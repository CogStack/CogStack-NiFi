# General info
To use OpenDistro for ElasticSearch and Kibana one needs to generate SSL certificates for these services and client applications using it. Moreover, one needs to set up users and roles used in ElasticSearch cluster.

For the moment, in this example, we are using self-signed certificates.


# Generation of self-signed certificates
The scripts available are:
- `create_root_ca_cert.sh` - creates root CA key and certificate,
- `create_client_cert.sh` - creates the client key and certificate,
- `create_keystore.sh` - creates the JKS keystore using previously generated (client) certificates.

## Root CA
Files generated (using `create_root_ca_cert.sh`):
- key: `root-ca.key`
- certificate: `root-ca.pem`

## ElasticSearch + Kibana
ElasticSearch and Kibana both require generating PEM certificates (using `create_client_cert.sh`).

ElasticSearch requires:
- `es-node1.pem`
- `es-node1.key`

These files need to be placed in `security/` directory. They are further referenced in `services/elasticsearch/config/elasticsearch.yml`. When setting up a multi-node ElasticSearch cluster, more keys need to be generated accordingly.

Kibana requires:
- `kibana.pem`
- `kibana.key`

These files need to be placed in `security/`. They are further referenced in `services/kibana/config/elasticsearch.yml`.

## NiFi
**IMPORTANT: currently, NiFi is not configured to use SSL.**

However, if willing to use a secure connection, it requires the certificates in JKS keystore format (using `create_keystore.sh`).

The `nifi.jks` needs then to be placed in `/nifi/security/nifi.jks`.


# Users and roles in ElasticSearch

## Users and passwords
The users and passwords are specified in the following `.env` files in `security/` directory:
- `es_internal_users.env` - contains passwords for ElasticSearch internal users,
- `es_kibana_user.env` - contains user and password used by Kibana,
- `es_cogstack_users.env` - contains passwords for custom ElasticSearch users.

**IMPORTANT: please remember to change the default passwords for the users before running this in production.**


## Setting up ElasticSearch
On the first run, after changing the default passwords, one should change the default `admin` and `kibanaserver` passwords as specified in the [OpenDistro documentation](https://opendistro.github.io/for-elasticsearch-docs/docs/install/docker-security/). To do so, one should:
- run the script `generate_es_internal_passwords.sh` to generate hashes,
- modify the `internal_users.yml` file with the generated hashes, 
- restart the stack, but with using `docker-compose down -v` to remove the volume data.

Following, one should modify the default passwords for the other build-in users (`logstash`, `kibanaro`, `readall`, `snapshotrestore`) and to create custom users (`cogstack_pipeline`, `cogstack_user`, `nifi`), as specified below. The script `create_es_users.sh` creates and sets up users and roles in ElasticSearch cluster.

## New roles
The available roles will be created:
- `ingest` - used for data ingestion, only `cogstack_*` and `nifi_*` indices can be used,
- `cogstack_accesss` - used for read-only access to the data only from `cogstack_*` and `nifi_*` indices.

## New users
The following users will be created:
- `cogstack_pipeline` - uses `ingest` role,
- `nifi` - uses `ingest` role,
- `cogstack_user` - uses `cogstack_access` role.
