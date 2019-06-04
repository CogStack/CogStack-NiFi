# Security and generation of SSL certificates.

## General info

To use ElasticSearch with OpenDistro one needs to generate certificates and set up users and roles for ElasticSearch cluster.

## Generation of certificates
The scripts are located in `./security` dir.

The script `create_cert.sh` creates the client certificates.

The script `create_keystore.sh` creates the JKS keystore using previosuly generated certificates.

### Root CA
Files used:
- `./security/root-ca.pem`

### ElasticSearch + Kibana
Requires PEM certs.

Files used:
- `./security-pem/es-node1.pem`
- `./security-pem/es-node1.key`
- `./security-pem/kibana.pem`
- `./security-pem/kibana.key`

### CogStack-Pipeline
Requires JKS keystore.

Files used:
- `./pipelines/cogstack-pipeline/security/cogstack.jks`

### NiFi
Requires JKS keystore.

Files used:
- `./nifi/security/nifi.jks`

### annotations-ingester
Requires PEM certs. For the ease of deployment, uses the PEM certificates generated for CogStack-Pipeline

Files used:
- `./security/cogstack.pem`
- `./security/cogstack.key`


## Users and roles in ElasticSearch

### Setting up ElasticSearch

The script `create_es_users.sh` creates and sets up users and roles in ElasticSearch cluster.

### Roles

The available roles are:
- `ingest` -- used for data ingestion -- only `cogstack_*` and `nifi_*` indices can be used,
- `cogstack_accesss` -- used for read-only access to the data.

### Users

The following users are available:
- `cogstack_pipeline` -- uses `ingest` role,
- `nifi` -- uses `ingest` role,
- `cogstack_user` --- uses `cogstack_access` role.
