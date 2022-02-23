DC_START_CMD := up -d
DC_STOP_CMD := stop
DC_DOWN_CMD := down


# start services
#
start-nifi:
	docker-compose -f services.yml $(DC_START_CMD) nifi nifi-nginx

start-elastic:
	docker-compose -f services.yml $(DC_START_CMD) elasticsearch-1 kibana

start-tika:
	docker-compose -f services.yml $(DC_START_CMD) tika-service

start-samples:
	docker-compose -f services.yml $(DC_START_CMD) samples-db

start-jupyter:
	docker-compose -f services.yml $(DC_START_CMD) jupyter-hub

start-nlp-medcat:
	docker-compose -f services.yml $(DC_START_CMD) nlp-medcat-medmen medcat-trainer-ui medcat-trainer-nginx

start-nlp-gate:
	docker-compose -f services.yml $(DC_START_CMD) nlp-gate-drugapp

start-data-infra: start-nifi start-elastic start-tika start-samples

start-all: start-data-infra start-jupyter start-nlp-medcat start-nlp-gate

.PHONY: start-all start-data-infra start-nifi start-elastic start-tika start-samples start-jupyter start-nlp-medcat start-nlp-gate


# stop services
#
stop-nifi:
	docker-compose -f services.yml $(DC_STOP_CMD) nifi nifi-nginx

stop-elastic:
	docker-compose -f services.yml $(DC_STOP_CMD) elasticsearch-1 kibana

stop-tika:
	docker-compose -f services.yml $(DC_STOP_CMD) tika-service

stop-samples:
	docker-compose -f services.yml $(DC_STOP_CMD) samples-db

stop-jupyter:
	docker-compose -f services.yml $(DC_STOP_CMD) jupyter-hub

stop-nlp-medcat:
	docker-compose -f services.yml $(DC_STOP_CMD) nlp-medcat-medmen medcat-trainer-ui medcat-trainer-nginx

stop-nlp-gate:
	docker-compose -f services.yml $(DC_STOP_CMD) nlp-gate-drugapp

stop-data-infra: stop-nifi stop-elastic stop-tika stop-samples

stop-all: stop-data-infra stop-jupyter stop-nlp-medcat stop-nlp-gate

.PHONY: stop-data-infra stop-nifi stop-elastic stop-tika stop-samples stop-jupyter stop-nlp-medcat stop-nlp-gate


# cleanup
#
down-all:
	docker-compose -f services.yml $(DC_DOWN_CMD)

cleanup:
	docker-compose -f services.yml $(DC_DOWN_CMD) -v

.PHONY: down-all cleanup