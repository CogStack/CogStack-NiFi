# Introduction
This repository proposes a possible next step for the free-text data processing capabilities implemented as [CogStack-Pipeline](https://github.com/CogStack/CogStack-Pipeline), shaping the solution more towards Platform-as-a-Service.
CogStack-NiFi contains example recipes using [Apache NiFi](https://nifi.apache.org/) as the key data workflow engine with a set of services for documents processing with NLP. 
Each component implementing key functionality, such as Text Extraction or Natural Language Processing, runs as a service where the data routing between the components and data source/sink is handled by Apache NiFi.
Moreover, NLP services are expected to implement an uniform RESTful API to enable easy plugging-in into existing document processing pipelines, making it possible to use any NLP application in the stack.
 
**Important!**
Please note that the project it is under development and is not production-ready.


# Project organisation
The project is organised in the following directories:
- [`nifi`](./nifi) - custom Docker image of Apache NiFi with configuration files, drivers, example workflows and custom user resources,
- [`security`](./security) - scripts to generate SSL keys and certificates for Apache NiFi and related services (when needed) with other security-related requirements,
- [`services`](./services) - available services with their corresponding configuration files and resources,
- [`deploy`](./deploy) - an example deployment of Apache NiFi with related services.
- [`scripts`](./scripts) - helper scripts such as the one ingesting samples into Elasticsearch.

For more information please refer to individual README files provided in each of these directories.

As a good starting point, please see deployment [README](./deploy/README.md) for more details on running an example project deployment.


# Security 

Default username : admin     password : admincogstacknifi

In previous nifi versions by default there was no user assigned and authentication was anonymous. Since 1.14.0 this changed. So now we have HTTPS enabled by default via port 8443 (configurable in nifi.properties and the services.yml file).

Before starting the NIFI container it's important to take note of the following things if we wish to enable HTTPS functionality:

- the `nifi_toolkit_security.sh` script is used to download the nifi toolkit and generate new certificates and keys that are used by the container, take note that inside the `localhost` folder there is another nifi.properties file that is generated, we must look to the following setttings which are generated randomly and copy them to the `nifi/conf/nifi.properties` file. 
- in order to be able to generate new keys for production use you should DELETE the localhost folder in `security/localhost` and `nifi-cert.pem` + `nifi-key.key` files.


```
    nifi.security.keystorePasswd=ZFD4i4UDvod8++XwWzTg+3J6WJF6DRSZO33lbb7hAgc
    nifi.security.keyPasswd=ZFD4i4UDvod8++XwWzTg+3J6WJF6DRSZO33lbb7hAgc
    nifi.security.truststore=./conf/truststore.jks
    nifi.security.truststoreType=jks
    nifi.security.truststorePasswd=lzMGadNB1JXQjgQEnFStLiNkJ6Wbbgw0bFdCTICKtKo
```

- nifi USER credentials, usually for a single user login you only need to check the `nifi.sensitive.props.key` which can be set to a random string of minimum 10 characters. Once this is set do NOT modify (https://nifi.apache.org/docs/nifi-docs/html/administration-guide.html#how-to-install-and-start-nifi)
- the `login-identity-providers.xml` file in `/nifi/conf/` stores the password for the user account, to generate a password one must use the following command within the container : `/opt/nifi/nifi-current/bin/nifi.sh set-single-user-credentials USERNAME PASSWORD`, once done, you would need to copy the file from `/opt/nifi/nifi-current/conf/login-identity-providers.xml` locally with docker cp and replace the one in the `nifi/conf` folder and rebuild the container.

URL: https://localhost:8443/nifi/login

Troubleshooting Security : if you encounter errors related to sensitive key properties not being set please clear/delete the docker volumes of the nifi container or delete all volumes of inactive containers `docker volume rm $(docker volume list -q)`

