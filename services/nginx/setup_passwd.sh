#!/bin/bash
set -e

################################################################
# 
# This script generates users and passwords for NGINX auth module
#  using provided env file with users/passwords
#

# load the users and passwords from a pre
NGINX_USERS_FILE=../../security/nginx_users.env

source $NGINX_USERS_FILE


# setup nginx
#
NGINX_PASSWD_FILE=./auth/.htpasswd

if [ ! -e $NGINX_PASSWD_FILE ]; then
	if [ ! -e ./auth/ ]; then
		mkdir ./auth
	fi

	echo "-- Generating user:password --> for nginx proxy"
	htpasswd -b -c $NGINX_PASSWD_FILE "$NGINX_NIFI_USER" "NGINX_NIFI_PASS"
else
	echo " -- NGINX password file already extsts: $NGINX_PASSWD_FILE"
	exit 1
fi

echo "Done."
