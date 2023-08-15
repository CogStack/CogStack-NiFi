#!/bin/bash

################################################################
# 
# This script creates roles and users for OpenDistro 
#  ElasticSearch distribution bundled with security plugin
#  using provided env file with users/passwords
#

set -e

# get the ES hostname
#
if [ -z "$1" ]; then
  echo "Usage: $0 <es_hostname> [--use-ssl]"
  exit 1
else
  ES_HOST=$1
fi


# check which protocol to use
#
if [ ! -z "$2" ] && [ "$2" = "--use-ssl" ]; then
  HTTP_PROTOCOL=https
  SSL_FLAGS="$SSL_FLAGS"
else
  HTTP_PROTOCOL=http
  SSL_FLAGS=""
fi


# ES admin config for altering users and roles
#
ES_PORT=9200
ES_ADMIN_USER=admin


# load the internal users passwords
# IMPORTANT: for production deployments please remember to change the passwords
#
source elasticsearch_users.env


# load the custom users passwords
# IMPORTANT: for production deployments please remember to change the passwords
#
source es_cogstack_users.env


echo "Going to query: $HTTP_PROTOCOL://$ES_HOST:$ES_PORT"


# create tenants
#
echo "Creating tenants ..."
curl -k -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS "$HTTP_PROTOCOL://$ES_HOST:$ES_PORT/_opendistro/_security/api/tenants/nifi_tenant" -H 'Content-Type: application/json' $SSL_FLAGS -d'
{
  "description": "A tenant for the NiFi"
}'
echo ""

curl -k -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS "$HTTP_PROTOCOL://$ES_HOST:$ES_PORT/_opendistro/_security/api/tenants/cogstack_tenant" -H 'Content-Type: application/json' $SSL_FLAGS -d'
{
  "description": "A tenant for the CogStack"
}'
echo ""


# create roles
#
echo "Creating roles ..."
curl -k -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS "$HTTP_PROTOCOL://$ES_HOST:$ES_PORT/_opendistro/_security/api/roles/cogstack_ingest" -H 'Content-Type: application/json' $SSL_FLAGS -d'
{
  "cluster_permissions": [
    "cluster_composite_ops",
    "indices:data/read/scroll*"
  ],
  "index_permissions": [{
    "index_patterns" : [
      "nifi_*",
      "cogstack_*" 
      ],
      "fls": [],
      "masked_fields": [],
      "allowed_actions": [
        "indices_all"
      ]
  }],
  "tenant_permissions": [{
    "tenant_patterns": [
      "nifi_tenant",
      "cogstack_tenant"
    ],
    "allowed_actions": [
      "kibana_all_write"
    ]
  }]
}'
echo ""

curl -k -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS "$HTTP_PROTOCOL://$ES_HOST:$ES_PORT/_opendistro/_security/api/roles/cogstack_access" -H 'Content-Type: application/json' $SSL_FLAGS -d'
{
  "cluster_permissions": [
    "cluster_composite_ops"
  ],
  "index_permissions": [{
    "index_patterns" : [
      "cogstack_*",
      "nifi_*"
      ],
      "fls": [],
      "masked_fields": [],
      "allowed_actions": [
        "search",
        "read",
        "get"
      ]
  }],
  "tenant_permissions": [{
    "tenant_patterns": [
      "cogstack_tenant"
    ],
    "allowed_actions": [
      "kibana_all_write"
    ]
  }]
}'
echo ""



# create users
#
echo "Creating users ..."
curl -k -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS "$HTTP_PROTOCOL://$ES_HOST:$ES_PORT/_opendistro/_security/api/internalusers/cogstack_user" -H 'Content-Type: application/json' $SSL_FLAGS -d"
{
  \"backend_roles\": [
    \"cogstack_access\",
    \"kibanauser\"
  ],
  \"password\": \"$COGSTACK_USER_PASS\",
  \"attributes\": {}
}"
echo ""

curl -k -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS "$HTTP_PROTOCOL://$ES_HOST:$ES_PORT/_opendistro/_security/api/internalusers/cogstack_pipeline" -H 'Content-Type: application/json' $SSL_FLAGS -d"
{
  \"backend_roles\": [
    \"cogstack_ingest\"
  ],
  \"password\": \"$COGSTACK_PIPELINE_PASS\",
  \"attributes\": {}
}"
echo ""

curl -k -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS "$HTTP_PROTOCOL://$ES_HOST:$ES_PORT/_opendistro/_security/api/internalusers/nifi" -H 'Content-Type: application/json' $SSL_FLAGS -d"
{
  \"backend_roles\": [
    \"cogstack_ingest\"
  ],
  \"password\": \"$COGSTACK_NIFI_PASS\",
  \"attributes\": {}
}"
echo ""


# create mapping roles
#
echo "Creating roles mapping ..."
curl -k -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS  "$HTTP_PROTOCOL://$ES_HOST:$ES_PORT/_opendistro/_security/api/rolesmapping/cogstack_access" -H 'Content-Type: application/json' $SSL_FLAGS -d'
{
  "backend_roles": [
    "cogstack_access"
  ],
  "hosts": [],
  "users": [
    "cogstack_user"
  ]
}'
echo ""

curl -k -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS  "$HTTP_PROTOCOL://$ES_HOST:$ES_PORT/_opendistro/_security/api/rolesmapping/cogstack_ingest" -H 'Content-Type: application/json' $SSL_FLAGS -d'
{
  "backend_roles": [
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
curl -k -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS "$HTTP_PROTOCOL://$ES_HOST:$ES_PORT/_opendistro/_security/api/internalusers/logstash" -H 'Content-Type: application/json' $SSL_FLAGS -d"
{
  \"backend_roles\": [
    \"logstash\"
  ],
  \"password\": \"$ES_LOGSTASH_PASS\",
  \"attributes\": {}
}"
echo ""

curl -k -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS "$HTTP_PROTOCOL://$ES_HOST:$ES_PORT/_opendistro/_security/api/internalusers/kibanaro" -H 'Content-Type: application/json' $SSL_FLAGS -d"
{
  \"backend_roles\": [
    \"kibanauser\",
    \"readall\"
  ],
  \"password\": \"$ES_KIBANARO_PASS\",
  \"attributes\": {}
}"
echo ""

curl -k -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS "$HTTP_PROTOCOL://$ES_HOST:$ES_PORT/_opendistro/_security/api/internalusers/readall" -H 'Content-Type: application/json' $SSL_FLAGS -d"
{
  \"backend_roles\": [
    \"readall\"
  ],
  \"password\": \"$ES_READALL_PASS\",
  \"attributes\": {}
}"
echo ""

curl -k -XPUT -u $ES_ADMIN_USER:$ES_ADMIN_PASS "$HTTP_PROTOCOL://$ES_HOST:$ES_PORT/_opendistro/_security/api/internalusers/snapshotrestore" -H 'Content-Type: application/json' $SSL_FLAGS -d"
{
  \"backend_roles\": [
    \"snapshotrestore\"
  ],
  \"password\": \"$ES_SNAPSHOTRESTORE_PASS\",
  \"attributes\": {}
}"
echo ""
