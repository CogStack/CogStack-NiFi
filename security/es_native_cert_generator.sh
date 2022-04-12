#!/bin/bash

set -e

CERTIFICATE_PASSWORD="cogstackNifi"
CERTIFICATE_TIME_VAILIDITY_IN_DAYS=730

echo -ne "
instances:
  - name: elasticsearch-1
    dns:
      - es01
      - elasticsearch-1
      - localhost
    ip:
      - 127.0.0.1
  - name: elasticsearch-2
    dns:
      - es02
      - elasticsearch-2
      - localhost   
    ip:
      - 127.0.0.1" > config/certificates/instances.yml
 
if [[ ! -f /certs/es_native_ca_bundle.zip ]]; then
  echo "Generating root-ca certificates for native ES"
  bin/elasticsearch-certutil ca --silent --days $CERTIFICATE_TIME_VAILIDITY_IN_DAYS --out /certs/elastic-stack-ca.p12 --pass $CERTIFICATE_PASSWORD<<<$CERTIFICATE_PASSWORD
  bin/elasticsearch-certutil cert --ca /certs/elastic-stack-ca.p12 --pass $CERTIFICATE_PASSWORD<<<""$CERTIFICATE_PASSWORD"
  
  " 
  # the above blank line is to avoid answering prompt, don't delete it 
fi;

if [[ ! -f /certs/es_native_certs_bundle.zip ]]; then
  echo "Generating CSR certficates for ES clusters"
  bin/elasticsearch-certutil cert --silent --out /certs/es_native_certs_bundle.zip --in config/certificates/instances.yml  --days $CERTIFICATE_TIME_VAILIDITY_IN_DAYS --ca /certs/elastic-stack-ca.p12<< EOF
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
EOF
fi;

unzip /certs/es_native_certs_bundle_pem.zip -d /certs/elasticsearch
unzip /certs/es_native_certs_bundle.zip -d /certs/elasticsearch


echo "------------------------------------------------"

bin/elasticsearch-certutil --silent http<<<"y
y
elasticsearch-1
localhost
elasticsearch-1
elasticsearch-2
cogstack*
es01
es02


0.0.0.0


n
y
elasticsearch-2
localhost
elasticsearch-1
elasticsearch-2
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

