# Available Services
This file covers the available services in the example deployment.

Apache NiFi-related files are provided in [`../nifi`](../nifi) directory.
 
Please note that all the services are deployed using [Docker](https://docker.io) engine and it needs to be present in the system.
Please see [example deployment](deploy/main.md) for more details on the used services and their configuration.

## Overview

The below image sums up how CogStack services work with eachother in an environment where all available components are used.

![nifi-services](../_static/img/nifi_services.png)

## Primary services
All the services are defined in `services.yml` file and these are:
- `samples-db` - a PostgreSQL database with sample data to play with,
- `cogstack-databank-db` - production PostgreSQL database, has it's own scripts in `/services/cogstack-db/pgsql`
- `cogstack-databank-db-mssql` - production MSSQL database, has it's own scripts in `/services/cogstack-db/mssql`, this is just an alternative, needs a license.
- `nifi` - a single instance of Apache NiFi processor (with Zookeper embedded) with exposing a web user interface,
- `nifi-nginx` - used for reverse proxy to enable secure access to NiFi and other services.
- `tika-service` - the [Apache Tika](https://tika.apache.org/) running as a web service (see: [Tika Service repository](https://github.com/CogStack/tika-service/)).
- `ocr-service-1/ocr-service-2` - the new OCR text extraction tool that is a replacement of `tika-service`.
- `nlp-gate-drugapp` - an example drug names extraction NLP application using [GATE NLP Service runner exposing a REST API](https://github.com/CogStack/gate-nlp-service),
- `nlp-medcat-service-production` - [MedCAT](https://github.com/CogStack/MedCAT) NLP application running as a [web Service](https://github.com/CogStack/MedCATservice) and using an example model trained on [Med-Mentions](https://github.com/chanzuckerberg/MedMentions) corpus,
- `medcat-trainer-ui` - [MedCAT Trainer](https://github.com/CogStack/MedCATtrainer) web application used for training and refining MedCAT NLP models,
- `medcat-trainer-nginx` - a [NGINX](https://www.nginx.com/) reverse-proxy for MedCAT Trainer,
- `elasticsearch-1/elasticsearch-2` - a two-node cluster of Elasticsearch based on [OpenSearch for Elasticsearch](https://opensearch.org/) distribution, 
- `metricbeat` - Elasticsearch Native only cluster monitoring service
- `filebeat` - log ingestion service for ElasticSearch Native
- `kibana` - Kibana user-interface based on [OpenSearch for Elasticsearch](https://opensearch.org/docs/latest/dashboards/index/) distribution,
- `jupyter-hub` - a single instance of [Jupyter Hub](https://jupyter.org/hub) for serving Jupyter Notebooks for interacting with the data.
- `git-ea` - Github-like web service, you can host your own repositories here if your organisation is strict security-wise

**IMPORTANT**
Please note that some of the necessary configuration parameters, variables and paths are also defined in the [`services.yml`](https://github.com/CogStack/CogStack-NiFi/tree/master/deploy/services.yml) file.

## Optional NLP services
In addition, there are defined such NLP services:
- `nlp-medcat-service-production` serving SNOMED CT model,
- `nlp-gate-bioyodie` - same as `nlp-gate-drugapp` but serving [Bio-YODIE](https://github.com/GateNLP/Bio-YODIE) NLP application.

These services are optional and won't be started by default.
They were left in the `services.yml` file for informative purposes if one would be interested in deploying these having access to necessary resources.

## Security
**Important**
Please note that for the demonstration purposes, the services are run with default built-in usernames / passwords.
Moreover, SSL encryption is also disabled or not set up in the configuration files.
For more information please see the [security](../security.md)

## Deployment
The example deployment recipes are defined in `Makefile` file.
The commands that start services are prefixed with `start-` keyword, similarly the ones to stop are prefixed with `stop`.

## Data ingestion and storage infrastructure
To deploy the data ingestion and storage infrastructure, type:
```
make start-data-infra
```

The command will deploy services: `nifi`, `elasticsearch-1`, `kibana`, `tika-service`, `samples-db`.
Please see below the description of the services with the information on the accessibility.

To stop the services, type:
```
make stop-data-infra
```

## Services & definition description
All the essential details on the services configuration are defined in `services.yml` file.

Please note that all the services are running within a private `cognet` Docker network hence the endpoints are all accessible within the deployed services.
However, for the ease of use, some of the services have their ports bound from container to the host machine.


## NLP services

**Important**
<br>
Please note that `nlp-medcat-service-production` and `nlp-gate-bioyodie` NLP services use license-restricted resources and these need to be provided by the user prior running these services.
Bio-YODIE requires [UMLS](https://www.nlm.nih.gov/research/umls/index.html) resources that need to be provided in the `RES_BIOYODIE_UMLS_PATH` directory.
MedCAT SNOMED CT model requires a prepared model based on [SNOMED CT](http://www.snomed.org/) dictionary with the model available in `RES_MEDCAT_SERVICE_MODEL_PRODUCTION_PATH` directory.
These paths can be defined in `.env` file in the deployment directory.

For more information on available services resources, please see [README](../services/README.md) in `services` directory.


### Bio-YODIE
[Bio-YODIE](https://github.com/GateNLP/Bio-YODIE) is a named entity linking application build using [GATE NLP](https://gate.ac.uk/) suite ([publication](https://arxiv.org/abs/1811.04860)).

The application files are stored in [`nlp-services/applications/bio-yodie/`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/nlp-services/applications/bio-yodie) directory.

The Bio-Yodie service configuration is stored in [`nlp-services/applications/bio-yodie/config/`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/nlp-services/applications/bio-yodie/config) directory - the key service configuration properties are defined in `application.properties` file.


### GATE

**Important**
Please note that this application is provided just as a proof-of-concept of running GATE applications.


This simple application implements annotation of common drugs and medications.
It was created using [GATE NLP](https://gate.ac.uk/sale/tao/splitch13.html) suite and uses GATE ANNIE Gazetteer plugin.
The application was been created in GATE Developer studio and exported into `gapp` format.
This application is hence ready to be used by GATE and is stored in `nlp-services/applications/drug-app/gate` directory as `drug.gapp` alongside the used resources.

The list of drugs and medications to annotate is based on a publicly available list of FDA-approved drugs and active ingredients.
The data can be downloaded directly from [Drugs@FDA database](https://www.fda.gov/drugs/informationondrugs/ucm079750.htm).

This applications is being run using a NLP Service runner application that uses internally [GATE Embedded](https://gate.ac.uk/family/embedded.html) (for running GATE applications) and exposes a REST API.
The NLP Service necessary configuration files are stored in `nlp-services/applications/drug-app/config/` directory - the key service configuration properties are defined in `application.properties` file.

If you would like to build the docker image with already initialized NLP application, service and necessary resources bundled, please use provided `Dockerfile` in the `nlp-services/applications/drug-app/` directory.

To deploy an example GATE NLP Drug names extraction application as a service, type:
```
make start-nlp-gate
```
The command will deploy `nlp-gate-drugapp` service.
Please see below the description of the deployed NLP service.

To stop the service, type:
```
make stop-nlp-gate
```


**Important**
This service will be discontinued in the near future, meaning it will be removed from the repo.


### MedCAT
[MedCAT](https://github.com/CogStack/MedCAT) is a named entity recognition and linking application for concept annotation from UMLS or any other source.
MedCAT is deployed as a service exposing RESTful API using the implementation from [MedCATservice](https://github.com/CogStack/MedCATservice).

### MedCAT Service


MedCAT Service resources are stored in [`./services/nlp-services/applications/medcat/`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/nlp-services/applications/medcat) directory.
The key configuration properties stored as environment variables are defined in [`./services/nlp-services/applications/medcat/config/`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/nlp-services/applications/medcat/config) sub-directory.
The models used by MedCAT are stored in [`./servies/nlp-services/applications/cat/models/`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/nlp-services/applications/medcat/models).
A default model to play with is provided `MedMen` and there is a script `download_medmen.sh` to download it.

For more information on the MedCAT Service configuration and use please refer to [the official documentation](https://github.com/CogStack/MedCATservice).

**Important**
For the example deployment we provide a simple and publicly available MedCAT model.
However, custom and more advanced MedCAT models can be used based on license-restricted terminology dictionaries such as [UMLS](https://www.nlm.nih.gov/research/umls/index.html) or [SNOMED CT](http://www.snomed.org/).
Which model is being used by the deployed MedCAT Service is defined both in the MedCAT Service config file and the deployment configuration file (see: [deploy](deploy/main.md)).


To deploy MedCAT application stack, type:
```
make start-nlp-medcat
```
The command will deploy MedCAT NLP service ` nlp-medcat-service-production` with related MedCAT Trainer services `medcat-trainer-ui`, `medcat-trainer-nginx`.
Please see below the description of the deployed NLP services.

To stop the services, type:
```
make stop-nlp-medcat
```

#### ENV/CONF files:
- `/service/nlp-services/applications/medcat/config/env_app` - settings specifically related to the medcat service app, such as model(pack) file location(s)
- `/service/nlp-services/applications/medcat/config/env_medcat` - medcat specific settings

## Jupyter Hub
To deploy Jupyter Hub, type:
```
make start-jupyter
```
Please see below the description of the Jupyter Hub.

To stop the services, type:
```
make stop-jupyter
```
#### ENV/CONF files:
- `/deploy/jupyter.env`

## Cleanup
To tear down all the containers and the data persisted in mounted volumes, type:
```
make cleanup
```

## Database Stack

The samples DB uses PgSQL, but we also provide an MSSQL instance (no data on it however), that can be used in prod environments.Please see [the workflows section](./deploy/workflows.md#configuring-db-connector) about how to configure the difference controllers and DB drivers.


## Samples DB
`samples-db` provides a [PostgreSQL](https://www.postgresql.org/) database that contains sample data to play with.
During start-up the data is loaded from a previously generated DB dump.

All the necessary resources, data and scripts are stored in `pgsamples/` directory.
During the service initialization, the script `init_db.sh` will populate the database with sample data read from a database dump stored in `db_dump` directory.
The directory [`./services/pgsamples/scripts`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/pgsamples/scripts) contains SQL schemas with scripts that will generate the database dump using sample data.

When deployed the PostgreSQL database is exposed at port `5432` of the `samples-db` container.
The port is also bound from container to the host machine `5555` port.
The example data is stored in `db_samples` database.
Use user `test` with password `test` to connect to it.

For an example deployment, a PostgreSQL database that contains some example data to play with was generated [synthetic records](https://github.com/synthetichealth/synthea) enrinched with free-text from [MTSamples](https://www.mtsamples.com/).
The free-text sample data is based on [MT Samples](https://www.mtsamples.com/) dataset with the structured fields generated by [Synthea](https://github.com/synthetichealth/synthea).

The tables available in the database are:
- `patients` -  structured patient information,
- `encounters` - structured encounters information,
- `observations` - structured observations information,
- `medical_reports_raw` - free-text documents in raw format (PDFs) `(*)`,
- `medical_reports_text` - free-text documents in clean, text format `(*)`,
- `medical_reports_processed` - for storing processed documents, empty `(*)`,
- `annotations_medcat` - for storing extracted MedCAT annotations, empty.

The tables used in the deployment example are marked with `(*)`.


#### ENV/CONF files:
- `/deploy/database.env` - currently only basic stuff like DB users/passwords are included

## Cogstack-db
This is a general database provided for production, it does not have any data in it beyond the defined cogstack_schema (this is not yet present) and annotation_schema.
Provided for both PGSQL and MSSQL.

In the future the `${DB_PROVIDER}` will be an environment variable that will take into account the db-provider you can select, possible values [`mssql`,`pgsql`]

By default all the `.sql` files beginning with `annotations*` and `cogstack*` prefix in the `services/cogstack-db/${DB_PROVIDER}/schemas/` will be loaded.This is defined in the `services/cogstack-db/${DB_PROVIDER}/init_db.sh`.There should not be a need to change them as users can simply name their schemas accordingly.Place the desired `sql` files in the `schemas` folder and it will be picked up.To debug any issues with the container or with the SQL scripts please run the startup commands separately `docker-compose -f services.yml up cogstack-databank-db` or `docker-compose -f services.yml cogstack-databank-db-mssql` while in the `deploy/` folder.

<span>MSSQL note</span>
The MSSQL container will require license activation for production as per [Microsoft's guideline](https://hub.docker.com/_/microsoft-mssql-server), setting the `MSSQL_PID` env variable to the correct license PID key should activate the product.


### ENV/CONF files:
- `/deploy/database.env` - currently only basic stuff like DB users/passwords are included

## Apache NiFi
`nifi` serves a single-node instance of Apache NiFi that includes the data processing engine with user interface for defining data flows and monitoring.
Since this is a single-node NiFi instance, it also contains the default, embedded [Apache Zookeper](https://zookeeper.apache.org/) instance for managing state.

`nifi` container exposes port `8443` which is also bound to the host machine on port 8082.
<br>

`nifi-nginx` contianer exposes the 8443 port directly, reverser-proxying the connection to nifi.
The Apache NiFi user interface can be hence accessed by navigating on the host (e.g.`localhost`) machine at `http://localhost:8443`.

In this deployment example, we use a custom build Apache NiFi image with example user scripts and workflow templates.
For more information on configuration, user scripts and user templates that are embeded with the custom Apache NiFi image please refer to the [nifi](../nifi.md).
The available example workflows are covered in [workflows](./workflows.md)
Alternatively, please refer to [the official Apache NiFi documentation](https://nifi.apache.org/) for more details on actual use of Apache NiFi.

#### ENV/CONF files:
- `/deploy/nifi.env` - most notable settings are related to port mapping and proxy
- `/security/certificates_nifi.env` - define NiFi certificate settings here

More configuration options are covered in [nifi-doc](../nifi/main.md).

## Tika Service

`tika-service` provides document text extraction functionality of [Apache Tika](https://tika.apache.org/).
[Tika Service](https://github.com/CogStack/tika-service) implements the actual Apache Tika functionality behind a RESTful API.

The application data, alongside configuration file, is stored in [`./services/tika-service`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/tika-service) directory.

When deployed Tika Service exposes port `8090` at `tika-service` container being available to all services within `cognet` Docker network, most importantly by `nifi` data processing engine.
The Tika service REST API endpoint for processing documents is available at `http://tika-service:8090/api/process`.

For more details on configuration, API definition and example use of Tika Service please refer to [the official documentation](https://github.com/CogStack/tika-service).

#### ENV/CONF files:
- `/deploy/tika-service/config/application.yaml`

## OCR Service

The new `ocr-service` provides a new way to OCR documents at good speed, the equivalent in Tika-service but revwritten in Python and optimized.

`ocr-service-1` - this container is used for OCR
`ocr-service-2` - this container is used for NON-OCR, meaning documents will simply have their text extracted if they contain text without images

#### ENV/CONF files:
- `/deploy/ocr_service.env` - for `ocr-service-1`
- `/deploy/ocr_service_text_only.env` - for `ocr-service-2`, NON-OCR instance

**IMPORTANT**
All settings are decribed [here](https://github.com/CogStack/ocr-service/blob/master/README.md).


## NLP Services

In the example deployment we use NLP applications running as a service exposing REST API.
The current version of API specs is specified in [`./services/nlp-services/api-specs/`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/nlp-services/api-specs) directory (both [Swagger](https://swagger.io/) and [OpenAPI](https://www.openapis.org/) specs).
The applications are stored in [`./services/nlp-services/applications`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/nlp-services/applications).


### NLP API
All the NLP services implement a RESTful API that is defined in [OpenAPI specification](https://github.com/CogStack/CogStack-Nifi/services/nlp-services/api-specs/openapi.yaml).

The available endpoints are:
- **GET** `/api/info` - for displaying general information about the used NLP application,
- **POST** `/api/process` - for processing text documents (single document mode),
- **POST** `/api/process_bulk` - for processing multiple text documents (bulk mode).

When plugging-in the NLP services into Apache NiFi workflows, the endpoint for processing single or multiple documents will be used to extract the annotations from documents.
Please see example Apache NiFi [workflows](./workflows.md) and [user scripts](https://github.com/CogStack/Cogstack-Nifi/nifi/user-scripts) on using and parsing the payloads with NiFi.

For further details on the used API please refer to the [OpenAPI specification](https://github.com/CogStack/CogStack-Nifi/services/nlp-services/api-specs/openapi.yaml) for the definition of the request and response payload.

### GATE NLP
`nlp-gate-drugapp` serves a simple drug names extraction NLP application using [GATE NLP Service](https://github.com/CogStack/gate-nlp-service).
This simple application implements annotation of common drugs and medications.
It was created using [GATE NLP](https://gate.ac.uk/sale/tao/splitch13.html) suite and uses GATE ANNIE Gazetteer plugin.
The GATE application definition and resources are available in directory [`./services/nlp-services/applications/drug-app`](https://github.com/CogStack/CogStack-Nifi/services/nlp-services/applications/drug-app/).

When deployed `nlp-gate-drugapp` exposes port `8095` on the container.
The port is also bound from container to the host machine `8095` port.
The service endpoint should be available to all the services running inside the `cognet` Docker network.
For example, to access the API endpoint to process a document by a service in `cognet` network, the endpoint address would be `http://nlp-gate-drugapp:8095/api/process`.

As a side note, when deployed `nlp-gate-bioyodie` (assuming that the Bio-YODIE resources are properly set up with `RES_BIOYODIE_UMLS_PATH` variable), the service will only expose port `8095` on container.
Although the service won't be accessible from the host machine, but all the services inside the `cognet` network will be able to access it.

For more information on the GATE NLP Service configuration and use please refer to [the official documentation](https://github.com/CogStack/gate-nlp-service).


### MedCAT NLP
[MedCAT](https://github.com/CogStack/MedCAT) is a named entity recognition and linking application for concept annotation from UMLS or any other source.
MedCAT deployment consists of [MedCAT NLP Service](https://github.com/CogStack/MedCATservice) serving NLP models via RESTful API and [MedCAT Trainer](https://github.com/CogStack/MedCATtrainer) for collecting annotations and refinement of the NLP models.

### MedCAT Service
` nlp-medcat-service-production` serves a basic UMLS model trained on MedMentions dataset via RESTful API.
The served model data is available in [`./services/nlp-services/applications/medcat/models/medmen/`](https://github.com/CogStack/CogStack-Nifi/services/nlp-services/applications/medcat/models/medmen`) directory.

When deployed ` nlp-medcat-service-production` exposes port `5000` on the container and binds it to port `5000` on the host machine.
For example, to access the API endpoint to process a document by a service from `cognet` Docker network, the endpoint address would be `http:// nlp-medcat-service-production:5000/api/process`.

As a side note, when deployed `nlp-medcat-service-production` (assuming that the MedCAT SNOMED CT model is available and set via `RES_MEDCAT_SERVICE_MODEL_PRODUCTION_PATH` variable), the service will only expose port `5000` on container.
Although the service won't be accessible from the host machine, but all the services inside the `cognet` network will be able to access it.

For more information on the MedCAT NLP Service configuration and use please refer to [the official documentation](https://github.com/CogStack/MedCATservice).


#### ENV/CONF files:
- `/service/nlp-services/applications/medcat/config/env_app` - settings specifically related to the medcat service app, such as model(pack) file location(s)
- `/service/nlp-services/applications/medcat/config/env_medcat` - medcat specific settings


### MedCAT Trainer
Apart from MedCAT Service, there is provided [MedCAT Trainer](https://github.com/CogStack/MedCATtrainer) that serves a web application used for training and refining MedCAT NLP models.
Such trained models can be later saved as files and loaded into MedCAT Service.
Alternatively, the models can be loaded into custom application.

`medcat-trainer-ui` serves the MedCAT Trainer web application used for training and refining MedCAT NLP models.
Such trained models can be later saved as files and loaded into MedCAT Service.
Alternatively, the models can be loaded into custom application.

As a companion service, `medcat-trainer-nginx` serves as a NGINX reverse-proxy for providing content from MedCAT Trainer web service.

When deployed, `medcat-trainer-ui` exposes port `8000` on the container.
`medcat-trainer-nginx` exposes port `8000` on the container and binds it to port `8001` on the host machine - it proxies all the requests to the MedCAT Trainer web service.
The NGINX configuration is stored in [`./services/medcat-trainer/nginx`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/medcat-trainer/nginx) directory.

To access the MedCAT Trainer user interface and admin panel, one can use the default built-in credentials: user `admin` with password `admin`.

For more information on the MedCAT Trainer  configuration and use please refer to [the official documentation](https://github.com/CogStack/MedCATtrainer).

MedCAT Trainer resources are stored in [`./services/medcat-trainer`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/nlp-services//medcat-trainer) directory.
The key configuration is stored in [`./services/medcat-trainer/env`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/medcat-trainer/envs/env) file.



## ELK stack

There are two types of Elasticsearch versions available, apart from the native one there is a also OpenSearch, which is a fork of the original but developed & maintained by Amazon as an opensource alternative.

The example deployment uses [ELK stack](https://www.elastic.co/what-is/elk-stack) from [OpenSearch for Elasticsearch](https://opensearch.org/) distribution.
OpenSearch for Elasticsearch is a fully open-source, free and community-driven fork of Elasticseach.
It implements many of the commercial X-Pack components functionality, such as advanced security module, alerting module or SQL support.
Nonetheless, the standard core functionality and APIs of the official Elasticsearch and OpenSearch remain the same.
Hence, OpenSearch can be used as a drop-in replacement for the standard ELK stack.

The names of the services within the NiFi project are the same even though they have different names, we will refer to original Elasticsearch as ES native in the documentation.

Services names Elasticsearch | OpenSearch :

    - Elasticsearch <-> OpenSearch
    - Kibana <-> OpenSearch Dashboards

In essence the configuration is very similar, however, there are a few differences:

|                                                                                                                                      | Elasticsearch Native      | OpenSearch                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| Subscription        | paid licensing, will require [subscription](https://www.elastic.co/subscriptions), 30-day free trial available                             | Free                      |
| Plugins             | Xpack (native), analysis-icu & elastiknn (3rd party), for more check this [link](https://www.elastic.co/guide/en/elasticsearch/plugins/8.9/index.html).                                                                                                       | Xpack                      |
| Security            | AD/LDAP/AWS/OpenID/Native auth                                                                                                             | AD/LDAP/AWS/OpenID auth   |




**Important**
Please note that for the demonstration purposes SSL encryption has been disabled in Elasticsearch and Kibana.
For enabling it and generating self-signed certificates please refer directly to the `services.yml` file and [README](../security/README.md) in `security` directory.
The security aspects are covered expensively in [the official OpenSearch for Elasticsearch documentation](https://opensearch.org/).


### Elasticsearch / Opensearch
Elasticsearch cluster is deployed as a single-node cluster with `elasticsearch-1` service.
It exposes port `9200` on the container and binds it to the same port on the host machine.
The service endpoint should be available to all the services running inside the `cognet` Docker network under address `http://elasticsearch-1:9200`.
The default user is : `admin` and password `admin`.
In the example deployment, the default, built-in configuration file is used with selected configuration options being overridden in `services.yml` file.
However, for manual tailoring the available configuration parameters are available in the `elasticsearch.yml` [configuration file](https://github.com/CogStack/CogStack-Nifi/services/elasticsearch/config/elasticsearch.yml).

For more information on use of Elasticsearch please refer either to [the official Elasticsearch documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html) or [the official OpenSearch for Elasticsearch documentation](https://opensearch.org/).


### Kibana / Opensearch-Dashboard
`kibana` service implements the Kibana user interface for interacting with the data stored in Elasticsearch cluster.
It exposes port `5601` on the container and binds it to the same port on the host machine.
To access Kibana user interface from web browser on the host (e.g.`localhost`) machine one can use URL: `https://localhost:5601`.
The default user is : `admin` and password `admin`.
In the example deployment, the default, built-in configuration file is used with selected configuration options being overridden in `services.yml` file.
However, for manual tailoring the available configuration parameters are available in `kibana.yml` [configuration file](https://github.com/CogStack/CogStack-Nifi/services/kibana/config/kibana.yml).

For more information on use of Kibana please refer either to [the official Kibana documentation](https://www.elastic.co/guide/en/kibana/current/index.html) or [the official OpenSearch for Elasticsearch documentation](https://opensearch.org/docs/latest/dashboards/index/).


#### ENV/CONF files:
- `/deploy/elasticsearch.env` - general settings for boith Kibana and ES , OpenSearch and OpenSearch-Dashboards
- `/security/certificates_elasticsearch.env` - you can control the settings for the SSL certificates here
- `/security/elasticsearch_users.env` - define system user credentials here

You should not really need to ever modify these files, only the `.env` files should be modified.
- `/services/elasticsearch/config/elasticsearch.yml` - Elasticsearch
- `/services/kibana/config/elasticsearch.yml` - Elasticsearch Kibana
- `/services/elasticsearch/config/opensearch.yml` - Opensearch
- `/services/kibana/config/opensearch.yml` - Opensearch-Dashboards


The used configuration files for ElasticSearch and Kibana are provided in [`./services/elasticsearch/config/`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/elasticsearch/config) and [`./services/kibana/config/`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/kibana/config) directories respectively for [`OpenSearch`](https://opensearch.org/docs/latest/install-and-configure/configuration/) and [`OpenSearch Dashboard`](https://opensearch.org/docs/latest/dashboards/index/).


### Security

Please note that both ElasticSearch and Kibana use security module to manage user access permissions and roles.
However, for production use, proper users and roles need to be set up otherwise the default built-in ones will be used and with default passwords.

In the example deployment, the default built-in user credentials are used, such as:
    - OpenSearch user: `admin` with pass `admin`.
    - ElasticSearch user: `elastic` with pass `kibanaserver`

For more details on setting up the security certificates, users, roles and more in this example deployment please refer to [`security`](security.md).

### Indexing & Ingesting data

Also note that in some scenarios a manual creation of index mapping may be a good idea prior to starting ingestion. Please look at Elasticsearch [mapping](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html) and OpenSearch [mapping](https://opensearch.org/docs/2.4/opensearch/mappings/) docs on how to create the mapping before ingesting.
 <span style="color: red"><strong> IMPORTANT: not creating the mapping of an index will result in ElasticSearch/OpenSearch automatically map all field datatypes as string, making fields such as date/timestamps not incredibly  !</strong></span>


A script `es_index_initializer.py` has been provided in [`./services/elasticsearch/scripts/`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/elasticsearch/scripts) directory to help with that.

### Installing and maintaining Elasticsearch/Opensearch

Please follow the instructions carefully and adapt where necessary.

#### Setting up a fresh cluster with 3 nodes

Assuming you will respect the proper guidelines, you would need 3 machines to set things up. If not, then you can still set them up on one machine.

Steps:
- go into the `/deploy/` folder, edit `elasticsearch.env`
- once you get the machine's IP addresses, modify the following variable on each machine `ELASTICSEARCH_NETWORK_HOST`, with the IP of each instance
- next, the env file will have a var for each server for settings such as:
    - `node name`: ELASTICSEARCH_NODE_1_NAME
    - `alternative node name`: ELASTICSEARCH_ALTERNATIVE_NODE_1_NAME (used in certificate generation)
    - `output port`: ELASTICSEARCH_NODE_1_OUTPUT_PORT
    - `docker volume names`: ELASTICSEARCH_NODE_1_DATA_VOL_NAME. 
  
  the only setting that you may change here IF needed is the `ELASTICSEARCH_NODE_1_NAME`, for each server, e.g: ELASTICSEARCH_NODE_1_NAME="test1", ELASTICSEARCH_NODE_2_NAME="test2", ELASTICSEARCH_NODE_3_NAME="test3"

##### Other settings
- OPTIONAL: you will need to setup the LDAP connection, if you are using LDAP, modify `ELASTICSEARCH_AD_URL`, `ELASTICSEARCH_AD_DOMAIN_NAME` and `ELASTICSEARCH_AD_TIMEOUT` (for timeout controls) also `ELASTICSEARCH_AD_UNMAPPED_GROUPS_AS_ROLES` for automatic LDAP group to role mapping (check [this](https://www.elastic.co/guide/en/enterprise-search/8.9/ldap-auth.html) for more info)
- OPTIONAL: additionally, you may want to have an email for your watcher jobs, this can be set via the `ELASTICSEARCH_EMAIL_ACCOUNT_PROFILE` variable and `ELASTICSEARCH_EMAIL_ACCOUNT_EMAIL_DEFAULTS`, the SMTP server must be set for this to work, so set `ELASTICSEARCH_EMAIL_SMTP_HOST` and `ELASTICSEARCH_EMAIL_SMTP_PORT` accordingly, look at the sample settings in the env file for guidance.


#### Updating the version of the cluster

 <span style="color: red"><strong> IMPORTANT: Make sure to disable any ingestion jobs before doing any of the update steps</strong></span>

##### For ElasticSearch:
- please check [this link](https://www.elastic.co/guide/en/elastic-stack/8.9/upgrading-elastic-stack.html) for specific version guides.
- carefully read [this](https://www.elastic.co/guide/en/elastic-stack/current/upgrading-elasticsearch.html), there are a few steps that need to be completed via the Dev Console in Kibana and/or via `curl` in terminal.
- take note of which Elastic version you are using and check if there are any extra steps that you might need to do, for example you cant upgrade from v7.1.0 to v8.9.2, you'd need to go v7.1.0->7.9.0 first then v8.1.0 -> v8.9.x, this is a pattern that will likely repeat for future versions
- there may be some additional steps that can be done via Kibana if the documentation says you may need to upgrade your indices to a later version, check [this](https://www.elastic.co/guide/en/elastic-stack/8.9/upgrading-elastic-stack.html#prepare-to-upgrade) as an example, upgrading from 7.x to 8.x requires a REINDEX operation on all indices!
- steps:
    - make sure you stop ALL ingestion jobs 

    - this disables shard allocation: <br> `curl -u your_username -X PUT "localhost:9200/_cluster/settings?pretty" -H 'Content-Type: application/json' -d'
    {
    "persistent": {
        "cluster.routing.allocation.enable": "primaries"
    }
    }
    '`
    - flush indices: `curl -u your_username -X POST "localhost:9200/_flush/synced?pretty"`
    - wait for everything to complete, check to see if the health of all clusters is green and the shards are fine
    - shut down all ES services, start with Kibana, Metricbeat, Filebeat and then the Elasticserch cluster : `docker container stop cogstack-kibana cogstack-metricbeat-1 cogstack-metricbeat-2  cogstack-filebeat-1  cogstack-filebeat-2  cogstack-filebeat-3`, `docker container stop elasticsearch-1 elasticsearch-2 elasticsearch-3`, obviously execute these on each
    - change the relevant ENV VARS (change these in `deploy/elasticsearch.env`): ELASTICSEARCH_DOCKER_IMAGE="docker.elastic.co/elasticsearch/elasticsearch:8.3.3", ELASTICSEARCH_KIBANA_DOCKER_IMAGE="docker.elastic.co/kibana/kibana:8.3.3", METRICBEAT_IMAGE="docker.elastic.co/beats/metricbeat:8.3.3", FILEBEAT_IMAGE="docker.elastic.co/beats/filebeat:8.3.3"
    - go to the `deploy` folder and start update the source env vars by executing `source export_env_vars.sh`, do a test to see if the new vars are set `echo $ELASTICSEARCH_DOCKER_IMAGE` for example
    - start only the elastic instance on the correct cluster (assuming each node is on its own separate machine, as it should normally be), wait for startup to complete
    - start the rest of the services and check for the health of each node
    - re-enable shard allocation:
    <br> `curl -u your_username -X PUT "localhost:9200/_cluster/settings?pretty" -H 'Content-Type: application/json' -d'
    {
    "persistent": {
        "cluster.routing.allocation.enable": "all"
    }
    }
    '`
    - go to Kibana > System Monitor > Clusters and check the status of all the nodes & shards.

##### For OpenSearch:
- please check [this link](https://opensearch.org/docs/2.0/install-and-configure/upgrade-opensearch/index/)
- the follow the steps from the `For Elasticsearch` section above, the only diference is the curl command for disabling the shard allocation:
    - `curl -u your_username -X PUT "localhost:9200/_cluster/settings?pretty" -H 'Content-Type: application/json' -d
{
   "persistent":{
      "cluster.routing.rebalance.enable": "primaries"
   }
}`
- shut down kibana & the nodes
- change the relevant ENV vars in `deploy/elasticsearch.env` such as ELASTICSEARCH_KIBANA_DOCKER_IMAGE and ELASTICSEARCH_DOCKER_IMAGE.
- go to the `deploy` folder and start update the source env vars by executing `source export_env_vars.sh`, do a test to see if the new vars are set `echo $ELASTICSEARCH_DOCKER_IMAGE` for example
- all things should be working, re-enable allocation of shards: 
    - `curl -u your_username -X PUT "localhost:9200/_cluster/settings?pretty" -H 'Content-Type: application/json' -d
{
   "persistent":{
      "cluster.routing.rebalance.enable": "primaries"
   }
}`

## Jupyter Hub

`jupyter-hub` service provides a single instance of Jupyter Hub to serve Jupyter Notebooks containers to users.In essence, the jupyter-hub container will spawn jupyter-singleuser containers for users, on the fly, as necessary.The settings applied to the jupyter-hub service in `services.yml` won't apply to the singleuser containers, please note that the singleuser containers and jupyter-hub container are entirely independent of one another.

It exposes port `8888` by default on the container and binds to the same port on the host machine.
Since `jupyter-hub` is running in the `cognet` Docker network it has access to all services available within it, hence can be used to read data directly from Elasticsearch or query NLP services.

For more information on the use and configuration of Jupyter Hub please refer to [the official Jupyter Hub documentation](https://jupyter.org/hub).

The JupyterHub comes with an example Jupyter notebook that is stored in [`./services/jupyter-hub/notebooks`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/jupyter-hub/notebooks) directory.

### Access and account control
To access Jupyter Hub on the host machine (e.g.localhost), one can type in the browser `http://localhost:8888`.


Creating accounts for other users is possible, just go to the admin page `https://localhost:8888/hub/admin#/`, click on add users and follow the instructions (make sure usernames are lower-cased and DO NOT contain symbols, if usernames contain uppercase they will be converted to lower case in the creation process).

The default password is blank, you can set the password for the admin user the first time you LOG IN, remember it.

Or you can set the password is defined by a local variable `JUPYTERHUB_PASSWORD` in `.env` file that is the password SHA-1 value if the authenticator is set to either LocalAuthenticator or Native read more in [jupyter doc](https://jupyterhub.readthedocs.io/en/stable/api/auth.html?highlight#) about this.

<strong><u>Users must use the "/work/"directory for their work, otherwise files might not get saved!</u></strong>

### User singleuser container image selection

Users can be allowed to select their own image upon starting their container service, this is enabled by default, it can be turned off by setting `DOCKER_SELECT_NOTEBOOK_IMAGE_ALLOWED=false` in the `services.yml` file.


### GPU support within jupyter

Pre-requisites (for Linux and Windows): 
    - for Linux, you need to install the nvidia-docker2 package / nvidia toolkit package that adds gpu spport for docker, official documentation [here](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)
    - this also needs to be done for Windows machines, please read the the documentation for WSL2 [here](https://docs.nvidia.com/cuda/wsl-user-guide/index.html)

GPU support is disabled by default, to enable it, set `DOCKER_ENABLE_GPU_SUPPORT=true` in the `services.yml` file.Please note that only the `cogstacksystems/jupyter-singleuser-gpu:latest`/ `cogstack-gpu` should be used, as it is the only image that has the drivers installed.

Do not attempt to use the gpu image on a non-gpu machine, it wont work and it will crash the container service.

### Resource limit control in Jupyter-Hub

It is possible to set CPU and RAM limits for admins and normal users, check the following properties in  [/deploy/jupyter.env](../../deploy/jupyter.env).

```
# general user resource cap per container
RESOURCE_ALLOCATION_USER_CPU_LIMIT="2"
RESOURCE_ALLOCATION_USER_RAM_LIMIT="2G"

# admin resource cap per container
RESOURCE_ALLOCATION_ADMIN_CPU_LIMIT="2"
RESOURCE_ALLOCATION_ADMIN_RAM_LIMIT="4G"
```

Go to the `/deploy` folder.
You will need to execute the `export_env_vars.sh` script in order to set these limits, BEFORE running the jupyter-hub container.

Check if the variables have been set by running: 
```
    echo $RESOURCE_ALLOCATION_USER_CPU_LIMIT
```

If no value is diplsayed then you will manually have to set it, run the following:
```
set -a
source jupyter.env
set +a
```

#### ENV/CONF files:

- `/deploy/jupyter.env` - all you should ever set is located here
- `/services/jupyter-hub/jupyter_config.py` - only tamper if you know what you are doing, please see [config documentation](https://github.com/jupyterhub/jupyterhub-deploy-docker/blob/main/basic-example/jupyterhub_config.py) for detailed settings

**IMPORTANT**:
- `/services/jupyter-hub/userlist` - userlist that gets loaded once jupyter starts up, you will need to update this manually at the moment whenever a user is created
- `/services/jupyter-hub/teamlist` - teamlist that gets loaded once jupyter starts up

Re-run the above if you change the values.Make sure to delete old instances of Jupyter-hub containers, and Jupyter single-user containers for each user.DO NOT delete their volumes, you don't want to delete their data!

<span style="color: red"><strong>IMPORTANT NOTE: all environment variable(s) are described in detail in the env file comments in </strong></span> `/deploy/jupyter.env`


### Security

This service users NiFi's `../../security/root-ca.p12` and  `../../security/root-ca.key` certificates,so if you have generated them for NiFi then there is nothing else to do, please see the [jupytherhub secion](../security.md#jupyterhub) for other security configs.

## Git-ea

This is a GitHub/GitLab equivalent.Feel free to use it if you organisation doesn't allow access to Github, etc.


### Migrating Git repositories:

Migrating git repos is straightforward.

If you have an Git organisation (e.g COGSTACK) on your git-ea server, make sure you do the following steps:
- make sure you have the same organisation name created/existing on both servers, and that the source server has the repos you need migrating assigned to the organisation
- select <New Migration>
- the above option reveals a screen, select `Git` not `Gitea`
- in the next screen we can pick a user
- complete the migration as per the following example:
    - get url of the source and dest servers : e.g cogstack1 (source) and cogstack2 (dest) respectively
    - use a user and password that is able to manage the repo on cogstack2
    - untick the `mirror` option as we will not be using cogstack2 in future
    - select <Migrate Repository> and it should report success and the repo will be migrated into the COGSTACK organisation on the new server



### ENV/settings files:

- `/services/gitea/app.ini`` - this is the file you will need to edit manually for settings for now, ENV file will soon be available.


### Security

This service users NiFi's `../../security/root-ca.p12` and  `../../security/root-ca.key` certificates, nothing else is required.

## NGINX
Although by default not used in the deployment example, NGINX is primarily used as a reverse proxy, limiting the access to the used services that normally expose endpoint for the end-user.
For a simple scenario, it can used only for securing access to Apache NiFi webservice endpoint.

All the necessary configuration files and scripts are located in [`./services/nginx/config/`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/nginx/config) directory where the user and password generation script `setup_passwd.sh`.

### NGINX-NiFi

This is a specific nginx instance that is used directly by all services EXCEPT MedCAT Trainer, the trainer has it's own instance started separately with different rules.

### NGINX-MEDCAT-TRAINER

Please refer to the trainer docs, [MedCAT Trainer](https://github.com/CogStack/MedCATtrainer) for more info on configuration.


#### Security

This service users NiFi's `../../security/root-ca.p12` and  `../../security/root-ca.key` certificates.
