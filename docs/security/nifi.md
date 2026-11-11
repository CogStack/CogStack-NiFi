## 🔐 NiFi TLS & Admin Access Setup (with NGINX)

This guide covers HTTPS and single-user access to Apache NiFi behind nginx.
Client-certificate administrator identities apply when that authentication mode is selected.
For background on how certificates are generated, see [Certificates and Root CA](certificates.md).

---

### 📁 Folder Structure

```text
security/certificates
├── elastic
├── nifi
│   ├── nifi-keystore.jks
│   ├── nifi-truststore.jks
│   ├── nifi.crt
│   ├── nifi.csr
│   ├── nifi.key
│   ├── nifi.p12
│   └── nifi.pem
└── root
    ├── root-ca-keystore.jks
    ├── root-ca-truststore.jks
    ├── root-ca.crt
    ├── root-ca.csr
    ├── root-ca.key
    ├── root-ca.p12
    ├── root-ca.pem
    └── root-ca.srl
```

---

For securing Apache NiFi endpoints with certificates, see [the official documentation](https://nifi.apache.org/docs/nifi-docs/html/walkthroughs.html#securing-nifi-with-provided-certificates).

Before starting the NiFi container:

- run `make -C deploy init-security-nifi` from the repository root. This creates the shared root CA when needed, then prepares the NiFi bundle, mounted OpenSearch leaf certificates and public CA, and PostgreSQL CA files used by maintained flows. Complete existing certificate sets are preserved, including when a different search backend is selected. For supplied PostgreSQL bundles, see [Docker database security](./databases.md).
- supply a stable `NIFI_SENSITIVE_PROPS_KEY`
  value (minimum 12 characters), and retain it with the persisted flow.

These certificate files are required even when the database and search services
run elsewhere or are not started. The combined `init-security` target covers all
these sets. NiFi mounts only its required leaf certificates and public
CAs; CA signing keys and PostgreSQL private keys are excluded.

Example (`nifi/conf/nifi.properties`):

```properties
nifi.security.keystorePasswd=example-keystore-password
nifi.security.keyPasswd=example-key-password
nifi.security.truststore=./conf/truststore.jks
nifi.security.truststoreType=jks
nifi.security.truststorePasswd=example-truststore-password
```

---

### Setting up access via user account (single user credentials)

Local single-user credentials are defined in `security/env/users_nifi.env`. They are public development defaults and must be replaced for any exposed deployment.

- `login-identity-providers.xml` in `nifi/conf/` stores the account settings.
- to generate credentials inside the container:

```bash
/opt/nifi/nifi-current/bin/nifi.sh set-single-user-credentials USERNAME PASSWORD
```

- Compose passes `security/env/users_nifi.env` credentials to Apache's native
  startup variables, which set the login automatically. Kubernetes deployments
  can populate `SINGLE_USER_CREDENTIALS_USERNAME` and
  `SINGLE_USER_CREDENTIALS_PASSWORD` through Secret environment references.
- For older published images, `bash security/scripts/nifi_init_create_user_auth.sh`
  updates the running NiFi credentials and restarts NiFi. It does not delete
  containers.

See [NiFi container runtime](../deploy/nifi-runtime.md) for non-root permissions,
persistent configuration, Secret inputs, proxy TLS and health checks.

URL: <https://localhost:8443/nifi/login>

---

### `nifi-nginx`

NGINX provides secure reverse-proxy access to NiFi at:

- <https://localhost:8443/nifi>

Reference: `services/nginx/config/nginx.conf.template`.

---

### 🔐 `authorizers.xml` initial admin identity

Ensure your certificate identity is present in NiFi `authorizers.xml`:

```xml
<property name="Initial Admin Identity">C=UK, ST=London, L=UK, O=cogstack, OU=cogstack, CN=cogstack</property>
```

If you use DN mapping (`nifi.security.identity.mapping.pattern.dn`), ensure the mapped identity matches the configured admin identity.

---

### 🌐 `nifi.properties` proxy settings

```properties
nifi.web.proxy.host=localhost:8443,nginx.local:8443
nifi.web.proxy.context.path=/nifi
nifi.security.identity.mapping.pattern.dn=^.*?CN=(.*?)(,|$)
```

---

### 🌍 NGINX reverse proxy example (NiFi)

The maintained template is `services/nginx/config/nginx.conf.template` and is
included in rebuilt proxy images. It enables `proxy_ssl_verify on`, verifies the
configured `NIFI_UPSTREAM_TLS_NAME`, and trusts `NGINX_UPSTREAM_CA`. Public
addressing and optional context prefixes are configured through deployment
settings; see [nginx addressing and TLS](../deploy/nifi-runtime.md#nginx-addressing-and-tls).

---

### ✅ Final checklist

- [x] Certificate SANs cover the public and upstream TLS hostnames
- [x] nginx verifies NiFi's certificate against the expected CA
- [x] `nifi.web.proxy.*` settings match exposed URL and context
- [x] Clear cookies if browser UI shows `Anonymous`

---

### 🧪 Test connectivity

```bash
curl --cacert security/certificates/root/root-ca.pem \
  https://127.0.0.1:8443/nifi-api/authentication/configuration
```

This checks HTTPS readiness. Use username/password login for the default
single-user authentication mode. The maintained smoke test also requests a token
and checks an authenticated API endpoint.

---

### 🛠 Troubleshooting

- Verify `Initial Admin Identity` in `authorizers.xml` matches the certificate identity.
- Recreate `authorizations.xml` if permissions are stuck.
- Restart NiFi after configuration updates.

Maintained by: `admin@cogstack.org`
