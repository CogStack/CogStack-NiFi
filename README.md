# Introduction
This repository contains example recipes on deploying NiFi with a set of services for documents processing with NLP.

# Project organisation
The project is organised in the following directories:
- `nifi` - configuration files for NiFi alongside the available drivers, workflows and custom user scripts,
- `security` - scripts to generate necessary SSL keys and certificates for NiFi and used services (when needed),
- `services` - available services with their corresponding configuration files and resources.

# Example deployment
In the main directory there is also `docker-compose.yml` file that defines the services that will be used with NiFi. These are:
- `nifi` - a single instance of NiFi processor (with Zookeper integrated),
- `samples-db` - a PostgreSQL database with sample data to play with,
- `elasticsearch-1` - a single-node [Amazon OpenDistro](https://opendistro.github.io/for-elasticsearch/) ElasticSearch cluster, 
- `kibana` - the [Amazon OpenDistro](https://opendistro.github.io/for-elasticsearch/) version of Kibana user-interface,
- `nlp-gate-bioyodie` - the [Bio-Yodie](https://github.com/GateNLP/Bio-YODIE) NLP application running as a web service exposing a REST API.

**Important!**
Please note that in this example deployment SSL encryption is temporary disabled for the self-signed certificates. However, one still needs to generate SSL certificates, self-sign them (see: `security\README.md`) and provide to `elasticsearch-1` and `kibana` services.
