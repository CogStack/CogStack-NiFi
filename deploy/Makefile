SHELL := /usr/bin/env bash
.SHELLFLAGS := -o pipefail -c

DC_START_CMD := up -d
DC_STOP_CMD := stop
DC_DOWN_CMD := down
REMOTE_COMPOSE_FILE ?= services.yml
REMOTE_SSH_KEY ?=
REMOTE_SSH_OPTS ?=
REMOTE_SSH_KEY_ARG = $(if $(strip $(REMOTE_SSH_KEY)),-i $(REMOTE_SSH_KEY),)
HELM_OPENSEARCH_RELEASE ?= cogstack-opensearch
HELM_OPENSEARCH_NAMESPACE ?= cogstack
HELM_OPENSEARCH_CHART ?= ./charts/opensearch
HELM_OPENSEARCH_VALUES_FILE ?= ./helm/opensearch.values.yaml
HELM_OPENSEARCH_VALUES_ARG = -f $(HELM_OPENSEARCH_VALUES_FILE)
HELM_POSTGRESQL_RELEASE ?= cogstack-postgresql
HELM_POSTGRESQL_NAMESPACE ?= cogstack
HELM_POSTGRESQL_CHART ?= ./charts/postgresql
HELM_POSTGRESQL_VALUES_FILE ?= ./helm/postgresql.values.yaml
HELM_POSTGRESQL_VALUES_ARG = -f $(HELM_POSTGRESQL_VALUES_FILE)
HELM_NIFI_RELEASE ?= cogstack-nifi
HELM_NIFI_NAMESPACE ?= cogstack
HELM_NIFI_CHART ?= ./charts/nifi
HELM_NIFI_VALUES_FILE ?= ./helm/nifi.values.yaml
HELM_NIFI_VALUES_ARG = -f $(HELM_NIFI_VALUES_FILE)
HELM_GITEA_RELEASE ?= cogstack-gitea
HELM_GITEA_NAMESPACE ?= cogstack
HELM_GITEA_REPO_NAME ?= gitea-charts
HELM_GITEA_REPO_URL ?= https://dl.gitea.com/charts/
HELM_GITEA_CHART ?= $(HELM_GITEA_REPO_NAME)/gitea
HELM_GITEA_CHART_VERSION ?= 12.5.0
HELM_GITEA_VALUES_FILE ?= ./helm/gitea.values.yaml
HELM_GITEA_VALUES_ARG = -f $(HELM_GITEA_VALUES_FILE)
CNPG_OPERATOR_MINOR ?= 1.28
CNPG_OPERATOR_VERSION ?= 1.28.1
CNPG_OPERATOR_MANIFEST ?= https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-$(CNPG_OPERATOR_MINOR)/releases/cnpg-$(CNPG_OPERATOR_VERSION).yaml
SECURITY_DIR ?= ../security
SECURITY_SCRIPTS_DIR ?= $(SECURITY_DIR)/scripts
SECURITY_CERTIFICATES_DIR ?= $(SECURITY_DIR)/certificates
SECURITY_ENV_DIR ?= $(SECURITY_DIR)/env
OPENSEARCH_CERT_NAMES ?=

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

init-security-root-ca: ## Generate the shared root CA only when no CA material exists
	@set -euo pipefail; \
	source "$(SECURITY_ENV_DIR)/certificates_general.env"; \
	root_dir="$(SECURITY_CERTIFICATES_DIR)/root"; \
	if [[ -f "$$root_dir/$${ROOT_CERTIFICATE_NAME}.key" \
	   && -f "$$root_dir/$${ROOT_CERTIFICATE_NAME}.pem" \
	   && -f "$$root_dir/$${ROOT_CERTIFICATE_NAME}.p12" \
	   && -f "$$root_dir/$${ROOT_CERTIFICATE_NAME}-keystore.jks" \
	   && -f "$$root_dir/$${ROOT_CERTIFICATE_NAME}-truststore.jks" ]]; then \
		echo "Root CA certificates already exist; leaving them unchanged."; \
	elif [[ -d "$$root_dir" && -n "$$(find "$$root_dir" -mindepth 1 -maxdepth 1 -print -quit)" ]]; then \
		echo "ERROR: $$root_dir contains an incomplete root CA set." >&2; \
		echo "Preserve and repair or explicitly replace that CA before rerunning this target." >&2; \
		exit 1; \
	else \
		echo "Generating the shared root CA certificates..."; \
		(cd "$(SECURITY_SCRIPTS_DIR)" && ./create_root_ca_cert.sh); \
	fi

