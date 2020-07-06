DC_UP_CMD := up -d
DC_DOWN_CMD := down


# start services
#
up-nifi:
	docker-compose -f nifi.yml $(DC_UP_CMD)

up-elastic-stack:
	docker-compose -f elastic-stack.yml $(DC_UP_CMD)

up-tika:
	docker-compose -f tika.yml $(DC_UP_CMD)

up-samples:
	docker-compose -f samples-db.yml $(DC_UP_CMD)

up-jupyter:
	docker-compose -f jupyter.yml $(DC_UP_CMD)

up-nlp-medcat:
	docker-compose -f nlp-medcat.yml $(DC_UP_CMD) nlp-medcat-medmen medcat-trainer-ui medcat-trainer-nginx

up-nlp-gate:
	docker-compose -f nlp-gate.yml $(DC_UP_CMD) nlp-gate-drugapp

up-data-infrastructure: up-nifi up-elastic-stack up-tika up-samples

up-all: up-data-infrastructure up-jupyter up-nlp-medcat up-nlp-gate

.PHONY: up-all up-data-infrastructure up-nifi up-elastic-stack up-tika up-samples up-jupyter up-nlp-medcat up-nlp-gate


# stop services
#
down-nifi:
	docker-compose -f nifi.yml $(DC_DOWN_CMD)

down-elastic-stack:
	docker-compose -f elastic-stack.yml $(DC_DOWN_CMD)

down-tika:
	docker-compose -f tika.yml $(DC_DOWN_CMD)

down-samples:
	docker-compose -f samples-db.yml $(DC_DOWN_CMD)

down-jupyter:
	docker-compose -f jupyter.yml $(DC_DOWN_CMD)

down-nlp-medcat:
	docker-compose -f nlp-medcat.yml $(DC_DOWN_CMD) nlp-medcat-medmen medcat-trainer-ui medcat-trainer-nginx

down-nlp-gate:
	docker-compose -f nlp-gate.yml $(DC_DOWN_CMD) nlp-gate-drugapp

down-data-infrastructure: down-nifi down-elastic-stack down-tika down-samples

down-all: down-data-infrastructure down-jupyter down-nlp-medcat down-nlp-gate

.PHONY: down-data-infrastructure down-nifi down-elastic-stack down-tika down-samples down-jupyter down-nlp-medcat down-nlp-gate
