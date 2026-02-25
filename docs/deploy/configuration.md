


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
For deployments based on the example workflows, please see [example workflows](./workflows_legacy.md) for more details.

### Deployment using a custom Docker-compose
When using a fork of this repository for a customized deployments, it can be useful to copy `services.yml` to a deployment-specific `docker-compose.yml`. In this Compose file you can specify the services you need for your instance and configure all parameters per service, as well as track this file in a branch in your own fork. This way you can use your own version control and rebase on `CogStack/CogStack-NiFi` master without running into merge conflicts.
