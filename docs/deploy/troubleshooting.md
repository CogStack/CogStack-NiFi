# 📛 Troubleshooting

Start with logs and container state. Do not delete containers or volumes as a
routine first step: volumes may contain NiFi state, database data, or search
indices.

From the repository root, list containers and their state:

```bash
docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

Inspect the affected service before restarting it:

```bash
docker logs --tail 300 cogstack-nifi
docker inspect cogstack-nifi
```

Use the scoped Make targets where possible. For example:

```bash
make -C deploy stop-nifi
make -C deploy start-nifi
```

To recreate only the NiFi containers while retaining named volumes:

```bash
make -C deploy delete-nifi-containers
make -C deploy start-nifi
```

!!! danger "Deleting persistent data"

    `make -C deploy cleanup` runs `docker compose down -v` for the core
    deployment and deletes its named volumes. Use it only when you deliberately
    want to reset all core service data. Do not use a global
    `docker volume prune` command as a CogStack troubleshooting step because it
    can delete unrelated Docker volumes on the host.

## 🐞 Known issues

### 🍎 Apple Silicon

Some images may only publish an `linux/amd64` variant. Typical errors include:

```text
no match for platform in manifest
no matching manifest for linux/arm64/v8 in the manifest list entries
image ... does not match the specified platform: wanted linux/arm64, actual: linux/amd64
```

On macOS, install Rosetta if it is not already available:

```bash
softwareupdate --install-rosetta
```

Enable Docker Desktop's Apple Virtualization framework and Rosetta-based
`x86_64` emulation. If an image still needs an explicit platform, set it for the
current shell before starting the service:

```bash
export DOCKER_DEFAULT_PLATFORM=linux/amd64
```

Emulation is slower than running a native ARM64 image and may require higher
Docker Desktop memory limits.

### 🔧 NiFi

#### NiFi reports mixed HTTP and HTTPS configuration

If NiFi reports that it supports only one mode of HTTP or HTTPS operation:

1. Check local changes in `nifi/conf/nifi.properties`.
2. Confirm the HTTPS settings loaded from `deploy/nifi.env`.
3. Recreate the NiFi containers without deleting their volumes.
4. Delete NiFi state volumes only if you have confirmed that stale persisted
   configuration is the cause and the stored state is disposable.

#### Keystore or truststore errors

Run the security initializer again; it validates complete certificate sets and
does not overwrite a valid existing set:

```bash
make -C deploy init-security
```

If it reports an incomplete certificate set, preserve the existing files and
repair or explicitly replace the set. Check the
[certificate guide](../security/certificates.md) before replacing a CA or leaf
certificate.

#### HTTP 421 or invalid host header

NiFi returns `HTTP 421 INVALID PROXY` or `System Error: Invalid host header`
when it does not trust the public host and port forwarded by nginx.

Set `NIFI_WEB_PROXY_HOST` in `deploy/nifi.env` to the browser-visible host and
port. For example:

```text
NIFI_WEB_PROXY_HOST="localhost:8443,nifi.example.org:8443"
```

Use port `443` for `https://nifi.example.org/nifi`, or `8443` for
`https://nifi.example.org:8443/nifi`. Restart `nifi` and `nifi-nginx` after the
change.

#### Database processor errors

- For Microsoft SQL Server errors involving `LIMIT`, configure
  `GenerateTableFetch` with the appropriate Microsoft SQL Server database type
  instead of `Generic`.
- If a JDBC driver class is not found, verify the JAR before configuring its
  absolute container path:

  ```bash
  jar -tvf ./nifi/drivers/postgresql-42.7.7.jar
  ```

  A PostgreSQL driver path in NiFi should look like
  `file:///opt/nifi/drivers/postgresql-42.7.7.jar`. Apply the controller-service
  configuration, then disable and re-enable the service to reload it.

#### 502 Bad Gateway

A 502 from nginx usually means that NiFi is not ready or has stopped. Inspect
the container state and logs:

```bash
docker ps -a --filter name=cogstack-nifi
docker logs --tail 1000 cogstack-nifi
```

NiFi startup can take several minutes. If the process was killed because of
memory pressure, review the Docker resource limits in `deploy/nifi.env` and the
JVM settings documented under
[bootstrap.conf](../nifi/main.md#bootstrapconf).

### 🛢️ Elasticsearch/OpenSearch

#### `vm.max_map_count` bootstrap failure

Search nodes may fail with an error similar to:

```text
bootstrap checks failed
max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]
```

On Linux, set the value temporarily with:

```bash
sudo sysctl -w vm.max_map_count=262144
```

For a persistent Linux configuration, add `vm.max_map_count=262144` to
`/etc/sysctl.conf` or an appropriate file under `/etc/sysctl.d/`, then apply the
configuration. On Docker Desktop, set the value in the Linux VM used by Docker.

#### OpenSearch host configuration fails validation

Errors saying that `opensearch.hosts` expects a URI usually indicate that the
environment was not loaded or that the value is not valid JSON/URI syntax.
Prefer the Make target, which loads the environment automatically:

```bash
make -C deploy start-elastic
```

If you invoke Compose directly, load the deployment environment first:

```bash
cd deploy
source ./export_env_vars.sh
docker compose -f services.yml up -d elasticsearch-1 elasticsearch-2 kibana
```

### 🗃️ Sample database has no data

If `samples_db` contains no sample tables, make sure Git LFS assets were pulled:

```bash
git lfs pull
```

Then recreate the sample database only if its existing data is disposable. Stop
the service, inspect its volume with `docker volume ls`, and remove only that
deployment's sample database volume before starting `samples-db` again.
