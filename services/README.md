# General info

This directory contains configuration files and resources for services used in the example deployment. Some of these services are used by NiFi when executing the flow. 

The available services are:
- `elasticsearch-1` - a single-node Amazon OpenDistro ElasticSearch cluster,
- `kibana` - the Amazon OpenDistro version of Kibana user-interface,
- `nlp-gate-bioyodie` - the Bio-Yodie NLP application running as a web service exposing a REST API,
- `samples-db` - a PostgreSQL database with sample data to play with,
- `nginx` - a reverse proxy for securing the access to used services (at the moment, not used).

Please note thst some alternative pipeline engines have been provided `aux-pipelines` directory, however, these are only for general testing purposes.

**IMPORTANT: Please note that some of the necessary configuration parameters, variables and paths are also defined in the `docker-compose.yml` file in the main distribution directory. This file also defines which ports will be mapped from containers to the host and exposed.**


# Available services

## ElasticSearch + Kibana
In this example deployment we use the [OpenDistro for ElasticSearch and Kibana](https://opendistro.github.io/for-elasticsearch/) version. The configuration files for ElasticSearch and Kibana are provided in `elasticsearch/config` and `kibana/config` directories respectively. 

### Access and security

Please note that both ElasticSearch and Kibana use security module from the OpenDistro to manage user access permissions and roles. However, users and roles need to be set up otherwise the default built-in ones will be used and with default passwords. For more details on setting up the security in this example deployment please refer to `security` directory in the main distribution directory.

By default, one can accesss the Kibana and ElasticSearch by using ther default `admin` user with pass `admin`.

**IMPORTANT: Please note that in some scenarios a manual creation of index mapping may be required prior to starting ingestion. A script `es_index_initializer.py` has been provided in `elasticsearch/scripts/` directory to help with that.**


## NLP applications
In this example we use NLP applications running as a service exposing REST API. The applications are stored in `nlp-services/applications` directory.

### REST API
The current version of API specs is specified in `nlp-services/api-specs` directory (both [Swagger](https://swagger.io/) and [OpenAPI](https://www.openapis.org/) specs).


### Bio-Yodie

#### NLP Application
[Bio-Yodie](https://github.com/GateNLP/Bio-YODIE) is a named entity linking application build using [GATE NLP](https://gate.ac.uk/) suite ([publication](https://arxiv.org/abs/1811.04860)).

#### NLP Service
The application files are stored in `nlp-services/applications/bio-yodie` directory.

The Bio-Yodie Service configuration is stored in `nlp-services/applications/bio-yodie/config` directory - the key service configuration properties are defined in `application.properties` file.

**IMPORTANT: Please note that in this example we use a custom build Docker image with Bio-Yodie application already present in the container and initialized. However, the UMLS resources are missing due to licensing limitation - these require to be provided on the host machine with its path linked to the container internal path (see: `docker-compose.yml` in the main distribution directory).**


### Drug-App

#### NLP Application
This simple application implements annotation of common drugs and medications. It was created using [GATE NLP](https://gate.ac.uk/sale/tao/splitch13.html) suite and uses GATE ANNIE Gazetteer plugin. The application was been created in GATE Developer studio and exported into `gapp` format. This application is hence ready to be used by GATE and is stored in `nlp-services/applications/drug-app/gate` directory as `drug.gapp` alongside the used resources.

The list of drugs and medications to annotate is based on a publicly available list of FDA-approved drugs and active ingredients. The data can be downloaded directly from [Drugs@FDA database](https://www.fda.gov/drugs/informationondrugs/ucm079750.htm). 

#### NLP Service
This applications is being run using a NLP Service runner application that uses internally [GATE Embedded](https://gate.ac.uk/family/embedded.html) (for running GATE applications) and exposes a REST API.

The NLP Service necessary configuration files are stored in `nlp-services/applications/drug-app/config` directory - the key service configuration properties are defined in `application.properties` file.

If you would like to build the docker image with already initialized NLP application, service and necessary resources bundled, please use provided `Dockerfile` in the `nlp-services/applications/drug-app/` directory.

**IMPORTANT: Please note that this application is provided just as a proof-of-concept and by default is not running as a part of services stack.**



## Samples DB
In this example, `samples-db` service runs as a PostgreSQL database that contains some example data to play with - generated [synthetic records](https://github.com/synthetichealth/synthea) enrinched with free-text from [MTSamples](https://www.mtsamples.com/).

### Initialization
During the service initialization, the script `init_db.sh` will populate the database with sample data read from a database dump. All the necessary data and scripts are stored in `pgsamples` directory.

### Connecting to the database
The example data is stored in `db_samples` database. Use user `test` with password `test` to connect to it.


## NGINX
In this example, Nginx is used as a reverse proxy, limiting the access to the used services that normally expose endpoint for the end-user. In this example, it is used only for securing access to NiFi web endpoint.

All the necessary configuration files and scripts are located in `nginx/config/` directory where the user and password generation script `setup_passwd.sh`. 

**IMPORTANT: For the moment, by default `nginx` is not being used and is disabled during services start-up (see: `docker-compose.yml`).**


# Missing
- MEDCAT NLP Service
- OCR Service
