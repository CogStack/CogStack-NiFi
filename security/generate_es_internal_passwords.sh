#!/bin/bash

# load the ES users configuration
source es_core_users.conf


# container name to connect to
# INFO: change the container name of elasticsearch name deployed under a different one
ES_CONTAINER_NAME=nifi_elasticsearch-1_1

# generate hashes
ES_ADMIN_HASH=$( docker exec $ES_CONTAINER_NAME /bin/sh /usr/share/elasticsearch/plugins/opendistro_security/tools/hash.sh -p $ES_ADMIN_PASS )
ES_KIBANA_HASH=$( docker exec $ES_CONTAINER_NAME /bin/sh /usr/share/elasticsearch/plugins/opendistro_security/tools/hash.sh -p $ES_KIBANA_PASS )

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
