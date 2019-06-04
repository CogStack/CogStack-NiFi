FROM apache/nifi:latest

# copy drivers
WORKDIR /opt/nifi/
COPY ./drivers ./drivers
#COPY ./security ./security

# copy user scripts and templates
COPY ./user-scripts ./user-scripts

WORKDIR /opt/nifi/nifi-current/conf/templates/
COPY ./user-templates ./

# copy configuration files
WORKDIR /opt/nifi/nifi-current/conf/
COPY ./conf/bootstrap.conf ./
COPY ./conf/nifi.properties ./
COPY ./conf/zookeeper.properties ./

# finalize
WORKDIR /opt/nifi/nifi-current/
