# General info
This directory contains files related with our custom Apache NiFi image and example deployment templates with associated services.
Apache NiFi is used as a customizable data pipeline engine for controlling and executing data flow between used services. 
There are multiple workflow templates provided with custom user scripts to work with NiFi.

For more information about Apache NiFi please refer to [the official website](https://nifi.apache.org/).


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
