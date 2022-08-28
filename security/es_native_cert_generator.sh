#!/bin/bash

set -e

if [[ -z "${CERTIFICATE_PASSWORD}" ]]; then
    CERTIFICATE_PASSWORD="cogstackNifi"
    echo "CERTIFICATE_PASSWORD not set, defaulting to CERTIFICATE_PASSWORD=cogstackNifi"
else
    CERTIFICATE_PASSWORD=${CERTIFICATE_PASSWORD}
fi

if [[ -z "${CERTIFICATE_TIME_VAILIDITY_IN_DAYS}" ]]; then
    CERTIFICATE_TIME_VAILIDITY_IN_DAYS=730
    echo "CERTIFICATE_TIME_VAILIDITY_IN_DAYS not set, defaulting to CERTIFICATE_TIME_VAILIDITY_IN_DAYS=730"
fi

# Set this variable in order to add more hostnames to the dns approved instances
# the syntax must be : export HOSTNAMES="- example1.com
#- example2.com
#- example3.com
#"
# EXACTLY IN THIS FORMAT(no extra chars at the start of the line), otherwise you will get parse errors.

if [[ -z "${HOSTNAMES}" ]]; then
	echo "HOSTNAMES env var not set, defaulting to ''"
  HOSTNAMES=""
else
  HOSTNAMES=$(printf '%s %s \\n      ' ${HOSTNAMES})
fi

# es instances names, domain names of the servers (if ES servers are separate) or docker containers names (if run locally on the same machine)
# Example: 
#   - if running on clusters separate servers:
#     ES_INSTANCE_NAME_1=es-server01
#     ES_INSTANCE_NAME_2=es-server02
#   - if running them on the same server (put the container names):
#     ES_INSTANCE_NAME_1=elasticsearch-1
#     ES_INSTANCE_NAME_2=elasticsearch-2

if [[ -z "${ES_INSTANCE_NAME_1}" ]]; then
	echo "ES_INSTANCE_NAME_1 env var not set, defaulting to 'elasticsearch-1'"
  ES_INSTANCE_NAME_1="elasticsearch-1"
else
  ES_INSTANCE_NAME_1="${ES_INSTANCE_NAME_1}"
fi

if [[ -z "${ES_INSTANCE_NAME_2}" ]]; then
	echo "ES_INSTANCE_NAME_2 env var not set, defaulting to 'elasticsearch-2'"
  ES_INSTANCE_NAME_2="elasticsearch-2"
else
  ES_INSTANCE_NAME_2="${ES_INSTANCE_NAME_2}"
fi

if [[ -z "${ES_INSTANCE_NAME_3}" ]]; then
	echo "ES_INSTANCE_NAME_3 env var not set, defaulting to 'elasticsearch-3'"
  ES_INSTANCE_NAME_3="elasticsearch-3"
else
  ES_INSTANCE_NAME_3="${ES_INSTANCE_NAME_3}"
fi

echo -ne "
instances:
  - name: $ES_INSTANCE_NAME_1
    dns:
      - $ES_INSTANCE_NAME_1
      - es01
      - localhost
      $HOSTNAMES
    ip:
      - 127.0.0.1
  - name: $ES_INSTANCE_NAME_2
    dns:
      - $ES_INSTANCE_NAME_2
      - es02
      - localhost
      $HOSTNAMES
    ip:
      - 127.0.0.1
  - name: $ES_INSTANCE_NAME_3
    dns:
      - $ES_INSTANCE_NAME_3
      - es02
      - localhost
      $HOSTNAMES
    ip:
      - 127.0.0.1
" > config/certificates/instances.yml
 
if [[ ! -f /certs/es_native_ca_bundle.zip ]]; then
  echo "Generating root-ca certificates for native ES"
  bin/elasticsearch-certutil ca --silent --days $CERTIFICATE_TIME_VAILIDITY_IN_DAYS --out /certs/elastic-stack-ca.p12 --pass $CERTIFICATE_PASSWORD<<<$CERTIFICATE_PASSWORD
  bin/elasticsearch-certutil cert --silent --ca /certs/elastic-stack-ca.p12 --pass $CERTIFICATE_PASSWORD<<<""$CERTIFICATE_PASSWORD"
  
  "
  # the above blank line is to avoid answering prompt, don't delete it 
fi;

if [[ ! -f /certs/es_native_certs_bundle.zip ]]; then
  echo "Generating CSR certficates for ES clusters"
  bin/elasticsearch-certutil cert --silent --out /certs/es_native_certs_bundle.zip --in config/certificates/instances.yml  --days $CERTIFICATE_TIME_VAILIDITY_IN_DAYS --ca /certs/elastic-stack-ca.p12<< EOF
$CERTIFICATE_PASSWORD
$CERTIFICATE_PASSWORD
$CERTIFICATE_PASSWORD
$CERTIFICATE_PASSWORD
EOF
fi;

if [[ ! -f /certs/es_native_certs_bundle_pem.zip ]]; then
  echo "Generating PEM certficates for ES clusters"
  bin/elasticsearch-certutil cert --pem --silent --out /certs/es_native_certs_bundle_pem.zip --in config/certificates/instances.yml  --days $CERTIFICATE_TIME_VAILIDITY_IN_DAYS --ca /certs/elastic-stack-ca.p12<< EOF
$CERTIFICATE_PASSWORD
$CERTIFICATE_PASSWORD
$CERTIFICATE_PASSWORD
$CERTIFICATE_PASSWORD
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
cogstack*
es01
es02


0.0.0.0


n
n
$CERTIFICATE_PASSWORD
$CERTIFICATE_PASSWORD
/certs/elasticsearch-ssl-http.zip
"

unzip /certs/elasticsearch-ssl-http.zip -d /certs;

echo "Setting file permissions"
chown -R root:root /certs;
find /certs -type d -exec chmod 750 \{\} \;;
find /certs -type f -exec chmod 640 \{\} \;;


# Convert p12 certificates to PEM
openssl pkcs12 -in /certs/elastic-stack-ca.p12 -out /certs/elastic-stack-ca.crt.pem -clcerts -nokeys -password pass:$CERTIFICATE_PASSWORD
openssl pkcs12 -in /certs/elastic-stack-ca.p12 -out /certs/elastic-stack-ca.key.pem -nocerts -nodes -password pass:$CERTIFICATE_PASSWORD

zip -ur /certs/es_native_certs_bundle_pem.zip /certs/elastic-stack-ca.crt.pem /certs/elastic-stack-ca.key.pem

cp -rf /certs/* /usr/share/elasticsearch/config/certificates/

