SHELL := /usr/bin/env bash
.SHELLFLAGS := -o pipefail -c

DC_START_CMD := up -d
DC_STOP_CMD := stop
DC_DOWN_CMD := down

define WITH_ENV
set -a && source ./export_env_vars.sh;
endef

# list all make targets in this file
help: ## List available targets with descriptions
	@echo "Available targets:"
	@awk '\
	function default_desc(target) { \
		if (target ~ /^start-/) return "Start a service or service group"; \
		if (target ~ /^stop-/) return "Stop a service or service group"; \
		if (target ~ /^delete-/) return "Delete related containers/images/volumes"; \
		if (target ~ /^git-/) return "Run a git helper script"; \
		if (target == "load-env") return "Load variables from export_env_vars.sh"; \
		if (target == "show-env") return "Print current environment variables"; \
		if (target == "fix-nifi-registry-perms") return "Fix NiFi registry file permissions"; \
		if (target == "down-all") return "Stop all services from services.yml"; \
		if (target == "cleanup") return "Stop all services and remove volumes"; \
		return "(no description)"; \
	} \
	/^[a-zA-Z0-9][a-zA-Z0-9_-]*:/ { \
		raw=$$0; \
		target=raw; \
		sub(/:.*/, "", target); \
		if (!(target in seen)) { \
			seen[target]=1; \
		} \
		if (index(raw, "##") > 0) { \
			description=raw; \
			sub(/^.*##[[:space:]]*/, "", description); \
			desc[target]=description; \
		} \
	} \
	END { \
		for (target in seen) { \
			description=desc[target]; \
			if (description == "") description=default_desc(target); \
			print target "\t" description; \
		} \
	} \
	' $(lastword $(MAKEFILE_LIST)) | sort | awk -F '\t' '{printf "  %-28s %s\n", $$1, $$2}'

.PHONY: help

# utility commands

git-freeze-security: ## Apply restricted git settings for safer shell operations
	@../scripts/git_freeze_security.sh

git-unfreeze-security: ## Revert restricted git settings
	@../scripts/git_unfreeze_security.sh

git-update-submodules: ## Update submodules recursively in this repository
	@../scripts/git_update_submodules_in_repo.sh

load-env: ## Load variables from export_env_vars.sh in a subshell
	$(WITH_ENV) echo "Environment variables loaded."

show-env: ## Print sorted environment variables after loading export_env_vars.sh
	${WITH_ENV} >/dev/null 2>&1; printenv | sort

fix-nifi-registry-perms: ## Fix NiFi registry permissions for a compose file
	$(WITH_ENV) SKIP_EXPORT_ENV=1 ../nifi/fix_nifi_registry_perms.sh $(COMPOSE_FILE)
	
# start services

start-nifi: ## Start NiFi and NiFi nginx (services.yml)
	$(WITH_ENV) SKIP_EXPORT_ENV=1 ../nifi/fix_nifi_registry_perms.sh services.yml; \
	docker compose -f services.yml $(DC_START_CMD) nifi nifi-nginx 

start-nifi-dev: ## Start NiFi and NiFi nginx (services.dev.yml)
	$(WITH_ENV) SKIP_EXPORT_ENV=1 ../nifi/fix_nifi_registry_perms.sh services.dev.yml; \
	docker compose -f services.dev.yml $(DC_START_CMD) nifi nifi-nginx 

start-nifi-dev-build: ## Build and start NiFi dev services
	$(WITH_ENV) SKIP_EXPORT_ENV=1 ../nifi/fix_nifi_registry_perms.sh services.dev.yml; \
	docker compose -f services.dev.yml up -d --build nifi nifi-nginx 

start-elastic: ## Start elasticsearch-1, elasticsearch-2 and kibana
	$(WITH_ENV) docker compose -f services.yml $(DC_START_CMD) elasticsearch-1 elasticsearch-2 kibana

start-elastic-cluster: ## Start full 3-node Elasticsearch cluster
	$(WITH_ENV) docker compose -f services.yml $(DC_START_CMD) elasticsearch-1 elasticsearch-2 elasticsearch-3

start-elastic-1:
	$(WITH_ENV) docker compose -f services.yml $(DC_START_CMD) elasticsearch-1

start-elastic-2:
	$(WITH_ENV) docker compose -f services.yml $(DC_START_CMD) elasticsearch-2

start-elastic-3:
	$(WITH_ENV) docker compose -f services.yml $(DC_START_CMD) elasticsearch-3

start-metricbeat-1:
	$(WITH_ENV) docker compose -f services.yml $(DC_START_CMD) metricbeat-1

start-metricbeat-2:
	$(WITH_ENV) docker compose -f services.yml $(DC_START_CMD) metricbeat-2

