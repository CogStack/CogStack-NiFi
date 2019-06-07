#!/bin/bash
################################
# 
# This script creates example roles and users for ES
#
# IMPORTANT: for production deployment remember to change the default passwords below
#
#

set -e


# ES admin config for altering users and roles
#
ES_HOST=localhost
ES_PORT=9200
ES_ADMIN_USER=admin


# load the build-in users pass
#
source es_core_users.conf


# load the custom users config
#
source es_cogstack_users.conf


# create roles
#
echo "Creating roles ..."
curl -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS "http://$ES_HOST:$ES_PORT/_opendistro/_security/api/roles/cogstack_ingest" -H 'Content-Type: application/json' --insecure -d'
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

curl -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS "http://$ES_HOST:$ES_PORT/_opendistro/_security/api/roles/cogstack_access" -H 'Content-Type: application/json' --insecure -d'
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
curl -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS "http://$ES_HOST:$ES_PORT/_opendistro/_security/api/internalusers/cogstack_user" -H 'Content-Type: application/json' --insecure -d"
{
  \"roles\": [
    \"cogstack_access\"
  ],
  \"password\": \"$COGSTACK_USER_PASS\",
  \"attributes\": {}
}"
echo ""

curl -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS "http://$ES_HOST:$ES_PORT/_opendistro/_security/api/internalusers/cogstack_pipeline" -H 'Content-Type: application/json' --insecure -d"
{
  \"roles\": [
    \"cogstack_ingest\"
  ],
  \"password\": \"$COGSTACK_PIPELINE_PASS\",
  \"attributes\": {}
}"
echo ""

curl -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS "http://$ES_HOST:$ES_PORT/_opendistro/_security/api/internalusers/nifi" -H 'Content-Type: application/json' --insecure -d"
{
  \"roles\": [
    \"cogstack_ingest\"
  ],
  \"password\": \"$COGSTACK_NIFI_PASS\",
  \"attributes\": {}
}"
echo ""


# create mapping roles
#
echo "Creating roles mapping ..."
curl -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS  "http://$ES_HOST:$ES_PORT/_opendistro/_security/api/rolesmapping/cogstack_access" -H 'Content-Type: application/json' --insecure -d'
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

curl -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS  "http://$ES_HOST:$ES_PORT/_opendistro/_security/api/rolesmapping/cogstack_ingest" -H 'Content-Type: application/json' --insecure -d'
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


# mnodify passwords for internal build-in users
#
echo "Modifying passwords for internal build-in users ..."
curl -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS "http://$ES_HOST:$ES_PORT/_opendistro/_security/api/internalusers/logstash" -H 'Content-Type: application/json' --insecure -d"
{
  \"roles\": [
    \"logstash\"
  ],
  \"password\": \"$ES_LOGSTASH_PASS\",
  \"attributes\": {}
}"
echo ""

curl -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS "http://$ES_HOST:$ES_PORT/_opendistro/_security/api/internalusers/kibanaro" -H 'Content-Type: application/json' --insecure -d"
{
  \"roles\": [
    \"kibanauser\",
    \"readall\"
  ],
  \"password\": \"$ES_KIBANARO_PASS\",
  \"attributes\": {}
}"
echo ""

curl -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS "http://$ES_HOST:$ES_PORT/_opendistro/_security/api/internalusers/readall" -H 'Content-Type: application/json' --insecure -d"
{
  \"roles\": [
    \"readall\"
  ],
  \"password\": \"$ES_READALL_PASS\",
  \"attributes\": {}
}"
echo ""

curl -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS "http://$ES_HOST:$ES_PORT/_opendistro/_security/api/internalusers/snapshotrestore" -H 'Content-Type: application/json' --insecure -d"
{
  \"roles\": [
    \"snapshotrestore\"
  ],
  \"password\": \"$ES_SNAPSHOTRESTORE_PASS\",
  \"attributes\": {}
}"
echo ""
