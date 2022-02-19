FROM apache/nifi:1.15.3
ARG UID=1000
ARG GID=1000

USER nifi

ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG no_proxy

ENV HTTP_PROXY $HTTP_PROXY
ENV HTTPS_PROXY $HTTPS_PROXY
ENV no_proxy $no_proxy

# solve groovy grape proxy issues, grape ignores the current environment's proxy settings
RUN export JAVA_OPTS="-Dhttp.proxyHost=$HTTP_PROXY -Dhttps.proxyHost=$HTTPS_PROXY -Dhttp.nonProxyHosts=$no_proxy"

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

USER root

RUN chown -R nifi:nifi ./conf
RUN chmod -R 777 ./conf

USER nifi