#!/bin/bash

set -e

if [[ -z "${ELASTIC_PASSWORD}" ]]; then
    ELASTIC_PASSWORD=kibanaserver
    echo "ELASTIC_PASSWORD not set, defaulting to ELASTIC_PASSWORD=kibanaserver"
fi

if [[ -z "${ELASTIC_USER}" ]]; then
    ELASTIC_USER=elastic
    echo "ELASTIC_USER not set, defaulting to ELASTIC_USER=elastic"
fi

if [[ -z "${KIBANA_USER}" ]]; then
    KIBANA_USER=kibanaserver
    echo "KIBANA_USER not set, defaulting to KIBANA_USER=kibanaserver"
fi

if [[ -z "${KIBANA_PASSWORD}" ]]; then
    KIBANA_PASSWORD=kibanaserver
    echo "KIBANA_PASSWORD not set, defaulting to KIBANA_PASSWORD=kibanaserver"
fi

echo "Waiting for Elasticsearch availability"
curl -k --cacert ./es_certiticates/ca/ca.crt -key ./es_certificates/ca/ca.key -u elastic:$ELASTIC_PASSWORD https://localhost:9200
echo "Setting kibana_system password"
curl -k -X POST --cacert ./es_certificates/ca/ca.crt -u elastic:$ELASTIC_PASSWORD -H "Content-Type:application/json" https://localhost:9200/_security/user/kibana_system/_password -d "{\"password\":\"$KIBANA_PASSWORD\"}" 


echo "Creating users"
# Create the actual kibanaserver user
curl -k -X POST -u elastic:$ELASTIC_PASSWORD --cacert ./es_certificates/ca/ca.crt "https://localhost:9200/_security/user/$KIBANA_USER?pretty" -H 'Content-Type:application/json' -d'
{
  "password" :"'$KIBANA_PASSWORD'",
  "roles" : ["kibana_system", "kibana_admin", "ingest_admin"],
  "full_name" : "kibanaserver",
  "email" : "cogstack@admin.net"
}
'

if [[ -z "${INGEST_SERVICE_USER}" ]]; then
    INGEST_SERVICE_USER=ingest_service
    echo "INGEST_SERVICE_USER not set, defaulting to INGEST_SERVICE_USER=ingest_service"
fi

if [[ -z "${INGEST_SERVICE_PASSWORD}" ]]; then
    KIBANA_PASSWORD=ingest_service
    echo "INGEST_SERVICE_PASSWORD not set, defaulting to INGEST_SERVICE_PASSWORD=ingest_service"
fi

# Create the actual kibanaserver user
curl -k -X POST -u elastic:$ELASTIC_PASSWORD --cacert ./es_certificates/ca/ca.crt "https://localhost:9200/_security/user/$INGEST_SERVICE_USER?pretty" -H 'Content-Type:application/json' -d'
{
  "password" :"'$INGEST_SERVICE_PASSWORD'",
  "roles" : ["ingest_admin"],
  "full_name" : "ingestion service",
  "email" : "cogstack@admin.net"
}
'