init-security-nifi: init-security-root-ca ## Generate NiFi certificates only when they are missing or incomplete
	@set -euo pipefail; \
	nifi_dir="$(SECURITY_CERTIFICATES_DIR)/nifi"; \
	if [[ -f "$$nifi_dir/nifi.key" \
	   && -f "$$nifi_dir/nifi.pem" \
	   && -f "$$nifi_dir/nifi.p12" \
	   && -f "$$nifi_dir/nifi-keystore.jks" \
	   && -f "$$nifi_dir/nifi-truststore.jks" ]]; then \
		echo "NiFi certificates already exist; leaving them unchanged."; \
	else \
		echo "Generating NiFi certificates..."; \
		(cd "$(SECURITY_SCRIPTS_DIR)" && ./create_nifi_certs.sh); \
	fi

init-security-gitea: init-security-root-ca ## Generate a dedicated Gitea leaf certificate when it is missing
	@set -euo pipefail; \
	gitea_dir="$(SECURITY_CERTIFICATES_DIR)/gitea"; \
	if [[ -f "$$gitea_dir/gitea.key" \
	   && -f "$$gitea_dir/gitea.pem" \
	   && -f "$$gitea_dir/gitea.crt" ]]; then \
		echo "Gitea leaf certificate already exists; leaving it unchanged."; \
	else \
		echo "Generating Gitea leaf certificate..."; \
		(cd "$(SECURITY_SCRIPTS_DIR)" && bash ./create_gitea_certs.sh); \
	fi

init-security-opensearch: init-security-root-ca ## Generate OpenSearch node, client, and admin certificates when missing
	@set -euo pipefail; \
	source "$(SECURITY_ENV_DIR)/certificates_elasticsearch.env"; \
	if [[ -n "$(strip $(OPENSEARCH_CERT_NAMES))" ]]; then \
		read -r -a node_names <<< "$(strip $(OPENSEARCH_CERT_NAMES))"; \
	else \
		node_names=("$$ES_INSTANCE_NAME_1" "$$ES_INSTANCE_NAME_2" "$$ES_INSTANCE_NAME_3"); \
	fi; \
	opensearch_dir="$(SECURITY_CERTIFICATES_DIR)/elastic/opensearch"; \
	node_certificates_missing=0; \
	for node_name in "$${node_names[@]}"; do \
		node_dir="$$opensearch_dir/elasticsearch/$$node_name"; \
		for suffix in .crt .key .p12 -keystore.jks -truststore.key; do \
			if [[ ! -f "$$node_dir/$$node_name$$suffix" ]]; then \
				node_certificates_missing=1; \
				break 2; \
			fi; \
		done; \
	done; \
	if [[ ! -f "$$opensearch_dir/elastic-stack-ca.crt.pem" \
	   || ! -f "$$opensearch_dir/elastic-stack-ca.p12" ]]; then \
		node_certificates_missing=1; \
	fi; \
	if (( node_certificates_missing )); then \
		echo "Generating OpenSearch node certificates for: $${node_names[*]}"; \
		(cd "$(SECURITY_SCRIPTS_DIR)" && ./create_opensearch_node_cert.sh "$${node_names[@]}"); \
	else \
		echo "OpenSearch node certificates already exist; leaving them unchanged."; \
	fi; \
	if [[ -f "$$opensearch_dir/admin.crt" \
	   && -f "$$opensearch_dir/admin.key.pem" \
	   && -f "$$opensearch_dir/$${ES_CLIENT_CERT_NAME}.pem" \
	   && -f "$$opensearch_dir/$${ES_CLIENT_CERT_NAME}.key" ]]; then \
		echo "OpenSearch client and admin certificates already exist; leaving them unchanged."; \
	else \
		echo "Generating OpenSearch client and admin certificates..."; \
		(cd "$(SECURITY_SCRIPTS_DIR)" && ./create_opensearch_client_admin_certs.sh); \
	fi

