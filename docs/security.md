# Security
In [the example deployment](deploy/services.md), for the ease of deployment and demo purposes, all the services have SSL security disabled and are using the default built-in users with passwords.

With NiFi 1.15+ HTTPS is enforced, this requires users to generate their own certificates. Some default publicly availble certificates are available in this repo as part of the demo but users should ALWAYS generate their own in production environment setups.

The Elasticsearch instances are now setup also with certificates, mainly cause this would most likely always be a requirement as part of a production deployment.

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
For information on OpenSearch for Elasticsearch security features and their configuration please refer to [the official documentation](https://opensearch.org/docs/latest/security-plugin/index/).

We also provide as part of our deployment the native Elastisearch version since it is used across many organisations in production environments [documentation](ttps://www.elastic.co/). 
Please note that the deployment of native ES version requires different settings to be changed from the current repository state.

# Generating ES + KIBANA CERTS

#### Elasticsearch Security Requirements

Please pay attention to the following sections, the describe what is needed to secure each version of ES deployments(Opensearch/Native ES)
### For OpenSearch
ElasticSearch OpenSearch requires the following certifiates available in the [security](security/) folder:
- `es_certificates/elasticsearch-1.pem`
- `es_certificates/elasticsearch-1.key`
- `es_certificates/elasticsearch-2.pem`
- `es_certificates/elasticsearch-2.key`
- `root-ca.key`
- `root-ca.pem`

We have to make sure to execute the following commands `bash ./create_es_nodecert.sh elasticsearch-1 && bash ./create_es_nodecert.sh elasticsearch-2` this will generate the certificates for both nodes, for both nodes make sure to generate the ADMIN authorization certificate by doing `bash ./create_es_admin_cert.sh`.

The keystore/truststore certificates are also generated when creating the node certificates, these are used in the NiFi workflows.

#### Generating users

Please see the `security/opensearch` folder for the roles mappings and internal users for user data. You can also use the `create_es_users.sh` script for this.

### For Elasticsearch Native

ElasticSearch Native requires the following certificates, available in the [security](security/) folder:
- `es_certificates/ca/ca.crt`
- `es_certificates/ca/ca.key`
- `es_certificates/elasticsearch/elasticsearch-1/http-elasticsearch-1.crt`
- `es_certificates/elasticsearch/elasticsearch-1/http-elasticsearch-1.key`
- `es_certificates/elasticsearch/elasticsearch-2/http-elasticsearch-2.crt`
- `es_certificates/elasticsearch/elasticsearch-2/http-elasticsearch-2.key`

To generate the above certificates all that is needed is to run the [`create_es_native_certs.sh`](security/create_es_native_certs.sh).

#### Generating users

You can generate some basic users by executing the [`create_es_native_credentials.sh`](security/create_es_native_credentials.sh) script, if you wish to add more users make sure to take a look at the official documentation on how to create roles and accounts. 

### Kibana (OpenDashboard)
Kibana OpenDashboard requires:
- `admin.pem`
- `admin-key.pem`
- `es_kibana_client.pem`
- `es_kibana_client.key`

Once generated, the files can be further referenced in `services/kibana/config/kibana_opensearch.yml` and/or linked directly in the Docker compose file with services configuration.

### Kibana 

- `es_certificates/elasticsearch-1/elasticsearch-1.crt`
- `es_certificates/elasticsearch-1/elasticsearch-1.key`
- `es_certificates/elasticsearch-2/elasticsearch-2.crt`
- `es_certificates/elasticsearch-2/elasticsearch-2.crt`
- `es_certificates/ca/ca.crt`

These certificates are generates by the steps mentioned in the above Elasticsearch Native section.

## Users and roles in ElasticSearch

### Users and passwords
The sample users and passwords are specified in the following `.env` files in `security/` directory:
- `es_internal_users.env` - contains passwords for ElasticSearch internal users,
- `es_kibana_user.env` - contains user and password used by Kibana,
- `es_cogstack_users.env` - contains passwords for custom ElasticSearch users.


### Setting up ElasticSearch
On the first run, after changing the default passwords, one should change the default `admin` and `kibanaserver` passwords as specified in the [OpenSearch documentation](https://opensearch.org/docs/latest/security-plugin/access-control/users-roles/).

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
The generated certificates (by `create_root_ca_cert.sh`) can be referenced directly in `services.yml` file in the example deployment or directly in the internal JupyterHub configuration file.
The COOKIE secret is a key used to encrypt browser cookies, please use the `generate_cookie_secret.sh`(./services/jupyter-hub/generate_cookie_secret.sh) script to generate a new key, make sure it is done before starting the container.

One should also configure and set up users, since the default user is `admin`, and the password is set the first time the account is logged in to (be careful, if there is a mistake delete the jupyter container and its volumes and restart).
See example deployment [services](deploy/services.md) for more details.

Once the container is started up you can create your users and also assing them to groups. 

You can create users before hand by adding newlines in the `userlist`(services/jupyter-hub/config/userlist) file, users with admin roles will need to have their role specificed on the same line, e.g: `user_name admin`.

If you want to create shared folder for users to use add them to the `teamlist`(services/jupyter-hub/config/teamlist) file, the first column is the shared folder name and the rest are just the usernames assigned to it.

For more information on JupyterHub security features and their configuration please refer to [the official documentation](https://jupyterhub.readthedocs.io/en/stable/getting-started/security-basics.html).


## Apache NiFi
For securing Apache NiFi endpoint with self-signed certificates please refer to [the official documentation](https://nifi.apache.org/docs/nifi-docs/html/walkthroughs.html#securing-nifi-with-provided-certificates).

Regarding connecting to services that use self-signed certificates (such as Elasticsearch), it is required that these certificates use JKS keystore format.
The certificates can be generated using `create_keystore.sh`.


## NGINX
Alternatively, one can secure the access to selected services by using NGINX reverse proxy.
This may be essential in case some of the web services that need to be exposed to end-users do not offer SSL encryption. 
See [the official documentation](https://docs.nginx.com/nginx/admin-guide/security-controls/securing-http-traffic-upstream/) for more details on using NGINX for that.