start-metricbeat-3:
	$(WITH_ENV) docker compose -f services.yml $(DC_START_CMD) metricbeat-3

start-filebeat-1:
	$(WITH_ENV) docker compose -f services.yml $(DC_START_CMD) filebeat-1

start-filebeat-2:
	$(WITH_ENV) docker compose -f services.yml $(DC_START_CMD) filebeat-2

start-filebeat-3:
	$(WITH_ENV) docker compose -f services.yml $(DC_START_CMD) filebeat-3

start-kibana:
	$(WITH_ENV) docker compose -f services.yml $(DC_START_CMD) kibana

start-samples: ## Start the sample database service
	$(WITH_ENV) docker compose -f services.yml $(DC_START_CMD) samples-db

start-jupyter:
	$(WITH_ENV) docker compose -f ../services/cogstack-jupyter-hub/docker/docker-compose.base.yml -f ../services/cogstack-jupyter-hub/docker/docker-compose.prod.yml $(DC_START_CMD) cogstack-jupyter-hub

start-medcat-service:
	$(WITH_ENV) docker compose -f ../services/cogstack-nlp/medcat-service/docker/docker-compose.yml $(DC_START_CMD) nlp-medcat-service-production

start-medcat-service-deid:
	$(WITH_ENV) docker compose -f ../services/cogstack-nlp/medcat-service/docker/docker-compose.yml $(DC_START_CMD) nlp-medcat-service-production-deid

start-medcat-trainer:
	$(WITH_ENV) docker compose -f ../services/cogstack-nlp/medcat-trainer/docker-compose-prod.yml $(DC_START_CMD) medcattrainer nginx solr

start-production-db:
	$(WITH_ENV) docker compose -f services.yml ${DC_START_CMD} cogstack-databank-db

start-ocr-services:
	$(WITH_ENV) docker compose -f ../services/ocr-service/docker/docker-compose.base.yml -f ../services/ocr-service/docker/docker-compose.prod.yml $(DC_START_CMD) ocr-service ocr-service-text-only

start-git-ea:
	$(WITH_ENV) docker compose -f services.yml ${DC_START_CMD} gitea

start-data-infra: start-nifi start-elastic start-samples ## Start core data infrastructure

start-all: start-data-infra start-jupyter start-medcat-service start-ocr-services ## Start all major services

.PHONY: start-all start-data-infra start-nifi start-nifi-dev start-nifi-dev-build start-elastic start-samples start-jupyter fix-nifi-registry-perms


# stop services
#
stop-nifi: ## Stop NiFi and NiFi nginx (services.yml)
	$(WITH_ENV) docker compose -f services.yml $(DC_STOP_CMD) nifi nifi-nginx 

stop-nifi-dev: ## Stop NiFi and NiFi nginx (services.dev.yml)
	$(WITH_ENV) docker compose -f services.dev.yml $(DC_STOP_CMD) nifi nifi-nginx 

delete-nifi: delete-nifi-containers ## Delete NiFi containers only

delete-nifi-containers: ## Remove NiFi containers from services.yml
	$(WITH_ENV) docker compose -f services.yml rm -f -s nifi nifi-nginx 

delete-nifi-dev-containers: ## Remove NiFi containers from services.dev.yml
	$(WITH_ENV) docker compose -f services.dev.yml rm -f -s nifi nifi-nginx 

delete-nifi-images: ## Delete NiFi images referenced in services.yml
	$(WITH_ENV) images="$$(docker compose -f services.yml config --images nifi nifi-nginx  | sort -u)"; \
	if [ -n "$$images" ]; then \
		docker image rm -f $$images; \
	else \
		echo "No NiFi images found in services.yml"; \
	fi

delete-nifi-dev-images: ## Delete NiFi images referenced in services.dev.yml
	$(WITH_ENV) images="$$(docker compose -f services.dev.yml config --images nifi nifi-nginx  | sort -u)"; \
	if [ -n "$$images" ]; then \
		docker image rm -f $$images; \
	else \
		echo "No NiFi images found in services.dev.yml"; \
	fi

delete-nifi-volumes: ## Delete NiFi volumes
	$(WITH_ENV) docker compose -f services.yml $(DC_DOWN_CMD) -v nifi nifi-nginx

delete-elastic: ## Remove Elasticsearch and Kibana containers
	$(WITH_ENV) docker compose -f services.yml rm -f -s elasticsearch-1 elasticsearch-2 elasticsearch-3 kibana

delete-elastic-volumes: ## Delete Elasticsearch and Kibana volumes
	$(WITH_ENV) docker compose -f services.yml $(DC_DOWN_CMD) -v elasticsearch-1 elasticsearch-2 elasticsearch-3 kibana

