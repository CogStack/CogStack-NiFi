#!/bin/bash

# IMPORTANT: remember to change the passwords
ADMIN_PASS=admin
KIBANA_PASS=kibanaserver

# container name to connect to
# INFO: change the container name of elasticsearch name deployed under a different one
ES_CONTAINER_NAME=nifi_elasticsearch-1_1

# generate hashes
ADMIN_HASH=$( docker exec $ES_CONTAINER_NAME /bin/sh /usr/share/elasticsearch/plugins/opendistro_security/tools/hash.sh -p $ADMIN_PASS )
KIBANA_HASH=$( docker exec $ES_CONTAINER_NAME /bin/sh /usr/share/elasticsearch/plugins/opendistro_security/tools/hash.sh -p $KIBANA_PASS )

echo "--------------------------------"
echo "user:     \"admin\""
echo "password: \"$ADMIN_PASS\""
echo "hash:     \"$ADMIN_HASH\""
echo "--------------------------------"
echo "user:     \"kibanaserver\""
echo "password: \"$KIBANA_PASS\""
echo "hash:     \"$KIBANA_HASH\""
echo "--------------------------------"
echo "Now apply these hashes in 'internal_users.yml' file"
