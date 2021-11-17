FROM apache/nifi:1.11.4
ARG UID=1000
ARG GID=1000

USER nifi

# copy drivers
WORKDIR /opt/nifi/
COPY --chown=nifi:nifi ./drivers ./drivers
#COPY --chown=nifi:nifi ./security ./security

# copy user scripts, schemas and templates
COPY --chown=nifi:nifi ./user-scripts ./user-scripts
COPY --chown=nifi:nifi ./user-schemas ./user-schemas

WORKDIR /opt/nifi/nifi-current/conf/templates/
COPY --chown=nifi:nifi ./user-templates ./

# copy configuration files
WORKDIR /opt/nifi/nifi-current/conf/

COPY --chown=nifi:nifi ./conf/bootstrap.conf ./
COPY --chown=nifi:nifi ./conf/nifi.properties ./
COPY --chown=nifi:nifi ./conf/zookeeper.properties ./

RUN mkdir -p /opt/nifi/groovy
WORKDIR /opt/nifi/groovy/
RUN wget https://archive.apache.org/dist/groovy/2.5.8/distribution/apache-groovy-binary-2.5.8.zip && \
        unzip apache-groovy-binary-2.5.8.zip && \
        rm apache-groovy-binary-2.5.8.zip

ENV GROOVY_BIN=/opt/nifi/groovy/groovy-2.5.8/bin

RUN $GROOVY_BIN/grape -V install org.apache.avro avro 1.8.1

# finalize
WORKDIR /opt/nifi/nifi-current/