delete-databank:
	$(WITH_ENV) docker compose -f services.yml rm -f -s cogstack-databank-db cogstack-databank-db-mssql

delete-databank-volumes:
	$(WITH_ENV) docker compose -f services.yml $(DC_DOWN_CMD) -v cogstack-databank-db cogstack-databank-db-mssql

delete-samples-db:
	$(WITH_ENV) docker compose -f services.yml rm -f -s samples-db

delete-samples-db-volumes:
	$(WITH_ENV) docker compose -f services.yml $(DC_DOWN_CMD) -v samples-db

stop-elastic: ## Stop elasticsearch-1, elasticsearch-2 and kibana
	$(WITH_ENV) docker compose -f services.yml $(DC_STOP_CMD) elasticsearch-1 elasticsearch-2 kibana

stop-elastic-cluster:
	$(WITH_ENV) docker compose -f services.yml $(DC_STOP_CMD) elasticsearch-1 elasticsearch-2

stop-elastic-1:
	$(WITH_ENV) docker compose -f services.yml $(DC_STOP_CMD) elasticsearch-1
	
stop-elastic-2:
	$(WITH_ENV) docker compose -f services.yml $(DC_STOP_CMD) elasticsearch-2

stop-elastic-3:
	$(WITH_ENV) docker compose -f services.yml $(DC_STOP_CMD) elasticsearch-3

stop-metricbeat-1:
	$(WITH_ENV) docker compose -f services.yml $(DC_STOP_CMD) metricbeat-1

stop-metricbeat-2:
	$(WITH_ENV) docker compose -f services.yml $(DC_STOP_CMD) metricbeat-2

stop-filebeat-1:
	$(WITH_ENV) docker compose -f services.yml $(DC_STOP_CMD) filebeat-1

stop-filebeat-2:
	$(WITH_ENV) docker compose -f services.yml $(DC_STOP_CMD) filebeat-2

stop-filebeat-3:
	$(WITH_ENV) docker compose -f services.yml $(DC_STOP_CMD) filebeat-3

stop-kibana:
	$(WITH_ENV) docker compose -f services.yml $(DC_STOP_CMD) kibana

stop-samples: ## Stop the sample database service
	$(WITH_ENV) docker compose -f services.yml $(DC_STOP_CMD) samples-db

stop-jupyter:
	$(WITH_ENV) docker compose -f ../services/cogstack-jupyter-hub/docker/docker-compose.base.yml -f ../services/cogstack-jupyter-hub/docker/docker-compose.yml $(DC_STOP_CMD) cogstack-jupyter-hub

stop-medcat-trainer:
	$(WITH_ENV) docker compose -f ../services/cogstack-nlp/medcat-trainer/docker-compose-prod.yml $(DC_STOP_CMD) medcattrainer nginx solr

stop-medcat-service:
	$(WITH_ENV) docker compose -f ../services/cogstack-nlp/medcat-service/docker/docker-compose.yml $(DC_STOP_CMD) nlp-medcat-service-production

stop-medcat-service-deid:
	$(WITH_ENV) docker compose -f ../services/cogstack-nlp/medcat-service/docker/docker-compose.yml $(DC_STOP_CMD) nlp-medcat-service-production-deid

stop-git-ea:
	$(WITH_ENV) docker compose -f services.yml ${DC_STOP_CMD} gitea

stop-ocr-services:
	$(WITH_ENV) docker compose -f ../services/ocr-service/docker/docker-compose.base.yml -f ../services/ocr-service/docker/docker-compose.prod.yml $(DC_STOP_CMD) ocr-service ocr-service-text-only

stop-production-db:
	$(WITH_ENV) docker compose -f services.yml $(DC_STOP_CMD) cogstack-databank-db

stop-data-infra: stop-nifi stop-elastic stop-samples ## Stop core data infrastructure

stop-all: stop-data-infra stop-jupyter stop-medcat-service stop-ocr-services ## Stop all major services

.PHONY: stop-data-infra stop-nifi stop-nifi-dev delete-nifi delete-nifi-containers delete-nifi-dev-containers delete-nifi-images delete-nifi-dev-images delete-nifi-volumes delete-elastic delete-elastic-volumes delete-databank delete-databank-volumes delete-samples-db delete-samples-db-volumes stop-elastic stop-samples stop-jupyter


# cleanup
#
down-all: ## Run docker compose down for services.yml
	$(WITH_ENV) docker compose -f services.yml $(DC_DOWN_CMD)

# deletes volumes associated with containers
cleanup: ## Run docker compose down -v for services.yml
	$(WITH_ENV) docker compose -f services.yml $(DC_DOWN_CMD) -v

.PHONY: down-all cleanup
