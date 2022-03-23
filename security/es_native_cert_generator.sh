#!/bin/bash

set -e


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
  bin/elasticsearch-certutil ca --silent --pem -out /certs/es_native_ca_bundle.zip;
  unzip /certs/es_native_ca_bundle.zip -d /certs; 
fi;

if [[ ! -f /certs/es_native_certs_bundle.zip ]]; then
  echo "Generating certficates for ES clusters"
  bin/elasticsearch-certutil cert --silent --pem -out /certs/es_native_certs_bundle.zip --in config/certificates/instances.yml --ca-cert /certs/ca/ca.crt --ca-key /certs/ca/ca.key;
  unzip /certs/es_native_certs_bundle.zip -d /certs;
fi;

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

/certs/elasticsearch-ssl-http.zip
"

unzip /certs/elasticsearch-ssl-http.zip -d /certs;

echo "Setting file permissions"
chown -R root:root /certs;
find /certs -type d -exec chmod 750 \{\} \;;
find /certs -type f -exec chmod 640 \{\} \;;
cp -rf /certs/* /usr/share/elasticsearch/config/certificates/