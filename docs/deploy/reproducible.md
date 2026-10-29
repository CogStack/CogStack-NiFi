# Repeatable deployments

The core deployment records its software inputs in Git: submodule commits,
container image digests, and the application configuration. Use the same
repository revision and container platform to deploy those inputs again.
Existing volumes, generated certificates, credentials, and local configuration
changes remain part of each deployment's state.

## Initialize a checkout

Run these commands from the repository root:

```bash
git lfs pull
make -C deploy git-init-submodules
make -C deploy check-config
make -C deploy init-security
make -C deploy start-data-infra
```

`git-init-submodules` checks out the exact commits recorded by the repository,
including nested submodules. It uses Git's explicit `--checkout` procedure and
does not select newer releases, stage files, or create commits. See the
[Git submodule documentation](https://git-scm.com/docs/git-submodule).

CI checks these recorded commits with read-only repository permissions. It no
longer advances dependencies or pushes synchronization commits when a branch
changes.

## Upgrade submodules explicitly

In a development checkout, run:

```bash
make -C deploy git-update-submodules
git diff --ignore-submodules=none --submodule=log
```

The upgrade command selects the highest version-sorted stable tag reachable
from each direct dependency's default branch. It falls back to other release
tags, then the default branch when no tags exist. Nested dependencies stay at
the commits recorded by the selected release. Local changes in initialized
submodules must be committed or stashed before upgrading.

Review and test the resulting changes, then explicitly stage the submodule
paths and commit them in a pull request. The helper leaves the parent index and
commit history unchanged, including any unrelated staged work.

The repository configures Git to hide routine submodule changes in ordinary
status output, so use `--ignore-submodules=none` when reviewing upgrades.

## Container image pins

Published images use `repository:version@sha256:...` or
`repository@sha256:...` references. The digest selects the image even when a
publisher later moves a tag. See Docker's
[image pinning guidance](https://docs.docker.com/build/building/best-practices/#pin-base-image-versions).

Image selections live in:

| Deployment | Image configuration |
|---|---|
| Core Compose services | `deploy/nifi.env`, `deploy/nginx.env`, `deploy/elasticsearch.env`, `deploy/database.env`, and `deploy/gitea.env` |
| Ollama and Open WebUI | `deploy/ollama.env` and `deploy/openwebui.env` |
| Sample PostgreSQL, databank PostgreSQL, and MSSQL | `deploy/services.yml` |
| Development observability services | `deploy/telemetry.env` |
| Owned Helm charts | `deploy/charts/*/values.yaml`; NiFi also reads `deploy/nifi.env` |

Compose requires these image variables to be loaded. The Make targets load
them automatically. For direct Compose commands:

```bash
cd deploy
source ./export_env_vars.sh
docker compose -f services.yml config --images
```

To update an image, inspect the chosen release without pulling its layers:

```bash
docker buildx imagetools inspect repository/image:release --format '{{.Manifest.Digest}}'
```

Record the returned manifest digest alongside the version in the relevant
tracked configuration, test it, and submit the change for review. Use the
multi-platform index digest when both amd64 and arm64 are supported.

For the NiFi and OpenSearch Helm charts, `image.digest` takes precedence over
`image.tag`. Update the digest together with the tag when selecting another
image. NiFi's imported `NIFI_DOCKER_IMAGE` remains the complete image reference
when supplied through its env file.

## Local image builds

Published image references and local build tags are separate:

```bash
make -C deploy build-nifi-image
make -C deploy start-nifi-dev
```

Local NiFi builds use `NIFI_LOCAL_DOCKER_IMAGE`. Keep `NIFI_VERSION` and
`NIFI_BASE_IMAGE` aligned when updating NiFi, since the version also selects
its NAR extensions. The direct Docker build defaults live in `nifi/Dockerfile`.

Services built from this checkout use `pull_policy: build` so Compose builds
the current source instead of reusing an unrelated cached local image. Their
base images are pinned in the Dockerfiles or supplied build arguments.

NiFi source builds still resolve operating-system packages and external build
tools at build time. For repeatable production deployment, publish the tested
build and record its resulting image digest.

## Validate the pins

These checks render configuration and use temporary local Git repositories;
they do not start services or change this checkout's submodule commits:

```bash
python3 -B scripts/tests/check_deployment_images.py --helm
python3 -B -m unittest discover -s scripts/tests -p test_deployment_images.py -v
python3 -B -m unittest discover -s scripts/tests -p test_submodule_checkout.py -v
```

The image check requires Docker Compose and Helm, but no running Docker daemon
or Kubernetes cluster. It validates both core Compose files, their local build
bases, and the three owned Helm charts. Helm image validation supplies an
existing credentials Secret name; deployment-specific credentials and TLS
Secrets must still be provided for an installation.

Optional services such as OCR, MedCAT, and JupyterHub use deployment definitions
inside their pinned submodules. Image and model versioning within those
definitions is owned by the corresponding service repositories.
