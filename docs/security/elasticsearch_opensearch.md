## 🌐 Elasticsearch / OpenSearch Security

This section describes how to secure both **Elasticsearch (native)** and **OpenSearch** clusters used in the CogStack-NiFi stack, including certificate setup, user management, and role configuration.

All related certificates are stored in `security/certificates/elastic/`. OpenSearch certificates are signed by the shared root CA; native Elasticsearch creates its own backend-specific certificate authority. Use the supported Make targets described in [Certificates and Root CA](certificates.md) to generate either set.

---

### 🔒 Overview

Both **Elasticsearch** and **OpenSearch** deployments require:

- TLS certificates for all nodes and HTTPS endpoints,
- secure credentials for built-in and custom users,
- properly configured roles and role mappings.

Certificates are generated through the Make targets in `deploy/Makefile`. Those targets call the scripts in `security/scripts/` and load their configuration from the `.env` files under `security/env/`.

---

### 📄 Environment files used

All scripts reference the following environment configuration files:

| File | Purpose |
|------|----------|
| `certificates_elasticsearch.env` | Hostnames, instance names, and certificate parameters for ES / OpenSearch nodes |
| `certificates_general.env` | Root CA configuration |
| `users_elasticsearch.env` | Internal user credentials |

The Make targets and supported security scripts load these files themselves. Edit the files before generation; no separate export step is required.

---

### ⚙️ Version variable

Set the ES/OS version in `deploy/elasticsearch.env` before launching containers:

```bash
ELASTICSEARCH_VERSION=opensearch
# or
ELASTICSEARCH_VERSION=elasticsearch
```

This ensures the correct certificate directory (`elasticsearch` or `opensearch`) is mounted into containers.

#### OpenSearch security setting deprecations

