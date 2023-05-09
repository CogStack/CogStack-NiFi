# Introduction
This repository proposes a possible next step for the free-text data processing capabilities implemented as [CogStack-Pipeline](https://github.com/CogStack/CogStack-Pipeline), shaping the solution more towards Platform-as-a-Service.

CogStack-NiFi contains example recipes using [Apache NiFi](https://nifi.apache.org/) as the key data workflow engine with a set of services for documents processing with NLP. 
Each component implementing key functionality, such as Text Extraction or Natural Language Processing, runs as a service where the data routing between the components and data source/sink is handled by Apache NiFi.
Moreover, NLP services are expected to implement an uniform RESTful API to enable easy plugging-in into existing document processing pipelines, making it possible to use any NLP application in the stack.

## Development

Please note that the project is under constant improvement, brining new features or services that might impact current deployments, please be aware as this might affect you, the user, when making upgrades, so be sure to check the release notes and the documentation beforehand. 

If you wish to contribute to the project, submit a pull request and we will review it.

## Asking questions
Feel free to ask questions on the github issue tracker or on our [discourse website](https://discourse.cogstack.org) which is frequently used by our development team!
<br>

## Project organisation
The project is organised in the following directories:
- [`nifi`](./nifi) - custom Docker image of Apache NiFi with configuration files, drivers, example workflows and custom user resources.
- [`security`](./security) - scripts to generate SSL keys and certificates for Apache NiFi and related services (when needed) with other security-related requirements.
- [`services`](./services) - available services with their corresponding configuration files and resources.
- [`deploy`](./deploy) - an example deployment of Apache NiFi with related services.
- [`scripts`](./scripts) - helper scripts containing setup tools, sample ES ingestion, bash ingestion into DB samples etc.
- [`data`](./data) - any data that you wish to ingest should be placed here.

### Branches

- master: main branch, production releases.
- devel: this branch contains experimental/unstable docker images may cause irregular behaviour or crashes.

## Documentation and getting started

Knowledge requirements: Docker usage (mandatory), Python, Linux/UNIX understarting.

Official documentation now available [here](https://cogstack-nifi.readthedocs.io/en/latest/).

As a good starting point, [deployment](https://cogstack-nifi.readthedocs.io/en/latest/deploy/main.html) walks through an example deployment with some workflow examples.

It is essential that a careful read through the [NiFi](https://cogstack-nifi.readthedocs.io/en/latest/nifi/main.html) section  is done as it explains all the details of how NiFi is setup, the configuration and production setup tips.

All issues are tracked in [README](https://cogstack-nifi.readthedocs.io/en/latest/deploy/main.html), check that section before opening a bug report ticket.

## Important news and updates

Please check [IMPORTANT_NEWS](https://cogstack-nifi.readthedocs.io/en/latest/news.html) for any major changes that might affect your deployment and <strong>security problems</strong> that have been discovered.