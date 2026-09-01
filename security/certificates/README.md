# Generated certificates

Everything in this directory, apart from this file, is generated locally and
must not be committed. Generated bundles include private keys and are specific
to a development or deployment environment.

From the repository root, generate all missing certificates required by NiFi,
Gitea, and the search backend selected in `deploy/elasticsearch.env`:

```bash
make -C deploy init-security
```

The individual initialization targets are also available:

```bash
make -C deploy init-security-root-ca
make -C deploy init-security-nifi
make -C deploy init-security-gitea
make -C deploy init-security-opensearch
make -C deploy init-security-elasticsearch
```

These targets leave complete existing certificate sets unchanged. An incomplete
root CA or native Elasticsearch set causes a safe failure so the existing
material can be preserved and repaired; the targets never silently rotate a CA.

Any private keys that were previously committed to Git must be considered
public. Do not reuse them outside local development, and rotate any deployment
credentials or certificates derived from them.
