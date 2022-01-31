FROM python:3.8.3

RUN mkdir -p /cogstackhub/api

COPY . /cogstackhub/api

WORKDIR /cogstackhub/api

RUN pip install -U pip setuptools wheel
RUN pip install -r requirements.txt

RUN apt-get update && \
    apt-get -qy full-upgrade && \
    apt-get install -qy curl && \
    apt-get install -qy curl && \
    curl -sSL https://get.docker.com/ | sh

CMD python initialiasedbscript.py ;python -u run.py