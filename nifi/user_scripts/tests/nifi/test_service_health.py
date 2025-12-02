import unittest

from pydantic import SecretStr

from nifi.user_scripts.dto.database_config import DatabaseConfig
from nifi.user_scripts.dto.elastic_config import ElasticConfig
from nifi.user_scripts.dto.nifi_api_config import NiFiAPIConfig
from nifi.user_scripts.dto.service_health import DatabaseHealth, ElasticHealth, NiFiHealth
from nifi.user_scripts.utils.generic import get_logger
from nifi.user_scripts.utils.helpers.nifi_api_client import NiFiClient, NiFiRegistryClient
from nifi.user_scripts.utils.helpers.service import check_elasticsearch, check_kibana, check_postgres


class TestServices(unittest.TestCase):
    """Service connectivity and health checks."""

    logger = get_logger(__name__)

    @classmethod
    def setUpClass(cls):
        cls.nifi_api_config: NiFiAPIConfig = NiFiAPIConfig()
        cls.nifi_client: NiFiClient = NiFiClient(config=cls.nifi_api_config, healh_check_on_init=False)
        cls.nifi_registry_client: NiFiRegistryClient = NiFiRegistryClient(config=cls.nifi_api_config)
        cls.pg_config: DatabaseConfig = DatabaseConfig(port=5554)
        cls.elastic_config: ElasticConfig = ElasticConfig(user="admin",
                                                          hosts=["https://localhost:9200"],
                                                          password=SecretStr("admin"),
                                                          kibana_host="https://localhost:5601",
                                                          kibana_version="opensearch-dashboards")

    def test_nifi_health(self) -> None:
        health: NiFiHealth = self.nifi_client.health_check()
        self.assertTrue(health.connected)
        self.assertEqual(health.status, "healthy")
    
    def test_nifi_registry_health(self) -> None:
        nifi_health: NiFiHealth = self.nifi_registry_client.health_check()
        self.assertTrue(nifi_health.connected)
        self.assertEqual(nifi_health.status, "healthy")

    def test_postgres_health(self):
        database_health: DatabaseHealth = check_postgres(self.pg_config)
        self.assertTrue(database_health.connected)
        self.assertEqual(database_health.status, "healthy")
    
    def test_elastic_health(self):
        elastic_health: ElasticHealth = check_elasticsearch(self.elastic_config)
        self.assertTrue(elastic_health.connected)
        self.assertEqual(elastic_health.status, "healthy")

    def test_kibana_health(self):
        elastic_health: ElasticHealth = check_kibana(self.elastic_config)
        self.assertTrue(elastic_health.connected)
        self.assertEqual(elastic_health.status, "healthy")