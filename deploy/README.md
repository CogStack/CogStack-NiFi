# Introduction
This directory contains an example deployment of Apache NiFi with related services for documents processing, NLP and text analytics.

The key available files are:
- `services.yml` - defines all the available services,
- `Makefile` - services deployment automated scripts,
- `.env` - local environment variables definitions,

Apart from the above key files, the individual services configuration is provided in [`../services`](../services) directory.

Apache NiFi-related files are provided in [`../nifi`](../nifi) directory.

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

followed by a cleanup or dangling volumes (careful as this will remove all volumes which are NOT being used by a container, if you want to remove specific volumes you will have to manually specifiy the volume names), otherwise, you can specify :

`docker volume prune -f` <strong> WARNING THIS WILL DELETE ALL UNUSED VOLUMES ON YOUR MACHINE!</strong>

## Known Issues/errors
When dealing with contaminated deployments ( containers using volumes from previous instances ) :
    <br />   
    - `NiFi only supports one mode of HTTP or HTTPS operation...` deleting the volumes should usually solve this issue, if not, please check the `nifi.properties` if there have been modifications done by yourself or a developer on it.
    <br />   
    - building the NiFi image manually on a restricted system, this is usually not necessary, but if for some reason this needs to be done then some settings such as proxy configs might need to be set up in the `nifi/Dockerfile` epecially ones related to the `grape` application and dealing with external downloads.
    <br />  
    - `keystore.jks`/`truststore.jks` related errors, remove the nifi container & related volumes then restart the nifi instance. 
    <br />
    - `System Error: Invalid host header : this occurs when nifi host has not been properly configured`, please check the `/nifi/conf/nifi.properties` file and set the `nifi.web.proxy.host` property to the IP address of the server along with the port `<host>:<port>`, if this does not work then it is usually a proxy/network configuration problem (also check firewalls), another workaround would be to comment out the following subsections of the `nifi` service in the `services.yml` file : `ports:` and `networks` with all their child settings. After this is done the following property should be added `network_mode: host`, restart the instance using the `docker-compoes -f services.yml up -d nifi` command afterwards. 
    <br />
    -  Possible error when dealing with non-pgsql databases `due to Incorrect syntax near 'LIMIT'.; routing to failure: com.microsoft.sqlserver.jdbc.SQLServerException: Incorrect syntax near 'LIMIT'`, go to the GenerateTableFetch Process -> right-click -> configure -> change database type from Generic to -> MS SQL 2012 + or 2008 (if older DB system is used)

    

   