# NiFi and nginx container runtime

The rebuilt NiFi and `nifi-nginx` images run as non-root users and include their
baseline application resources. Their startup does not require a repository
checkout. On-prem processor/source mounts remain supported.

These changes apply to newly built images. The published digests in
`deploy/nifi.env` remain unchanged until new images are published. Use
`make -C deploy start-nifi-dev-build` to build the current source.
Promote those images and update the published digest settings when releasing.

## Configuration and secrets

NiFi inherits Apache's entrypoint, Python interpreter and Python directory
defaults. The image enables certificate reload and sets shutdown periods during
the build. Deployment configuration and credentials from the checkout are not
copied into the image.

Apache's bundled NARs are inherited; only additional extensions are downloaded.
The image retains `/tmp/cogstack_nifi/nifi` bootstrap resources consumed by the
existing chart, and the script-import link used by editable site mounts.

The development Compose service keeps writable runtime configuration at
`/opt/nifi/nifi-current/conf` in the existing `nifi-vol-conf` volume. Docker
populates a new volume from the image; subsequent starts retain the flow,
authorization files and configuration already in that volume. The repository's
`nifi/conf` directory is not automatically imported into this volume.

The published-image Compose service retains its writable `nifi/conf` bind mount.
A deployment can also supply its own writable configuration directory. Apache's
startup edits configuration in place, so its runtime `conf` directory must be
writable by the runtime user. In Kubernetes, any preparation of read-only
ConfigMap/Secret configuration belongs in the deployment, for example an init
container copying settings to writable storage.

Compose maps the existing `NIFI_SINGLE_USER_CREDENTIALS_*`, `NIFI_KEYSTORE_*`
and `NIFI_TRUSTSTORE_*` settings to Apache's native environment variables.
Existing deployment security env files continue to work. Direct image users
and Kubernetes deployments should supply the native names:

```text
AUTH=tls
NIFI_SECURITY_USER_AUTHORIZER=single-user-authorizer
NIFI_SECURITY_USER_LOGIN_IDENTITY_PROVIDER=single-user-provider
SINGLE_USER_CREDENTIALS_USERNAME=<username>
SINGLE_USER_CREDENTIALS_PASSWORD=<password, minimum 12 characters>
KEYSTORE_PATH=/run/certificates/keystore.p12
KEYSTORE_TYPE=PKCS12
KEYSTORE_PASSWORD=<keystore password>
TRUSTSTORE_PATH=/run/certificates/truststore.p12
TRUSTSTORE_TYPE=PKCS12
TRUSTSTORE_PASSWORD=<truststore password>
NIFI_SENSITIVE_PROPS_KEY=<stable flow-encryption key>
```

Here `AUTH=tls` invokes Apache's supplied-certificate configuration. The explicit
single-user authorizer and login provider preserve username/password login over
HTTPS. Other authentication modes use Apache's native settings for those modes.

Kubernetes can populate credential environment variables with
`env.valueFrom.secretKeyRef` and mount certificate files read-only. There is no
custom `_FILE` secret loader or configuration-copying entrypoint. Use
hex-generated values for store passwords and the flow key so they pass unchanged
through Apache's property substitution.

Keep `NIFI_SENSITIVE_PROPS_KEY` stable with the persisted flow and retain a
protected backup. Rotating it requires NiFi's encryption migration procedure.
Settings without a supported Apache environment variable are configured in the
runtime `nifi.properties` or `bootstrap.conf`.

## Persistent and editable paths

| Path | Purpose |
|---|---|
| `/opt/nifi/nifi-current/conf` | Runtime configuration, flow definition and authorization files |
| `/opt/nifi/nifi-current/flowfile_repository` | Queue metadata |
| `/opt/nifi/nifi-current/content_repository` | Queued content |
| `/opt/nifi/nifi-current/database_repository` | NiFi databases |
| `/opt/nifi/nifi-current/provenance_repository` | Provenance history |
| `/opt/nifi/nifi-current/state` | Component state and default script SQLite databases |
| `/opt/nifi/user_scripts` | Editable site scripts; imports follow this directory |
| `/opt/nifi/nifi-current/python_extensions` | Editable Python processor extensions |
| `/opt/nifi/nifi-current/work/python` | Generated Python environments/cache, separate from source |

Preserve the repository volumes together with the flow definition. Replacing an
image must not replace these volumes. Each NiFi instance needs its own repository
and local-state storage. Keep logs available through container stdout and retain
log files separately when required.

The existing script and processor mounts remain editable on the host. Mounting
them does not require rebuilding the image. Startup never copies bundled source
over a mounted site directory. Python imports of `nifi.user_scripts` follow the
mounted scripts directory, without requiring a second copy of the source.

