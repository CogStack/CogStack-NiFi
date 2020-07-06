FROM apache/nifi:1.11.4

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
RUN wget https://dl.bintray.com/groovy/maven/apache-groovy-binary-2.5.8.zip && \
        unzip apache-groovy-binary-2.5.8.zip && \
        rm apache-groovy-binary-2.5.8.zip

ENV GROOVY_BIN=/opt/nifi/groovy/groovy-2.5.8/bin

RUN $GROOVY_BIN/grape -V install org.apache.avro avro 1.8.1


# finalize
WORKDIR /opt/nifi/nifi-current/
