# Security for additional services

Services use dedicated leaf certificates for HTTPS and trust the shared CogStack root CA. The root CA private key must be retained only for signing and must never be mounted as a service's TLS key.

## Gitea TLS configuration

Generate the local/reference Gitea certificate from the repository root:

```bash
make -C deploy init-security-gitea
```

This creates:

```text
security/certificates/gitea/
├── gitea.key
├── gitea.csr
├── gitea.pem
└── gitea.crt
```

The leaf certificate is signed by the shared CA and contains local development SANs for `gitea`, `cogstack-gitea`, `localhost`, and `127.0.0.1`. The Compose configuration mounts the generated certificate directory and configures Gitea to serve `gitea.pem` with `gitea.key`.

For Kubernetes, create the development TLS Secret with:

```bash
kubectl -n cogstack create secret generic gitea-tls \
  --from-file=gitea.pem=./security/certificates/gitea/gitea.pem \
  --from-file=gitea.key=./security/certificates/gitea/gitea.key
```

Production deployments should instead provide a deployment-specific TLS Secret issued for their public Gitea hostname, normally through the platform certificate manager.

## Verification

Verify the generated chain before starting Gitea:

```bash
openssl verify \
  -CAfile security/certificates/root/root-ca.pem \
  security/certificates/gitea/gitea.pem
```

After starting Gitea, verify its HTTPS endpoint:

```bash
curl --cacert security/certificates/root/root-ca.pem https://localhost:3000/
```
