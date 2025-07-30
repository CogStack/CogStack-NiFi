#!/usr/bin/env bash

set -e

openssl rand -hex 32 > ../config/jupyterhub_cookie_secret