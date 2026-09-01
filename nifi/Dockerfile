ARG NIFI_VERSION=2.11.0

FROM apache/nifi:${NIFI_VERSION}

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

ARG NIFI_VERSION=2.11.0
ARG GROOVY_VERSION=5.1.0

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
ARG NIFI_PYTHON_WORKING_DIRECTORY="/opt/nifi/user_scripts"

ENV TZ=${TZ}
ENV NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY=${NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY}
ENV NIFI_PYTHON_EXTENSIONS_SOURCE_DIRECTORY_DEFAULT=${NIFI_PYTHON_EXTENSIONS_SOURCE_DIRECTORY_DEFAULT}
ENV NIFI_PYTHON_WORKING_DIRECTORY=${NIFI_PYTHON_WORKING_DIRECTORY}
ENV PYTHONPATH=${NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY}

# python stuff
ENV PIP_PREFER_BINARY=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PIP_NO_CACHE_DIR=1
# Enables Python to generate .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=0
# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# default env vars to prevent NiFi from running on HTTP
ENV NIFI_WEB_HTTP_PORT=""
ENV NIFI_WEB_HTTP_HOST=""

USER root

# add repositories, install tooling, and clean up apt metadata in one layer
RUN set -eux; \
    apt-get update -y; \
    apt-get install -y --no-install-recommends \
      apt-transport-https \
      ca-certificates \
      curl \
      gnupg \
      wget; \
    printf '%s\n' \
      "deb http://deb.debian.org/debian/ bookworm main contrib non-free non-free-firmware" \
      "deb http://deb.debian.org/debian/ bookworm-updates main contrib non-free non-free-firmware" \
      "deb http://deb.debian.org/debian/ bookworm-backports main contrib non-free non-free-firmware" \
      "deb http://security.debian.org/debian-security/ bookworm-security main contrib non-free non-free-firmware" \
      "deb-src http://deb.debian.org/debian/ bookworm main contrib non-free non-free-firmware" \
      "deb-src http://deb.debian.org/debian/ bookworm-updates main contrib non-free non-free-firmware" \
      "deb-src http://deb.debian.org/debian/ bookworm-backports main contrib non-free non-free-firmware" \
      "deb-src http://security.debian.org/debian-security/ bookworm-security main contrib non-free non-free-firmware" \
      > /etc/apt/sources.list.d/debian.list; \
    wget -q -O- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/packages.microsoft.gpg; \
    echo "deb [arch=amd64,armhf,arm64] https://packages.microsoft.com/ubuntu/22.04/prod jammy main" > /etc/apt/sources.list.d/microsoft.list; \
    apt-get update -y; \
    apt-get upgrade -y --no-install-recommends; \
    apt-get install -y --no-install-recommends \
      apt-utils \
      build-essential \
      cmake \
      git \
      iputils-ping \
      jq \
      libsqlite3-dev \
      libssl-dev \
      make \
      openssl \
      postgresql-server-dev-all \
      python3.11 \
      python3.11-dev \
      python3-dev \
      python3-pip \
      python3-venv \
      software-properties-common \
      sqlite3 \
      ssl-cert \
      tzdata \
      unzip \
      zip; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*

# bust cache
ENV UV_VERSION=latest

# install rust, medcat requirement, install UV
ENV HOME=/root
ENV PATH="/root/.cargo/bin:${PATH}"
ENV UV_INSTALL_DIR=/usr/local/bin

RUN set -eux; \
    curl -sSf https://sh.rustup.rs -o /tmp/rustup-init.sh; \
    chmod +x /tmp/rustup-init.sh; \
    /tmp/rustup-init.sh -y; \
    rm /tmp/rustup-init.sh

RUN set -eux; \
    curl -Ls https://astral.sh/uv/install.sh -o /tmp/install_uv.sh; \
    bash /tmp/install_uv.sh; \
    rm /tmp/install_uv.sh

######################################## Python / PIP SECTION ########################################

RUN uv pip install --no-cache-dir --break-system-packages --system --upgrade pip setuptools wheel

# Install the locked runtime dependencies used by NiFi scripts and extensions.
COPY pyproject.toml uv.lock /tmp/cogstack_nifi/
RUN uv export \
      --project /tmp/cogstack_nifi \
      --frozen \
      --no-dev \
      --no-emit-project \
      --format requirements.txt \
      --output-file /tmp/cogstack_nifi/requirements.txt \
    && uv pip install \
      --no-cache-dir \
      --break-system-packages \
      --target=${NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY} \
      -r /tmp/cogstack_nifi/requirements.txt \
      --index-url https://pypi.org/simple

# install the local cogstack_nifi package so nifi.user_scripts imports resolve
COPY nifi /tmp/cogstack_nifi/nifi
RUN uv pip install \
      --no-cache-dir \
      --break-system-packages \
      --no-deps \
      --target=${NIFI_PYTHON_FRAMEWORK_SOURCE_DIRECTORY} \
      /tmp/cogstack_nifi

#######################################################################################################

# solve groovy grape proxy issues, grape ignores the current environment's proxy settings
ENV JAVA_OPTS="-Dhttp.proxyHost=${HTTP_PROXY} -Dhttps.proxyHost=${HTTPS_PROXY} -Dhttp.nonProxyHosts=${no_proxy}"


