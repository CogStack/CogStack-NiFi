## 🔐 NiFi TLS & Admin Access Setup (with NGINX)

This guide documents how to configure TLS and certificate-based admin access for Apache NiFi behind NGINX.
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

- (optional if already done) run `create_root_ca_cert.sh` to generate root CA certs used across services.
- set `nifi.sensitive.props.key` to a stable value (minimum 12 characters).

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

Default:

```text
username: admin
password: cogstackNiFi
```

- `login-identity-providers.xml` in `nifi/conf/` stores the account settings.
- to generate credentials inside the container:

```bash
/opt/nifi/nifi-current/bin/nifi.sh set-single-user-credentials USERNAME PASSWORD
```

- alternatively:
  - set credentials in `security/env/users_nifi.env`
  - stop NiFi (`docker stop cogstack-nifi`)
  - run `bash security/scripts/nifi_init_create_user_auth.sh`

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

```nginx
server {
    listen 8443 ssl;
    server_name nginx.local;

    ssl_certificate           /certificates/nifi/nifi.pem;
    ssl_certificate_key       /certificates/nifi/nifi.key;
    ssl_client_certificate    /certificates/root/root-ca.pem;
    ssl_trusted_certificate   /certificates/root/root-ca.pem;

    location / {
        proxy_set_header Host nifi;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-ProxyHost $host;
        proxy_set_header X-ProxyPort 8443;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-ProxyScheme $scheme;
        proxy_pass https://nifi;
    }

    location /nifi {
        proxy_set_header Host nifi;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-ProxyHost $host;
        proxy_set_header X-ProxyPort 8443;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-ProxyScheme $scheme;
        proxy_pass https://nifi;
    }

    location ^~ /nifi-api/ {
        proxy_set_header Host nifi;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-ProxyHost $host;
        proxy_set_header X-ProxyPort 8443;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-ProxyScheme $scheme;
        proxy_pass https://nifi/nifi-api/;
    }
}
```

---

### ✅ Final checklist

- [x] Certificate CN matches the NiFi admin identity
- [x] NGINX uses the expected certificates and root CA
- [x] `nifi.web.proxy.*` settings match exposed URL and context
- [x] Clear cookies if browser UI shows `Anonymous`

---

### 🧪 Test connectivity

```bash
curl -vk --cert ./nifi.pem --key ./nifi.key https://localhost:8443/nifi-api/flow/about
```

---

### 🛠 Troubleshooting

- Verify `Initial Admin Identity` in `authorizers.xml` matches the certificate identity.
- Recreate `authorizations.xml` if permissions are stuck.
- Restart NiFi after configuration updates.

Maintained by: `admin@cogstack.org`
