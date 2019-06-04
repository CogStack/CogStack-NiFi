# General info
To use OpenDistro for ElasticSearch and Kibana one needs to generate SSL certificates and later set up users and roles for ElasticSearch cluster.

# Generation of certificates
The scripts available are:
- `create_root_ca_cert.sh` - creates root CA key and certificate,
- `create_client_cert.sh` - creates the client key and certificate,
- `create_keystore.sh` - creates the JKS keystore using previosuly generated certificates,
- `create_es_users.sh` - creates roles and users in ElasticSearch (`create_es_users_insecure.sh` does not need SSL certificates).

## Root CA
Files generated (using `create_root_ca_cert.sh`):
- key: `root-ca.key`
- certificate: `root-ca.pem`

## ElasticSearch + Kibana
ElasticSearch and Kibana both require generating PEM certificates (using `create_client_cert.sh`).

ElasticSearch requires:
- `es-node1.pem`
- `es-node1.key`

These files need to be placed in `services/elasticsearch/config/`. They are further referenced in `services/elasticsearch/config/elasticsearch.yml`.

Kibana requires:
- `kibana.pem`
- `kibana.key`

These files need to be placed in `services/kibana/config/`. They are further referenced in `services/kibana/config/elasticsearch.yml`.

## NiFi
**IMPORTANT: currently, NiFi is not configured to use SSL.**

However, if willing to use a secure connection, it requires the certificates in JKS keystore format (using `create_keystore.sh`).

The `nifi.jks` needs then to be placed in `/nifi/security/nifi.jks`.


# Users and roles in ElasticSearch

## Setting up ElasticSearch
The script `create_es_users.sh` creates and sets up users and roles in ElasticSearch cluster. Alternatively, when SSL is not used `create_es_users_insecure.sh` handles this.

**IMPORTANT: please remember to change the default passwords of the users created before running this in production. ** 

## Roles
The available roles will be created:
- `ingest` - used for data ingestion, only `cogstack_*` and `nifi_*` indices can be used,
- `cogstack_accesss` - used for read-only access to the data.

## Users
The following users will be created:
- `cogstack_pipeline` - uses `ingest` role,
- `nifi` - uses `ingest` role,
- `cogstack_user` -- uses `cogstack_access` role.
