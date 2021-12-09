# Introduction
This directory contains an example deployment of Apache NiFi with related services for documents processing, NLP and text analytics.

The key available files are:
- `services.yml` - defines all the available services,
- `Makefile` - services deployment automated scripts,
- `.env` - local environment variables definitions,

Apart from the above key files, the individual services configuration is provided in [`../services`](../services) directory.

Apache NiFi-related files are provided in [`../nifi`](../nifi) directory.

## NiFi access credentials
For the usernames & passwords used for NiFi, please see the ```nifi/README.md``` file.

**Important!**
Please note that in this example, for the ease of deployment and demonstration, SSL encryption is not used and services are used with default build-in usernames / passwords. 

# Services
Please note that all the services are deployed using [Docker](https://docker.io) engine and it needs to be present in the system.

Please see [the available services and deployment](./SERVICES.md) for more details.


# Workflows
Apache NiFi provides users the ability to build very large and complex data flows. 
These data flows can be later saved as workflow *templates*, exported into XML format and shared with other users.
We provide few example templates for ingesting the records from database into Elasticsearch and to perform extraction of NLP annotations from documents.

Please see [example workflows](./WORKFLOWS.md) for more details.


# Troubleshooting

Always start with fresh containers and volumes, to make sure that there are no volumes from previous experimentations, make sure to always delete all/any cogstack running containers by executing:

`docker container rm samples-db elasticsearch-1 kibana nifi nlp-medcat-medmen tika-service nlp-gate-drugapp nlp-medcat-snomed nlp-gate-bioyodie medcat-trainer-ui medcat-trainer-nginx jupyter-hub -f`

followed by a cleanup or dangling volumes (careful as this will remove all volumes which are NOT being used by a container, if you want to remove specific volumes you will have to manually specifiy the volume names):

`docker volume prune -f`

## <strong>Known Issues/errors</strong>
Common issues that can be encountered across services.
<br>
<br>
### **NiFi**
When dealing with contaminated deployments (containers using volumes from previous instances):
    <br />   
    - `NiFi only supports one mode of HTTP or HTTPS operation...` deleting the volumes should usually solve this issue, if not, please check the `nifi.properties` if there have been modifications done by yourself or a developer on it.
    <br />   
    - building the NiFi image manually on a restricted system, this is usually not necessary, but if for some reason this needs to be done then some settings such as proxy configs might need to be set up in the `nifi/Dockerfile` epecially ones related to the `grape` application and dealing with external downloads.
    <br />  
    - `keystore.jks`/`truststore.jks` related errors, remove the nifi container & related volumes then restart the nifi instance. 
    <br />
<br>
###  **Elasticsearch Errors**
It is quite a common issue for both opensearchand native-ES to error out when it comes to virtual memory allocation, this error typically comes in the form of :

```
ERROR: [1] bootstrap checks failed
[1]: max virtual memory areas vm.max_map_count [65111] is too low, increase to at least [262144]
```
To solve this one needs to simply execute :
    <br>
    - on Linux : 
    ```sysctl -w vm.max_map_count=262144``` in terminal. 
    To make the same change systemwide plase add ```vm.max_map_count=262144``` to /etc/sysctl.conf and restart the dockerservice/machine.
    <br>
    - on Windows you need to enter the following commands in a powershell instance:
    <br>
    ```wsl -d docker-desktop```
    <br>
    ```sysctl -w vm.max_map_count=262144```

For more on this issue please read: https://www.elastic.co/guide/en/elasticsearch/reference/current/vm-max-map-count.html