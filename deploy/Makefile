DC_START_CMD := up -d
DC_STOP_CMD := stop
DC_DOWN_CMD := down


# start services
#
start-nifi:
	docker compose -f services.yml $(DC_START_CMD) nifi nifi-nginx

start-elastic:
	docker compose -f services.yml $(DC_START_CMD) elasticsearch-1 elasticsearch-2 kibana

start-elastic-cluster:
	docker compose -f services.yml $(DC_START_CMD) elasticsearch-1 elasticsearch-2

start-elastic-1:
	docker compose -f services.yml $(DC_START_CMD) elasticsearch-1

start-elastic-2:
	docker compose -f services.yml $(DC_START_CMD) elasticsearch-2

start-elastic-3:
	docker compose -f services.yml $(DC_START_CMD) elasticsearch-3

start-metricbeat-1:
	docker compose -f services.yml $(DC_START_CMD) metricbeat-1

start-metricbeat-2:
	docker compose -f services.yml $(DC_START_CMD) metricbeat-2

start-filebeat-1:
	docker compose -f services.yml $(DC_START_CMD) filebeat-1

start-filebeat-2:
	docker compose -f services.yml $(DC_START_CMD) filebeat-2

start-filebeat-3:
	docker compose -f services.yml $(DC_START_CMD) filebeat-3

start-kibana:
	docker compose -f services.yml $(DC_START_CMD) kibana

start-tika:
	docker compose -f services.yml $(DC_START_CMD) tika-service

start-samples:
	docker compose -f services.yml $(DC_START_CMD) samples-db

start-jupyter:
	docker compose -f services.yml $(DC_START_CMD) jupyter-hub

start-medcat-service:
	docker compose -f services.yml $(DC_START_CMD) nlp-medcat-service-production

start-medcat-trainer:
	docker compose -f services.yml $(DC_START_CMD) medcat-trainer-ui medcat-trainer-nginx

start-nlp-medcat:
	docker compose -f services.yml $(DC_START_CMD) nlp-medcat-service-production medcat-trainer-ui medcat-trainer-nginx

start-nlp-gate:
	docker compose -f services.yml $(DC_START_CMD) nlp-gate-drugapp

start-production-db:
	docker compose -f services.yml ${DC_START_CMD} cogstack-databank-db

start-ocr-services:
	docker compose -f services.yml ${DC_START_CMD} ocr-service-1 ocr-service-2

start-git-ea:
	docker compose -f services.yml ${DC_START_CMD} gitea

start-data-infra: start-nifi start-elastic start-tika start-samples

start-all: start-data-infra start-jupyter start-nlp-medcat start-nlp-gate

.PHONY: start-all start-data-infra start-nifi start-elastic start-tika start-samples start-jupyter start-nlp-medcat start-nlp-gate


# stop services
#
stop-nifi:
	docker compose -f services.yml $(DC_STOP_CMD) nifi nifi-nginx

stop-elastic:
	docker compose -f services.yml $(DC_STOP_CMD) elasticsearch-1 elasticsearch-2 kibana

stop-elastic-cluster:
	docker compose -f services.yml $(DC_STOP_CMD) elasticsearch-1 elasticsearch-2

stop-elastic-1:
	docker compose -f services.yml $(DC_STOP_CMD) elasticsearch-1
	
stop-elastic-2:
	docker compose -f services.yml $(DC_STOP_CMD) elasticsearch-2

stop-elastic-3:
	docker compose -f services.yml $(DC_STOP_CMD) elasticsearch-3

stop-metricbeat-1:
	docker compose -f services.yml $(DC_STOP_CMD) metricbeat-1

stop-metricbeat-2:
	docker compose -f services.yml $(DC_STOP_CMD) metricbeat-2

stop-filebeat-1:
	docker compose -f services.yml $(DC_STOP_CMD) filebeat-1

stop-filebeat-2:
	docker compose -f services.yml $(DC_STOP_CMD) filebeat-2

stop-filebeat-3:
	docker compose -f services.yml $(DC_STOP_CMD) filebeat-3

stop-kibana:
	docker compose -f services.yml $(DC_STOP_CMD) kibana

stop-tika:
	docker compose -f services.yml $(DC_STOP_CMD) tika-service

stop-samples:
	docker compose -f services.yml $(DC_STOP_CMD) samples-db

stop-jupyter:
	docker compose -f services.yml $(DC_STOP_CMD) jupyter-hub

stop-nlp-medcat:
	docker compose -f services.yml $(DC_STOP_CMD) nlp-medcat-service-production medcat-trainer-ui medcat-trainer-nginx

stop-medcat-trainer:
	docker compose -f services.yml $(DC_STOP_CMD) medcat-trainer-ui medcat-trainer-nginx

stop-medcat-service:
	docker compose -f services.yml $(DC_STOP_CMD) nlp-medcat-service-production

stop-nlp-gate:
	docker compose -f services.yml $(DC_STOP_CMD) nlp-gate-drugapp

stop-git-ea:
	docker compose -f services.yml ${DC_STOP_CMD} gitea

stop-ocr-services:
	docker compose -f services.yml ${DC_STOP_CMD} ocr-service-1 ocr-service-2

stop-data-infra: stop-nifi stop-elastic stop-tika stop-samples

stop-production-db:
	docker compose -f services.yml $(DC_STOP_CMD) cogstack-databank-db

stop-all: stop-data-infra stop-jupyter stop-nlp-medcat stop-nlp-gate

.PHONY: stop-data-infra stop-nifi stop-elastic stop-tika stop-samples stop-jupyter stop-nlp-medcat stop-nlp-gate


# cleanup
#
down-all:
	docker compose -f services.yml $(DC_DOWN_CMD)

# deletes volumes associated with containers
cleanup:
	docker compose -f services.yml $(DC_DOWN_CMD) -v

.PHONY: down-all cleanup