init-security-elasticsearch: ## Generate native Elasticsearch certificates when the output directory is absent
	@set -euo pipefail; \
	source "$(SECURITY_ENV_DIR)/certificates_elasticsearch.env"; \
	elasticsearch_dir="$(SECURITY_CERTIFICATES_DIR)/elastic/elasticsearch"; \
	certificate_set_complete=1; \
	for required_file in \
		"elastic-stack-ca.crt.pem" \
		"elastic-stack-ca.p12" \
		"elasticsearch/$${ES_INSTANCE_NAME_1}/$${ES_INSTANCE_NAME_1}.crt" \
		"elasticsearch/$${ES_INSTANCE_NAME_1}/$${ES_INSTANCE_NAME_1}.key" \
		"elasticsearch/$${ES_INSTANCE_NAME_2}/$${ES_INSTANCE_NAME_2}.crt" \
		"elasticsearch/$${ES_INSTANCE_NAME_2}/$${ES_INSTANCE_NAME_2}.key" \
		"elasticsearch/$${ES_INSTANCE_NAME_3}/$${ES_INSTANCE_NAME_3}.crt" \
		"elasticsearch/$${ES_INSTANCE_NAME_3}/$${ES_INSTANCE_NAME_3}.key"; do \
		if [[ ! -f "$$elasticsearch_dir/$$required_file" ]]; then \
			certificate_set_complete=0; \
			break; \
		fi; \
	done; \
	if (( certificate_set_complete )); then \
		echo "Native Elasticsearch certificates already exist; leaving them unchanged."; \
	elif [[ -e "$$elasticsearch_dir" ]]; then \
		echo "ERROR: $$elasticsearch_dir exists but contains an incomplete certificate set." >&2; \
		echo "Move or remove that directory after preserving anything needed, then rerun this target." >&2; \
		exit 1; \
	else \
		echo "Generating native Elasticsearch certificates with Docker..."; \
		(cd "$(SECURITY_SCRIPTS_DIR)" && ./create_es_native_certs.sh); \
	fi

init-security-search: ## Generate certificates for ELASTICSEARCH_VERSION from elasticsearch.env
	@set -euo pipefail; \
	source ./elasticsearch.env; \
	case "$${ELASTICSEARCH_VERSION}" in \
		opensearch|elasticsearch) \
			$(MAKE) --no-print-directory "init-security-$${ELASTICSEARCH_VERSION}" \
			;; \
		*) \
			echo "ERROR: unsupported ELASTICSEARCH_VERSION '$${ELASTICSEARCH_VERSION}'." >&2; \
			exit 1 \
			;; \
	esac

init-security: ## Generate missing NiFi, Gitea, and selected search-backend certificates
	@$(MAKE) --no-print-directory init-security-nifi
	@$(MAKE) --no-print-directory init-security-gitea
	@$(MAKE) --no-print-directory init-security-search

.PHONY: init-security init-security-root-ca init-security-nifi init-security-gitea init-security-opensearch init-security-elasticsearch init-security-search

helm-template-opensearch: ## Render OpenSearch chart using chart defaults plus ./helm/opensearch.values.yaml
	helm template $(HELM_OPENSEARCH_RELEASE) $(HELM_OPENSEARCH_CHART) $(HELM_OPENSEARCH_VALUES_ARG)

helm-install-opensearch: ## Install/upgrade OpenSearch chart using chart defaults plus ./helm/opensearch.values.yaml
	helm upgrade --install $(HELM_OPENSEARCH_RELEASE) $(HELM_OPENSEARCH_CHART) $(HELM_OPENSEARCH_VALUES_ARG) --namespace $(HELM_OPENSEARCH_NAMESPACE) --create-namespace

kube-install-cnpg-operator: ## Install CloudNativePG operator/CRDs from the pinned upstream manifest
	kubectl apply --server-side -f $(CNPG_OPERATOR_MANIFEST)

helm-template-nifi: ## Render CogStack NiFi chart using chart defaults plus ./helm/nifi.values.yaml
	helm template $(HELM_NIFI_RELEASE) $(HELM_NIFI_CHART) $(HELM_NIFI_VALUES_ARG) --namespace $(HELM_NIFI_NAMESPACE)

helm-install-nifi: ## Install/upgrade CogStack NiFi chart using chart defaults plus ./helm/nifi.values.yaml
	helm upgrade --install $(HELM_NIFI_RELEASE) $(HELM_NIFI_CHART) $(HELM_NIFI_VALUES_ARG) --namespace $(HELM_NIFI_NAMESPACE) --create-namespace