The shared `services/elasticsearch/config/opensearch.yml` is used by Docker Compose and the OpenSearch Helm chart. It uses `transport.ssl.enforce_hostname_verification` instead of the deprecated `plugins.security.ssl.transport.enforce_hostname_verification`. The value remains `false`, preserving the existing transport TLS behavior. Enable verification only after ensuring node certificates cover the hostnames used for inter-node connections. See [Configuring TLS certificates](https://docs.opensearch.org/latest/security/configuration/tls/#advanced-hostname-verification-and-dns-lookup).

The deprecated `plugins.security.system_indices.indices` list has no replacement YAML setting. The bundled plugins register their system index descriptors with OpenSearch. The shared configuration keeps `plugins.security.system_indices.enabled: true` and `plugins.security.system_indices.permission.enabled: true`, so registered system indices remain protected and roles can still grant explicit `system:admin/system_index` access. See [System indexes](https://docs.opensearch.org/latest/security/configuration/system-indices/).

Before applying this configuration to an existing cluster, check for legacy or custom indices that depended on the old list. Plugin registrations do not necessarily cover every name matched by the old wildcards; for example, `.opendistro-notebooks` is a legacy name, while the current Observability plugin registers `.opensearch-notebooks`. Keep any required legacy protection until the owning plugin registers those indices or the data has been migrated. Such deployments may need to retain the deprecated list temporarily.

Apply the same configuration to every OpenSearch node and perform a rolling restart, waiting for each node to rejoin and the cluster to recover before restarting the next. These are static node settings; updating the Security plugin roles or calling its configuration API does not apply them. For Helm deployments, upgrade the ConfigMap and restart the OpenSearch pods; the chart mounts `opensearch.yml` using `subPath`.

#### Field masking salt and datasource encryption key

The shared OpenSearch configuration reads `plugins.security.compliance.salt` from `OPENSEARCH_COMPLIANCE_SALT` and `plugins.query.datasources.encryption.masterkey` from `OPENSEARCH_DATASOURCE_MASTER_KEY`. All nodes must receive identical values. Compose reads them from `security/env/users_elasticsearch.env`; the Helm chart imports them into the credentials Secret and references that Secret from every OpenSearch pod.

The checked-in values are public development defaults. Supply deployment-specific values through local configuration or an external secret store for production. Generate a 16-character ASCII salt with `openssl rand -hex 8` and a 32-character datasource key with `openssl rand -hex 16`. Preserve both values across restarts and keep a backup of the key: changing it prevents decryption of credentials already stored in SQL/PPL datasource definitions. Changing the salt changes field-masking hashes. See [Field masking](https://docs.opensearch.org/latest/security/access-control/field-masking/#set-the-salt-setting) and [Data sources](https://docs.opensearch.org/latest/dashboards/management/data-sources/).

For Helm, supply these keys in `usersEnvFile.raw` together with the existing credential keys, or include them in `credentials.existingSecret`. When overriding `usersEnvFile.raw` without these keys, set `credentials.complianceSalt` and `credentials.datasourceMasterKey` explicitly. Recreate Compose containers one node at a time after changing their environment; `docker compose restart` does not reload `env_file` values.

OpenSearch Security 3.9.0 can still log one warning containing its built-in salt during startup. Its internal `FieldMasking.Config.DEFAULT` is initialized from `Settings.EMPTY`, which creates a default `Salt` before the node-specific configuration is used. Inspection of the installed 3.9.0.0 plugin confirms this initialization path. A single such warning does not establish that field masking uses the default salt. Keep the configured salt consistent across nodes.

#### Runtime configuration permissions and JVM warnings

The shared `services/elasticsearch/search-entrypoint.sh` copies read-only deployment inputs from `config-input/` into the image's writable `config/` directory before calling the original image entrypoint. Image defaults, including JVM configuration and the keystore, are preserved. For OpenSearch, runtime configuration directories are set to `0700` and files to `0600`; host source permissions are left unchanged. Compose and Helm both use this startup hook. Configuration and certificate changes are copied on container startup, so restart or recreate the container after changing inputs.

The startup hook sets `DISABLE_INSTALL_DEMO_CONFIG=true` because the deployment supplies its own security configuration and certificates. This skips the demo installer while retaining the Security plugin. The shared JVM options include `--enable-native-access=ALL-UNNAMED` for dependencies that load native libraries. See [Docker configuration](https://docs.opensearch.org/latest/install-and-configure/install-opensearch/docker/) and [JDK native access](https://bugs.openjdk.org/browse/JDK-8334569).

Messages about Byte Buddy's `sun.misc.Unsafe` calls and missing SLF4J providers originate in bundled dependencies. Resolving them requires compatible upstream dependency changes. Optional-plugin and incubating-vector messages can also appear during normal startup; check node readiness and cluster health to establish whether startup completed.

#### Repeated startup and out-of-memory exits

The development configuration allows 2 GiB per OpenSearch node while retaining a 512 MiB Java heap. OpenSearch 3.9 plugin initialization exceeded the former 1 GiB container limit in this deployment, causing repeated Docker `oom` events followed by exit code `137`. The container limit must also cover direct buffers, native allocations, thread stacks, and plugin memory. Ensure the Docker VM or Kubernetes worker has enough memory for every node and the other services.

Check Docker's event history when startup repeats without a Java exception. `OOMKilled` and cgroup memory counters describe the current container execution and can reset after an automatic restart. Historical `oom` and `die` events identify the cause of earlier executions. See [Docker resource constraints](https://docs.docker.com/engine/containers/resource_constraints/).

#### Performance Analyzer configuration

`services/elasticsearch/config/performance-analyzer/` supplies `performance-analyzer.properties`, `plugin-stats-metadata`, and `agent-stats-metadata` for both Compose and Helm. This also covers OpenSearch images that omit these configuration files. See [Performance Analyzer configuration](https://docs.opensearch.org/latest/monitoring-plugins/pa/index/#configure-performance-analyzer).

The OpenSearch 3.9 image also contains a legacy agent launcher whose `PerformanceAnalyzerApp` class is absent because the RCA application was removed. This is separate from the in-process collectors loading their configuration successfully. The shared entrypoint detects missing RCA library JARs, reports that the agent and port 9600 API are unavailable, and sets `DISABLE_PERFORMANCE_ANALYZER_AGENT_CLI=true`. An explicitly supplied flag takes precedence for custom images. The collector plugin remains installed. See [the upstream missing-RCA issue](https://github.com/opensearch-project/performance-analyzer/issues/904).

The metadata paths must be regular files. The former volume mounts at `plugin-stats-metadata` and `plugins-stats-metadata` created directories at those paths. Performance Analyzer volumes now hold metrics databases at `/var/lib/opensearch-performance-analyzer`, while temporary metrics stay in `/dev/shm/performanceanalyzer/`. Compose runs a small initialization service to assign the database volume roots to OpenSearch's UID/GID 1000; Helm uses the pod's `fsGroup` for volume access.

Recreate existing Compose containers to apply the corrected mounts, waiting for each node to recover before moving to the next. Load the deployment environment first, as for other Compose commands. For example:

```bash
source deploy/export_env_vars.sh
docker compose -f deploy/services.yml up -d elasticsearch-1
# Wait for node 1 to rejoin and the cluster to recover.
docker compose -f deploy/services.yml up -d elasticsearch-2
# Repeat for elasticsearch-3 if it is deployed.
```

Keep the existing data and log volumes. No volume deletion is needed for this repair.

---

### 🧩 Common certificate layout

Certificate naming and folder structure are consistent across both ES and OpenSearch:

```text
security/certificates/elastic/
├── elasticsearch/
│   ├── elastic-stack-ca.crt.pem
│   ├── elastic-stack-ca.key.pem
│   ├── elasticsearch/
│   │   ├── elasticsearch-{1,2,3}/
│   │   │   ├── http-elasticsearch-*.crt
│   │   │   ├── http-elasticsearch-*.key
│   │   │   ├── http-elasticsearch-*.p12
│   │   │   ├── elasticsearch-*.crt
│   │   │   ├── elasticsearch-*.key
│   │   │   └── elasticsearch-*.p12
│   └── kibana/
│       ├── sample-kibana.yml
│       └── README.txt
└── opensearch/
    ├── admin.*, es_kibana_client.*, elastic-stack-ca.*
    └── elasticsearch/{1,2,3}/...
```

Each version has its own generation scripts, but they all depend on the same `.env` configuration and naming patterns.

---

### 🏗️ Generating certificates

#### Elasticsearch (native)

To generate certificates for Elasticsearch from the repository root:

```bash
make -C deploy init-security-elasticsearch
```

This script creates all required node and HTTP certificates under:

```text
security/certificates/elastic/elasticsearch/elasticsearch-{1,2,3}/
```

The script uses variables such as:

- `ES_INSTANCE_NAME_*` — Node names (match `ELASTICSEARCH_NODE_*_NAME` in `deploy/elasticsearch.env`)
- `ES_INSTANCE_ALTERNATIVE_*_NAME` — Alternative hostnames
- `ES_HOSTNAMES` — List of all node hostnames
- `ES_CLIENT_SUBJ_ALT_NAMES` / `ES_NODE_SUBJ_ALT_NAMES` — Additional domain aliases for SAN fields

Make sure the environment variables are set correctly before running the script.

---

#### OpenSearch

To generate the OpenSearch node, admin, and client certificates from the repository root:

```bash
make -C deploy init-security-opensearch
```

This produces:

| File | Purpose |
|------|----------|
| `admin.crt`, `admin.key.pem` | Admin dashboard certificate |
| `es_kibana_client.pem`, `es_kibana_client.key` | Client certificate for Kibana/OpenDashboard |
| `*.jks` | Node keystores/truststores for HTTPS and inter-node encryption |

The resulting certificates are placed in:

```text
security/certificates/elastic/opensearch/
```

---

### 📁 Kibana / OpenDashboard certificates

| Platform | Required Certificates | Source Folder |
|-----------|----------------------|----------------|
| **Kibana** | `elasticsearch-{1,2,3}.crt`, `elasticsearch-{1,2,3}.key`, `elastic-stack-ca.crt.pem` | `security/certificates/elastic/elasticsearch/` |
| **OpenDashboard (OpenSearch)** | `admin.crt`, `admin.key.pem`, `es_kibana_client.pem`, `es_kibana_client.key`, `elastic-stack-ca.crt.pem` | `security/certificates/elastic/opensearch/` |

All certificate references in `services/kibana/config/opensearch.yml` or `services.yml` must point to these locations.

---

### 🔐 Users and roles

#### OpenSearch

1. Edit the password values in `security/env/users_elasticsearch.env` and ensure every required user is present in `security/es_roles/opensearch/internal_users.yml`.
2. With OpenSearch running, validate and then apply hashes for all internal users:

   ```bash
   cd security/scripts
   ./update_opensearch_users.sh elasticsearch-1
   ./update_opensearch_users.sh elasticsearch-1 --apply
   ```

3. Populate the additional tenants, roles, users, and role mappings:

   ```bash
   ./security/scripts/create_opensearch_users.sh localhost
   ```

   - `<opensearch_hostname>` is the hostname covered by the OpenSearch node certificate.
   - HTTPS with CA verification is the default. Use `--use-http` only for an explicitly unsecured local endpoint.
   - The script resolves its files from its own location, so it can be run from any directory.

##### `create_opensearch_users.sh` reference

Script: `security/scripts/create_opensearch_users.sh`  
Usage:

```bash
./security/scripts/create_opensearch_users.sh <opensearch_hostname> [--use-http]
```

Required inputs are loaded from:

- `deploy/elasticsearch.env`
- `security/env/users_elasticsearch.env`

What it creates/updates:

- Tenants: `nifi_tenant`, `cogstack_tenant`
- Roles: `cogstack_ingest`, `cogstack_access`
- Internal users: `cogstack_user`, `cogstack_pipeline`, `nifi`
- Role mappings for `cogstack_access` and `cogstack_ingest`

The script uses the current `/_plugins/_security/api` endpoints. Password rotation for predefined users such as `admin`, `logstash`, `kibanaro`, `readall`, and `snapshotrestore` remains the responsibility of `update_opensearch_users.sh`.

Verification example:

```bash
source security/env/users_elasticsearch.env
curl --cacert security/certificates/elastic/opensearch/elastic-stack-ca.crt.pem \
  -u "${OPENSEARCH_ADMIN_USER:-admin}:${OPENSEARCH_ADMIN_PASSWORD:-$ELASTIC_PASSWORD}" \
  https://localhost:9200/_plugins/_security/api/roles/cogstack_ingest
```

Troubleshooting:

- If you see authentication failures, confirm `ELASTIC_PASSWORD` in `security/env/users_elasticsearch.env` matches the running OpenSearch admin password.
- If the CA is stored elsewhere, set `OPENSEARCH_CA_CERT` to the appropriate CA certificate before running the script.
- Ensure the supplied hostname appears in the OpenSearch node certificate SANs.
- The script is idempotent (`PUT` calls), so it can be re-run safely after credential or role changes.

OpenSearch includes default roles (`admin`, `kibanaserver`, `readall`, `snapshotrestore`, etc.) — always change their passwords after first run.

##### `update_opensearch_users.sh` reference

Use this script when you need to rotate passwords for every user already defined in `security/es_roles/opensearch/internal_users.yml`, including the reserved `admin` user.

The script updates password hashes in `internal_users.yml` using OpenSearch's `hash.sh`, then applies only the `internalusers` config with `securityadmin.sh`. It does not create tenants, roles, role mappings, or new internal users. For those tasks, use `create_opensearch_users.sh`.

Script: `security/scripts/update_opensearch_users.sh`  
Usage:

```bash
cd security/scripts

# Dry run: validates env vars and generates hashes, but does not write files.
./update_opensearch_users.sh <opensearch_container_name>

# Update internal_users.yml and push the internal users config to OpenSearch.
./update_opensearch_users.sh <opensearch_container_name> --apply

# Update only the local YAML file; do not run securityadmin.sh.
./update_opensearch_users.sh <opensearch_container_name> --apply --skip-securityadmin
```

To find the container name:

```bash
docker ps --format '{{.Names}}' | grep elasticsearch
```

Required inputs are loaded from:

- `deploy/elasticsearch.env`
- `security/env/certificates_elasticsearch.env`
- `security/env/certificates_general.env`
- `security/env/users_elasticsearch.env`

Password env var resolution:

| OpenSearch user | Env var used |
|-----------------|--------------|
| `admin` | `ADMIN_PASSWORD` or `OPENSEARCH_ADMIN_PASSWORD` if set, otherwise `ELASTIC_PASSWORD` |
| `kibanaserver` | `KIBANA_PASSWORD` when `KIBANA_USER=kibanaserver` |
| `logstash` | `ES_LOGSTASH_PASS` |
| `kibanaro` | `ES_KIBANARO_PASS` |
| `readall` | `ES_READALL_PASS` |
| `snapshotrestore` | `ES_SNAPSHOTRESTORE_PASS` |
| `anomalyadmin` | `ANOMALYADMIN_PASSWORD` |
| `new-user` | `NEW_USER_PASSWORD` |
| Any other user | `<USERNAME>_PASSWORD`, uppercased with non-alphanumeric characters converted to underscores |

Example: a user named `data-loader` expects `DATA_LOADER_PASSWORD` unless it is covered by one of the explicit mappings above.

Recommended workflow:

1. Edit the relevant password values in `security/env/users_elasticsearch.env`.
2. Run the script without `--apply` to validate all users and generate hashes.
3. Run the script with `--apply` to back up and update `internal_users.yml`, then apply it to the running OpenSearch cluster.
4. Re-run any dependent setup scripts or update dependent service credentials if the rotated user is used elsewhere.

The script writes a timestamped backup next to the source file:

```text
security/es_roles/opensearch/internal_users.yml.bak.YYYYMMDDHHMMSS
```

Important behavior:

- The dry run still needs a running OpenSearch container because hashes are generated with the version of `hash.sh` bundled in that container.
- `securityadmin.sh -f ... -t internalusers` replaces the internal users config stored in the OpenSearch security index. Keep every required internal user in `internal_users.yml` before applying.
- The running cluster is not updated if you use `--skip-securityadmin`; only the local YAML file changes.
- If you rotate `admin`, update any scripts or services that still authenticate with `admin:${ELASTIC_PASSWORD}`.

Verification example after rotating `admin`, from the repository root:

```bash
source security/env/users_elasticsearch.env
curl --cacert security/certificates/elastic/opensearch/elastic-stack-ca.crt.pem \
  -u "admin:${ADMIN_PASSWORD:-$ELASTIC_PASSWORD}" \
  https://localhost:9200/_plugins/_security/api/account
```

##### OpenSearch Dashboards post-login setup (Global tenant + workspace)

After your first login to `https://localhost:5601` using the development credentials in `security/env/users_elasticsearch.env`:

1. Open the user menu (top-right) and select **Switch tenant**.
2. Select `Global`, then apply the change.
3. Open **Stack Management** → **Workspaces** (or the workspace switcher in the header) and click **Create workspace**.
4. Enter a workspace name (for example `cogstack-main`) and keep it in the `Global` tenant.
5. Save, then create data views and dashboards inside this workspace.

Use `Global` for shared dashboards and saved objects.  
`Private` tenant content is user-specific and not visible to other users.

If tenant switching or workspace creation is not available in the UI, verify these settings in `services/kibana/config/opensearch.yml`:

```yaml
opensearch_security.multitenancy.enabled: true
opensearch_security.multitenancy.tenants.enable_global: true
opensearch_security.multitenancy.tenants.preferred: ["Global"]
workspace.enabled: true
```

---

#### Elasticsearch (native)

Run after containers start:

```bash
cd security/scripts
bash ./create_es_native_credentials.sh
```

This script creates system users, roles, and a service account token for Kibana.

You can modify credentials in `security/env/users_elasticsearch.env`.

**New roles** created:

- `ingest` — for NiFi and pipeline ingestion (`cogstack_*`, `nifi_*` indices)
- `cogstack_access` — read-only access to `cogstack_*` and `nifi_*`

**New users**:

- `nifi` → `ingest`
- `cogstack_user` → `cogstack_access`

---

#### ⚠️ Notes

- The `security/certificates/` folder is also **mounted inside NiFi** so NiFi processors can access ES/OS securely without restarting.  
- For OpenSearch role details, see the [OpenSearch Security Plugin documentation](https://opensearch.org/docs/latest/security-plugin/index/).  
- For Elasticsearch, refer to the [official Elastic Security docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/configuring-security.html).

---

#### ✅ Verification

To verify HTTPS access and trust for the selected backend from the repository root, use its generated CA file:

```bash
source deploy/elasticsearch.env
curl --cacert "security/certificates/elastic/${ELASTICSEARCH_VERSION}/elastic-stack-ca.crt.pem" \
  https://localhost:9200/
```

To inspect a node certificate while verifying the same CA:

```bash
source deploy/elasticsearch.env
openssl s_client -connect localhost:9200 -servername localhost \
  -CAfile "security/certificates/elastic/${ELASTICSEARCH_VERSION}/elastic-stack-ca.crt.pem" \
  -verify_hostname localhost
```
