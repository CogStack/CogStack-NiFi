# 🛡️ Security

## 🗺️ Overview

Core CogStack-NiFi services use TLS certificates generated locally for each deployment. A shared root Certificate Authority (CA) signs dedicated service leaf certificates, while native Elasticsearch uses its own certificate-generation tooling.

This ensures full end-to-end encryption across the stack for essential operations, including service-to-service communication and user-facing endpoints.

Security is achieved through:

- A unified **root Certificate Authority (CA)**,
- Per-service certificate generation and signing targets,
- Environment-file management for local development credentials, and
- Optional reverse-proxy enforcement via **NGINX**.

!!! warning

    Generated certificates and private keys are deployment-local and ignored by Git. Run `make -C deploy init-security` before starting services. The tracked `security/env/*.env` files contain public development defaults only; never use those values as production secrets.

## 🧩 Components secured with HTTPS

| Service | Certificate location | Supported initialization target |
|---------|----------------------|---------------------------------|
| NiFi | `security/certificates/nifi/` | `make -C deploy init-security-nifi` |
| Elasticsearch | `security/certificates/elastic/elasticsearch/` | `make -C deploy init-security-elasticsearch` |
| OpenSearch and Dashboards | `security/certificates/elastic/opensearch/` | `make -C deploy init-security-opensearch` |
| Gitea | `security/certificates/gitea/` | `make -C deploy init-security-gitea` |

The root CA private key must be used only to sign leaf certificates. Services trust `root-ca.pem`; they must never serve `root-ca.key` as their TLS private key.

---

## 📂 Folder structure

The `security/` directory centralizes all certificate, credential, and role management for CogStack-NiFi.  
Below is the high-level structure with explanations for each sub-folder.

```text
security/
├── certificates/                               # All generated certificates and keystores
│   ├── elastic/                                # Elasticsearch / OpenSearch + Kibana certs
│   ├── nifi/                                   # Apache NiFi leaf certificate and Java stores
│   ├── gitea/                                  # Gitea leaf certificate
│   └── root/                                   # Root CA files and truststores
│               
├── env/                                        # Environment variable definitions for certs and users
│   ├── certificates_*.env                      # Variables controlling certificate generation
│   └── users_*.env                             # Public local-development defaults only
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
│   ├── create_opensearch_client_admin_certs.sh # Creates admin + client certificates for OpenSearch Dashboards
│   ├── create_opensearch_internal_passwords.sh # Generates bcrypt password hashes for OpenSearch internal_users.yml
│   ├── update_opensearch_users.sh              # Updates password hashes for every user in OpenSearch internal_users.yml
│   ├── create_opensearch_users.sh              # Creates OpenSearch internal users and role mappings (manual execution post-startup)
│   ├── create_nifi_certs.sh                    # Generates NiFi 2.x leaf certificates and Java stores
│   ├── create_gitea_certs.sh                   # Generates a dedicated Gitea leaf certificate
│   ├── nifi_toolkit_security.sh                # Legacy NiFi < 2.0 certificate helper
│   ├── nifi_init_create_user_auth.sh           # Bootstraps a temporary NiFi container to create a single-user authentication file
│   ├── nifi_create_single_user_auth.sh         # Helper script executed inside the container to generate NiFi single-user credentials
│   ├── es_native_cert_generator.sh             # Helper called by create_es_native_certs.sh to assemble ES cert bundles
│   └── create_keystore.sh                      # Builds Java keystores from a certificate and private key
│
└── templates/                                  # OpenSSL / X.509 configuration templates
    └── ssl-extensions-x509.cnf                 # SAN extensions used across certificate scripts
```
