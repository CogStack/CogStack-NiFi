FROM apache/nifi:1.14.0

# copy drivers
WORKDIR /opt/nifi/
COPY ./drivers ./drivers
#COPY ./security ./security

# copy user scripts, schemas and templates
COPY ./user-scripts ./user-scripts
COPY ./user-schemas ./user-schemas

WORKDIR /opt/nifi/nifi-current/conf/templates/
COPY ./user-templates ./

# copy configuration files
WORKDIR /opt/nifi/nifi-current/conf/
COPY ./conf/bootstrap.conf ./
COPY ./conf/nifi.properties ./
COPY ./conf/zookeeper.properties ./

#USER nifi
RUN mkdir -p /opt/nifi/groovy
WORKDIR /opt/nifi/groovy/
RUN wget https://groovy.jfrog.io/artifactory/dist-release-local/groovy-zips/apache-groovy-binary-3.0.9.zip && \
        unzip apache-groovy-binary-3.0.9.zip && \
        rm apache-groovy-binary-3.0.9.zip

ENV GROOVY_BIN=/opt/nifi/groovy/groovy-3.0.9/bin

RUN $GROOVY_BIN/grape -V install org.apache.avro avro 1.10.2


# finalize
WORKDIR /opt/nifi/nifi-current/
