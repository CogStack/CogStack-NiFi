#!/bin/bash
set -e

# WARNING: revise the NiFi user:pass before going to production


# setup nginx
#
if [ ! -e ./auth/.htpasswd ]; then
	echo "-- Generating user:password --> for nginx proxy"
	mkdir ./auth
	htpasswd -b -c ./auth/.htpasswd 'nifi' 'NiFiPass'
fi

echo "Done."
