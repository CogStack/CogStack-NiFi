# General info
This directory contains files related with our custom Apache NiFi image and example deployment templates with associated services.
Apache NiFi is used as a customizable data pipeline engine for controlling and executing data flow between used services. 
There are multiple workflow templates provided with custom user scripts to work with NiFi.

For more information about Apache NiFi please refer to [the official website](https://nifi.apache.org/) and the [guide](https://nifi.apache.org/docs/nifi-docs/html/administration-guide.html#how-to-install-and-start-nifi).


# Custom Docker image
For the example deployment it is recommended to build and use the custom Docker image of Apache NiFi that will contain all the necessary configuration, drivers, custom user scripts and workflows.
Otherwise, one would need to set these up, configure and import manually.

The Docker image recipe is defined in `Dockerfile` file.
There are two images being built as part of CI process:
- `cogstacksystems/cogstack-nifi:latest` - the latest image built from `master` branch,
- `cogstacksystems/cogstack-nifi:dev-latest` - the latest image built from `devel` branch.


# Apache NiFi configuration
The main configuration files for NiFi are provided in [`conf`](./conf) directory.

For much more detailed information please refer to the official [Apache NiFi System Administrator's Guide](https://nifi.apache.org/docs/nifi-docs/html/administration-guide.html).

## `bootstrap.conf`
This file allows users to configure settings for how NiFi should be started. 
This includes parameters, such as the size of the Java Heap, what Java command to run, and Java System Properties.

This custom image will use increased size of Java Heap Size (min: `1G`, max: `4G`, default: `512MB`) and is specified as:
```
java.arg.2=-Xms1G
java.arg.3=-Xmx4G
```

## `nifi.properties`
This file allows users to configure operational settings for NiFi on more granular level, such as the max. number of flow files to be buffered, the amount of space dedicated for data provenance, etc.

This custom image will use less resources and storage size for data provenance, flow files storage and indexing operations (mostly to avoid exceeding Java Max Heap Size errors). 
The corresponding properties have been commented out in the file.

## `zookeeper.conf`
Apache Zookeeper is a highly consistent, scalable and reliable cluster co-ordination service. 
When deploying Apache NiFi, an exernal Apache Zookeper service can be used or embedeed within NiFi service (the default option).

This custom image will use embedeed Zookeeper within NiFi service and will use the default `zookeeper.properties` file.

## NIFI security setup

This is entirely optional, if you have configered the security certs as described in ```security/README.md``` then you are good to go, just  
<br>
Default username : 
<br>
```
username: admin     
password:admincogstacknifi
```

In previous nifi versions by default there was no user assigned and authentication was anonymous. Since 1.14.0 this changed. So now we have HTTPS enabled by default via port 8443 (configurable in nifi.properties and the services.yml file).

Before starting the NIFI container it's important to take note of the following things if we wish to enable HTTPS functionality:

- the `nifi_toolkit_security.sh` script is used to download the nifi toolkit and generate new certificates and keys that are used by the container, take note that inside the `localhost` folder there is another nifi.properties file that is generated, we must look to the following setttings which are generated randomly and copy them to the `nifi/conf/nifi.properties` file. 
- the trust/store keys generated for production will be in the `nifi_certificates/localhost` folder and  the `nifi-cert.pem` + `nifi-key.key` files. in the baes `nifi_certificates` folder.

- as port of the security process the `nifi.sensitive.props.key` should be set to a random string or a password of minimum 12 characters. Once this is set do NOT modify it as all the other sensitive passwords will be hashed with this string. By default this is set to <strong>```cogstackNiFipass```</strong>

Example:
```
    nifi.security.keystorePasswd=ZFD4i4UDvod8++XwWzTg+3J6WJF6DRSZO33lbb7hAgc
    nifi.security.keyPasswd=ZFD4i4UDvod8++XwWzTg+3J6WJF6DRSZO33lbb7hAgc
    nifi.security.truststore=./conf/truststore.jks
    nifi.security.truststoreType=jks
    nifi.security.truststorePasswd=lzMGadNB1JXQjgQEnFStLiNkJ6Wbbgw0bFdCTICKtKo
```

- the `login-identity-providers.xml` file in `/nifi/conf/` stores the password for the user account, to generate a password one must use the following command within the container : `/opt/nifi/nifi-current/bin/nifi.sh set-single-user-credentials USERNAME PASSWORD`, once done, you would need to copy the file from `/opt/nifi/nifi-current/conf/login-identity-providers.xml` locally with docker cp and replace the one in the `nifi/conf` folder and rebuild the container.

URL: https://localhost:8443/nifi/login

Troubleshooting Security : if you encounter errors related to sensitive key properties not being set please clear/delete the docker volumes of the nifi container or delete all volumes of inactive containers `docker volume rm $(docker volume list -q)`

# Drivers
The drivers are provided in [`drivers`](./drivers) directory.
The key used ones are: 
- `mssql-jdbc-7.2.2.jre11.jar` - MS SQL Server JDBC driver,
- `postgresql-42.2.5.jar` - PostgreSQL JDBC driver.


# User resources
With our custom image there are bundled resources to get up and running example workflows.

Please see [WORKFLOWS.md](../deploy/WORKFLOWS.md) in the `deploy` directory for more details on the workflows.

## Workflow templates
Workflow templates define example data workflows that can be tailored and executed by the user.
The templates are stored in [user-templates](./user-templates) directory.

## User scripts
Apache NiFi gives users the ability to execute custom scripts inside the data flow (supported languages: Python, Groovy, Clojure, Ruby, Lua, ECMAScript).
[`user-scripts`](./user-scripts) directory contains example scripts, these are mostly used when parsing the data from Flow Files.

## User schemas
[`user-scripts`](./user-scripts) directory contains example AVRO type schemas that can be used by data parsers and processor.
