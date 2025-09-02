ARG NIFI_VERSION=2.5.0

FROM apache/nifi:${NIFI_VERSION}

ARG HTTP_PROXY=""
ARG HTTPS_PROXY=""
ARG no_proxy=""
ARG DEBIAN_FRONTEND=noninteractive

ARG NIFI_UID=1000
ARG NIFI_GID=1000
ARG UID=${NIFI_UID:-1000}
ARG GID=${NIFI_GID:-1000}
ARG MEDCAT_VERSION="1.16.0"
ARG TZ="Europe/London"
ARG NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY="/opt/nifi/nifi-current/python/framework"
ARG NIFI_PYTHON_EXTENSIONS_SOURCE_DIRECTORY_DEFAULT="/opt/nifi/nifi-current/python_extensions"
ARG NIFI_PYTHON_WORKING_DIRECTORY="/opt/nifi/user-scripts"

ENV TZ=${TZ}
ENV MEDCAT_VERSION=${MEDCAT_VERSION}
ENV NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY=${NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY}
ENV NIFI_PYTHON_EXTENSIONS_SOURCE_DIRECTORY_DEFAULT=${NIFI_PYTHON_EXTENSIONS_SOURCE_DIRECTORY_DEFAULT}
ENV NIFI_PYTHON_WORKING_DIRECTORY=${NIFI_PYTHON_WORKING_DIRECTORY}

# default env vars to prevent NiFi from running on HTTP
ENV NIFI_WEB_HTTP_PORT=""
ENV NIFI_WEB_HTTP_HOST=""

RUN echo "GID=${GID}" 
RUN echo "UID=${UID}"

USER root

# run updates and install some base utility packages along with python support
RUN apt-get update && apt-get install -y --no-install-recommends iputils-ping libssl-dev openssl apt-transport-https apt-utils curl software-properties-common wget git build-essential make cmake ca-certificates zip unzip tzdata

RUN echo "deb http://deb.debian.org/debian/ bookworm main contrib non-free non-free-firmware" >> /etc/apt/sources.list.d/debian.sources
RUN echo "deb http://deb.debian.org/debian/ bookworm-updates main contrib non-free non-free-firmware" >> /etc/apt/sources.list.d/debian.sources
RUN echo "deb http://deb.debian.org/debian/ bookworm-backports main contrib non-free non-free-firmware" >> /etc/apt/sources.list.d/debian.sources
RUN echo "deb http://security.debian.org/debian-security/ bookworm-security main contrib non-free non-free-firmware" >> /etc/apt/sources.list.d/debian.sources

RUN echo "deb-src http://deb.debian.org/debian/ bookworm main contrib non-free non-free-firmware" >> /etc/apt/sources.list.d/debian.sources
RUN echo "deb-src http://deb.debian.org/debian/ bookworm-updates main contrib non-free non-free-firmware" >> /etc/apt/sources.list.d/debian.sources
RUN echo "deb-src http://deb.debian.org/debian/ bookworm-backports main contrib non-free non-free-firmware" >> /etc/apt/sources.list.d/debian.sources
RUN echo "deb-src http://security.debian.org/debian-security/ bookworm-security main contrib non-free non-free-firmware" >> /etc/apt/sources.list.d/debian.sources

# Microsoft repos
RUN wget -q -O- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/packages.microsoft.gpg
RUN echo "deb [arch=amd64,armhf,arm64] https://packages.microsoft.com/ubuntu/22.04/prod jammy main" | tee -a /etc/apt/sources.list

RUN apt-get update && apt-get install --no-install-recommends -y ssl-cert libsqlite3-dev python3-dev python3-pip python3.11 python3.11-dev python3.11-full python3-venv sqlite3 postgresql-server-dev-all

# install rust, medcat requirement
RUN curl -y --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# clean up apt
RUN apt-get clean autoclean && apt-get autoremove --purge -y

######################################## Python / PIP SECTION ########################################

RUN pip3 install --no-cache-dir --break-system-packages --upgrade pip setuptools wheel
RUN pip3 install --no-cache-dir --break-system-packages psycopg2-binary

RUN pip3 install --no-cache-dir --break-system-packages --target=${NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY} ipyparallel py7zr cython isort html2text jsoncsv simplejson detect bokeh tqdm && \
    pip3 install --no-cache-dir --break-system-packages --target=${NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY} pymssql mysql-connector-python cx-Oracle jsonpickle jsonext python-certifi-win32 certifi pyodbc openpyxl

# install util packages used in NiFi scripts (such as MedCAT, avro, nifyapi, etc.)
COPY ./requirements.txt ./
RUN pip3 install --no-cache-dir --break-system-packages --target=${NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY} -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu/

# clean up pip
RUN pip3 cache purge
 
#######################################################################################################

# solve groovy grape proxy issues, grape ignores the current environment's proxy settings
RUN export JAVA_OPTS="-Dhttp.proxyHost=$HTTP_PROXY -Dhttps.proxyHost=$HTTPS_PROXY -Dhttp.nonProxyHosts=$no_proxy"

# INSTALL NAR extensions 
WORKDIR /opt/nifi/nifi-current/lib/

# Install Groovy
RUN mkdir -p /opt/nifi/groovy
WORKDIR /opt/nifi/groovy/

RUN curl https://archive.apache.org/dist/groovy/5.0.0/distribution/apache-groovy-binary-5.0.0.zip --output apache-groovy-binary-5.0.0.zip --max-time 3600 && \
    unzip apache-groovy-binary-5.0.0.zip && \
    rm apache-groovy-binary-5.0.0.zip
ENV GROOVY_BIN=/opt/nifi/groovy/groovy-5.0.0/bin
RUN $GROOVY_BIN/grape -V install org.apache.avro avro 1.12.0

# copy configuration files
WORKDIR /opt/nifi/nifi-current/conf/

# finalize
WORKDIR /opt/nifi/nifi-current/

# add log file
RUN touch logs/nifi-app.log