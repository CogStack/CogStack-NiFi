# Prequisites

Software required on machine:
    - git + git-lfs
    - Docker

You can use the script with `SUDO` rights, located at `/scripts/installation_utils/install_docker_and_utils.sh`, it can be used on Debian/Ubuntu/CentOS/RedHAT RHEL 8 only, run it once and everything should be set up.
Consult the (`Docker installation steps`)[https://docs.docker.com/engine/install/debian/] if there are issues with the docker setup.

#### <span style="color: red"><strong>IMPORTANT NOTE: Do a `git-lfs pull` so that you have everything downloaded from the repo (including bigger zipped files.).

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

`docker container rm samples-db elasticsearch-1 kibana nifi  nlp-medcat-service-production tika-service nlp-gate-drugapp nlp-medcat-snomed nlp-gate-bioyodie medcat-trainer-ui medcat-trainer-nginx jupyter-hub -f`

followed by a cleanup or dangling volumes (careful as this will remove all volumes which are NOT being used by a container, if you want to remove specific volumes you will have to manually specifiy the volume names), otherwise, you can specify :

`docker volume prune -f` <strong> WARNING THIS WILL DELETE ALL UNUSED VOLUMES ON YOUR MACHINE!</strong>. Check the volume names used in services.yml file and delete them as necessary `dockr volume rm volume_name`

### Known Issues/errors
Common issues that can be encountered across services.
<br>
<br>

#### **Apple Silicon**

Many services cannot run natively on Apple Silicon (such as M1 and M2 architectures). Common error messages related to Apple silicon follow patterns similar to:
    <br /><br/>
    - `no match for platform in manifest`
    <br /><br/>
    <br /><br/>
    - `no matching manifest for linux/arm64/v8 in the manifest list entries`
    <br /><br/>
    <br /><br/>
    - `image with reference cogstacksystems/cogstack-ocr-service:0.2.4 was found but does not match the specified platform: wanted linux/arm64, actual: linux/amd64`
    <br /><br/>
To solve these issues; Rosetta is required and enabled in Docker Desktop. Finally an environment variable is required to be set.

Rosetta can which can be installed via the following command:
```
softwareupdate --install-rosetta
```
When Rosetta and Docker Desktop are installed, Rosetta must be enabled. This done by going to Docker Desktop -> Setting -> General and enabling "Use Virtualization framework". After in the same settings go to "features in development" -> "Use Rosetta for x86/amd64 emulation on Apple Silicon". Finally execute the following command:
```
export DOCKER_DEFAULT_PLATFORM=linux/amd64
```
to set the environment variable. These issues are known to occur on the "cogstack-nifi", "cogstack-ocr-services" and "jupyter-hub" services and may occur on others.

#### **NiFi**

When dealing with contaminated deployments ( containers using volumes from previous instances ) :
    <br /><br/>
    - `NiFi only supports one mode of HTTP or HTTPS operation...` deleting the volumes should usually solve this issue, if not, please check the `nifi.properties` if there have been modifications done by yourself or a developer on it.
    <br /><br/>
    - building the NiFi image manually on a restricted system, this is usually not necessary, but if for some reason this needs to be done then some settings such as proxy configs might need to be set up in the `nifi/Dockerfile` epecially ones related to the `grape` application and dealing with external downloads.
    <br /><br/>
    - `keystore.jks`/`truststore.jks` related errors, remove the nifi container & related volumes then restart the nifi instance. 
     <br /><br/>
    - `System Error: Invalid host header : this occurs when nifi host has not been properly configured`, please check the `/nifi/conf/nifi.properties` file and set the `nifi.web.proxy.host` property to the IP address of the server along with the port `<host>:<port>`, if this does not work then it is usually a proxy/network configuration problem (also check firewalls), another workaround would be to comment out the following subsections of the `nifi` service in the `services.yml` file : `ports:` and `networks` with all their child settings. After this is done the following property should be added `network_mode: host`, restart the instance using the `docker-compoes -f services.yml up -d nifi` command afterwards. 
    <br /><br/>
    - Possible error when dealing with non-pgsql databases `due to Incorrect syntax near 'LIMIT'.; routing to failure: com.microsoft.sqlserver.jdbc.SQLServerException: Incorrect syntax near 'LIMIT'`, go to the GenerateTableFetch Process -> right-click -> configure -> change database type from Generic to -> MS SQL 2012 + or 2008 (if an older DB system is used)
    - Possible error on Linux systems related to `nifi.properties` permission error and/or other files from the `nifi/conf/` folder, please see the [nifi doc](./nifi/main.md#span-style-color-red-strong-important-note-about-nifi-properties-strong-span) {nifi.properties} section. 
    <br /><br/>
    - `Driver class org.postgresql.Driver is not found` or something similar for other MSSQL/SQL drivers, this is a known issue after NiFi version v1.20+, first, make sure you pull the latest version of the repository, then for the JAR file you are using, please execute the following command in order to verify its integrity `jar -tvf ./nifi/drivers/your_file_version.jar`, if this returns a list of files and NO errors then the files are not corrupted and can be loaded. On the NiFi side make sure to go to the `DBCPConnectionPool` controller service and verify the propertiesit a few times, make sure the file path is correct and in the following format: `file:///opt/nifi/drivers/postgresql-42.6.0.jar` for example. If all this fails stop nifi, delete all the Docker volumes associated with it -> restart NiFi, perform the above steps again. You can try forcefully starting the `GenerateTableFetch` or `QueryDatabaseTable` processors by enabling the `DBCPConnectionPool` even if an error popus up after clicking the verify button.
    <br /><br/>
    - `502 Bad Gateway`, NiFi simply not starting, even after waiting more than 2-3 minutes. This can occur due to a wide variety of issues, you can check the NiFi container log : “docker logs -f --tail 1000 cogstack-nifi > my_log_file.txt” to capture the output easily. The most common cause is running out of memory, increase or decrease the limits in `nifi/conf/bootstrap.conf` according to your machine's spec, please read [bootstrap.conf](../nifi/main.md#bootstrapconf)
    <br /><br/>
    - `Unable to connect to ElasticSearch` using the `ElasticSearchClientService` NiFi controller, make sure the settings are correct (username,password,certificates, etc.) and then click `Apply`, disregard the errors and click `Enable` on the controller to forcefully reload the controller, stop it and then validate the settings, start it again after and it should work.

####  **Elasticsearch Errors**
<br>

##### **VM memory errors, failed bootstrap check**
<br>

It is quite a common issue for both opensearch and native-ES to error out when it comes to virtual memory allocation, this error typically comes in the form of :

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

<br>

##### **OpenSearch: validating opensearch.yml hosts**
<br>


```
FATAL  Error: [config validation of [opensearch].hosts]: types that failed validation:
- [config validation of [opensearch].hosts.0]: expected URI with scheme [http|https].
- [config validation of [opensearch].hosts.1]: could not parse array value from json input
```

This issue may appear after the recent switch to using fully customizable environment variables. Strings and ENV vars may be parsed differently depending on the shell version found on the host system.

To solve this, the easiest way is to make sure to load the `elasticsearch.env` variables before starting the Elastic & Kibana containers by doing the following:

```
    cd ./deploy/
    set -a
    source elasticsearch.env
    make start-elastic
```

Alternatively (if the script executes without issues):
```
    cd ./deploy/
    source export_env_vars.sh
    make start-elastic
```


### DB-samples issues

``` No table data  for samples_db```
It is possible that you may have forgotten to pull the large files from the repo, please do : `git lfs pull` .
Delete the samples-db container and it's volumes and restart it, you should now see the data in the tables.