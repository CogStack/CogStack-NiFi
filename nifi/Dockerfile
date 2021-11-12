FROM apache/nifi:1.14.0

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
#COPY ./security ./security

# copy user scripts, schemas and templates
COPY ./user-scripts ./user-scripts
COPY ./user-schemas ./user-schemas

#####
WORKDIR /opt/nifi/nifi-current/conf/templates/
COPY ./user-templates ./    

USER nifi

RUN mkdir -p /opt/nifi/groovy
WORKDIR /opt/nifi/groovy/

RUN curl https://groovy.jfrog.io/artifactory/dist-release-local/groovy-zips/apache-groovy-binary-3.0.9.zip --output apache-groovy-binary-3.0.9.zip --max-time 3600 && \
    unzip apache-groovy-binary-3.0.9.zip && \
    rm apache-groovy-binary-3.0.9.zip

ENV GROOVY_BIN=/opt/nifi/groovy/groovy-3.0.9/bin

RUN $GROOVY_BIN/grape -V install org.apache.avro avro 1.10.2

WORKDIR  /opt/nifi/nifi-toolkit-current/

# copy configuration files
WORKDIR /opt/nifi/nifi-current/conf/

COPY ./conf/bootstrap.conf ./
COPY ./conf/nifi.properties ./
COPY ./conf/zookeeper.properties ./

COPY ./conf/login-identity-providers.xml ./

# finalize
WORKDIR /opt/nifi/nifi-current/
