# News
<strong>This document covers important news with regards to the components of CogStack as a whole, any major security issues or major changes that might break existing deployments are covered here along with how to handle them.</strong>
</br>
</br>

# 13-12-2021 LOG4J Vulnerabity


Since the discovery of the Log4J package vulenerability (https://www.ncsc.gov.uk/news/apache-log4j-vulnerability) it is necessary and recommended to update all existing deployments of CogStack.

A summary of the steps needed to easily upgrade any CogStack components on an existing deployment:

For both instances (old and NiFI versions of the pipeline):
</br>
- make sure to update Elasticsearch to version 7.16.1+ if you are using the native version, if you are using OpenDistro it will be 1.13.3, and for OpenSearch it would be 1.2.1, all of these versions with their compose config can be found on the master branch of the NiFI repo, all that needs to be done is just a simple version change/increment in the docker-compose file (e.g https://github.com/CogStack/CogStack-NiFi/blob/master/deploy/services.yml , see the kibana/elasticsearch sections), followed by the pulling of the new images.

For the Old pipeline:
      - re-pull the latest docker image (docker pull cogstacksystems/cogstack-pipeline:latest)
For NiFI:
      - re-pull (docker pull cogstacksystems/cogstack-nifi:latest)
      - re-pull the tika image (docker pull cogstacksystems/tika-service:latest)
      