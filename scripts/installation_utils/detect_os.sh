#!/usr/bin/env bash

# linux determines distribution version, the -iom1 arguments are as follows : -i  (case insensitive) -o (only matching characters/lines returned) -m1 (return 1 match max)
os_distribution=""

if ls /etc/*release 1> /dev/null 2>&1 ; then 
  os_distribution=$(grep -Eiom1 '(centos|debian|ubuntu|red hat)' /etc/*release)
  os_distribution="$(tr '[:upper:]' '[:lower:]' <<< "$os_distribution")" # to lower chars
  echo "$os_distribution"
else
  echo "Distribution version could not be found. Stopping script...";
  exit 1
fi;
