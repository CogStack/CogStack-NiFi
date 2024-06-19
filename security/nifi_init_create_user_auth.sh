#!/bin/bash

set -e

echo "Deleting the current nifi container"
docker container rm -f $(docker ps -a -q --filter name="cogstack-nifi*") || true

echo "starting up the nifi container for script execution ..." 
docker-compose -f ../deploy/services.yml up -d nifi

echo "Creating NiFi single-user-credentials from nifi_users.env ..."
docker exec -it cogstack-nifi /bin/bash /opt/nifi/nifi-current/security_scripts/nifi_create_single_user_auth.sh

echo "Deleting the nifi container"
docker container rm -f $(docker ps -a -q --filter name="cogstack-nifi*") || true