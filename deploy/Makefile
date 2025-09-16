SHELL := /usr/bin/env bash
.SHELLFLAGS := -o pipefail -c

DC_START_CMD := up -d
DC_STOP_CMD := stop
DC_DOWN_CMD := down

define WITH_ENV
set -a && source ./export_env_vars.sh;
endef

# utility commands
git-freeze-security:
	@../scripts/git_freeze_security.sh

git-unfreeze-security:
	@../scripts/git_unfreeze_security.sh

git-update-submodules:
	@../scripts/git_update_submodules_in_repo.sh

# start services
#
start-nifi:
	$(WITH_ENV) docker compose -f services.yml $(DC_START_CMD) nifi nifi-nginx nifi-registry-flow

start-elastic:
	$(WITH_ENV) docker compose -f services.yml $(DC_START_CMD) elasticsearch-1 elasticsearch-2 kibana

start-elastic-cluster:
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

start-samples:
	$(WITH_ENV) docker compose -f services.yml $(DC_START_CMD) samples-db

start-jupyter:
	$(WITH_ENV) docker compose -f ../services/cogstack-jupyter-hub/docker/docker-compose.yml $(DC_START_CMD) cogstack-jupyter-hub

start-medcat-service:
	$(WITH_ENV) docker compose -f ../services/cogstack-nlp/medcat-service/docker/docker-compose.yml $(DC_START_CMD) nlp-medcat-service-production

start-medcat-service-deid:
	$(WITH_ENV) docker compose -f ../services/cogstack-nlp/medcat-service/docker/docker-compose.yml $(DC_START_CMD) nlp-medcat-service-production-deid

start-medcat-trainer:
	$(WITH_ENV) docker compose -f../services/cogstack-nlp/medcat-trainer/docker-compose-prod.yml $(DC_START_CMD) medcattrainer nginx solr

start-production-db:
	$(WITH_ENV) docker compose -f services.yml ${DC_START_CMD} cogstack-databank-db

start-ocr-services:
	$(WITH_ENV) docker compose -f ../services/ocr-service/docker/docker-compose.yml ${DC_START_CMD} ocr-service ocr-service-text-only

start-git-ea:
	$(WITH_ENV) docker compose -f services.yml ${DC_START_CMD} gitea

start-data-infra: start-nifi start-elastic start-samples

start-all: start-data-infra start-jupyter

.PHONY: start-all start-data-infra start-nifi start-elastic start-samples start-jupyter


# stop services
#
stop-nifi:
	$(WITH_ENV) docker compose -f services.yml $(DC_STOP_CMD) nifi nifi-nginx

stop-elastic:
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

stop-samples:
	$(WITH_ENV) docker compose -f services.yml $(DC_STOP_CMD) samples-db

stop-jupyter:
	$(WITH_ENV) docker compose -f ../services/cogstack-jupyter-hub/docker/docker-compose.yml $(DC_STOP_CMD) cogstack-jupyter-hub

stop-medcat-trainer:
	$(WITH_ENV) docker compose -f../services/cogstack-nlp/medcat-trainer/docker-compose-prod.yml $(DC_STOP_CMD) medcattrainer nginx solr

stop-medcat-service:
	$(WITH_ENV) docker compose -f ../services/cogstack-nlp/medcat-service/docker/docker-compose.yml $(DC_STOP_CMD) nlp-medcat-service-production

stop-medcat-service-deid:
	$(WITH_ENV) docker compose -f ../services/cogstack-nlp/medcat-service/docker/docker-compose.yml $(DC_STOP_CMD) nlp-medcat-service-production-deid

stop-git-ea:
	$(WITH_ENV) docker compose -f services.yml ${DC_STOP_CMD} gitea

stop-ocr-services:
	$(WITH_ENV) docker compose -f ../services/ocr-service/docker/docker-compose.yml ${DC_STOP_CMD} ocr-service ocr-service-text-only

stop-production-db:
	$(WITH_ENV) docker compose -f services.yml $(DC_STOP_CMD) cogstack-databank-db

stop-data-infra: stop-nifi stop-elastic stop-samples

stop-all: stop-data-infra stop-jupyter

.PHONY: stop-data-infra stop-nifi stop-elastic stop-samples stop-jupyter


# cleanup
#
down-all:
	$(WITH_ENV) docker compose -f services.yml $(DC_DOWN_CMD)

# deletes volumes associated with containers
cleanup:
	$(WITH_ENV) docker compose -f services.yml $(DC_DOWN_CMD) -v

.PHONY: down-all cleanup
