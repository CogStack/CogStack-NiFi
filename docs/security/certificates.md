## 🏛️ Certificates and Root CA

This section describes the full structure of the `security/certificates/` directory and explains how certificates are generated, organized, and used across CogStack-NiFi services.

All certificates originate from the **Root Certificate Authority (CA)**, generated via `create_root_ca_cert.sh`.  

This Root CA signs all service certificates (NiFi, OpenSearch, Kibana, JupyterHub, Gitea, etc.), ensuring consistent trust across the stack, with the exception of ElasticSearch (Native), we use Elastic's built-in cert generation scripts for it instead.

---

### 📂 Certificate directory structure

```text
security/
└── certificates/
    ├── elastic/                                        # Certificates for Elasticsearch / OpenSearch clusters
    │   ├── elasticsearch/                              # Native Elasticsearch certificates
    │   │   ├── elastic-stack-ca.*                      # CA for Elasticsearch (self-signed or derived from root)
    │   │   ├── elasticsearch/                          # Node certificates for Elasticsearch instances
    │   │   │   ├── elasticsearch-1,2,3/ and *-dev/ variants
    │   │   │   │   ├── *.crt, *.key, *.p12             # Node certs for each instance
    │   │   │   │   ├── http-elasticsearch-*.csr/key    # HTTP service certs for HTTPS APIs
    │   │   │   │   ├── sample-elasticsearch.yml        # Example ES configuration
    │   │   │   │   └── README.txt                      # Node-level info
    │   │   ├── elasticsearch-ssl-http.zip              # Bundled certs for HTTP layer
    │   │   ├── es_native_certs_bundle*.zip             # Bundled native ES certs
    │   │   ├── instances.yml                           # Defines node names and hostnames
    │   │   └── kibana/                                 # Certificates for Kibana dashboard
    │   │       ├── sample-kibana.yml
    │   │       └── README.txt
    │   │
    │   └── opensearch/                                 # OpenSearch and OpenSearch Dashboard certs
    │       ├── admin.*, es_kibana_client.*, root-ca.*  # Admin + dashboard + CA certs
    │       ├── elasticsearch/                          # Node certs for OpenSearch nodes
    │       │   ├── elasticsearch-{1,2,3}/              # Per-node certs, keystore/truststore
    │       │   │   ├── *.crt, *.key, *.p12, *.csr  
    │       │   │   ├── elasticsearch-*-keystore.jks    # Keystores for OpenSearch nodes
    │       │   │   ├── elasticsearch-*-truststore.key  # Truststores
    │       │   │   └── http-elasticsearch-*.csr/key    # HTTP layer certs
    │       ├── es_kibana_client.{pem,key,p12,csr}      # Kibana client certs
    │       ├── elastic-stack-ca.*                      # OpenSearch cluster CA
    │       └── root-ca.*                               # Root CA reference for OpenSearch
    │   
    ├── nifi/                                           # NiFi HTTPS and toolkit certificates
    │   ├── nifi.{crt,key,p12,pem,csr}                  # Primary NiFi node certificates
    │   ├── nifi-keystore.jks                           # Java keystore for NiFi server
    │   ├── nifi-truststore.jks                         # Truststore for verifying other services
    │   
    └── root/                                           # Root Certificate Authority (CA)
        ├── root-ca.key, root-ca.pem                    # Private key and public cert
        ├── root-ca.p12, root-ca.keystore.jks           # PKCS#12 and Java Keystore formats
        ├── root-ca-truststore.jks                      # Truststore for client-side verification
        └── root-ca.csr, root-ca.srl                    # Certificate signing request and serial
```

---

### ⚙️ Environment configuration

All certificate-generation scripts source variables from `.env` files under `security/env/`:

| File | Description |
|------|--------------|
| `certificates_general.env` | Global Root CA options (CN, expiry, key size). |
| `certificates_elasticsearch.env` | Node names, SAN hostnames, version control for ES/OS. |
| `certificates_nifi.env` | NiFi keystore/truststore names and passwords. |
| `users_*.env` | Default credentials used by generation scripts. |

