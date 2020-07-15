# Introduction
This directory contains an example deployment of Apache NiFi with related services for documents processing, NLP and text analytics.

The key available files are:
- `services.yml` - defines all the available services,
- `Makefile` - services deployment automated scripts,
- `.env` - local environment variables definitions,

Apart from the above key files, the individual services configuration is provided in `../services` directory.
Apache NiFi-related files are provided in `../nifi` directory.
 
Please see: [details on the deployment and available services](./SERVICES.md).

Please see: [available Apache NiFi workflow templates](./WORKFLOWS.md).

**Important**
Please note that all the services are deployed using [Docker](https://docker.io) engine and it needs to be present in the system.
