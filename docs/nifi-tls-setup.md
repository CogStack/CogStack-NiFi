# 🔐 NiFi Registry TLS & Admin Access Setup (with NGINX)

This guide documents how to configure TLS and certificate-based admin access for Apache NiFi Registry (v1.26+) using OpenSSL-generated certificates and NGINX as a reverse proxy.

---

## 📁 Folder Structure

```bash
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

## 📜 openssl-x509.conf

Set up a reusable certificate config to define SANs and subject.

```ini
[req]
default_bits = 4096
prompt = no
default_md = sha256
distinguished_name = req_distinguished_name
x509_extensions = v3_leaf

[req_distinguished_name]
C  = UK
ST = London
L  = UK
O  = cogstack
OU = cogstack
CN = cogstack

[v3_leaf]
basicConstraints = critical, CA:FALSE
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth, clientAuth
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
subjectAltName = @alt_names

[alt_names]
DNS.1 = cogstack
DNS.2 = nifi
DNS.3 = nifi-registry
DNS.4 = localhost
DNS.5 = *.cogstack
IP.1 = 127.0.0.1
email.1 = admin@cogstack.net
```

---

## 🔐 authorizers.xml – Multiple Admins

```xml
<userGroupProvider>
    <identifier>file-user-group-provider</identifier>
    <class>org.apache.nifi.registry.security.authorization.file.FileUserGroupProvider</class>
    <property name="Users File">./conf/users.xml</property>
    <property name="Initial User Identity 1">C=UK, ST=London, L=UK, O=cogstack, OU=cogstack, CN=cogstack</property>
    <property name="Initial User Identity 2">cogstack</property>
</userGroupProvider>

<accessPolicyProvider>
    <identifier>file-access-policy-provider</identifier>
    <class>org.apache.nifi.registry.security.authorization.file.FileAccessPolicyProvider</class>
    <property name="User Group Provider">file-user-group-provider</property>
    <property name="Authorizations File">./conf/authorizations.xml</property>
    <property name="Initial Admin Identity">C=UK, ST=London, L=UK, O=cogstack, OU=cogstack, CN=cogstack</property>
    <property name="Initial User Identity 1">C=UK, ST=London, L=UK, O=cogstack, OU=cogstack, CN=cogstack</property>
    <property name="Initial User Identity 2">cogstack</property>
</accessPolicyProvider>
```

---

## 🌐 `nifi-registry.properties`

```properties
nifi.registry.web.context.path=/nifi-registry
nifi.registry.web.proxy.context.path=/nifi-registry
nifi.registry.web.proxy.host=localhost:18443,nginx.local:18443
nifi.registry.security.identity.mapping.pattern.dn=^.*?CN=(.*?)(,|$)
```

---

## 🌍 NGINX Reverse Proxy Example

```nginx
server {
    listen 18443 ssl;
    server_name nginx.local;

    ssl_certificate     /etc/nginx/nifi_certificates/nifi.pem;
    ssl_certificate_key /etc/nginx/nifi_certificates/nifi.key;
    ssl_trusted_certificate /etc/nginx/root_certificates/root-ca.pem;
    proxy_ssl_server_name on;

    location ^~ /nifi-registry/ {
        proxy_ssl_certificate     /etc/nginx/nifi_certificates/nifi.pem;
        proxy_ssl_certificate_key /etc/nginx/nifi_certificates/nifi.key;
        proxy_ssl_trusted_certificate /etc/nginx/root_certificates/root-ca.pem;

        proxy_set_header Host nifi-registry;
        proxy_set_header X-Real-IP nifi-registry;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-ProxyScheme $scheme;

        proxy_pass https://nifi-registry/nifi-registry/;
    }

    location ^~ /nifi-registry-api/ {
        proxy_ssl_certificate     /etc/nginx/nifi_certificates/nifi.pem;
        proxy_ssl_certificate_key /etc/nginx/nifi_certificates/nifi.key;
        proxy_ssl_trusted_certificate /etc/nginx/root_certificates/root-ca.pem;

        proxy_set_header Host nifi-registry;
        proxy_set_header X-Real-IP nifi-registry;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-ProxyScheme $scheme;

        proxy_pass https://nifi-registry/nifi-registry-api/;
    }
}
```

---

## ✅ Final Checklist

- [x] Certificate CN matches identity in `authorizers.xml`
- [x] NGINX uses correct client cert + root CA
- [x] `proxy_pass` includes `/nifi-registry/` and `/nifi-registry-api/` context
- [x] `nifi.registry.web.proxy.*` is aligned with NGINX
- [x] Clear cookies if browser UI shows **Anonymous**

---

## 🧪 Test Identity

```bash
curl -vk   --cert ./nifi.pem   --key ./nifi.key   https://localhost:18443/nifi-registry-api/tenants/me
```

---

## 🛠 If Settings Icon Missing

- Double-check that the user shown by `/tenants/me` is **exactly** the same as `Initial Admin Identity`
- Recreate `authorizations.xml` if needed by clearing it
- Restart NiFi Registry after updates

---

Maintained by: `cogstack-dev@kcl.ac.uk`

### 🔐 Admin Identity Consistency Between NiFi and NiFi Registry

To ensure a seamless integration between **NiFi** and **NiFi Registry**, especially when using flows versioned through the Registry, **the certificate identity used for administration must be present in both systems**.

If your admin certificate resolves to identity `CN=cogstack`, then:

#### ✅ You must define it in both `authorizers.xml` files:

**For NiFi** (`conf/authorizers.xml`):

```xml
<property name="Initial Admin Identity">C=UK, ST=London, L=UK, O=cogstack, OU=cogstack, CN=cogstack</property>
```

**For NiFi Registry** (`conf/authorizers.xml`):

```xml
<property name="Initial Admin Identity">C=UK, ST=London, L=UK, O=cogstack, OU=cogstack, CN=cogstack</property>
```

> 📝 If you’re using `nifi.security.identity.mapping.pattern.dn` to reduce the full DN to something simpler like `cogstack`, ensure that the mapped identity is **also** consistent and declared in both systems.