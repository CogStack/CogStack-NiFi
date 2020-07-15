# Introduction
This repository contains example recipes using [Apache NiFi](https://nifi.apache.org/) as the key data workflow engine with a set of services for documents processing with NLP. 
CogStack-NiFi proposes a possible replacement for the data processing capabilities of [CogStack-Pipeline](https://github.com/CogStack/CogStack-Pipeline). 
 
**Important!**
Please note that it is still a work-in-progress project and it is not production-ready.


# Project organisation
The project is organised in the following directories:
- `nifi` - configuration files for Apache NiFi, alongside used drivers, example workflows and custom user scripts,
- `security` - scripts to generate SSL keys and certificates for Apache NiFi and related services (when needed) with other security-related requirements,
- `services` - available services with their corresponding configuration files and resources,
- `deploy` - an example deployment of Apache NiFi with related services.

For more information please refer to individual README files provided in each of these directories.


**Important!**
Please note that in this example deployment SSL encryption is temporary disabled for the self-signed certificates. However, one still needs to generate SSL certificates, self-sign them (see: `security/README.md`) and provide to `elasticsearch-1` and `kibana` services.
