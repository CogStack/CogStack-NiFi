# General info
This directory contains files related with an example deployment of Apache NiFi and associated services.

In this example deployment, Apache NiFi is used as a customizable data pipeline engine for controlling and executing data flow between used services. There are multiple workflow templates provided with custom user scripts to work with NiFi.

For more information about Apache NiFi please refer to the [official website](https://nifi.apache.org/).


# Custom docker image
It is recommended to build a custom Docker image of Apache NiFi that will contain all the necessary configuration, drivers, custom user scripts and workflows. 

The custom image recipe is defined in `Dockerfile`.

When deplying services stack using the main `docker-compose.yml` file Docker engine will automatically build the custom Apache NiFi image.


# Workflow templates
Apache NiFi provides users the ability to build very large and complex data flows. These data flows can be later saved as *templates*, exported into XML format and shared with other users. In this example, we provide example data flows templates for ingesting the records from database into ElasticSearch and to perform extraction of NLP annotations from documents.

The example workflow templates are stored in `user-templates`.

## Workflow `DB-ES`
This template defines an example workflow consisting of:
1. reading records from a sample database,
2. storing these records to ElasticSearch.

The workflow is defined in `Workflow__DB-ES_[large_table]_-_samples-db.xml` file.

## Workflow `DB-NLP-ES`
This template defines an example workflow consisting of:
1. reading reacords with free-text field from database, 
2. parsing the records to prepare service request content for the NLP service,
3. sending the payload to the NLP Service (behind REST API),
4. parsing the returned annotations from the response content,
5. storing the annotations to ElasticSearch.

The workflow is defined in `Workflow__DB-NLP-ES_[large_tables_+_bulk]_-_samples-db.xml` file.


# User scripts
Apache NiFi gives users the ability to execute custom scripts inside the data flow (supported languages: Python, Groovy, Clojure, Ruby, Lua, ECMAScript).

This custom image will use user scripts from `user-scripts` directory, where the essential ones are:
- `parse-db-records-for-nlp-request-bulk.groovy` - parses the records and prepares the request payload for the NLP Service,
- `parse-anns-from-nlp-response-bulk.groovy` - parses the NLP Service response payload (annotations).

Please note that these scripts implement parsing the records and preparing the payload to be used by the NLP Service in bulk mode. There are also provided scripts that process single record and document at time, yet processing documents one-by-one is a much less performant option.


# Custom Drivers
The drivers are provided in `drivers` directory and these include: 
- `mssql-jdbc-7.2.2.jre11.jar` - MS SQL Server JDBC driver,
- `postgresql-42.2.5.jar` - PostgreSQL JDBC driver.


# NiFi Configuration
The main configuration files for NiFi are provided in `conf` directory.

For much more detailed information please refer to the official [NiFi System Administrator's Guide](https://nifi.apache.org/docs/nifi-docs/html/administration-guide.html).

## `bootstrap.conf`
This file allows users to configure settings for how NiFi should be started. This includes parameters, such as the size of the Java Heap, what Java command to run, and Java System Properties.

This custom image will use increased size of Java Heap Size (min: `1G`, max: `4G`, default: `512MB`) and is specified as:
```
java.arg.2=-Xms1G
java.arg.3=-Xmx4G
```

## `nifi.properties`
This file allows users to configure operational settings for NiFi on more granular level, such as the max. number of flow files to be buffered, the amount of space dedicated for data provenance, etc.

This custom image will use less resources and storage size for data provenance, flow files storage and indexing operations. The corresponding properties have been commented out in the file.

## `zookeeper.conf`
Apache Zookeeper is a highly consistent, scalable and reliable cluster co-ordination service. When deploying Apache NiFi, an exernal Apache Zookeper service can be used or embedeed within NiFi service (the default option).

This custom image will use Zookeeper Embedeed within NiFi service and uses the default `zookeeper.properties` file.

