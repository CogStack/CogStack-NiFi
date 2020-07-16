# Introduction
This directory contains an example deployment of Apache NiFi with related services for documents processing, NLP and text analytics.

The key available files are:
- `services.yml` - defines all the available services,
- `Makefile` - services deployment automated scripts,
- `.env` - local environment variables definitions,

Apart from the above key files, the individual services configuration is provided in [`../services`](../services) directory.
Apache NiFi-related files are provided in [`../nifi`](../nifi) directory.

**Important!**
Please note that for the ease of demonstration in this example deployment SSL encryption is disabled. 


# Services
Please note that all the services are deployed using [Docker](https://docker.io) engine and it needs to be present in the system.

Please see [details on the deployment and available services](./SERVICES.md) for more details on available services.


# Workflows
Apache NiFi provides users the ability to build very large and complex data flows. 
These data flows can be later saved as workflow *templates*, exported into XML format and shared with other users.
We provide few example templates for ingesting the records from database into ElasticSearch and to perform extraction of NLP annotations from documents.

Please see [available Apache NiFi workflow templates](./WORKFLOWS.md) for details.
