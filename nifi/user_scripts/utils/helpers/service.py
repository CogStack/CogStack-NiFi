import time

import psycopg

from nifi.user_scripts.dto.database_config import DatabaseConfig
from nifi.user_scripts.dto.service_health import DatabaseHealth
from nifi.user_scripts.utils.generic import get_logger

logger = get_logger(__name__)


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

            latency = (time.perf_counter() - start) * 1000
            database_health.latency_ms = latency
            if result and result[0]:
                database_health.version = result[0]
                database_health.status = "healthy"
                database_health.connected = True
                logger.info(f"✅ PostgreSQL OK, latency {database_health.latency_ms:.2f} ms")
            else:
                database_health.message = "No version returned from database"
                database_health.status = "unhealthy"
                database_health.connected = True

    except Exception as e:
        database_health.message = str(e)
        database_health.status = "unhealthy"
        database_health.connected = False
        logger.info("❌ Failed to query PostgreSQLi: %s", str(e))
    return database_health
