FROM apache/nifi:1.16.3
ARG UID=1000
ARG GID=1000

ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG no_proxy

ENV HTTP_PROXY $HTTP_PROXY
ENV HTTPS_PROXY $HTTPS_PROXY
ENV no_proxy $no_proxy

USER root

# run updates and install some base utility packages along with python support
RUN apt-get update && apt-get upgrade -y && apt-get install -y apt-transport-https apt-utils curl software-properties-common wget git build-essential make ca-certificates && \
    apt-add-repository contrib && \
    apt-add-repository non-free && \
    apt-get update && apt-get upgrade -y && \
    apt-get install -y postgresql-server-dev-13 postgresql-server-dev-all python3 python3-pip python3-dev python3.9-dev python3-all-dev ssl-cert --no-install-recommends && \
    pip3 install --upgrade pip && \
    pip3 install setuptools dvc flask GitPython elasticsearch opensearch-py neo4j --ignore-installed PyYAML && \
    pip3 install pymssql mysql-connector-python cx-Oracle dataclasses numpy matplotlib pandas dill jsonpickle jsonext psycopg2-binary psycopg2 python-certifi-win32 certifi

# ApacheNifi specific packages
RUN pip3 install nipyapi

RUN apt-get clean autoclean && apt-get autoremove --purge -y

# clean up
RUN pip3 cache purge
RUN apt-get autoremove -y

# solve groovy grape proxy issues, grape ignores the current environment's proxy settings
RUN export JAVA_OPTS="-Dhttp.proxyHost=$HTTP_PROXY -Dhttps.proxyHost=$HTTPS_PROXY -Dhttp.nonProxyHosts=$no_proxy"

# USER nifi

# copy drivers
WORKDIR /opt/nifi/
COPY ./drivers ./drivers
#COPY ../security ./security

# copy user scripts, schemas and templates
COPY ./user-scripts ./user-scripts
COPY ./user-schemas ./user-schemas

#####
WORKDIR /opt/nifi/nifi-current/conf/templates/
COPY ./user-templates ./    

RUN mkdir -p /opt/nifi/groovy
WORKDIR /opt/nifi/groovy/

RUN curl https://archive.apache.org/dist/groovy/4.0.0/distribution/apache-groovy-binary-4.0.0.zip --output apache-groovy-binary-4.0.0.zip --max-time 3600 && \
    unzip apache-groovy-binary-4.0.0.zip && \
    rm apache-groovy-binary-4.0.0.zip

ENV GROOVY_BIN=/opt/nifi/groovy/groovy-4.0.0/bin

RUN $GROOVY_BIN/grape -V install org.apache.avro avro 1.11.0

WORKDIR  /opt/nifi/nifi-toolkit-current/

# copy configuration files
WORKDIR /opt/nifi/nifi-current/conf/

COPY ./conf/bootstrap.conf ./
COPY ./conf/nifi.properties ./
COPY ./conf/zookeeper.properties ./

COPY ./conf/login-identity-providers.xml ./

# finalize
WORKDIR /opt/nifi/nifi-current/
