# Air-gapped NiFi deployment

This guide installs the CogStack NiFi Docker Compose services on a machine that
has no internet access. It uses a removable drive to transfer a prepared bundle
from an internet-connected staging machine to the air-gapped target.

The bundle contains:

- a complete repository working tree, including resolved Git LFS-managed files
  and checked-out submodules;
- the container images required by the `nifi` and `nifi-nginx` services;
- a manifest recording the source commit, image identities, and platform; and
- SHA-256 checksums for the transferred archives.

This procedure covers the Docker Compose deployment. Air-gapped Kubernetes or
Helm deployment additionally requires an internal image registry and packaged
charts and is outside the scope of this guide.

!!! warning

    Treat the connected staging machine and removable drive as part of the
    software supply chain. Use a clean staging checkout, scan the bundle
    according to your organisation's policy, encrypt the drive where required,
    and verify the checksums on the target before loading or extracting files.

## Before you begin

Confirm the following:

- The staging machine can access the Git repositories, Git LFS storage, and
  container registries used by CogStack.
- The target is a supported Linux system and has enough disk and memory for the
  deployment. See [Prerequisites](./main.md).
- You know the target container platform, normally `linux/amd64` or
  `linux/arm64`.
- The target has Bash, GNU Make, `tar`, `gzip`, `sha256sum`, OpenSSL, and a Java
  installation that provides `keytool`, or the removable drive includes
  compatible installation packages for them.
- Docker Engine and the Docker Compose plugin are already installed on the
  target, or the removable drive includes installation packages prepared for
  the target's exact Linux distribution, release, and CPU architecture.
- The removable drive uses a filesystem that supports files larger than 4 GiB.
  FAT32 is therefore unsuitable for many container-image archives.

The repository's online installation script downloads system packages and
cannot install Docker on an air-gapped machine. If Docker is not already
installed, have the system administrator download Docker Engine, the Compose
plugin, and all package dependencies from the target distribution's approved
repositories. Test those packages on an equivalent offline host before the
transfer. Do not assume packages prepared for another Linux distribution or
release will work.

## 1. Prepare a clean repository on the staging machine

Use a released revision or an explicitly approved commit. The example below
assumes the repository has already been cloned into `cogstack_nifi`:

```bash
cd cogstack_nifi
git switch --detach <release-tag-or-commit>
git submodule update --init --recursive
git lfs pull
git submodule foreach --recursive git lfs pull
git status --short
```

Investigate any output from `git status --short`. A fresh staging checkout
reduces the risk of transferring local credentials, generated certificates, or
unreviewed files.

!!! important

    Do not run `make -C deploy init-security` on the staging machine. Generate
    the deployment CA, private keys, and certificates on the air-gapped target
    after transfer. Review and replace deployment credentials on the target as
    well.

## 2. Pull and export the NiFi images

Set `DOCKER_DEFAULT_PLATFORM` to the target platform before pulling. Running an
`amd64` image on an `arm64` target, or the reverse, will either fail or require
emulation.

From the repository root:

```bash
mkdir -p ../cogstack-nifi-airgap
cd deploy
source ./export_env_vars.sh
export DOCKER_DEFAULT_PLATFORM=linux/amd64

printf '%s\n' "$DOCKER_DEFAULT_PLATFORM" \
  > ../../cogstack-nifi-airgap/target-platform.txt

docker compose -f services.yml config --images nifi nifi-nginx \
  | sort -u > ../../cogstack-nifi-airgap/nifi-airgap-images.txt

docker compose -f services.yml pull nifi nifi-nginx

docker image save \
  --output ../../cogstack-nifi-airgap/nifi-airgap-images.tar \
  $(docker compose -f services.yml config --images nifi nifi-nginx)
```

Use `linux/arm64` instead if that is the target platform. Keep
`nifi-airgap-images.txt` with the image archive. The generated list follows the
actual Compose configuration, including any image overrides loaded from the
environment files.

The default Compose configuration currently uses `latest` image tags. An image
archive still preserves the exact images that were pulled, but the tag alone is
not an immutable version identifier. Record the image IDs and registry digests:

```bash
docker image inspect \
  --format '{{join .RepoTags ","}} {{.Id}} {{join .RepoDigests ","}}' \
  $(docker compose -f services.yml config --images nifi nifi-nginx) \
  > ../../cogstack-nifi-airgap/nifi-airgap-image-manifest.txt
```

Where published versioned tags or approved digests are available, set them in
the deployment configuration before creating the bundle. Never refresh only
part of an approved bundle while retaining its old manifest or checksums.

## 3. Build the transfer bundle

Return to the directory containing the repository and archive the populated
working tree. The exclusions prevent Git metadata from being copied; the
checked-out submodule and Git LFS file contents remain in the working tree.

