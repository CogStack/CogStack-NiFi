## 🌐 Elasticsearch / OpenSearch Security

This section describes how to secure both **Elasticsearch (native)** and **OpenSearch** clusters used in the CogStack-NiFi stack, including certificate setup, user management, and role configuration.

All related certificates are stored in `security/certificates/elastic/`, and are generated from the shared **Root CA** created via [`create_root_ca_cert.sh`](certificates.md).

---

### 🔒 Overview

Both **Elasticsearch** and **OpenSearch** deployments require:

- TLS certificates for all nodes and HTTPS endpoints,
- secure credentials for built-in and custom users,
- properly configured roles and role mappings.

Certificates and credentials are generated using the scripts provided in `security/scripts/` and are controlled through the `.env` files under `security/env/`.

---

### 📄 Environment files used

All scripts reference the following environment configuration files:

| File | Purpose |
|------|----------|
| `certificates_elasticsearch.env` | Hostnames, instance names, and certificate parameters for ES / OpenSearch nodes |
| `certificates_general.env` | Root CA configuration |
| `users_elasticsearch.env` | Internal user credentials |

Reload them before running any security-related script:

```bash
cd ../deploy
source export_env_vars.sh
cd ../security
```

---

### ⚙️ Version variable

Set the ES/OS version in `deploy/elasticsearch.env` before launching containers:

```bash
ELASTICSEARCH_VERSION=opensearch
# or
ELASTICSEARCH_VERSION=elasticsearch
```

This ensures the correct certificate directory (`elasticsearch` or `opensearch`) is mounted into containers.

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
    ├── admin.*, es_kibana_client.*, elastic-stack-ca.*, root-ca.*
    └── elasticsearch/{1,2,3}/...
```

Each version has its own generation scripts, but they all depend on the same `.env` configuration and naming patterns.

---

### 🏗️ Generating certificates

#### Elasticsearch (native)

To generate certificates for Elasticsearch:

```bash
bash ./create_es_native_certs.sh
```

This script creates all required node and HTTP certificates under:

```text
security/certificates/elastic/elasticsearch/elasticsearch-{1,2,3}/
```

The script uses variables such as:

- `ES_INSTANCE_NAME_*` — Node names (match `ELASTICSEARCH_NODE_*_NAME` in `/deploy/elasticsearch.env`)
- `ES_INSTANCE_ALTERNATIVE_*_NAME` — Alternative hostnames
- `ES_HOSTNAMES` — List of all node hostnames
- `ES_CLIENT_SUBJ_ALT_NAMES` / `ES_NODE_SUBJ_ALT_NAMES` — Additional domain aliases for SAN fields

Make sure the environment variables are set correctly before running the script.

---

#### OpenSearch

For OpenSearch nodes:

```bash
bash ./create_opensearch_node_cert.sh elasticsearch-1 elasticsearch-2 elasticsearch-3
```

Then generate the admin and client certificates:

```bash
bash ./create_opensearch_client_admin_certs.sh
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

1. Edit `security/es_roles/opensearch/internal_users.yml` to define users.
2. Optionally generate password hashes:

   ```bash
   bash ./create_opensearch_internal_passwords.sh
   ```

3. Apply changes by recreating containers:

   ```bash
   docker compose down -v
   docker compose up -d
   ```

4. Populate tenants, roles, users, and role mappings:

   ```bash
   cd security/scripts
   bash create_opensearch_users.sh elasticsearch-1 --use-ssl
   ```

   - `<es_hostname>` is the OpenSearch node hostname (for this stack, usually `elasticsearch-1`).
   - `--use-ssl` switches the script endpoint from `http` to `https` (recommended for this stack).
   - Run the script from `security/scripts/` because it loads env files via relative paths.

##### `create_opensearch_users.sh` reference

Script: `security/scripts/create_opensearch_users.sh`  
Usage:

```bash
bash create_opensearch_users.sh <es_hostname> [--use-ssl]
```

Required inputs are loaded from:

- `deploy/general.env`
- `deploy/elasticsearch.env`
- `security/env/certificates_elasticsearch.env`
- `security/env/certificates_general.env`
- `security/env/users_elasticsearch.env`

What it creates/updates:

- Tenants: `nifi_tenant`, `cogstack_tenant`
- Roles: `cogstack_ingest`, `cogstack_access`
- Internal users: `cogstack_user`, `cogstack_pipeline`, `nifi`
- Role mappings for `cogstack_access` and `cogstack_ingest`
- Passwords for built-in users: `logstash`, `kibanaro`, `readall`, `snapshotrestore`

Verification example:

```bash
curl -k -u admin:${ELASTIC_PASSWORD} \
  https://elasticsearch-1:9200/_opendistro/_security/api/roles/cogstack_ingest
```

Troubleshooting:

- If you see authentication failures, confirm `ELASTIC_PASSWORD` in `security/env/users_elasticsearch.env` matches the running OpenSearch admin password.
- If you see `404` on security API paths, your OpenSearch version may require `_plugins/_security/api/...` instead of `_opendistro/_security/api/...`.
- The script is idempotent (`PUT` calls), so it can be re-run safely after credential or role changes.

OpenSearch includes default roles (`admin`, `kibanaserver`, `readall`, `snapshotrestore`, etc.) — always change their passwords after first run.

##### OpenSearch Dashboards post-login setup (Global tenant + workspace)

After your first login to `https://localhost:5601` (default: `admin` / `admin`):

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

To verify HTTPS access and trust:

```bash
curl -vk --cacert ./root-ca.pem https://elasticsearch-1:9200
```

To check inter-node encryption (inside a container):

```bash
openssl s_client -connect elasticsearch-1:9300 -CAfile ./root-ca.pem
```
