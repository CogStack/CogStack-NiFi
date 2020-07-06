################################
#
# This Dockerfile is used to build a preinitialized 
# docker image for using GATE Service Runner
# with ANNIE plugins
#
FROM cogstacksystems/nlp-rest-service-gate:dev-latest

# copy the GATE application resources
WORKDIR /gate/app/drug-app
COPY ./gate /gate/app/drug-app

# copy the necessary service configuration
WORKDIR /app/nlp-service
COPY ./config /app/nlp-service/config

# initialize the GATE Application
RUN ["bash", "init_gate_app.sh"]
