# Introduction
This repository proposes a possible next step for the free-text data processing capabilities implemented as [CogStack-Pipeline](https://github.com/CogStack/CogStack-Pipeline), shaping the solution more towards Platform-as-a-Service.
CogStack-NiFi contains example recipes using [Apache NiFi](https://nifi.apache.org/) as the key data workflow engine with a set of services for documents processing with NLP. 
Each component implementing key functionality, such as Text Extraction or Natural Language Processing, runs as a service where the data routing between the components and data source/sink is handled by Apache NiFi.
Moreover, NLP services are expected to implement an uniform RESTful API to enable easy plugging-in into existing document processing pipelines, making it possible to use any NLP application in the stack.
 
<strong>----------Important----------</strong>
<br>
Please note that the project it is under constant improvement, brining new features or services that might impact curent deplyoments, please be aware as this might affect you, the user, when making upgrades, so be sure to check release notes and documentation beforehand.

# Project organisation
The project is organised in the following directories:
- [`nifi`](./nifi) - custom Docker image of Apache NiFi with configuration files, drivers, example workflows and custom user resources,
- [`security`](./security) - scripts to generate SSL keys and certificates for Apache NiFi and related services (when needed) with other security-related requirements,
- [`services`](./services) - available services with their corresponding configuration files and resources,
- [`deploy`](./deploy) - an example deployment of Apache NiFi with related services.
- [`scripts`](./scripts) - helper scripts such as the one ingesting samples into Elasticsearch.
- [`data`](./data) - any data that you wish to ingest should be placed here.

As a good starting point, [deployment](https://cogstack-nifi.readthedocs.io/en/latest/deploy/main.html) walks through an example deployment workflow examples.

Official documentation now available [here](https://cogstack-nifi.readthedocs.io/en/latest/) 

All issues are tracked in [README](https://cogstack-nifi.readthedocs.io/en/latest/deploy/main.html), check that section before opening a bug report ticket.

# IMPORTANT NEWS AND UPDATES

Please check [IMPORTANT_NEWS](https://cogstack-nifi.readthedocs.io/en/latest/news.html) for any major changes that might affect your deployment and <strong>security problems</strong> that have been discovered.