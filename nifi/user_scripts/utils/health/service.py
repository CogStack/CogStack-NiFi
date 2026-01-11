import time

import psycopg
import requests
from opensearchpy import OpenSearch

from nifi.user_scripts.dto.database_config import DatabaseConfig
from nifi.user_scripts.dto.elastic_config import ElasticConfig
from nifi.user_scripts.dto.service_health import DatabaseHealth, ElasticHealth
from ..generic import get_logger

logger = get_logger(__name__)

def check_kibana(config: ElasticConfig) -> ElasticHealth:

    elastic_health: ElasticHealth = ElasticHealth(service=config.kibana_version)
    start = time.perf_counter()

    try:
        if config.kibana_version == "kibana":
            raise NotImplementedError

        response = requests.get(config.kibana_host + "/api/status",
                                 auth=config.auth_credentials(),
                                 timeout=config.timeout,
                                 cert=config.get_kibana_ssl_certs_path(),
                                 verify=config.elastic_root_cert_ca_path
        )

        elastic_health.latency_ms = (time.perf_counter() - start) * 1000
        elastic_health.connected = response.ok

        if response.status_code == 200:
            elastic_health.status = "healthy"
            logger.info(f"✅ {config.kibana_version} OK, latency {elastic_health.latency_ms:.2f} ms")
        else:
            elastic_health.message = f"❌ Failed to query {config.kibana_version}"

    except Exception as e:
        elastic_health.message = str(e)
        logger.error(f"❌ Failed to query {config.kibana_version}: %s", str(e))

    return elastic_health

def check_elasticsearch(config: ElasticConfig) -> ElasticHealth:

    elastic_health: ElasticHealth = ElasticHealth(service=config.elasticsearch_version)
    start = time.perf_counter()

    try:
        elastic_connection = OpenSearch(hosts=config.hosts,
                                        use_ssl=config.verify_ssl,
                                        verify_certs=False,
                                        http_auth=config.auth_credentials(),
                                        ssl_show_warn=False,
                                        ssl_assert_hostname=False,
                                        ca_cert=config.elastic_root_cert_ca_path,
                                        client_cert=config.elastic_node_cert_pem_path,
                                        client_key=config.elastic_node_cert_key_path
                            )

        if config.elasticsearch_version == "elasticsearch":
            raise NotImplementedError

        if elastic_connection.ping():
            elastic_health.connected = True
            elastic_health.status = "healthy"
            elastic_health.service_info = elastic_connection.nodes.info()
            elastic_health.latency_ms = (time.perf_counter() - start) * 1000
            logger.info(f"✅ {config.elasticsearch_version} OK, latency {elastic_health.latency_ms:.2f} ms")
        else:
            elastic_health.message = f"❌ Failed to query {config.elasticsearch_version}"
    except Exception as e:
        elastic_health.message = str(e)
        logger.error(f"❌ Failed to query {config.elasticsearch_version}: %s", str(e))

    return elastic_health

def check_postgres(config: DatabaseConfig) -> DatabaseHealth:

    start = time.perf_counter()
    database_health = DatabaseHealth(service="cogstack-samples-db",
                                    db_name=config.database_name,
                                    version=None
                                    )

    try:
        with psycopg.connect(
            host=config.host,
            port=config.port,
            user=config.username,
            password=config.password.get_secret_value(),
            dbname=config.database_name,
            connect_timeout=config.timeout,
        ) as connection, connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            result = cursor.fetchone()

            if result and result[0]:
                database_health.version = result[0]
                database_health.status = "healthy"
                database_health.connected = True
                database_health.latency_ms = (time.perf_counter() - start) * 1000
                logger.info(f"✅ PostgreSQL OK, latency {database_health.latency_ms:.2f} ms")
            else:
                database_health.message = "No version returned from database"
                database_health.status = "unhealthy"
                database_health.connected = True

    except Exception as e:
        database_health.message = str(e)
        logger.info("❌ Failed to query PostgreSQLi: %s", str(e))
    return database_health
