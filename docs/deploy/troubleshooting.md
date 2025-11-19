# Troubleshooting

Always start with fresh containers and volumes, to make sure that there are no volumes from previous experimentations, make sure to always delete all/any cogstack running containers by executing:

`docker container rm samples-db elasticsearch-1 kibana nifi  nlp-medcat-service-production tika-service nlp-gate-drugapp nlp-medcat-snomed nlp-gate-bioyodie medcat-trainer-ui medcat-trainer-nginx jupyter-hub -f`

followed by a cleanup or dangling volumes (careful as this will remove all volumes which are NOT being used by a container, if you want to remove specific volumes you will have to manually specifiy the volume names), otherwise, you can specify :

`docker volume prune -f` <strong> WARNING THIS WILL DELETE ALL UNUSED VOLUMES ON YOUR MACHINE!</strong>. Check the volume names used in services.yml file and delete them as necessary `dockr volume rm volume_name`

## Known Issues/errors

Common issues that can be encountered across services.
<br>
<br>

### **Apple Silicon**

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

```bash
softwareupdate --install-rosetta
```

When Rosetta and Docker Desktop are installed, Rosetta must be enabled. This done by going to Docker Desktop -> Setting -> General and enabling "Use Virtualization framework". After in the same settings go to "features in development" -> "Use Rosetta for x86/amd64 emulation on Apple Silicon". Finally execute the following command:

```bash
export DOCKER_DEFAULT_PLATFORM=linux/amd64
```

to set the environment variable. These issues are known to occur on the "cogstack-nifi", "cogstack-ocr-services" and "jupyter-hub" services and may occur on others.

### **NiFi**

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
    - Possible error on Linux systems related to `nifi.properties` permission error and/or other files from the `nifi/conf/` folder, please see the [nifi doc](../nifi/main.md#important-note-about-nifi-properties) {nifi.properties} section. 
    <br /><br/>
    - `Driver class org.postgresql.Driver is not found` or something similar for other MSSQL/SQL drivers, this is a known issue after NiFi version v1.20+, first, make sure you pull the latest version of the repository, then for the JAR file you are using, please execute the following command in order to verify its integrity `jar -tvf ./nifi/drivers/your_file_version.jar`, if this returns a list of files and NO errors then the files are not corrupted and can be loaded. On the NiFi side make sure to go to the `DBCPConnectionPool` controller service and verify the propertiesit a few times, make sure the file path is correct and in the following format: `file:///opt/nifi/drivers/postgresql-42.6.0.jar` for example. If all this fails stop nifi, delete all the Docker volumes associated with it -> restart NiFi, perform the above steps again. You can try forcefully starting the `GenerateTableFetch` or `QueryDatabaseTable` processors by enabling the `DBCPConnectionPool` even if an error popus up after clicking the verify button.
    <br /><br/>
    - `502 Bad Gateway`, NiFi simply not starting, even after waiting more than 2-3 minutes. This can occur due to a wide variety of issues, you can check the NiFi container log : “docker logs -f --tail 1000 cogstack-nifi > my_log_file.txt” to capture the output easily. The most common cause is running out of memory, increase or decrease the limits in `nifi/conf/bootstrap.conf` according to your machine's spec, please read [bootstrap.conf](../nifi/main.md#bootstrapconf)
    <br /><br/>
    - `Unable to connect to ElasticSearch` using the `ElasticSearchClientService` NiFi controller, make sure the settings are correct (username,password,certificates, etc.) and then click `Apply`, disregard the errors and click `Enable` on the controller to forcefully reload the controller, stop it and then validate the settings, start it again after and it should work.

###  **Elasticsearch Errors**

#### **VM memory errors, failed bootstrap check**

It is quite a common issue for both opensearch and native-ES to error out when it comes to virtual memory allocation, this error typically comes in the form of :

```bash
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

#### **OpenSearch: validating opensearch.yml hosts**

```bash
FATAL  Error: [config validation of [opensearch].hosts]: types that failed validation:
- [config validation of [opensearch].hosts.0]: expected URI with scheme [http|https].
- [config validation of [opensearch].hosts.1]: could not parse array value from json input
```

This issue may appear after the recent switch to using fully customizable environment variables. Strings and ENV vars may be parsed differently depending on the shell version found on the host system.

To solve this, the easiest way is to make sure to load the `elasticsearch.env` variables before starting the Elastic & Kibana containers by doing the following:

```bash
    cd ./deploy/
    set -a
    source elasticsearch.env
    make start-elastic
```

Alternatively (if the script executes without issues):

```bash
    cd ./deploy/
    source export_env_vars.sh
    make start-elastic
```

### DB-samples issues

```bash
No table data for samples_db
```

It is possible that you may have forgotten to pull the large files from the repo, please do : `git lfs pull`.

Delete the samples-db container and it's volumes and restart it, you should now see the data in the tables.