```bash
cd ../..

tar \
  --exclude='cogstack_nifi/.git' \
  --exclude='cogstack_nifi/.git/*' \
  --exclude='cogstack_nifi/**/.git' \
  -czf cogstack-nifi-airgap/cogstack-nifi-repository.tar.gz \
  cogstack_nifi
```

Record the source revision and preparation environment:

```bash
git -C cogstack_nifi rev-parse HEAD \
  > cogstack-nifi-airgap/source-commit.txt

{
  uname -a
  docker version
  docker compose version
} > cogstack-nifi-airgap/preparation-environment.txt
```

On Linux, create the checksum file with:

```bash
cd cogstack-nifi-airgap
sha256sum \
  cogstack-nifi-repository.tar.gz \
  nifi-airgap-images.tar \
  nifi-airgap-images.txt \
  nifi-airgap-image-manifest.txt \
  target-platform.txt \
  source-commit.txt \
  preparation-environment.txt \
  > SHA256SUMS
cd ..
```

On macOS, use `shasum -a 256` instead of `sha256sum`.

Copy the entire `cogstack-nifi-airgap` directory to the encrypted removable
drive. Include the separately prepared Docker installation packages if the
target does not already have Docker Engine and Compose.

## 4. Verify and unpack on the air-gapped target

Copy the bundle from the removable drive to a local filesystem before loading
it. From inside the copied bundle directory, verify every file:

```bash
sha256sum --check SHA256SUMS
```

Stop if any checksum fails. Do not load images or run scripts from a bundle that
does not match its checksum manifest.

If necessary, install the previously prepared Docker Engine and Compose
packages using the target distribution's offline package procedure. Then
confirm that the required host commands, daemon, and Compose plugin are
available without pulling a test image:

```bash
command -v bash make tar gzip sha256sum openssl keytool docker
docker version
docker compose version
cat target-platform.txt
```

Load the archived images and extract the repository:

```bash
docker image load --input nifi-airgap-images.tar

mkdir -p workspace
tar -xzf cogstack-nifi-repository.tar.gz -C workspace
cd workspace/cogstack_nifi
```

Confirm that every expected image resolves locally:

```bash
while IFS= read -r image; do
  docker image inspect "$image" >/dev/null || exit 1
done < ../../nifi-airgap-images.txt
```

Compare the loaded image IDs and digests with
`../../nifi-airgap-image-manifest.txt` if the deployment requires a manual
approval step.

## 5. Configure the target and generate security material

Review the files in `deploy/*.env`, especially:

- `deploy/general.env` for the target CPU architecture and time zone;
- `deploy/nifi.env` for resource limits, ports, and the public NiFi proxy host;
- `deploy/network_settings.env` for host mappings and deployment networks; and
- the files under `security/env/` for certificate subjects and credentials.

Set the final hostname, IP address, and certificate subject alternative names
before generating certificates. Replace any example or default credentials in
`security/env/` with deployment-specific values. Then generate only the CA and
NiFi certificate set required by this guide, from the repository root:

```bash
make -C deploy init-security-nifi
```

The broader `init-security` target also prepares certificates for Gitea and the
configured search backend. Use it only when those services and their offline
dependencies are included in the deployment bundle. The OpenSearch host setting
`vm.max_map_count=262144` is not required for a NiFi-only deployment.

## 6. Start NiFi without registry access

Load the deployment environment and first confirm that Compose still resolves
the same image names recorded in the bundle:

```bash
cd deploy
source ./export_env_vars.sh

docker compose -f services.yml config --images nifi nifi-nginx | sort -u
cat ../../../nifi-airgap-images.txt
```

If the lists differ, correct the image configuration or import the missing
approved images before continuing. Start NiFi with implicit image pulls
disabled:

```bash
docker compose -f services.yml up -d --pull never nifi nifi-nginx
```

The `--pull never` policy makes a missing image fail locally instead of causing
Compose to contact a registry.

## 7. Validate the offline deployment

Check container state and logs:

```bash
docker compose -f services.yml ps nifi nifi-nginx
docker compose -f services.yml logs --tail=200 nifi nifi-nginx
```

Open the configured NiFi URL, normally:

```text
https://<target-host>:8443/nifi
```

Confirm that:

- both containers remain running;
- NiFi completes startup without missing-file or permission errors;
- the browser receives the expected certificate;
- authentication succeeds with the target-generated credentials; and
- the required processors, controller services, drivers, and workflows are
  present.

For an acceptance test, perform the final restart while outbound network access
is disabled and retain the manifests and validation logs with the deployment
record.

## Updating an existing air-gapped deployment

Prepare updates as a new complete bundle. Give each bundle its own source
commit, image manifest, checksums, approval record, and rollback plan. Before an
upgrade, back up the NiFi configuration and repositories according to the
deployment's data-retention policy. Do not overwrite the previous removable
media bundle until the update has been validated and rollback is no longer
required.

See [Troubleshooting](./troubleshooting.md) for container, certificate, memory,
and architecture-related failures.
