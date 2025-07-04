FROM apache/nifi:${NIFI_VERSION:-2.4.0}

ARG HTTP_PROXY=""
ARG HTTPS_PROXY=""
ARG no_proxy=""
ARG DEBIAN_FRONTEND=noninteractive

ENV NIFI_VERSION=${NIFI_VERSION:-2.4.0}

ENV NIFI_UID ${NIFI_UID:-1000}
ENV NIFI_GID ${NIFI_GID:-1000}

ENV TZ=Europe/London

ENV HTTP_PROXY ${HTTP_PROXY:-""}
ENV HTTPS_PROXY ${HTTPS_PROXY:-""}
ENV no_proxy $no_proxy

ENV MEDCAT_VERSION ${MEDCAT_VERSION:-1.16.0}


ENV NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY ${NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY:-"/opt/nifi/nifi-current/python/framework"}
ENV NIFI_PYTHON_EXTENSIONS_SOURCE_DIRECTORY_DEFAULT ${NIFI_PYTHON_EXTENSIONS_SOURCE_DIRECTORY_DEFAULT:-"/opt/nifi/nifi-current/python_extensions"}
ENV NIFI_PYTHON_WORKING_DIRECTORY ${NIFI_PYTHON_WORKING_DIRECTORY:-"/opt/nifi/user-scripts"}

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

# RUN apt-add-repository contrib && \
#     apt-add-repository non-free && \
#     apt-add-repository non-free-firmware
RUN echo "deb http://deb.debian.org/debian/ bookworm main contrib non-free non-free-firmware" >> /etc/apt/sources.list.d/debian.sources
RUN echo "deb http://deb.debian.org/debian/ bookworm-updates main contrib non-free non-free-firmware" >> /etc/apt/sources.list.d/debian.sources
RUN echo "deb http://deb.debian.org/debian/ bookworm-backports main contrib non-free non-free-firmware" >> /etc/apt/sources.list.d/debian.sources
RUN echo "deb http://security.debian.org/debian-security/ bookworm-security main contrib non-free non-free-firmware" >> /etc/apt/sources.list.d/debian.sources

RUN echo "deb-src http://deb.debian.org/debian/ bookworm main contrib non-free non-free-firmware" >> /etc/apt/sources.list.d/debian.sources
RUN echo "deb-src http://deb.debian.org/debian/ bookworm-updates main contrib non-free non-free-firmware" >> /etc/apt/sources.list.d/debian.sources
RUN echo "deb-src http://deb.debian.org/debian/ bookworm-backports main contrib non-free non-free-firmware" >> /etc/apt/sources.list.d/debian.sources
RUN echo "deb-src http://security.debian.org/debian-security/ bookworm-security main contrib non-free non-free-firmware" >> /etc/apt/sources.list.d/debian.sources

RUN curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/postgresql-keyring.gpg

RUN echo "deb [signed-by=/usr/share/keyrings/postgresql-keyring.gpg] http://apt.postgresql.org/pub/repos/apt/ bullseye-pgdg main" | tee /etc/apt/sources.list.d/postgresql.list

RUN gpg --keyserver keyserver.ubuntu.com --recv-keys F23C5A6CF475977595C89F51BA6932366A755776
RUN gpg --export F23C5A6CF475977595C89F51BA6932366A755776 | tee /usr/share/keyrings/ppa-deadsnakes.gpg > /dev/null

RUN echo "deb [signed-by=/usr/share/keyrings/ppa-deadsnakes.gpg] https://ppa.launchpadcontent.net/deadsnakes/ppa/ubuntu/ trusty main" > /etc/apt/sources.list.d/ppa-deadsnakes.list
RUN echo "deb-src [signed-by=/usr/share/keyrings/ppa-deadsnakes.gpg] https://ppa.launchpadcontent.net/deadsnakes/ppa/ubuntu/ trusty main" >> /etc/apt/sources.list.d/ppa-deadsnakes.list

# Microsoft repos
RUN wget -q -O- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/packages.microsoft.gpg
RUN echo "deb [arch=amd64,armhf,arm64] https://packages.microsoft.com/ubuntu/22.04/prod jammy main" | tee -a /etc/apt/sources.list

RUN apt-get update && apt-get upgrade -y 

RUN apt-get install --no-install-recommends -y ssl-cert libsqlite3-dev python3-dev python3-pip python3.11 python3.11-dev python3.11-full python3-venv sqlite3 
# RUN apt-get install --no-install-recommends -y python3-psycopg2
# python3-psycopg
# postgresql-server-dev-17
# postgresql-server-dev-all 

# timezone setting
RUN apt-get install --no-install-recommends -y tzdata

# install rust, medcat requirement
RUN curl -y --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# needed for rust & cargo
# RUN bash $HOME/.cargo/env

# clean up apt
RUN apt-get clean autoclean && apt-get autoremove --purge -y

######################################## Python / PIP SECTION ########################################

RUN pip3 install --no-cache-dir --break-system-packages --upgrade pip setuptools wheel
RUN pip3 install --no-cache-dir --break-system-packages psycopg2-binary

RUN pip3 install --no-cache-dir --break-system-packages --target=${NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY} dvc flask GitPython elasticsearch opensearch-py neo4j eland --ignore-installed PyYAML && \ 
    pip3 install --no-cache-dir --break-system-packages --target=${NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY} pytesseract ipyparallel py7zr cython isort html2text jsoncsv simplejson detect nltk keras bokeh seaborn matplotlib graphviz plotly tqdm && \
    pip3 install --no-cache-dir --break-system-packages --target=${NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY} pymssql mysql-connector-python cx-Oracle dataclasses numpy matplotlib pandas dill jsonpickle jsonext python-certifi-win32 certifi pyodbc openpyxl rancoord

# XNAT
RUN pip3 install --no-cache-dir --break-system-packages --target=${NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY} xnat

# medcat & models
# spacy not installed
RUN pip3 install --no-cache-dir --break-system-packages --target=${NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY} thinc click torch

RUN pip3 install --no-cache-dir --break-system-packages --target=${NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY} medcat==${MEDCAT_VERSION}

# ApacheNifi specific packages
RUN pip3 install --no-cache-dir --break-system-packages --target=${NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY} nipyapi nifi.flowfile avro

# uther useful packages
RUN pip3 install --no-cache-dir --break-system-packages --target=${NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY} jupyter geocoder

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

#COPY ./conf/bootstrap.conf ./
#COPY ./conf/nifi.properties ./
#COPY ./conf/zookeeper.properties ./

# COPY ./conf/login-identity-providers.xml ./

# finalize
WORKDIR /opt/nifi/nifi-current/

# add log file
RUN touch logs/nifi-app.log