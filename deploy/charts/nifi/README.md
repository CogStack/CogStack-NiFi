# cogstack-nifi Helm Chart

Helm chart for deploying the CogStack Apache NiFi image on Kubernetes.

## What this chart deploys

- NiFi `StatefulSet` using the repository's custom `cogstacksystems/cogstack-nifi` image
- ClusterIP and headless Services
- Per-pod PVCs for NiFi configuration, logs, repositories, state, Python working directory, and flowfile error output
- Optional Ingress
- Optional RBAC for NiFi 2.x Kubernetes Lease and ConfigMap-based clustering

## Default mode

The default is a single-node TLS NiFi deployment. This matches the current repository security defaults more closely than enabling a cluster by default because the repo currently ships single-user authentication and a shared NiFi certificate baseline.

The chart bootstraps writable PVCs from the image path `/tmp/cogstack_nifi/nifi`, which is populated by the repo Dockerfile. It copies:

- `conf/` to the writable NiFi config PVC
- `drivers/` to `/opt/nifi/drivers`
- `user_schemas/` to `/opt/nifi/user_schemas`
- `user_python_extensions/` to the NiFi Python extensions directory
- selected source directories from `user_scripts/` to the NiFi Python working directory

Generated `user_scripts/extensions/` virtualenv content is not copied from the image; NiFi can recreate it at runtime.

## Required TLS Secret

The chart reads selected defaults from:

- `deploy/nifi.env`
- `security/env/certificates_nifi.env`
- `security/env/users_nifi.env`

Create a Kubernetes Secret containing the NiFi keystore and truststore files before installing:

```bash
kubectl create namespace cogstack --dry-run=client -o yaml | kubectl apply -f -

kubectl -n cogstack create secret generic nifi-certs \
  --from-file=nifi-keystore.jks=./security/certificates/nifi/nifi-keystore.jks \
  --from-file=nifi-truststore.jks=./security/certificates/nifi/nifi-truststore.jks \
  --dry-run=client -o yaml | kubectl apply -f -
```

By default, the chart generates a separate sensitive-config Secret from `security/env/certificates_nifi.env` and `security/env/users_nifi.env`. That Secret contains the keystore/truststore passwords, `nifi.sensitive.props.key`, and single-user credentials. Do not bake these values into images.

For production, if you do not want these sensitive values rendered into Helm manifests and stored in Helm release metadata, pre-create the sensitive-config Secret and set `sensitiveConfig.create=false` plus `sensitiveConfig.existingSecret=<secret-name>`.

If you use different key names, update:

```yaml
certificates:
  existingSecret: nifi-certs
  files:
    keystore: nifi-keystore.jks
    truststore: nifi-truststore.jks
sensitiveConfig:
  create: true
  existingSecret: ""
  keys:
    sensitivePropsKey: nifi-sensitive-props-key
    keystorePassword: nifi-keystore-password
    keyPassword: nifi-key-password
    truststorePassword: nifi-truststore-password
    singleUserUsername: nifi-single-user-username
    singleUserPassword: nifi-single-user-password
```

## Install

```bash
helm upgrade --install cogstack-nifi ./deploy/charts/nifi \
  -f ./deploy/helm/nifi.values.yaml \
  --namespace cogstack --create-namespace
```

## Render templates

```bash
helm template cogstack-nifi ./deploy/charts/nifi \
  -f ./deploy/helm/nifi.values.yaml \
  --namespace cogstack
```

## Local access

```bash
kubectl -n cogstack port-forward svc/cogstack-nifi 8443:8443
```

Then open:

```text
https://localhost:8443/nifi
```

## Cluster mode

NiFi 2.x can use Kubernetes Leases for leader election and Kubernetes ConfigMaps for cluster state. Enable this with:

```yaml
replicaCount: 3
nifi:
  cluster:
    enabled: true
```

When enabled, the chart grants the service account the required namespace-scoped Lease and ConfigMap permissions.

Before using cluster mode in production, also review the NiFi authentication and authorization model. The repo defaults use single-user authentication and one shared NiFi certificate; a production NiFi cluster should normally use node-specific identities and an authorizer configuration that grants those node identities cluster access.

## Notes

- The `conf` PVC is writable and persistent. Runtime changes made by NiFi will survive pod restarts.
- `nifi.bootstrapFromImage.overwriteExistingConfig` defaults to `false`, so chart upgrades do not overwrite an existing config PVC. Set it to `true` only when you intentionally want to refresh config from the image.
- `nifi.bootstrapFromImage.overwriteExistingResources` controls refreshes for drivers, schemas, user scripts, and Python extensions.
- The service uses `sessionAffinity: ClientIP` by default. If you expose clustered NiFi through an Ingress, configure sticky sessions at the Ingress/load-balancer layer too.
- TLS files, TLS passwords, `nifi.sensitive.props.key`, and single-user credentials are read from Kubernetes Secret data, not from the image.
