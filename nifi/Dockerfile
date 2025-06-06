FROM apache/nifi:${NIFI_VERSION:-1.28.1}

ARG HTTP_PROXY=""
ARG HTTPS_PROXY=""
ARG no_proxy=""
ARG DEBIAN_FRONTEND=noninteractive

ENV NIFI_VERSION=${NIFI_VERSION:-1.28.1}

ENV NIFI_UID ${NIFI_UID:-1000}
ENV NIFI_GID ${NIFI_GID:-1000}

ENV TZ=Europe/London

ENV HTTP_PROXY ${HTTP_PROXY:-""}
ENV HTTPS_PROXY ${HTTPS_PROXY:-""}
ENV no_proxy $no_proxy

# default env vars to prevent NiFi from running on HTTP
ENV NIFI_WEB_HTTP_PORT ""
ENV NIFI_WEB_HTTP_HOST ""

ARG UID=${NIFI_UID:-1000}
ARG GID=${NIFI_GID:-1000}

RUN echo "GID=${GID}" 
RUN echo "UID=${UID}"

USER root

# run updates and install some base utility packages along with python support
RUN apt-get update && apt-get upgrade -y && apt-get install -y libssl-dev openssl apt-transport-https apt-utils curl software-properties-common wget git build-essential make cmake ca-certificates zip unzip

RUN apt-add-repository contrib && \
    apt-add-repository non-free

RUN curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/postgresql-keyring.gpg

RUN echo "deb [signed-by=/usr/share/keyrings/postgresql-keyring.gpg] http://apt.postgresql.org/pub/repos/apt/ bullseye-pgdg main" | tee /etc/apt/sources.list.d/postgresql.list

RUN gpg --keyserver keyserver.ubuntu.com --recv-keys F23C5A6CF475977595C89F51BA6932366A755776
RUN gpg --export F23C5A6CF475977595C89F51BA6932366A755776 | tee /usr/share/keyrings/ppa-deadsnakes.gpg > /dev/null

RUN echo "deb [signed-by=/usr/share/keyrings/ppa-deadsnakes.gpg] https://ppa.launchpadcontent.net/deadsnakes/ppa/ubuntu/ trusty main" > /etc/apt/sources.list.d/ppa-deadsnakes.list
RUN echo "deb-src [signed-by=/usr/share/keyrings/ppa-deadsnakes.gpg] https://ppa.launchpadcontent.net/deadsnakes/ppa/ubuntu/ trusty main" >> /etc/apt/sources.list.d/ppa-deadsnakes.list

RUN apt-get update && apt-get upgrade -y

RUN apt-get install --no-install-recommends -y libsqlite3-dev python3-dev python3-pip python3 python3-dev python3-full python3-venv postgresql-server-dev-all ssl-cert python3-psycopg2 sqlite3 postgresql-server-dev-14

# timezone setting
RUN apt-get install --no-install-recommends -y tzdata

# install rust, medcat requirement
RUN curl -y --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# needed for rust & cargo
# RUN bash $HOME/.cargo/env

# clean up apt
RUN apt-get clean autoclean && apt-get autoremove --purge -y

######################################## Python / PIP SECTION ########################################

RUN pip3 install --no-cache-dir --upgrade pip && \
    pip3 install --no-cache-dir setuptools dvc flask GitPython elasticsearch opensearch-py neo4j eland --ignore-installed PyYAML && \ 
    pip3 install --no-cache-dir pytesseract ipyparallel py7zr cython isort html2text jsoncsv simplejson detect wheel nltk keras bokeh seaborn matplotlib graphviz plotly tqdm && \
    pip3 install --no-cache-dir pymssql mysql-connector-python cx-Oracle dataclasses numpy matplotlib pandas dill jsonpickle jsonext psycopg2-binary python-certifi-win32 certifi pyodbc openpyxl rancoord

# XNAT
RUN pip3 install --no-cache-dir xnat

# medcat & models
RUN pip3 install --no-cache-dir -U spacy click torch thinc
RUN pip3 install --no-cache-dir medcat==1.15.0

# ApacheNifi specific packages
RUN pip3 install --no-cache-dir nipyapi nifi.flowfile avro

# uther useful packages
RUN pip3 install --no-cache-dir jupyter geocoder

# clean up pip
RUN pip3 cache purge

#######################################################################################################

# solve groovy grape proxy issues, grape ignores the current environment's proxy settings
RUN export JAVA_OPTS="-Dhttp.proxyHost=$HTTP_PROXY -Dhttps.proxyHost=$HTTPS_PROXY -Dhttp.nonProxyHosts=$no_proxy"

# USER nifi

# copy user scripts, schemas
#COPY ./user-scripts ./user-scripts
#COPY ./user-schemas ./user-schemas

# copy templates
WORKDIR /opt/nifi/nifi-current/conf/templates/
#COPY ./user-templates ./    

# INSTALL NAR extensions 
WORKDIR /opt/nifi/nifi-current/lib/

# Install Groovy

RUN mkdir -p /opt/nifi/groovy
WORKDIR /opt/nifi/groovy/

RUN curl https://archive.apache.org/dist/groovy/4.0.9/distribution/apache-groovy-binary-4.0.9.zip --output apache-groovy-binary-4.0.9.zip --max-time 3600 && \
    unzip apache-groovy-binary-4.0.9.zip && \
    rm apache-groovy-binary-4.0.9.zip
ENV GROOVY_BIN=/opt/nifi/groovy/groovy-4.0.9/bin
RUN $GROOVY_BIN/grape -V install org.apache.avro avro 1.11.0

# install Jython
RUN mkdir -p /opt/nifi/jython
RUN curl https://repo1.maven.org/maven2/org/python/jython-installer/2.7.3/jython-installer-2.7.3.jar --output jython-installer-2.7.3.jar --max-time 3600
RUN java -jar jython-installer-2.7.3.jar -s -v -d /opt/nifi/jython
ENV JYTHON_HOME=/opt/nifi/jython/

RUN rm jython-installer-2.7.3.jar

RUN $JYTHON_HOME/bin/jython -m ensurepip
RUN $JYTHON_HOME/bin/jython -m pip install --upgrade pip
RUN $JYTHON_HOME/bin/jython -m pip install avro pysqlite3

# copy configuration files
WORKDIR /opt/nifi/nifi-current/conf/

COPY ./conf/bootstrap.conf ./
COPY ./conf/nifi.properties ./
COPY ./conf/zookeeper.properties ./

COPY ./conf/login-identity-providers.xml ./

# finalize
WORKDIR /opt/nifi/nifi-current/

# add log file
RUN touch logs/nifi-app.log