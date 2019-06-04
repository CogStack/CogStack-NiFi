#!/bin/bash

################################
# 
# This script creates example roles and users for ES
#
# WARNING! In production environment please remember to change the default passwords
#
#

set -e

# default conifig for ES
#
ES_HOST=localhost
ES_PORT=9200
ES_USER=admin
ES_PASS=admin


# create roles
#
echo "Creating roles ..."
curl -XPUT -u $ES_USER:$ES_PASS 'https://$ES_HOST:$ES_PORT/_opendistro/_security/api/roles/cogstack_ingest' -H 'Content-Type: application/json' --insecure -d'
{
  "cluster": [
    "CLUSTER_COMPOSITE_OPS",
    "indices:data/read/scroll*"
  ],
  "indices": {
    "nifi_*": {
      "*": [
        "INDICES_ALL"
      ]
    },
    "cogstack_*": {
      "*": [
        "INDICES_ALL"
      ]
    }
  },
  "tenants": {}
}'
echo ""

curl -XPUT -u $ES_USER:$ES_PASS 'https://$ES_HOST:$ES_PORT/_opendistro/_security/api/roles/cogstack_access' -H 'Content-Type: application/json' --insecure -d'
{
  "cluster": [
    "CLUSTER_COMPOSITE_OPS"
  ],
  "indices": {
    "nifi_*": {
      "*": [
        "READ",
        "SEARCH"
      ]
    },
    "cogstack_*": {
      "*": [
        "SEARCH",
        "READ"
      ]
    }
  },
  "tenants": {}
}'
echo ""


# create users
#
echo "Creating users ..."
curl -XPUT -u $ES_USER:$ES_PASS 'https://$ES_HOST:$ES_PORT/_opendistro/_security/api/internalusers/cogstack_user' -H 'Content-Type: application/json' --insecure -d'
{
  "roles": [
    "cogstack_access"
  ],
  "password": "cogstackpass",
  "attributes": {}
}'
echo ""

curl -XPUT -u $ES_USER:$ES_PASS 'https://$ES_HOST:$ES_PORT/_opendistro/_security/api/internalusers/cogstack_pipeline' -H 'Content-Type: application/json' --insecure -d'
{
  "roles": [
    "cogstack_ingest"
  ],
  "password": "cogstackpass",
  "attributes": {}
}'
echo ""

curl -XPUT -u $ES_USER:$ES_PASS 'https://$ES_HOST:$ES_PORT/_opendistro/_security/api/internalusers/nifi' -H 'Content-Type: application/json' --insecure -d'
{
  "roles": [
    "cogstack_ingest"
  ],
  "password": "nifipass",
  "attributes": {}
}'
echo ""


# create mapping roles
#
echo "Creating roles mapping ..."
curl -XPUT -u $ES_USER:$ES_PASS  'https://$ES_HOST:$ES_PORT/_opendistro/_security/api/rolesmapping/cogstack_access' -H 'Content-Type: application/json' --insecure -d'
{
  "backendroles": [
    "cogstack_access"
  ],
  "hosts": [],
  "users": [
    "cogstack_user"
  ]
}'
echo ""

curl -XPUT -u $ES_USER:$ES_PASS  'https://$ES_HOST:$ES_PORT/_opendistro/_security/api/rolesmapping/cogstack_ingest' -H 'Content-Type: application/json' --insecure -d'
{
  "backendroles": [
    "cogstack_ingest"
  ],
  "hosts": [],
  "users": [
    "cogstack_pipeline",
    "nifi"
  ]
}'
echo ""
