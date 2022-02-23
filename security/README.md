# Introduction

With NiFi 1.15+ HTTPS is enforced, this requires users to generate their own certificates. Some default publicly availble certificates are available in this repo as part of the demo but users should ALWAYS generate their own in production environment setups.

The Elasticsearch instances are now setup also with certificates, mainly cause this would most likely always be a requirement as part of a production deployment.

# General steps

<strong>THIS IS PREREQUISITE FOR ALL THE SECTIONS BELOW</strong> 

By default the root certificate needs to be generated first, as this will be used as the base cert for other the other keys. To do this, execute ```./create_root_ca_cert.sh```.

All certificates are generated to be valid for 730 days, feel free with the `CERTIFICATE_TIME_VAILIDITY_IN_DAYS` property to extend this.


## Keystores and truststores
Nifi will require trust and key stores for SSL connections, you can generate these in PKCS12 format via the `create_keystore.sh` script (useful in our case for ES connections). 

# Generating the nifi certs
- the `nifi_toolkit_security.sh` script is used to download the nifi toolkit and generate new certificates and keys that are used by the container, take note that inside the `localhost` folder there is another nifi.properties file that is generated, we must look to the following setttings which are generated randomly and copy them to the `nifi/conf/nifi.properties` file. 
- the trust/store keys generated for production will be in the `nifi_certificates/localhost` folder and  the `nifi-cert.pem` + `nifi-key.key` files. in the baes `nifi_certificates` folder.
- as port of the security process the `nifi.sensitive.props.key` should be set to a random string or a password of minimum 12 characters. Once this is set do NOT modify it as all the other sensitive passwords will be hashed with this string. By default this is set to <strong>```cogstackNiFipass```</strong>. <strong>IF YOU MODIFY this setting you will need to re-run the `nifi_toolkit_security.sh` script. </strong>

***IMPORTANT***  This tool will modify the `nifi.sensitive.props*` settings in the `nifi.properties` file, make sure not to change those settings after executing the scripts otherwise your NiFi instance will not run.
All the certificates for nifi can be found in the `nifi_certificates` folder.

# Generating ES + KIBANA CERTS

Make sure to execute the scripts in the order mentioned, the `root_ca` must be generated first.

## For Elasticsearch
We have to make sure to execute the following commands `bash ./create_es_nodecert.sh elasticsearch-1 && bash ./create_es_nodecert.sh elasticsearch-2` this will generate the certificates for both nodes, for both nodes make sure to generate the ADMIN authorization certificate by doing `bash ./create_es_admin_cert.sh`.

## Kibana
We only have to generate one client certificate, we can do so by doing `bash ./create_es_client_cert.sh` 

All the above certificates are automatically transfered to the `es_certificates` folder after generation.
