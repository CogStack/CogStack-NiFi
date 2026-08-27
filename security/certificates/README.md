# Generated certificates

Everything in this directory, apart from this file, is generated locally and
must not be committed. Generated bundles include private keys and are specific
to a development or deployment environment.

From `security/scripts`, generate the shared root CA first and then the
certificates needed by the service being tested. For example:

```bash
./create_root_ca_cert.sh
./create_nifi_certs.sh
```

For OpenSearch, run the root CA generator followed by the node and client/admin
certificate generators described in the security documentation.

Any private keys that were previously committed to Git must be considered
public. Do not reuse them outside local development, and rotate any deployment
credentials or certificates derived from them.