helm-template-postgresql: ## Render CloudNativePG PostgreSQL chart using chart defaults plus ./helm/postgresql.values.yaml
	helm template $(HELM_POSTGRESQL_RELEASE) $(HELM_POSTGRESQL_CHART) $(HELM_POSTGRESQL_VALUES_ARG) --namespace $(HELM_POSTGRESQL_NAMESPACE)

helm-install-postgresql: ## Install/upgrade CloudNativePG PostgreSQL chart using chart defaults plus ./helm/postgresql.values.yaml
	helm upgrade --install $(HELM_POSTGRESQL_RELEASE) $(HELM_POSTGRESQL_CHART) $(HELM_POSTGRESQL_VALUES_ARG) --namespace $(HELM_POSTGRESQL_NAMESPACE) --create-namespace

helm-repo-add-gitea: ## Add/update the official Gitea Helm repository
	@if ! helm repo list | awk '$$1 == "$(HELM_GITEA_REPO_NAME)" { found=1 } END { exit !found }'; then \
		helm repo add $(HELM_GITEA_REPO_NAME) $(HELM_GITEA_REPO_URL); \
	fi
	helm repo update $(HELM_GITEA_REPO_NAME)

helm-template-gitea: helm-repo-add-gitea ## Render the official Gitea chart using ./helm/gitea.values.yaml
	helm template $(HELM_GITEA_RELEASE) $(HELM_GITEA_CHART) --version $(HELM_GITEA_CHART_VERSION) $(HELM_GITEA_VALUES_ARG) --namespace $(HELM_GITEA_NAMESPACE)

helm-install-gitea: helm-repo-add-gitea ## Install/upgrade the official Gitea chart using ./helm/gitea.values.yaml
	helm upgrade --install $(HELM_GITEA_RELEASE) $(HELM_GITEA_CHART) --version $(HELM_GITEA_CHART_VERSION) $(HELM_GITEA_VALUES_ARG) --namespace $(HELM_GITEA_NAMESPACE) --create-namespace


remote-deploy-service: ## Deploy one or more services to a remote machine via SSH + docker compose
remote-deploy-service: _check-remote-params
	@ssh $(REMOTE_SSH_KEY_ARG) $(REMOTE_SSH_OPTS) "$(REMOTE_HOST)" 'cd "$(REMOTE_REPO_DIR)/deploy" && set -a && source ./export_env_vars.sh && docker compose -f "$(REMOTE_COMPOSE_FILE)" up -d $(REMOTE_SERVICES)'

remote-stop-service: ## Stop one or more services on a remote machine via SSH + docker compose
remote-stop-service: _check-remote-params
	@ssh $(REMOTE_SSH_KEY_ARG) $(REMOTE_SSH_OPTS) "$(REMOTE_HOST)" 'cd "$(REMOTE_REPO_DIR)/deploy" && set -a && source ./export_env_vars.sh && docker compose -f "$(REMOTE_COMPOSE_FILE)" stop $(REMOTE_SERVICES)'

remote-delete-service: ## Delete one or more remote service containers via SSH + docker compose rm
remote-delete-service: _check-remote-params
	@ssh $(REMOTE_SSH_KEY_ARG) $(REMOTE_SSH_OPTS) "$(REMOTE_HOST)" 'cd "$(REMOTE_REPO_DIR)/deploy" && set -a && source ./export_env_vars.sh && docker compose -f "$(REMOTE_COMPOSE_FILE)" rm -f -s $(REMOTE_SERVICES)'

_check-remote-params:
	@if [ -z "$(REMOTE_HOST)" ]; then \
		echo "REMOTE_HOST is required (example: REMOTE_HOST=user@machine)"; \
		exit 1; \
	fi
	@if [ -z "$(REMOTE_REPO_DIR)" ]; then \
		echo "REMOTE_REPO_DIR is required (example: REMOTE_REPO_DIR=/opt/cogstack_nifi)"; \
		exit 1; \
	fi
	@if [ -z "$(REMOTE_SERVICES)" ]; then \
		echo "REMOTE_SERVICES is required (example: REMOTE_SERVICES='nifi nifi-nginx')"; \
		exit 1; \
	fi

