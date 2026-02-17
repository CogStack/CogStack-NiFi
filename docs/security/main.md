# 🛡️ Security

## 🗺️ Overview

All core CogStack-NiFi services — including **NiFi**, **Elasticsearch/OpenSearch**, **Kibana/OpenSearch Dashboards**, **JupyterHub**, **NGINX** and **Gitea** — are now deployed with **HTTPS enabled by default**.  
Each component is provisioned with its own X.509 certificates issued by the shared root CA generated via the `create_root_ca_cert.sh` script.

This ensures full end-to-end encryption across the stack for essential operations, including service-to-service communication and user-facing endpoints.

Security is achieved through:

- A unified **root Certificate Authority (CA)**,
- Per-service certificate generation and signing scripts,
- Environment variable management for secrets and credentials, and
- Optional reverse-proxy enforcement via **NGINX**.

> ⚠️ **Important:** Always generate unique certificates and credentials for each deployment.  
> The repository provides sample certificates for demonstration only.

## 🧩 Components secured with HTTPS

| Service | HTTPS/TLS Enabled | Certificate Location | Script(s) Used |
|----------|------------------|----------------------|----------------|
| NiFi | ✅ | `security/certificates/nifi/` | `nifi_toolkit_security.sh` |
| Elasticsearch / OpenSearch | ✅ | `security/certificates/elastic/(elasticsearch or opensearch)/` | `create_es_native_certs.sh`, `create_opensearch_node_cert.sh` |
| Kibana / OpenSearch Dashboards | ✅ | `security/certificates/elastic/(elasticsearch or opensearch)/` | `create_opensearch_client_admin_certs.sh` |
| JupyterHub | ✅ | `security/certificates/root/` | `create_root_ca_cert.sh` |
| Gitea | ✅ | `security/certificates/root/` | `create_root_ca_cert.sh` |
| NGINX | ✅ | `security/certificates/root/` | `create_root_ca_cert.sh` |

---

## 📂 Folder structure

The `security/` directory centralizes all certificate, credential, and role management for CogStack-NiFi.  
Below is the high-level structure with explanations for each sub-folder.

```text
security/
├── certificates/                               # All generated certificates and keystores
│   ├── elastic/                                # Elasticsearch / OpenSearch + Kibana certs
│   ├── nifi/                                   # Apache NiFi certificates (generated via NiFi Toolkit)
│   └── root/                                   # Root CA files and truststores
│               
├── env/                                        # Environment variable definitions for certs and users
│   ├── certificates_*.env                      # Variables controlling certificate generation
│   └── users_*.env                             # Default credentials for each service
│               
├── es_roles/                                   # Role and role mapping definitions for ES / OpenSearch
│   ├── elasticsearch/                          # Native Elasticsearch roles
│   └── opensearch/                             # OpenSearch Security Plugin configs
│           
├── scripts/                                    # Shell utilities for creating certs and credentials
│   ├── create_root_ca_cert.sh                  # Generates the shared root CA (trust anchor)
│   ├── create_es_native_certs.sh               # Elasticsearch node and client certs
│   ├── create_es_native_credentials.sh         # Runs post-deployment to create default Elasticsearch system users and tokens
│   ├── create_opensearch_node_cert.sh          # Generates certificates and JKS stores for each OpenSearch node
│   ├── create_opensearch_admin_certs.sh        # Creates admin + client certificates for OpenSearch Dashboards (Kibana equivalent)
│   ├── create_opensearch_internal_passwords.sh # Generates bcrypt password hashes for OpenSearch internal_users.yml
│   ├── create_opensearch_users.sh              # Creates OpenSearch internal users and role mappings (manual execution post-startup)
│   ├── nifi_toolkit_security.sh                # Generates NiFi HTTPS certs using NiFi Toolkit (for NiFi < 2.0, no longer used for certs as of 2.0+)
│   ├── nifi_init_create_user_auth.sh           # Bootstraps a temporary NiFi container to create a single-user authentication file
│   ├── nifi_create_single_user_auth.sh         # Helper script executed inside the container to generate NiFi single-user credentials
│   ├── es_native_cert_generator.sh             # Helper called by create_es_native_certs.sh to assemble ES cert bundles
│   └── create_keystore.sh                      # Builds Java KeyStores (JKS) from PEM or PKCS#12 certificates
│
└── templates/                                  # OpenSSL / X.509 configuration templates
    └── ssl-extensions-x509.cnf                 # SAN extensions used across certificate scripts
```

```{include} certificates.md
```

```{include} services.md
```

```{include} nifi.md
```

```{include} elasticsearch_opensearch.md
```
