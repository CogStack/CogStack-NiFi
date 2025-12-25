## 🔐 NiFi/NiFi Registry TLS & Admin Access Setup (with NGINX)

This guide documents how to configure TLS and certificate-based admin access for Apache NiFi Registry (v1.26+) using OpenSSL-generated certificates and NGINX as a reverse proxy.
For background on how these certificates are generated, see [Certificates and Root CA](certificates.md).  
This section focuses on applying those certificates to secure **NiFi** and **NiFi Registry Flow**, including admin identity configuration and reverse-proxy integration.

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

For securing Apache NiFi endpoint with self-signed certificates please refer to [the official documentation](https://nifi.apache.org/docs/nifi-docs/html/walkthroughs.html#securing-nifi-with-provided-certificates).

Before starting the NIFI container it's important to take note of the following things if we wish to enable HTTPS functionality:

- this step is optional (as you might have done it before from configuring other certificates), run `create_root_ca_cert.sh` to create the ROOT certificates, these will be used by NiFi/NiFi Registry Flow/OpenSearch etc.

- **(OPTIONAL, DO NOT USE FOR NIFI VERSION >= 2.0)** the `nifi_toolkit_security.sh` script is used to download the nifi toolkit and generate new certificates and keys that are used by the container, take note that inside the `localhost` folder there is another nifi.properties file that is generated, we must look to the following setttings which are generated randomly and copy them to the `nifi/conf/nifi.properties` file.
- the trust/store keys generated for production will be in the `nifi_certificates/localhost` folder and  the `nifi-cert.pem` + `nifi-key.key` files. in the base `nifi_certificates` folder.

- as part of the security process the `nifi.sensitive.props.key` should be set to a random string or a password of minimum 12 characters. Once this is set do NOT modify it as all the other sensitive passwords will be hashed with this string. By default this is set to <strong><code>cogstackNiFipass</code></strong>
Example (`nifi/conf/nifi.properties`):

```properties
    nifi.security.keystorePasswd=ZFD4i4UDvod8++XwWzTg+3J6WJF6DRSZO33lbb7hAgc
    nifi.security.keyPasswd=ZFD4i4UDvod8++XwWzTg+3J6WJF6DRSZO33lbb7hAgc
    nifi.security.truststore=./conf/truststore.jks
    nifi.security.truststoreType=jks
    nifi.security.truststorePasswd=lzMGadNB1JXQjgQEnFStLiNkJ6Wbbgw0bFdCTICKtKo
```

### Setting up access via user account (SINGLE USER CREDETIAL)

<strong>This is entirely optional, if you have configered the security certs as described in <code>security/README.md</code> then you are good to go.</strong>
<br>
Default username :
<br>

```text
    username: admin     
    password: cogstackNiFi
```

- the `login-identity-providers.xml` file in `/nifi/conf/` stores the password for the user account, to generate a password one must use the following command within the container : `/opt/nifi/nifi-current/bin/nifi.sh set-single-user-credentials USERNAME PASSWORD`, once done, you would need to copy the file from `/opt/nifi/nifi-current/conf/login-identity-providers.xml` locally with docker cp and replace the one in the `nifi/conf` folder and rebuild the container.

- alternative to the above step: go into the `/security` folder, set the desired nifi username & password in the `/security/nifi_users.env` file. Make sure to STOP any running NiFi containers `docker stop cogstack-nifi` and execute the following script: `bash /security/nifi_init_create_user_auth.sh`, this script will start a NiFi container for the time of the account creation and then remove itself, after it finishes, go back to the `/deploy` folder and start your NiFi container, all should be working!

URL: <https://localhost:8443/nifi/login>

Troubleshooting Security : if you encounter errors related to sensitive key properties not being set please clear/delete the docker volumes of the nifi container or delete all volumes of inactive containers `docker volume prune`.

### Disabling the login screen

If for some reason you do not wish to authenticate every time you connect to NiFi, you can enable the client certificates in the [nginx.conf](../services/nginx/config/nginx.conf) line 86-87 and delete the commented lines.

### `nifi-nginx`

Alternatively, one can secure the access to selected services by using NGINX reverse proxy.
This may be essential in case some of the web services that need to be exposed to end-users do not offer SSL encryption.
See [the official documentation](https://docs.nginx.com/nginx/admin-guide/security-controls/securing-http-traffic-upstream/) for more details on using NGINX for that.

Nginx only requires the root-CA certificate by default, so use the above [generate cert](#generating-the-base-certificates-for-nifinginxjupyterhubocr-servicetikamedcat-service-certificates) section to create it.

In order to be able to properly access the nifi instance securely, you also need to start the nifi-nginx container as it is configured to provide access from any source to nifi, available at <https://localhost:8443/nifi> .

---

### 🔐 authorizers.xml – Multiple Admins

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

### 🌐 `nifi-registry.properties`

```properties
nifi.registry.web.context.path=/nifi-registry
nifi.registry.web.proxy.context.path=/nifi-registry
nifi.registry.web.proxy.host=localhost:18443,nginx.local:18443
nifi.registry.security.identity.mapping.pattern.dn=^.*?CN=(.*?)(,|$)
```

---

### 🌍 NGINX Reverse Proxy Example

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

### ✅ Final Checklist

- [x] Certificate CN matches identity in `authorizers.xml`
- [x] NGINX uses correct client cert + root CA
- [x] `proxy_pass` includes `/nifi-registry/` and `/nifi-registry-api/` context
- [x] `nifi.registry.web.proxy.*` is aligned with NGINX
- [x] Clear cookies if browser UI shows **Anonymous**

---

### 🧪 Test Identity

```bash
curl -vk   --cert ./nifi.pem   --key ./nifi.key   https://localhost:18443/nifi-registry-api/tenants/me
```

---

### 🛠 If Settings Icon Missing

- Double-check that the user shown by `/tenants/me` is **exactly** the same as `Initial Admin Identity`
- Recreate `authorizations.xml` if needed by clearing it
- Restart NiFi Registry after updates

---

Maintained by: `admin@cogstack.org`

### 🔐 Admin Identity Consistency Between NiFi and NiFi Registry

To ensure a seamless integration between **NiFi** and **NiFi Registry**, especially when using flows versioned through the Registry, **the certificate identity used for administration must be present in both systems**.

If your admin certificate resolves to identity `CN=cogstack`, then:

#### ✅ You must define it in both `authorizers.xml` files

**For NiFi** (`conf/authorizers.xml`):

```xml
<property name="Initial Admin Identity">C=UK, ST=London, L=UK, O=cogstack, OU=cogstack, CN=cogstack</property>
```

**For NiFi Registry** (`conf/authorizers.xml`):

```xml
<property name="Initial Admin Identity">C=UK, ST=London, L=UK, O=cogstack, OU=cogstack, CN=cogstack</property>
```

> 📝 If you’re using `nifi.security.identity.mapping.pattern.dn` to reduce the full DN to something simpler like `cogstack`, ensure that the mapped identity is **also** consistent and declared in both systems.
