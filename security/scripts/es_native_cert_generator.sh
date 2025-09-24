#!/usr/bin/env bash

set -e

# Validate required variables
: "${ES_CERTIFICATE_PASSWORD:?Must set ES_CERTIFICATE_PASSWORD in certificates_elasticsearch.env}"
: "${ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS:?Must set ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS in certificates_elasticsearch.env}"

# Set this variable in order to add more ES_HOSTNAMES to the dns approved instances
# the syntax must be : export ES_HOSTNAMES="- example1.com
#- example2.com
#- example3.com
#"
# EXACTLY IN THIS FORMAT(no extra chars at the start of the line), otherwise you will get parse errors.

: "${ES_HOSTNAMES:?Must set ES_HOSTNAMES in certificates_elasticsearch.env}"

# es instances names, domain names of the servers (if ES servers are separate) or docker containers names (if run locally on the same machine)
# Example: 
#   - if running on clusters separate servers:
#     ES_INSTANCE_NAME_1=es-server01
#     ES_INSTANCE_NAME_2=es-server02
#   - if running them on the same server (put the container names):
#     ES_INSTANCE_NAME_1=elasticsearch-1
#     ES_INSTANCE_NAME_2=elasticsearch-2

: "${ES_INSTANCE_NAME_1:?Must set ES_INSTANCE_NAME_1 in certificates_elasticsearch.env}"
: "${ES_INSTANCE_NAME_2:?Must set ES_INSTANCE_NAME_2 in certificates_elasticsearch.env}"
: "${ES_INSTANCE_NAME_3:?Must set ES_INSTANCE_NAME_3 in certificates_elasticsearch.env}"
: "${ES_INSTANCE_ALTERNATIVE_1_NAME:?Must set ES_INSTANCE_ALTERNATIVE_1_NAME in certificates_elasticsearch.env}"
: "${ES_INSTANCE_ALTERNATIVE_2_NAME:?Must set ES_INSTANCE_ALTERNATIVE_2_NAME in certificates_elasticsearch.env}"
: "${ES_INSTANCE_ALTERNATIVE_3_NAME:?Must set ES_INSTANCE_ALTERNATIVE_3_NAME in certificates_elasticsearch.env}"

_ES_HOSTNAMES=""
for host in $ES_HOSTNAMES; do
  _ES_HOSTNAMES+="      - $host"$'\n'
done
ES_HOSTNAMES=$_ES_HOSTNAMES

cat > config/certificates/instances.yml <<EOF
instances:
  - name: $ES_INSTANCE_NAME_1
    dns:
      - $ES_INSTANCE_NAME_1
      - es01
      - localhost
      $ES_HOSTNAMES
    ip:
      - 127.0.0.1
  - name: $ES_INSTANCE_NAME_2
    dns:
      - $ES_INSTANCE_NAME_2
      - es02
      - localhost
      $ES_HOSTNAMES
    ip:
      - 127.0.0.1
  - name: $ES_INSTANCE_NAME_3
    dns:
      - $ES_INSTANCE_NAME_3
      - es02
      - localhost
      $ES_HOSTNAMES
    ip:
      - 127.0.0.1
  - name: $ES_INSTANCE_ALTERNATIVE_1_NAME
    dns:
      - $ES_INSTANCE_ALTERNATIVE_1_NAME
      - es02
      - localhost
      $ES_HOSTNAMES
    ip:
      - 127.0.0.1
  - name: $ES_INSTANCE_ALTERNATIVE_2_NAME
    dns:
      - $ES_INSTANCE_ALTERNATIVE_2_NAME
      - es02
      - localhost
      $ES_HOSTNAMES
    ip:
      - 127.0.0.1
  - name: $ES_INSTANCE_ALTERNATIVE_3_NAME
    dns:
      - $ES_INSTANCE_ALTERNATIVE_3_NAME
      - es02
      - localhost
      $ES_HOSTNAMES
    ip:
      - 127.0.0.1
EOF
 
if [[ ! -f /certs/es_native_ca_bundle.zip ]]; then
  echo "Generating root-ca certificates for native ES"
  bin/elasticsearch-certutil ca --silent --days $ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS --out /certs/elastic-stack-ca.p12 --pass $ES_CERTIFICATE_PASSWORD<<<$ES_CERTIFICATE_PASSWORD
  bin/elasticsearch-certutil cert --silent --ca /certs/elastic-stack-ca.p12 --pass $ES_CERTIFICATE_PASSWORD<<<""$ES_CERTIFICATE_PASSWORD"
  
  "
  # the above blank line is to avoid answering prompt, don't delete it 
fi;

if [[ ! -f /certs/es_native_certs_bundle.zip ]]; then
  echo "Generating CSR certficates for ES clusters"
  bin/elasticsearch-certutil cert --silent --out /certs/es_native_certs_bundle.zip --in config/certificates/instances.yml --days $ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS --ca /certs/elastic-stack-ca.p12<< EOF
