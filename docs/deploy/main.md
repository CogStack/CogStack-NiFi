# Deployment
[./deploy](https://github.com/CogStack/CogStack-NiFi/tree/master/deploy/) contains an example deployment of the customised NiFi image with related services for document processing, NLP and text analytics.

The key files are:
- `services.yml` - defines all the available services in docker-compose format. K8s (i.e. multi container service deployments is coming soon...)
- `Makefile` - scripts for running docker-compose commands,
- `.env` - local environment variables definitions, deployment `.env` files are located in the `/deploy` folder, security `.env` files are located in the `/security` folder, containing users and certificate generation settings.
The above mentioned files should be the files that you will most likely need to change during a deployment.

Individual service configurations are provided in [`./services`](https://github.com/CogStack/CogStack-NiFi/tree/master/services/).

Apache NiFi-related files are provided in [`./nifi`](https://github.com/CogStack/CogStack-NiFi/tree/master/nifi/) directory.

<br>

## Environment variables

As mentioned above, environment variables have been made available after release 1.0.
The variables are configurable, and are separated, into security and general env vars, furthermore, all services declared in the `services.yml` file have their variables in separate files.
In most cases, modifying these variables should be the only thing that is needed in order to run a successful deployment.

Multiple files are available, split into two categories:
- service: located in `./deploy/` are reponsible for direct service configuration
- security: located in `./security`, ceriticate related settings are always in the files starting with `certificates_` and user settings are located in the files ending with `_users`

The variables declared in the `./deploy` folder are used in multiple config files, as follows:
- `elasticsearch.env`, variables here are used in :
    -   `./services/elasticsearch/config/(opensearch|elasticsearch).yml`
    -   `./services/kibana/config/(opensearch|elasticsearch).yml` 
    -   `./services/metricbeat/metricbeat.yml`
    -   `./deploy/services.yml` in the following sections: `nifi`, `elasticsearch-1`, `elasticsearch-1`, `elasticsearch-3`, `kibana`, `metricbeat-1`,`metricbeat-2`

- `nifi.env`, vars used in:
    -   `./deploy/services.yml`, sections: `nifi`
    -   `./nifi/conf/nifi.properties`

- `jupyter.env`, vars used in:
    -   `./deploy/services.yml`, sections: `jupyter`

- `nlp_service.env`, vars used in:
    -   `./deploy/services.yml`, sections: `nlp-medcat-service-production`

- `database.env`, vars used in:
    -   `./deploy/services.yml`, sections: `cogstack-databank-db`,  `samples-db`

- `general.env`, these vars are optional, declared any custom variables you want here, used in the `nifi` section

Additional variablesenv files, used only or certificate generation and user accounts, found in `./security`:
- `certificates_elasticsearch.env`, used in `create_opensearch_*`/`create_es_native*` scripts
- `certificates_general.env`, used in `create_root_ca.sh`
- `certificates_nifi.env`, used in `nifi_toolkit_security.sh`
- `database_users.env`
- `elasticsearch_users.env`
- `nginx_users.env`


### Customization
For custom deployments, copy all the `.env` files (which are not tracked by Git) and add deployment specific configurations to these files. For example:

```
cp deploy/*.env deploy/new_deploy_folder/
cp security/*.env deploy/new_deploy_folder/
```

### Multiple deployments on the same machine
When deploying multiple docker-compose projects on the same machine (e.g. for dev or testing), it can be useful to remove all containers, volume and network names from the docker-compose file, and let [Docker create names](https://docs.docker.com/compose/reference/envvars/#compose_project_name) based on `COMPOSE_PROJECT_NAME` in `deploy/.env`. Docker will automatically create a Docker network and makes sure that containers can find each other by container name.

For example, when setting `COMPOSE_PROJECT_NAME=cogstack-prod`, Docker Compose will create a container named `cogstack-prod_elasticsearch-1_1` for the `elasticsearch-1` service. Within the NiFi container, which is running in the same Docker network, you can refer to that container using just the service name `elasticsearch-1`.

<br>

## <span style="color:red">Important security detail</span> 

Please note that in the example service defintions, for ease of deployment and demonstration, SSL encryption is enabled among services (NiFi, ES, etc.), however, the certificates that are used are in this public repository, anyone can see them, so **please** make sure to re-generate them when you go into production. 

## Services
Please note that all the services are deployed using [Docker](https://docker.io) engine and requires docker deamon to be running / functioning.

Please see [the available services](./services.md) for more details.


## Workflows
Apache NiFi provides users the ability to build very large and complex data flows. 
These data flows can be later saved as workflow *templates*, exported into XML format and shared with other users.
We provide few example templates for ingesting the records from a database into Elasticsearch and to perform extraction of NLP annotations from documents.

### Deployment using Makefile
For deployments based on the example workflows, please see [example workflows](./workflows.md) for more details.

### Deployment using a custom Docker-compose
When using a fork of this repository for a customized deployments, it can be useful to copy `services.yml` to a deployment-specific `docker-compose.yml`. In this Compose file you can specify the services you need for your instance and configure all parameters per service, as well as track this file in a branch in your own fork. This way you can use your own version control and rebase on `CogStack/CogStack-NiFi` master without running into merge conflicts.


## Troubleshooting

Always start with fresh containers and volumes, to make sure that there are no volumes from previous experimentations, make sure to always delete all/any cogstack running containers by executing:

`docker container rm samples-db elasticsearch-1 kibana nifi nlp-medcat-medmen tika-service nlp-gate-drugapp nlp-medcat-snomed nlp-gate-bioyodie medcat-trainer-ui medcat-trainer-nginx jupyter-hub -f`

followed by a cleanup or dangling volumes (careful as this will remove all volumes which are NOT being used by a container, if you want to remove specific volumes you will have to manually specifiy the volume names), otherwise, you can specify :

`docker volume prune -f` <strong> WARNING THIS WILL DELETE ALL UNUSED VOLUMES ON YOUR MACHINE!</strong>. Check the volume names used in services.yml file and delete them as necessary `dockr volume rm volume_name`

### Known Issues/errors
Common issues that can be encountered across services.
<br>
<br>

#### **NiFi**

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
    - Possible error when dealing with non-pgsql databases `due to Incorrect syntax near 'LIMIT'.; routing to failure: com.microsoft.sqlserver.jdbc.SQLServerException: Incorrect syntax near 'LIMIT'`, go to the GenerateTableFetch Process -> right-click -> configure -> change database type from Generic to -> MS SQL 2012 + or 2008 (if older DB system is used)
    - Possible error on Linux systems related to `nifi.properties` permission error and/or other files from the `nifi/conf/` folder, please see the [nifi doc](./nifi/main.md#span-style-color-red-strong-important-note-about-nifi-properties-strong-span) {nifi.properties} section. 

####  **Elasticsearch Errors**
It is quite a common issue for both opensearchand native-ES to error out when it comes to virtual memory allocation, this error typically comes in the form of :

```
ERROR: [1] bootstrap checks failed
[1]: max virtual memory areas vm.max_map_count [65111] is too low, increase to at least [262144]
```
To solve this one needs to simply execute :
    <br>
    - on Linux/Mac OS X : 
    ```sysctl -w vm.max_map_count=262144``` in terminal. 
    To make the same change systemwide plase add ```vm.max_map_count=262144``` to /etc/sysctl.conf and restart the dockerservice/machine.
    An example of this can be found under /services/elasticsearch/sysctl.conf
    <br>
    - on Windows you need to enter the following commands in a powershell instance:
    <br>
    ```wsl -d docker-desktop```
    <br>
    ```sysctl -w vm.max_map_count=262144```

For more on this issue please read: https://www.elastic.co/guide/en/elasticsearch/reference/current/vm-max-map-count.html