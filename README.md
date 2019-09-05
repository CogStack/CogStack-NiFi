# Introduction
This repository contains example recipes on deploying [Apache NiFi](https://nifi.apache.org/) with a set of services for documents processing with NLP.

**Important!**
Please note that it is still a work-in-progress project and it is not production-ready.


# Project organisation
The project is organised in the following directories:
- `nifi` - configuration files for Apache NiFi alongside the available drivers, workflows and custom user scripts,
- `security` - scripts to generate necessary SSL keys and certificates for Apache NiFi and used services (when needed), and for creating and configuring ElasticSearch users,
- `services` - available services with their corresponding configuration files and resources.

For more information, there is a README provided in each of these directories.


# Example deployment
In the main directory there is also `docker-compose.yml` file that defines the services that will be used with Apache NiFi. These are:
- `nifi` - a single instance of Apache NiFi processor (with Zookeper embedded),
- `samples-db` - a PostgreSQL database with sample data to play with,
- `elasticsearch-1` - a single-node cluster of [Amazon OpenDistro](https://opendistro.github.io/for-elasticsearch/) for ElasticSearch, 
- `kibana` - the [Amazon OpenDistro](https://opendistro.github.io/for-elasticsearch/) version of Kibana user-interface,
- `tika-service` - the [Apache Tika](https://tika.apache.org/) running as a web service (see: [tika-service repository](https://github.com/tika-service/)).
- `nlp-gate-bioyodie` - the [Bio-Yodie](https://github.com/GateNLP/Bio-YODIE) NLP application running as a web service exposing a REST API,
- `nlp-medcat-medmen` (using [Med-Mentions](https://github.com/chanzuckerberg/MedMentions) corpus) and `nlp-medcat-umls` (using UMLS) - the [MEDCAT](https://github.com/CogStack/CAT/) NLP application running as a web service.
- `nginx` - serving as a reverse-proxy, exposing internal services (`elasticsearch-1`, `kibana` and `nifi`) to the host machine.

**Important!**
Please note that NLP Services: Bio-Yodie and MEDCAT that use UMLS vocabulary due to licensing limitations come without UMLS provided. One needs to provide these resources manually. Only MEDCAT version using Med-Mentions (`nlp-medcat-medmen`) is ready-to-use without providing manually prepared UMLS resources.

**Important!**
Please note that in this example deployment SSL encryption is temporary disabled for the self-signed certificates. However, one still needs to generate SSL certificates, self-sign them (see: `security/README.md`) and provide to `elasticsearch-1` and `kibana` services.
