import json
import os
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, "../../")

import requests
from dto.nifi_api_config import NiFiAPIConfig
from dto.database_config import DatabaseConfig
from dto.service_health import NiFiHealth, DatabaseHealth
from nipyapi import config as nipy_config
from nipyapi import security, versioning
from utils.helpers.nifi_api_client import NiFiClient, NiFiRegistryClient
from utils.helpers.service import check_postgres


class TestServices(unittest.TestCase):
    """Service connectivity and health checks."""

    @classmethod
    def setUpClass(cls):
        

       # cls.pg_cfg = PGConfig()
       # cls.nifi_api_config = NiFiAPIConfig()
       # cls.nifi_client = NiFiClient(config=cls.nifi_api_config, login_on_init=False)
       # cls.nifi_registry_client = NiFiRegistryClient(config=cls.nifi_api_config)
       # cls.pg_config = PGConfig()
       # cls.registry_bucket_name = os.environ.get("NIFI_REGISTRY_BUCKET", "cogstack")
       # cls.flow_name = "opensearch_ingest_docs_db_to_es"
       # cls.template_path = (
       #     Path(__file__).resolve().parents[4]
       #     / "nifi"
       #     / "user-templates"
       #     / f"{cls.flow_name}.json"
       # )
       # cls.es_hosts = os.environ.get("OPENSEARCH_URLS", "http://localhost:9200")
       # cls.es_username = os.environ.get("OPENSEARCH_USERNAME", "admin")
       # cls.es_password = os.environ.get("OPENSEARCH_PASSWORD", "admin")

 #@classmethod
 #def _configure_nipyapi(cls) -> None:
 #    """Apply SSL + host config so nipyapi uses the same creds as the raw client."""
 #    nipy_config.nifi_config.host = cls.nifi_api_config.nifi_api_url
 #    nipy_config.registry_config.host = cls.nifi_api_config.nifi_registry_api_url
 #
 #    for cfg in (nipy_config.nifi_config, nipy_config.registry_config):
 #        cfg.verify_ssl = cls.nifi_api_config.VERIFY_SSL
 #        cfg.cert_file = cls.nifi_api_config.NIFI_CERT_PEM_PATH
 #        cfg.key_file = cls.nifi_api_config.NIFI_CERT_KEY_PATH
 #        cfg.ssl_ca_cert = cls.nifi_api_config.ROOT_CERT_CA_PATH
 #
 #def _prepare_snapshot_with_env_defaults(self) -> Path:
 #    """
 #    Load the opensearch template and pre-fill controller service properties
 #    using env/default configs so the flow can start without manual clicks.
 #    """
 #    with self.template_path.open() as fp:
 #        snapshot = json.load(fp)
 #
 #    db_url = f"jdbc:postgresql://{self.pg_cfg.host}:{self.pg_cfg.port}/{self.pg_cfg.db}"
 #
 #    for controller_service in snapshot.get("flowContents", {}).get("controllerServices", []):
 #        name = controller_service.get("name")
 #        properties = controller_service.setdefault("properties", {})
 #
 #        if name == "DBCPConnectionPool":
 #            properties["Database Connection URL"] = db_url
 #            properties["Database User"] = self.pg_cfg.user
 #            properties["Password"] = self.pg_cfg.password
 #        elif name == "ElasticSearchClientServiceImpl":
 #            properties["el-cs-http-hosts"] = self.es_hosts
 #            properties["el-cs-username"] = self.es_username
 #            properties["el-cs-password"] = self.es_password
 #
 #    fd, tmp_path = tempfile.mkstemp(suffix=".json", prefix="nifi-template-")
 #    with os.fdopen(fd, "w") as tmp_file:
 #        json.dump(snapshot, tmp_file)
 #
 #    return Path(tmp_path)
 #
 #def test_nifi_health(self) -> None:
 #    result = self.nifi_client._login()
 #    self.assertTrue(result)
 #
 #def test_nifi_registry_health(self) -> None:
 #    result = requests.head(
 #        url=self.nifi_api_config.nifi_registry_base_url,
 #        auth=self.nifi_api_config.auth_credentials(),
 #        cert=self.nifi_api_config.get_nifi_ssl_certs_paths(),
 #        verify=self.nifi_api_config.ROOT_CERT_CA_PATH,
 #        timeout=15,
 #    )
 #    self.assertEqual(result.status_code, 200)
 #
 #def test_postgres_health(self):
 #    result, latency, err = check_postgres(self.pg_config)
 #    self.assertTrue(result, f"PostgreSQL unhealthy: {err}")
 #    print(f"✅ PostgreSQL OK, latency {latency:.2f} ms")
 #
 #def test_import_opensearch_template_and_configure_controller_services(self) -> None:
 #    """
 #    Bring the opensearch template into the local NiFi Registry bucket and
 #    patch the controller services so they use local PG/ES credentials.
 #    """
 #    self.assertTrue(self.nifi_client._login())
 #    self._configure_nipyapi()
 #
 #    security.service_login(
 #        service="registry",
 #        username=self.nifi_api_config.NIFI_USERNAME,
 #        password=self.nifi_api_config.NIFI_PASSWORD,
 #    )
 #
 #    bucket = versioning.get_bucket(self.registry_bucket_name)
 #    if bucket is None:
 #        bucket = versioning.create_bucket(
 #            bucket_name=self.registry_bucket_name,
 #            bucket_desc="Auto-created for test imports",
 #        )
 #
 #    flow = versioning.get_flow_in_bucket(
 #        bucket_id=bucket.identifier,
 #        identifier=self.flow_name,
 #        identifier_type="name",
 #    )
 #    if flow is None:
 #        flow = versioning.create_flow(
 #            bucket_id=bucket.identifier,
 #            flow_name=self.flow_name,
 #            desc="Auto-imported from user-templates",
 #        )
 #
 #    snapshot_path = self._prepare_snapshot_with_env_defaults()
 #
 #    try:
 #        snapshot = versioning.import_flow_version(
 #            bucket_id=bucket.identifier,
 #            flow_id=flow.identifier,
 #            file_path=str(snapshot_path),
 #        )
 #    finally:
 #        snapshot_path.unlink(missing_ok=True)
 #
 #    self.assertIsNotNone(snapshot)
 #