#!/bin/bash

################################################################
# 
# This script generates the hashes of passwords for the internal
#  users in OpenDistro\Opensearch that need to be afterwards
#  manually imported
#

set -e

# required env var files
source ../deploy/general.env
source certificates_elasticsearch.env
source certificates_general.env
source elasticsearch_users.env

# container name to connect to
if [ -z "$1" ]; then
	echo "Usage: $0 <es_container_name>"
	exit 1
fi

# load the ES users configuration
source elasticsearch_users.env

ES_CONTAINER_NAME="$1"

# connect to the container and generate hashes
ES_ADMIN_HASH=$( docker exec $ES_CONTAINER_NAME /bin/sh /usr/share/opensearch/plugins/opensearch-security/tools/hash.sh -p $ES_ADMIN_PASS )
ES_KIBANA_HASH=$( docker exec $ES_CONTAINER_NAME /bin/sh /usr/share/opensearch/plugins/opensearch-security/tools/hash.sh -p $ES_KIBANA_PASS )

echo "--------------------------------"
echo "user:     \"admin\""
echo "password: \"$ES_ADMIN_PASS\""
echo "hash:     \"$ES_ADMIN_HASH\""
echo "--------------------------------"
echo "user:     \"kibanaserver\""
echo "password: \"$ES_KIBANA_PASS\""
echo "hash:     \"$ES_KIBANA_HASH\""
echo "--------------------------------"
echo "Now apply these hashes in 'internal_users.yml' file"
