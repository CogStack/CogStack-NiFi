ARG NIFI_VERSION=2.6.0

FROM apache/nifi:${NIFI_VERSION}

ARG HTTP_PROXY=""
ARG HTTPS_PROXY=""
ARG no_proxy=""
ARG DEBIAN_FRONTEND=noninteractive

ARG NIFI_UID=1000
ARG NIFI_GID=1000
ARG UID=${NIFI_UID:-1000}
ARG GID=${NIFI_GID:-1000}
ARG TZ="Europe/London"
ARG NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY="/opt/nifi/nifi-current/python/framework"
ARG NIFI_PYTHON_EXTENSIONS_SOURCE_DIRECTORY_DEFAULT="/opt/nifi/nifi-current/python_extensions"
ARG NIFI_PYTHON_WORKING_DIRECTORY="/opt/nifi/user-scripts"

ENV TZ=${TZ}
ENV NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY=${NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY}
ENV NIFI_PYTHON_EXTENSIONS_SOURCE_DIRECTORY_DEFAULT=${NIFI_PYTHON_EXTENSIONS_SOURCE_DIRECTORY_DEFAULT}
ENV NIFI_PYTHON_WORKING_DIRECTORY=${NIFI_PYTHON_WORKING_DIRECTORY}

# python stuff
ENV PIP_PREFER_BINARY=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PIP_NO_CACHE_DIR=1

# default env vars to prevent NiFi from running on HTTP
ENV NIFI_WEB_HTTP_PORT=""
ENV NIFI_WEB_HTTP_HOST=""

RUN echo "GID=${GID}" 
RUN echo "UID=${UID}"

USER root

# run updates and install some base utility packages along with python support
RUN apt-get update && apt-get upgrade -y --no-install-recommends && apt-get install -y --no-install-recommends iputils-ping libssl-dev openssl apt-transport-https apt-utils curl software-properties-common wget git build-essential make cmake ca-certificates zip unzip tzdata jq

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

RUN apt-get update && apt-get install --no-install-recommends -y ssl-cert libsqlite3-dev python3-dev python3-pip python3.11 python3.11-dev python3-venv sqlite3 postgresql-server-dev-all

# bust cache
ENV UV_VERSION=latest

# install rust, medcat requirement, install UV
ENV HOME=/root
ENV PATH="/root/.cargo/bin:${PATH}"

RUN curl -sSf https://sh.rustup.rs -o /tmp/rustup-init.sh \
 && chmod +x /tmp/rustup-init.sh \
 && /tmp/rustup-init.sh -y \
 && rm /tmp/rustup-init.sh

RUN curl -Ls https://astral.sh/uv/install.sh -o /tmp/install_uv.sh \
 && bash /tmp/install_uv.sh

RUN UV_PATH=$(find / -name uv -type f | head -n1) && \
    ln -s "$UV_PATH" /usr/local/bin/uv

# clean up apt
RUN apt-get clean autoclean && apt-get autoremove --purge -y

######################################## Python / PIP SECTION ########################################

RUN uv pip install --no-cache-dir --break-system-packages --system --upgrade pip setuptools wheel

# install util packages used in NiFi scripts (such as MedCAT, avro, nifyapi, etc.)
COPY ./requirements.txt ./requirements.txt
RUN uv pip install --no-cache-dir --break-system-packages --target=${NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY} -r "./requirements.txt"

#######################################################################################################

# solve groovy grape proxy issues, grape ignores the current environment's proxy settings
RUN export JAVA_OPTS="-Dhttp.proxyHost=$HTTP_PROXY -Dhttps.proxyHost=$HTTPS_PROXY -Dhttp.nonProxyHosts=$no_proxy"

# INSTALL NAR extensions 
WORKDIR /opt/nifi/nifi-current/lib/

# Install Groovy
RUN mkdir -p /opt/nifi/groovy
WORKDIR /opt/nifi/groovy/

RUN curl https://archive.apache.org/dist/groovy/5.0.2/distribution/apache-groovy-binary-5.0.2.zip --output apache-groovy-binary-5.0.2.zip --max-time 3600 && \
    unzip apache-groovy-binary-5.0.2.zip && \
    rm apache-groovy-binary-5.0.2.zip
ENV GROOVY_BIN=/opt/nifi/groovy/groovy-5.0.2/bin
RUN $GROOVY_BIN/grape -V install org.apache.avro avro 1.12.0

# copy configuration files
WORKDIR /opt/nifi/nifi-current/conf/

# finalize
WORKDIR /opt/nifi/nifi-current/

# add log file
RUN touch logs/nifi-app.log