Published images default to UID/GID `1000:1000`. Local Compose builds use the host
UID/GID, selected by `COGSTACK_LOCAL_UID` and `COGSTACK_LOCAL_GID`, so private
host-owned certificate files remain readable without making them public. Existing
volumes must be writable by the selected runtime identity; migrate ownership of
existing NiFi volumes before switching identities. Secret/certificate inputs must
be readable by that identity or its filesystem group. Startup does not run a root
ownership-fixing process.

Before upgrading an existing site that uses script SQLite databases, stop NiFi
and copy the contents of `nifi/user_scripts/db/` into the persistent
`state/user_scripts/db/` directory, preserving ownership for the runtime user.
Keep the original files as a backup. The new default does not automatically move
or delete site data; a site-specific `NIFI_USER_SCRIPT_DB_DIR` still overrides it.

## nginx addressing and TLS

nginx renders its bundled template into `/tmp/nginx/nginx.conf`. Only its runtime
directory needs writes; it supports a read-only root filesystem with writable
`/tmp`. Existing template and site mounts remain optional overrides.

The published-image Compose service provides a temporary filesystem at
`NGINX_RUNTIME_DIR` (default `/tmp/nginx`). This also creates the parent directory
required by the older image's stock entrypoint when loading the updated template.

| Setting | Default / purpose |
|---|---|
| `NIFI_UPSTREAM_HOST` | `nifi`; configurable DNS name |
| `NIFI_UPSTREAM_PORT` | `NIFI_INTERNAL_PORT`, otherwise `8443` |
| `NIFI_UPSTREAM_TLS_NAME` | Certificate hostname to verify, normally `nifi` |
| `NGINX_NIFI_SERVER_NAME` | Public nginx server name, default `_` |
| `NIFI_WEB_PROXY_PORT` | Public port advertised to NiFi, default `8443` |
| `NGINX_PROXY_SCHEME` | Public scheme, default `https` |
| `NGINX_PROXY_CONTEXT_PATH` | Optional public prefix before `/nifi`, empty by default |
| `NGINX_TLS_CERTIFICATE` | `/certificates/nifi/nifi.pem` |
| `NGINX_TLS_CERTIFICATE_KEY` | `/certificates/nifi/nifi.key` |
| `NGINX_UPSTREAM_CA` | `/certificates/root/root-ca.pem` |
| `NGINX_DNS_RESOLVER` | First nameserver from the container's `/etc/resolv.conf` |

nginx verifies both NiFi's certificate chain and hostname. Its upstream DNS
address refreshes when endpoints change. Set NiFi's `NIFI_WEB_PROXY_HOST` to the
public hostname/port used by clients. For a public prefix such as `/cogstack`, set
`NGINX_PROXY_CONTEXT_PATH=/cogstack` and include `/cogstack` in NiFi's
`NIFI_WEB_PROXY_CONTEXT_PATH`; clients then use `/cogstack/nifi/`.

There is no automatic localhost-to-loopback redirect. Open `127.0.0.1` directly
for browsers affected by localhost cookie handling.

Mount certificate directories read-only so replacement files become visible.
New image configuration enables keystore/truststore reload through
`nifi.security.autoreload.enabled=true` in `nifi.properties`. Existing persisted
configuration retains its current value. After renewing nginx's certificate files, run
`nginx -s reload -c /tmp/nginx/nginx.conf` inside the container, or replace the
container. If `NGINX_RUNTIME_DIR` is overridden, use that directory instead.

## Health and shutdown

The images provide exec-compatible checks without exposing application secrets:

```text
/opt/nifi/scripts/cogstack-healthcheck.sh live
/opt/nifi/scripts/cogstack-healthcheck.sh startup
/opt/nifi/scripts/cogstack-healthcheck.sh ready
/usr/local/bin/cogstack-nginx-healthcheck.sh live
/usr/local/bin/cogstack-nginx-healthcheck.sh ready
```

NiFi liveness checks its process status. Startup/readiness checks its local HTTPS
`/nifi-api/authentication/configuration` API using certificate verification. Override
`NIFI_HEALTHCHECK_HOST` and `NIFI_HEALTHCHECK_CA_FILE` when using different
certificate names/issuers. nginx liveness returns locally on
`127.0.0.1:8080/healthz/live`; readiness checks NiFi through the verified upstream.
An upstream outage does not fail nginx liveness. `NGINX_HEALTH_PORT` changes the
local check port. Docker health checks use readiness; other runtimes can call the
scripts for their separate startup/liveness/readiness policies.

Apache's startup script handles shutdown signals. New image configuration sets
`nifi.flowcontroller.graceful.shutdown.period=30 sec` in `nifi.properties` and
`graceful.shutdown.seconds=60` in `bootstrap.conf`. Existing persisted or mounted
configuration retains its values. Compose allows 120 seconds before killing
NiFi. nginx uses graceful `SIGQUIT` shutdown and a 90-second Compose stop grace.
