# Security
In [the example deployment](deploy/services.md), for the ease of deployment and demo purposes, all the services have SSL security disabled and are using the default built-in users with passwords.

However, to use the services with SSL enabled (e.g., Elasticsearch and Kibana), one needs to obtain SSL certificates for these services. 
One needs also to set up users and roles in the services used in the considered services.

This directory contains example scripts to generate and use self-signed certificates and to set up users and roles in Elasticsearch.
It also gives hints for securing access to other relevant services used in the deployment.

**IMPORTANT: 
Please note that the actual security configuration will depend on the requirements of the user/team/organisation planning to use the services stack.
The information provided in this README hence should be only considered as a hint and consulted with the key stakeholders before considering any production use.**


## Generation of self-signed certificates
Assuming that one needs to generate self-signed certificates for the services, there are provided some useful scripts:
- `create_root_ca_cert.sh` - creates root CA key and certificate,
- `create_client_cert.sh` - creates the client key and certificate,
- `create_keystore.sh` - creates the JKS keystore using previously generated (client) certificates.

### Root CA
Using `create_root_ca_cert.sh` the files generated are:
- key: `root-ca.key`
- certificate: `root-ca.pem`

### ELK stack
For information on OpenDistro for Elasticsearch security features and their configuration please refer to [the official documentation](https://opendistro.github.io/for-elasticsearch/features/security.html).

ElasticSearch and Kibana both require certificates in PEM format and these can be generated using `create_client_cert.sh`.

#### Elasticsearch
ElasticSearch requires:
- `es-node1.pem`
- `es-node1.key`

Once generated, these files can be referenced in `services/elasticsearch/config/elasticsearch.yml` and/or linked directly in the Docker compose file with services configuration.
When setting up a multi-node Elasticsearch cluster, more certificates need to be generated, one per node accordingly.

#### Kibana
Kibana requires:
- `kibana.pem`
- `kibana.key`

Once generated, the files can be further referenced in `services/kibana/config/kibana.yml` and/or linked directly in the Docker compose file with services configuration.


## Users and roles in ElasticSearch

### Users and passwords
The sample users and passwords are specified in the following `.env` files in `security/` directory:
- `es_internal_users.env` - contains passwords for ElasticSearch internal users,
- `es_kibana_user.env` - contains user and password used by Kibana,
- `es_cogstack_users.env` - contains passwords for custom ElasticSearch users.


### Setting up ElasticSearch
On the first run, after changing the default passwords, one should change the default `admin` and `kibanaserver` passwords as specified in the [OpenDistro documentation](https://opendistro.github.io/for-elasticsearch-docs/docs/install/docker-security/).

To do so, one can:
- run the script `generate_es_internal_passwords.sh` to generate hashes,
- modify the `internal_users.yml` file with the generated hashes, 
- restart the stack, but with using `docker-compose down -v` to remove the volume data.

Following, one should modify the default passwords for the other build-in users (`logstash`, `kibanaro`, `readall`, `snapshotrestore`) and to create custom users (`cogstack_pipeline`, `cogstack_user`, `nifi`), as specified below. 
The script `create_es_users.sh` creates and sets up example users and roles in ElasticSearch cluster.

### New roles
Example new roles that will be created after running `create_es_users.sh`:
- `ingest` - used for data ingestion, only `cogstack_*` and `nifi_*` indices can be used,
- `cogstack_accesss` - used for read-only access to the data only from `cogstack_*` and `nifi_*` indices.

### New users
Example new users will be created after running `create_es_users.sh`:
- `cogstack_pipeline` - uses `ingest` role (deprecated),
- `nifi` - uses `ingest` role,
- `cogstack_user` - uses `cogstack_access` role.


## JupyterHub
Similarly, as in case of ELK stack, one should obtain certificates for JupyterHub to secure the access to the exposed endpoint.
The generated certificates (by `create_client_cert.sh`) can be referenced directly in `services.yml` file in the example deployment or directly in the internal JupyterHub configuration file.

One should also configure and set up users, since the default user with `admin` password is being used in the example deployment. 
See example deployment [services](deploy/services.md) for more details.

For more information on JupyterHub security features and their configuration please refer to [the official documentation](https://jupyterhub.readthedocs.io/en/stable/getting-started/security-basics.html).


## Apache NiFi
For securing Apache NiFi endpoint with self-signed certificates please refer to [the official documentation](https://nifi.apache.org/docs/nifi-docs/html/walkthroughs.html#securing-nifi-with-provided-certificates).

Regarding connecting to services that use self-signed certificates (such as Elasticsearch), it is required that these certificates use JKS keystore format.
The certificates can be generated using `create_keystore.sh`.


## NGINX
Alternatively, one can secure the access to selected services by using NGINX reverse proxy.
This may be essential in case some of the web services that need to be exposed to end-users do not offer SSL encryption. 
See [the official documentation](https://docs.nginx.com/nginx/admin-guide/security-controls/securing-http-traffic-upstream/) for more details on using NGINX for that.