.PHONY: remote-deploy-service remote-stop-service remote-delete-service _check-remote-params helm-template-opensearch helm-install-opensearch kube-install-cnpg-operator helm-template-nifi helm-install-nifi helm-template-postgresql helm-install-postgresql helm-repo-add-gitea helm-template-gitea helm-install-gitea
	
# start services

start-nifi: ## Start NiFi and NiFi nginx (services.yml)
	$(WITH_ENV) docker compose -f services.yml $(DC_START_CMD) nifi nifi-nginx 

start-nifi-dev: ## Start NiFi and NiFi nginx (services.dev.yml)
	$(WITH_ENV) docker compose -f services.dev.yml $(DC_START_CMD) nifi nifi-nginx 

start-nifi-dev-build: ## Build and start NiFi dev services
	$(WITH_ENV) docker compose -f services.dev.yml up -d --build nifi nifi-nginx 

build-nifi-image: ## Build the local NiFi image without starting services
	$(WITH_ENV) docker build \
		--build-arg NIFI_UID="$${NIFI_UID:-1000}" \
		--build-arg NIFI_GID="$${NIFI_GID:-1000}" \
		--tag "$${NIFI_DOCKER_IMAGE:-cogstacksystems/cogstack-nifi:latest}" \
		--file ../nifi/Dockerfile \
		..

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

start-all: start-data-infra start-medcat-service start-ocr-services ## Start all major services

.PHONY: start-all start-data-infra start-nifi start-nifi-dev start-nifi-dev-build build-nifi-image start-elastic start-samples start-jupyter


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

delete-medcat-trainer: ## Remove MedCAT Trainer containers
	$(WITH_ENV) docker compose -f ../services/cogstack-nlp/medcat-trainer/docker-compose-prod.yml rm -f -s medcattrainer nginx solr

delete-medcat-trainer-volumes: ## Delete MedCAT Trainer volumes
	$(WITH_ENV) docker compose -f ../services/cogstack-nlp/medcat-trainer/docker-compose-prod.yml $(DC_DOWN_CMD) -v medcattrainer nginx solr

delete-jupyter: ## Remove Jupyter container
	$(WITH_ENV) docker compose -f ../services/cogstack-jupyter-hub/docker/docker-compose.base.yml -f ../services/cogstack-jupyter-hub/docker/docker-compose.prod.yml rm -f -s cogstack-jupyter-hub

delete-medcat-service: ## Remove MedCAT service container
	$(WITH_ENV) docker compose -f ../services/cogstack-nlp/medcat-service/docker/docker-compose.yml rm -f -s nlp-medcat-service-production

delete-medcat-service-deid: ## Remove MedCAT service (deid) container
	$(WITH_ENV) docker compose -f ../services/cogstack-nlp/medcat-service/docker/docker-compose.yml rm -f -s nlp-medcat-service-production-deid

delete-ocr-services: ## Remove OCR service containers
	$(WITH_ENV) docker compose -f ../services/ocr-service/docker/docker-compose.base.yml -f ../services/ocr-service/docker/docker-compose.prod.yml rm -f -s ocr-service ocr-service-text-only

make-delete-jupyter: delete-jupyter ## Alias for delete-jupyter

make-delete-medcat-service: delete-medcat-service ## Alias for delete-medcat-service

make-delete-medcat-service-deid: delete-medcat-service-deid ## Alias for delete-medcat-service-deid

make-delete-ocr-services: delete-ocr-services ## Alias for delete-ocr-services

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

.PHONY: stop-data-infra stop-nifi stop-nifi-dev delete-nifi delete-nifi-containers delete-nifi-dev-containers delete-nifi-images delete-nifi-dev-images delete-nifi-volumes delete-elastic delete-elastic-volumes delete-databank delete-databank-volumes delete-samples-db delete-samples-db-volumes delete-medcat-trainer delete-medcat-trainer-volumes delete-jupyter delete-medcat-service delete-medcat-service-deid delete-ocr-services make-delete-jupyter make-delete-medcat-service make-delete-medcat-service-deid make-delete-ocr-services stop-elastic stop-samples stop-jupyter


# cleanup
#
down-all: ## Run docker compose down for services.yml
	$(WITH_ENV) docker compose -f services.yml $(DC_DOWN_CMD)

# deletes volumes associated with containers
cleanup: ## Run docker compose down -v for services.yml
	$(WITH_ENV) docker compose -f services.yml $(DC_DOWN_CMD) -v

.PHONY: down-all cleanup