### 📜 openssl-x509.conf

Set up a reusable certificate config to define SANs and subject. This is used globally for all services except ES native.
Feel free to add custom DNS
Note that the settings here impact services that rely on Distinguished Names (DN) attributes for authentication.

```ini
# =========================================================================================
# 📜 OpenSSL X.509 v3 Extensions Configuration
# For: Root CA and Node/Client Certificates
# =========================================================================================

[v3_ca]
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:TRUE
keyUsage = critical, keyCertSign, cRLSign
subjectAltName=DNS:nifi,DNS:elasticsearch-1,DNS:elasticsearch-2,DNS:elasticsearch-3,DNS:cogstack,DNS:*.cogstack

[v3_leaf]
basicConstraints = critical, CA:FALSE
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth, clientAuth
subjectAltName = @alt_names
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer

[alt_names]
DNS.1 = nifi
DNS.2 = nifi-nginx
DNS.3 = elasticsearch-1
DNS.4 = elasticsearch-2
DNS.5 = elasticsearch-3
DNS.6 = ocr-service
DNS.7 = ocr-service-text-only
DNS.8 = medcat-trainer-nginx
DNS.9 = medcat-trainer-ui 
DNS.10 = nlp-medcat-service-production
DNS.11 = nlp-medcat-service-production-deid
DNS.12 = cogstack-kibana
DNS.13 = cogstack-cohort
DNS.14 = cogstack-elasticsearch-1
DNS.15 = cogstack-elasticsearch-2
DNS.16 = cogstack-elasticsearch-3
DNS.17 = cogstack-nifi
DNS.18 = cogstack-nifi-nginx
DNS.19 = cogstack-auth-service
DNS.20 = cogstack
DNS.21 = *.cogstack
DNS.22 = localhost
IP.1 = 127.0.0.1
email.1 = admin@cogstack.net

[req]
default_bits       = 4096
string_mask        = utf8only
prompt = no
distinguished_name = req_distinguished_name
x509_extensions    = v3_leaf
default_md         = sha256

[req_distinguished_name]
CN = cogstack
C  = UK
ST = London
L  = UK
O  = cogstack
OU = cogstack
CN = cogstack
```

> 💡 **Tip:**  
> Always reload environment variables before running any script:
> ```bash
> cd ../deploy
> source export_env_vars.sh
> cd ../security
> ```
> or manually if you just want to test out one file:
> ```bash
> source file.env
> ```

---

### 🛠️ Generation workflow

From the repository root, initialize all certificates required by NiFi and the
search backend selected by `ELASTICSEARCH_VERSION` in `deploy/elasticsearch.env`:

```bash
make -C deploy init-security
```

You can also initialize certificate sets independently:

```bash
make -C deploy init-security-root-ca
make -C deploy init-security-nifi
make -C deploy init-security-opensearch
make -C deploy init-security-elasticsearch
```

The initialization targets are idempotent: complete certificate sets are left
unchanged. Native Elasticsearch generation uses Docker and refuses to overwrite
an existing incomplete directory automatically.

1. **(Optional) Create custom JKS keystores**

   ```bash
   cd security/scripts
   bash create_keystore.sh mycert.pem mystore.jks mypassword
   ```

2. **Re-export environment variables and restart services**

   ```bash
   cd ../../deploy
   source export_env_vars.sh
   make start-<SERVICE_NAME>
   ```

---

### 🧠 Best practices

- **Do not commit** private keys (`*.key`, `*.p12`, `*.jks`) to version control.  
- **Back up** the Root CA files securely — they’re your trust anchor.  
- **Rotate** certificates regularly (every 2 years) or whenever hostnames change.  
- **Use unique CN/SANs** per environment (`dev`, `staging`, `prod`).  
- **Verify** certificate chains before deployment (e.g):

```bash
  openssl verify -CAfile security/certificates/root/root-ca.pem security/certificates/elastic/opensearch/elasticsearch/elasticsearch-1/elasticsearch-1.crt
```
