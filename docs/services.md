# Available service resources
This directory contains configuration files and resources for services used in the example deployment. 
Many of these services are used by Apache NiFi when executing the flow. 

This README covers only the available resources listed in [`./services`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/).
Please see [example deployment](deploy/main.md) for more details on the used services and their configuration.

**IMPORTANT**
Please note that some of the necessary configuration parameters, variables and paths are also defined in the [`services.yml`](https://github.com/CogStack/CogStack-NiFi/tree/master/deploy/services.yml) file.

## Samples DB
For an example deployment, a PostgreSQL database that contains some example data to play with was generated [synthetic records](https://github.com/synthetichealth/synthea) enrinched with free-text from [MTSamples](https://www.mtsamples.com/).
All the necessary resources, data and scripts are stored in `pgsamples/` directory.
During the service initialization, the script `init_db.sh` will populate the database with sample data read from a database dump stored in `db_dump` directory.
The directory [`./services/pgsamples/scripts`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/pgsamples/scripts) contains SQL schemas with scripts that will generate the database dump using sample data.


## ELK stack
There are two types of Elasticsearch versions available, apart from the native one there is a also OpenSearch, which is a fork of the original but developed & maintained by Amazon.

The [ELK stack](https://www.elastic.co/what-is/elk-stack) used in this project is based on [OpenSearch for ElasticSearch and Kibana](https://opensearch.org/) distribution.
OpenSearch for Elasticsearch is a fully open-source, free and community-driven fork of Elasticseach.
It implements many of the commercial X-Pack components functionality, such as advanced security module, alerting module or SQL support. 
Nonetheless, the standard core functionality and APIs of the official Elasticsearch and OpenDistro remain the same. 
Hence, OpenSearch can be used as a drop-in replacement for the standard ELK stack.

The used configuration files for ElasticSearch and Kibana are provided in [`./services/elasticsearch/config/`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/elasticsearch/config) and [`./services/kibana/config/`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/kibana/config) directories respectively.

The names of the services within the NiFi project are the same even though they have different names, we will refer to original Elasticsearch as ES native in the documentation.

Services names Elasticsearch | OpenSearch:
    - Elasticsearch <-> OpenSearch
    - Kibana <-> OpenSearch Dashboards

Please note that both ElasticSearch and Kibana use security module from the OpenDistro to manage user access permissions and roles. 
However, for production use, proper users and roles need to be set up otherwise the default built-in ones will be used and with default passwords. 
For more details on setting up the security in this example deployment please refer to [`security`](security.md).

Please note that in some scenarios a manual creation of index mapping may be a good idea prior to starting ingestion. 
A script `es_index_initializer.py` has been provided in [`./services/elasticsearch/scripts/`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/elasticsearch/scripts) directory to help with that.


## Tika service
In order to extract text from binary documents [Apache Tika](https://tika.apache.org/) is used. 
The application is deployed running as a webservice that exposes a REST API. 
The application data, alongside configuration file, is stored in [`./services/tika-service`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/tika-service) directory.

The Tika service configuration file is specified in `tika-service/config/application.yaml` file. 
Please refer to the [Tika Service documentation](https://github.com/CogStack/tika-service) for the description of the available parameters.


## NLP applications
In the example deployment we use NLP applications running as a service exposing REST API. 
The current version of API specs is specified in [`./services/nlp-services/api-specs/`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/nlp-services/api-specs) directory (both [Swagger](https://swagger.io/) and [OpenAPI](https://www.openapis.org/) specs).
The applications are stored in [`./services/nlp-services/applications`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/nlp-services/applications).

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


### MedCAT Trainer
Apart from MedCAT Service, there is provided [MedCAT Trainer](https://github.com/CogStack/MedCATtrainer) that serves a web application used for training and refining MedCAT NLP models.
Such trained models can be later saved as files and loaded into MedCAT Service.
Alternatively, the models can be loaded into custom application.

MedCAT Trainer resources are stored in [`./services/medcat-trainer`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/nlp-services//medcat-trainer) directory. 
The key configuration is stored in [`./services/medcat-trainer/env`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/medcat-trainer/envs/env) file.

As a companion service, it uses a NGINX reverse-proxy for providing content from MedCAT Trainer web service.
The NGINX configuration is stored in [`./services/medcat-trainer/nginx`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/medcat-trainer/nginx) directory.

For more information on the MedCAT Trainer configuration and use please refer to [the official documentation](https://github.com/CogStack/MedCATtrainer).


### GATE NLP apps

### Drugs and medications
This simple application implements annotation of common drugs and medications. 
It was created using [GATE NLP](https://gate.ac.uk/sale/tao/splitch13.html) suite and uses GATE ANNIE Gazetteer plugin. 
The application was been created in GATE Developer studio and exported into `gapp` format. 
This application is hence ready to be used by GATE and is stored in `nlp-services/applications/drug-app/gate` directory as `drug.gapp` alongside the used resources.

The list of drugs and medications to annotate is based on a publicly available list of FDA-approved drugs and active ingredients. 
The data can be downloaded directly from [Drugs@FDA database](https://www.fda.gov/drugs/informationondrugs/ucm079750.htm). 

This applications is being run using a NLP Service runner application that uses internally [GATE Embedded](https://gate.ac.uk/family/embedded.html) (for running GATE applications) and exposes a REST API.
The NLP Service necessary configuration files are stored in `nlp-services/applications/drug-app/config/` directory - the key service configuration properties are defined in `application.properties` file.

If you would like to build the docker image with already initialized NLP application, service and necessary resources bundled, please use provided `Dockerfile` in the `nlp-services/applications/drug-app/` directory.

**Important**
Please note that this application is provided just as a proof-of-concept of running GATE applications.


#### Bio-YODIE
[Bio-YODIE](https://github.com/GateNLP/Bio-YODIE) is a named entity linking application build using [GATE NLP](https://gate.ac.uk/) suite ([publication](https://arxiv.org/abs/1811.04860)).

The application files are stored in [`nlp-services/applications/bio-yodie/`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/nlp-services/applications/bio-yodie) directory.

The Bio-Yodie service configuration is stored in [`nlp-services/applications/bio-yodie/config/`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/nlp-services/applications/bio-yodie/config) directory - the key service configuration properties are defined in `application.properties` file.

**Important**
Please note that the required Bio-YODIE UMLS resources cannot be publicly shared due to licensing limitation and are not included, hence the application cannot be run out-of-the-box.
The resources need to be provided on the host machine with its path linked to the container internal path (see: [deploy](deploy/main.md)) prior running Bio-YODIE.


## JupyterHub
[JupyterHub](https://jupyter.org/hub) allows to serve Jupyter Notebooks to users.
It gives users access to computational environments and resources without burdening the users with installation and maintenance tasks.

For the example deployment, there is a custom JupyterHub Docker image being built.
It includes additional database drivers and Python packages.
All the resources are available in [`./services/jupyter-hub`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/jupyter-hub) directory.

The JupyterHub comes with an example Jupyter notebook that is stored in [`./services/jupyter-hub/notebooks`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/jupyter-hub/notebooks) directory.

For more information on the use and configuration of Jupyter Hub please refer to [the official Jupyter Hub documentation](https://jupyter.org/hub).


## NGINX
Although by default not used in the deployment example, NGINX is primarily used as a reverse proxy, limiting the access to the used services that normally expose endpoint for the end-user. 
For a simple scenario, it can used only for securing access to Apache NiFi webservice endpoint.

All the necessary configuration files and scripts are located in [`./services/nginx/config/`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/nginx/config) directory where the user and password generation script `setup_passwd.sh`. 