# Install Groovy
RUN mkdir -p /opt/nifi/groovy
WORKDIR /opt/nifi/groovy/

RUN set -eux; \
  mkdir -p /opt/nifi/groovy; \
  cd /opt/nifi/groovy; \
  url1="https://archive.apache.org/dist/groovy/${GROOVY_VERSION}/distribution/apache-groovy-binary-${GROOVY_VERSION}.zip"; \
  url2="https://repo1.maven.org/maven2/org/apache/groovy/apache-groovy-binary/${GROOVY_VERSION}/apache-groovy-binary-${GROOVY_VERSION}.zip"; \
  curl -fsSL --retry 8 --retry-delay 3 --connect-timeout 20 -o groovy.zip "$url1" \
    || curl -fsSL --retry 8 --retry-delay 3 --connect-timeout 20 -o groovy.zip "$url2"; \
  unzip groovy.zip; rm groovy.zip

ENV GROOVY_BIN=/opt/nifi/groovy/groovy-${GROOVY_VERSION}/bin
RUN $GROOVY_BIN/grape -V install org.apache.avro avro 1.12.0

####################################### NAR INSTALL SECTION ##########################################
# INSTALL NAR extensions 
WORKDIR /opt/nifi/nifi-current/lib/

# --- Hotfix: NiFi 2.7.2 + Azure + Netty QUIC missing class (netty 4.2.9.Final) ---
ARG NETTY_VERSION=4.2.17.Final
RUN set -eux; \
    cd /opt/nifi/nifi-current/lib; \
    curl -fL --retry 5 --retry-delay 2 \
      -o "netty-codec-classes-quic-${NETTY_VERSION}.jar" \
      "https://repo1.maven.org/maven2/io/netty/netty-codec-classes-quic/${NETTY_VERSION}/netty-codec-classes-quic-${NETTY_VERSION}.jar"; \
    # sanity check: ensure the Quic class exists in the jar
    jar tf "netty-codec-classes-quic-${NETTY_VERSION}.jar" | grep -q '^io/netty/handler/codec/quic/Quic.class$'

# Install parquet NAR
RUN set -eux; \
  base="https://repo.maven.apache.org/maven2/org/apache/nifi"; \
  nars=( \
    nifi-atlassian-nar \
    nifi-aws-nar \
    nifi-aws-service-api-nar \
    nifi-aws-kinesis-nar \
    nifi-azure-nar \
    nifi-azure-services-api-nar \
    nifi-snowflake-processors-nar \
    nifi-snowflake-services-nar \
    nifi-snowflake-services-api-nar \
    nifi-smb-nar \
    nifi-slack-nar \
    nifi-solr-nar \
    nifi-sql-reporting-nar \
    nifi-parquet-nar \
    nifi-database-dialect-service-nar \
    nifi-jolt-nar \
    nifi-iotdb-nar \
    nifi-kafka-to-s3-nar \
    nifi-kafka-service-api-nar \
    nifi-kafka-service-aws-nar \
    nifi-kafka-nar \
    nifi-kerberos-iaa-providers-nar \
    nifi-key-service-nar \
    nifi-iceberg-shared-nar \
    nifi-iceberg-service-api-nar \
    nifi-iceberg-services-api-nar \
    nifi-iceberg-processors-nar \
    nifi-iceberg-rest-catalog-nar \
    nifi-iceberg-azure-nar \
    nifi-iceberg-aws-nar \
    nifi-iceberg-gcs-nar \
    nifi-iceberg-parquet-writer-nar \
    nifi-hashicorp-vault-nar \
    nifi-hashicorp-vault-client-service-api-nar \
    nifi-hadoop-libraries-nar \
    nifi-hadoop-nar \
    nifi-hl7-nar \
    nifi-github-nar \
    nifi-grpc-nar \
    nifi-groovyx-nar \
    nifi-geohash-nar \
    nifi-gitlab-nar \
    nifi-graph-nar \
    nifi-other-graph-services-nar \
    nifi-graph-client-service-api-nar \
    nifi-couchbase-nar \
    nifi-framework-zookeeper-nar \
    nifi-framework-kubernetes-nar \
    nifi-framework-nar \
    nifi-flow-registry-client-nar \
    nifi-media-nar \
    nifi-mqtt-nar \
    nifi-mongodb-nar \
    nifi-neo4j-cypher-service-nar \
    nifi-nar-provider-service-api-nar \
    nifi-prometheus-nar \
    nifi-opentelemetry-nar \
    nifi-protobuf-services-nar \
    nifi-py4j-nar \
    nifi-redis-service-api-nar \
  ); \
  for a in "${nars[@]}"; do \
     url="${base}/${a}/${NIFI_VERSION}/${a}-${NIFI_VERSION}.nar"; \
     echo "Checking $a"; \
     if ! curl -fsSL --retry 2 \
       -o "${a}-${NIFI_VERSION}.nar" \
       "$url"; then \
       echo "MISSING: $a @ ${NIFI_VERSION}"; \
       rm -f "${a}-${NIFI_VERSION}.nar"; \
     fi; \
  done; \
  chown ${UID}:${GID} ./*.nar

########################################################################################################

# copy configuration files
WORKDIR /opt/nifi/nifi-current/conf/

# finalize
WORKDIR /opt/nifi/nifi-current/

# add log file
RUN touch logs/nifi-app.log
