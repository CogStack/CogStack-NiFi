# syntax=docker/dockerfile:1
ARG NIFI_BASE_IMAGE=apache/nifi:2.12.0@sha256:6f7f2840dbf178c6dd3fa13435b9b358f3be3c6fb7417de467a35a267f4d28ad

FROM ${NIFI_BASE_IMAGE}

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

ARG NIFI_VERSION=2.12.0
ARG GROOVY_VERSION=5.1.0

ARG HTTP_PROXY=""
ARG HTTPS_PROXY=""
ARG no_proxy=""
ARG DEBIAN_FRONTEND=noninteractive

ARG TZ="Europe/London"

ENV TZ=${TZ}
ENV PYTHONPATH=${NIFI_HOME}/python/framework

# python stuff
ENV PIP_PREFER_BINARY=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PIP_NO_CACHE_DIR=1
# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

USER root

# Install system dependencies using the repositories provided by the base image.
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
      apt-utils \
      build-essential \
      ca-certificates \
      cmake \
      curl \
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

# install rust, medcat requirement, install UV
ENV HOME=/root
ENV PATH="/root/.cargo/bin:${PATH}"
ENV UV_INSTALL_DIR=/usr/local/bin

RUN set -eux; \
    curl -sSf https://sh.rustup.rs -o /tmp/rustup-init.sh; \
    chmod +x /tmp/rustup-init.sh; \
    /tmp/rustup-init.sh -y; \
    rm /tmp/rustup-init.sh

# Install the exact or minimum uv version required by the repository.
COPY pyproject.toml /tmp/cogstack_nifi/pyproject.toml
RUN set -eux; \
    UV_VERSION="$(sed -nE 's/^required-version = "(==|>=)([0-9]+\.[0-9]+\.[0-9]+)"$/\2/p' /tmp/cogstack_nifi/pyproject.toml)"; \
    test -n "${UV_VERSION}" || { echo 'Expected tool.uv.required-version to be ==X.Y.Z or >=X.Y.Z in pyproject.toml' >&2; exit 1; }; \
    curl -LsSf "https://astral.sh/uv/${UV_VERSION}/install.sh" -o /tmp/install_uv.sh; \
    bash /tmp/install_uv.sh; \
    rm /tmp/install_uv.sh

######################################## Python / PIP SECTION ########################################

RUN uv pip install --no-cache-dir --break-system-packages --system --upgrade pip setuptools wheel

# Install the locked runtime dependencies used by NiFi scripts and extensions.
COPY uv.lock /tmp/cogstack_nifi/uv.lock
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
      --target=${NIFI_HOME}/python/framework \
      -r /tmp/cogstack_nifi/requirements.txt \
      --index-url https://pypi.org/simple

#######################################################################################################

# solve groovy grape proxy issues, grape ignores the current environment's proxy settings
ENV JAVA_OPTS="-Dhttp.proxyHost=${HTTP_PROXY} -Dhttps.proxyHost=${HTTPS_PROXY} -Dhttp.nonProxyHosts=${no_proxy}"


# Install Groovy
WORKDIR /opt/nifi/groovy

RUN set -eux; \
  url1="https://archive.apache.org/dist/groovy/${GROOVY_VERSION}/distribution/apache-groovy-binary-${GROOVY_VERSION}.zip"; \
  url2="https://repo.maven.apache.org/maven2/org/apache/groovy/apache-groovy-binary/${GROOVY_VERSION}/apache-groovy-binary-${GROOVY_VERSION}.zip"; \
  curl -fsSL --retry 8 --retry-delay 3 --connect-timeout 20 -o groovy.zip "$url1" \
    || curl -fsSL --retry 8 --retry-delay 3 --connect-timeout 20 -o groovy.zip "$url2"; \
  unzip groovy.zip; rm groovy.zip

ENV GROOVY_BIN=/opt/nifi/groovy/groovy-${GROOVY_VERSION}/bin
RUN $GROOVY_BIN/grape -V install org.apache.avro avro 1.12.0

####################################### NAR INSTALL SECTION ##########################################
# INSTALL NAR extensions 
WORKDIR /opt/nifi/nifi-current/lib/

# Apache's base image already provides the standard NARs; add only missing extensions.
RUN set -eux; \
  base="https://repo.maven.apache.org/maven2/org/apache/nifi"; \
  nars=( \
    nifi-snowflake-processors-nar \
    nifi-snowflake-services-nar \
    nifi-snowflake-services-api-nar \
    nifi-sql-reporting-nar \
    nifi-parquet-nar \
    nifi-iotdb-nar \
    nifi-hadoop-libraries-nar \
    nifi-hadoop-nar \
    nifi-graph-nar \
    nifi-other-graph-services-nar \
    nifi-graph-client-service-api-nar \
    nifi-couchbase-nar \
    nifi-media-nar \
    nifi-neo4j-cypher-service-nar \
    nifi-nar-provider-service-api-nar \
  ); \
  for a in "${nars[@]}"; do \
     url="${base}/${a}/${NIFI_VERSION}/${a}-${NIFI_VERSION}.nar"; \
     echo "Downloading $a"; \
     curl -fsSL \
       --connect-timeout 20 \
       --retry 5 \
       --retry-connrefused \
       --retry-delay 3 \
       --retry-max-time 120 \
       -o "${a}-${NIFI_VERSION}.nar" \
       "$url"; \
  done