$ES_CERTIFICATE_PASSWORD
$ES_CERTIFICATE_PASSWORD
$ES_CERTIFICATE_PASSWORD
$ES_CERTIFICATE_PASSWORD
$ES_CERTIFICATE_PASSWORD
$ES_CERTIFICATE_PASSWORD
$ES_CERTIFICATE_PASSWORD
EOF
fi;

if [[ ! -f /certs/es_native_certs_bundle_pem.zip ]]; then
  echo "Generating PEM certficates for ES clusters"
  bin/elasticsearch-certutil cert --pem --silent --out /certs/es_native_certs_bundle_pem.zip --in config/certificates/instances.yml  --days $ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS --ca /certs/elastic-stack-ca.p12<< EOF
$ES_CERTIFICATE_PASSWORD
$ES_CERTIFICATE_PASSWORD
$ES_CERTIFICATE_PASSWORD
$ES_CERTIFICATE_PASSWORD
$ES_CERTIFICATE_PASSWORD
$ES_CERTIFICATE_PASSWORD
$ES_CERTIFICATE_PASSWORD
EOF
fi;

unzip /certs/es_native_certs_bundle_pem.zip -d /certs/elasticsearch
unzip /certs/es_native_certs_bundle.zip -d /certs/elasticsearch


echo "------------------------------------------------"


echo "------------------------------------------------"

bin/elasticsearch-certutil --silent http<<<"y
y
$ES_INSTANCE_NAME_1
localhost
$ES_INSTANCE_NAME_1
$ES_INSTANCE_NAME_2
$ES_INSTANCE_NAME_3
$ES_INSTANCE_ALTERNATIVE_1_NAME
$ES_INSTANCE_ALTERNATIVE_2_NAME
$ES_INSTANCE_ALTERNATIVE_3_NAME
cogstack*
es01
es02


0.0.0.0


n
y
$ES_INSTANCE_NAME_2
localhost
$ES_INSTANCE_NAME_1
$ES_INSTANCE_NAME_2
$ES_INSTANCE_NAME_3
$ES_INSTANCE_ALTERNATIVE_1_NAME
$ES_INSTANCE_ALTERNATIVE_2_NAME
$ES_INSTANCE_ALTERNATIVE_3_NAME
cogstack*
es01
es02


0.0.0.0


n
y
$ES_INSTANCE_NAME_3
localhost
$ES_INSTANCE_NAME_1
$ES_INSTANCE_NAME_2
$ES_INSTANCE_NAME_3
$ES_INSTANCE_ALTERNATIVE_1_NAME
$ES_INSTANCE_ALTERNATIVE_2_NAME
$ES_INSTANCE_ALTERNATIVE_3_NAME
cogstack*
es01
es02


0.0.0.0


n
y
$ES_INSTANCE_ALTERNATIVE_1_NAME
localhost
$ES_INSTANCE_NAME_1
$ES_INSTANCE_NAME_2
$ES_INSTANCE_NAME_3
$ES_INSTANCE_ALTERNATIVE_1_NAME
$ES_INSTANCE_ALTERNATIVE_2_NAME
$ES_INSTANCE_ALTERNATIVE_3_NAME
cogstack*
es01
es02


0.0.0.0


n
y
$ES_INSTANCE_ALTERNATIVE_2_NAME
localhost
$ES_INSTANCE_NAME_1
$ES_INSTANCE_NAME_2
$ES_INSTANCE_NAME_3
$ES_INSTANCE_ALTERNATIVE_1_NAME
$ES_INSTANCE_ALTERNATIVE_2_NAME
$ES_INSTANCE_ALTERNATIVE_3_NAME
cogstack*
es01
es02


0.0.0.0


n
y
$ES_INSTANCE_ALTERNATIVE_3_NAME
localhost
$ES_INSTANCE_NAME_1
$ES_INSTANCE_NAME_2
$ES_INSTANCE_NAME_3
$ES_INSTANCE_ALTERNATIVE_1_NAME
$ES_INSTANCE_ALTERNATIVE_2_NAME
$ES_INSTANCE_ALTERNATIVE_3_NAME
cogstack*
es01
es02


0.0.0.0


n
n
$ES_CERTIFICATE_PASSWORD
$ES_CERTIFICATE_PASSWORD
/certs/elasticsearch-ssl-http.zip
"

unzip /certs/elasticsearch-ssl-http.zip -d /certs;

echo "Setting file permissions"

chown -R root:root /certs;

find /certs -type d -exec chmod 755 \{\} \;;
find /certs -type f -exec chmod 755 \{\} \;;

# Convert p12 certificates to PEM
openssl pkcs12 -in /certs/elastic-stack-ca.p12 -out /certs/elastic-stack-ca.crt.pem -clcerts -nokeys -password pass:$ES_CERTIFICATE_PASSWORD
openssl pkcs12 -in /certs/elastic-stack-ca.p12 -out /certs/elastic-stack-ca.key.pem -nocerts -nodes -password pass:$ES_CERTIFICATE_PASSWORD

zip -ur /certs/es_native_certs_bundle_pem.zip /certs/elastic-stack-ca.crt.pem /certs/elastic-stack-ca.key.pem

cp -rf /certs/* /usr/share/elasticsearch/config/certificates/

