## 🏛️ Certificates and Root CA

This section describes the full structure of the `security/certificates/` directory and explains how certificates are generated, organized, and used across CogStack-NiFi services.

The supported entry point is `make -C deploy init-security`. It generates the shared **Root Certificate Authority (CA)** and the required service certificates locally. Generated certificate material is ignored by Git.

The shared root CA signs the locally generated NiFi, OpenSearch, and Gitea certificates. Native Elasticsearch is the exception: it uses Elastic's certificate tooling to generate a backend-specific CA and certificate set.

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
    │       ├── admin.*, es_kibana_client.*            # Admin + dashboard certificates
    │       ├── elasticsearch/                          # Node certs for OpenSearch nodes
    │       │   ├── elasticsearch-{1,2,3}/              # Per-node certs, keystore/truststore
    │       │   │   ├── *.crt, *.key, *.p12, *.csr  
    │       │   │   ├── elasticsearch-*-keystore.jks    # Keystores for OpenSearch nodes
    │       │   │   ├── elasticsearch-*-truststore.key  # Truststores
    │       │   │   └── http-elasticsearch-*.csr/key    # HTTP layer certs
    │       ├── es_kibana_client.{pem,key,p12,csr}      # Kibana client certs
    │       ├── elastic-stack-ca.*                      # OpenSearch cluster CA
    │       └── elastic-stack-ca.*                     # Shared CA copied for OpenSearch consumers
    │   
    ├── nifi/                                           # NiFi HTTPS and toolkit certificates
    │   ├── nifi.{crt,key,p12,pem,csr}                  # Primary NiFi node certificates
    │   ├── nifi-keystore.jks                           # Java keystore for NiFi server
    │   ├── nifi-truststore.jks                         # Truststore for verifying other services
    │
    ├── gitea/                                          # Dedicated Gitea leaf certificate
    │   └── gitea.{crt,key,pem,csr}
    │
    └── root/                                           # Root Certificate Authority (CA)
        ├── root-ca.key, root-ca.pem                    # Private key and public cert
        ├── root-ca.p12, root-ca-keystore.jks           # PKCS#12 and Java Keystore formats
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
| `users_*.env` | Public local-development credentials consumed by services and setup scripts. Override them for every real deployment. |

### OpenSSL extension configuration

`security/templates/ssl-extensions-x509.cnf` defines the shared CA and general service certificate extensions. `security/templates/gitea-x509.cnf` contains the narrower server-only SAN set used by Gitea. Add every deployment hostname to the relevant SAN list before generating certificates; changing a template does not alter certificates that have already been generated.

The Make targets load the required `.env` files automatically. The lower-level scripts remain available for development and troubleshooting, but should be run from `security/scripts/` because several of them use paths relative to that directory.

---

### 🛠️ Generation workflow

From the repository root, initialize all certificates required by NiFi, Gitea,
and the search backend selected by `ELASTICSEARCH_VERSION` in `deploy/elasticsearch.env`:

```bash
make -C deploy init-security
```

You can also initialize certificate sets independently:

```bash
make -C deploy init-security-root-ca
make -C deploy init-security-nifi
make -C deploy init-security-gitea
make -C deploy init-security-opensearch
make -C deploy init-security-elasticsearch
```

The initialization targets are idempotent: complete certificate sets are left
unchanged. Root CA and native Elasticsearch generation refuse to overwrite an
existing incomplete directory automatically, preventing accidental CA rotation.

1. **(Optional) Create a custom JKS keystore**

   The low-level helper expects `mycert.crt` and `mycert.key` in the current directory. Pass base names rather than file names with extensions:

   ```bash
   cd security/scripts
   bash create_keystore.sh mycert mycert-keystore mypassword
   ```

2. **Restart the required services**

   ```bash
   make -C deploy start-<SERVICE_NAME>
   ```

---

### 🧠 Best practices

- **Do not commit** private keys (`*.key`, `*.p12`, `*.jks`) to version control.
- **Back up** the root CA securely — it is the deployment trust anchor.
- **Rotate** certificates before expiry or whenever a key may have been exposed.
- **Use unique CN/SANs** per environment (`dev`, `staging`, `prod`).
- **Verify** certificate chains before deployment (e.g):

```bash
openssl verify -CAfile security/certificates/root/root-ca.pem \
  security/certificates/elastic/opensearch/elasticsearch/elasticsearch-1/elasticsearch-1.crt
```