########################################################################################################

# Baseline resources work without a repository checkout. Processor directories
# can still be overridden by writable, deployment-owned volumes.
COPY nifi/__init__.py /tmp/cogstack_nifi/nifi/__init__.py
COPY nifi/user_scripts /tmp/cogstack_nifi/nifi/user_scripts
COPY nifi/user_python_extensions /tmp/cogstack_nifi/nifi/user_python_extensions
RUN uv pip install --no-cache-dir --break-system-packages --no-deps \
      --target=${NIFI_HOME}/python/framework /tmp/cogstack_nifi

ARG NIFI_UID=1000
ARG NIFI_GID=1000

COPY --chown=${NIFI_UID}:${NIFI_GID} nifi/drivers /opt/nifi/drivers
COPY --chown=${NIFI_UID}:${NIFI_GID} nifi/user_schemas /opt/nifi/user_schemas
COPY --chown=${NIFI_UID}:${NIFI_GID} nifi/user_templates /opt/nifi/user_templates
COPY --chown=${NIFI_UID}:${NIFI_GID} nifi/user_scripts /opt/nifi/user_scripts
COPY --chown=${NIFI_UID}:${NIFI_GID} nifi/user_python_extensions /opt/nifi/nifi-current/python_extensions
COPY --chmod=755 nifi/docker/healthcheck.sh /opt/nifi/scripts/cogstack-healthcheck.sh

# Keep Apache's configuration defaults and startup script. Deployment credentials
# and mutable configuration from the checkout never enter the image.
RUN sed -i \
      -e 's|^nifi.security.autoreload.enabled=.*|nifi.security.autoreload.enabled=true|' \
      -e 's|^nifi.flowcontroller.graceful.shutdown.period=.*|nifi.flowcontroller.graceful.shutdown.period=30 sec|' \
      "${NIFI_HOME}/conf/nifi.properties" \
    && sed -i 's|^graceful.shutdown.seconds=.*|graceful.shutdown.seconds=60|' "${NIFI_HOME}/conf/bootstrap.conf" \
    && cp -a "${NIFI_HOME}/conf" /tmp/cogstack_nifi/nifi/conf

# Apache ships owner-only executables; remap them only for custom UID builds.
RUN set -eux; \
    if [ "$(id -g nifi)" != "${NIFI_GID}" ]; then groupmod -o -g "${NIFI_GID}" nifi; fi; \
    if [ "$(id -u nifi)" != "${NIFI_UID}" ]; then \
      usermod -o -u "${NIFI_UID}" nifi; \
      chown -R "${NIFI_UID}:${NIFI_GID}" "${NIFI_HOME}" "${NIFI_TOOLKIT_HOME}"; \
    fi; \
    mkdir -p "${NIFI_HOME}/run" "${NIFI_HOME}/work/python" \
      "${NIFI_HOME}/logs/user_scripts" "${NIFI_HOME}/state/user_scripts/db" \
      /opt/nifi/pipeline/flowfile-errors /data /opt/models; \
    rm -rf "${NIFI_HOME}/python/framework/nifi/user_scripts"; \
    ln -s /opt/nifi/user_scripts "${NIFI_HOME}/python/framework/nifi/user_scripts"; \
    ln -s /opt/nifi/drivers /tmp/cogstack_nifi/nifi/drivers; \
    ln -s /opt/nifi/user_schemas /tmp/cogstack_nifi/nifi/user_schemas; \
    ln -s /opt/nifi/user_templates /tmp/cogstack_nifi/nifi/user_templates; \
    chown -R "${NIFI_UID}:${NIFI_GID}" \
      "${NIFI_HOME}"/{conf,logs,run,work,database_repository,flowfile_repository,content_repository,provenance_repository,state,nar_extensions,python_extensions} \
      /home/nifi /opt/nifi/pipeline/flowfile-errors /data /opt/models

ENV HOME=/home/nifi
ENV NIFI_WEB_HTTPS_HOST="0.0.0.0"
ENV PATH=/usr/local/bin:${JAVA_HOME}/bin:/usr/local/sbin:/usr/sbin:/usr/bin:/sbin:/bin
ENV UV_CACHE_DIR=/opt/nifi/nifi-current/work/python/uv-cache
ENV PYTHONPYCACHEPREFIX=/opt/nifi/nifi-current/work/python/pycache
ENV NIFI_USER_SCRIPT_LOGS_DIR=/opt/nifi/nifi-current/logs/user_scripts
ENV NIFI_USER_SCRIPT_DB_DIR=/opt/nifi/nifi-current/state/user_scripts/db
WORKDIR /opt/nifi/nifi-current
USER ${NIFI_UID}:${NIFI_GID}
HEALTHCHECK --interval=30s --timeout=10s --start-period=300s --retries=3 \
  CMD ["/opt/nifi/scripts/cogstack-healthcheck.sh", "ready"]
