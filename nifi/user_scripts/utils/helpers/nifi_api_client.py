import time
from logging import Logger

import requests
from nipyapi import canvas, security
from nipyapi.nifi import ApiClient, ProcessGroupsApi
from nipyapi.nifi.configuration import Configuration as NiFiConfiguration
from nipyapi.nifi.models.process_group_entity import ProcessGroupEntity
from nipyapi.nifi.models.processor_entity import ProcessorEntity
from nipyapi.registry import ApiClient as RegistryApiClient
from nipyapi.registry import BucketsApi
from nipyapi.registry.configuration import Configuration as RegistryConfiguration

from nifi.user_scripts.dto.nifi_api_config import NiFiAPIConfig
from nifi.user_scripts.dto.service_health import NiFiHealth
from nifi.user_scripts.utils.generic import get_logger


class NiFiRegistryClient:

    def __init__(self, config: NiFiAPIConfig, healh_check_on_init: bool = True) -> None:
        self.config = config or NiFiAPIConfig()
        self.nipyapi_config = RegistryConfiguration()
        self.nipyapi_config.host = self.config.nifi_registry_api_url
        self.nipyapi_config.verify_ssl = self.config.verify_ssl
        self.nipyapi_config.cert_file = self.config.nifi_cert_pem_path # type: ignore
        self.nipyapi_config.key_file = self.config.nifi_cert_key_path # type: ignore
        self.nipyapi_config.ssl_ca_cert = self.config.root_cert_ca_path # type: ignore

        self.logger: Logger = get_logger(self.__class__.__name__)

        self.api_client = RegistryApiClient(self.nipyapi_config.host)
        self.buckets_api = BucketsApi(self.api_client)

    def list_buckets(self):
        buckets = self.buckets_api.get_buckets()
        for b in buckets:
            self.logger.info("Bucket: %s (%s)", b.name, b.identifier)
        return buckets

    def health_check(self, timeout: int = 15) -> NiFiHealth:
        start = time.perf_counter()
        nifi_health = NiFiHealth(
            service="nifi-registry",
            service_info=self.config.nifi_registry_base_url
        )

        try:
            response = requests.head(
                url=self.config.nifi_registry_base_url,
                auth=self.config.auth_credentials(),
                cert=self.config.get_nifi_ssl_certs_paths(),
                verify=self.config.root_cert_ca_path,
                timeout=timeout,
            )

            nifi_health.latency_ms = (time.perf_counter() - start) * 1000
            nifi_health.connected = response.ok

            if response.status_code == 200:
                nifi_health.status = "healthy"
                self.logger.info(f"✅ Logged in to NiFi Registry, latency {nifi_health.latency_ms:.2f} ms")
            else:
                nifi_health.status = "unhealthy"
                nifi_health.message = f"❌ Unexpected status code {response.status_code}"

        except Exception as exc:
            nifi_health.latency_ms = (time.perf_counter() - start) * 1000
            nifi_health.message = str(exc)
            self.logger.info("❌ Failed to log in to NiFi: %s", exc)

        return nifi_health

    
class NiFiClient:

    def __init__(self, config: NiFiAPIConfig, healh_check_on_init: bool = True) -> None:
        self.config = config or NiFiAPIConfig()
        self.nipyapi_config = NiFiConfiguration()
        self.nipyapi_config.host = self.config.nifi_api_url
        self.nipyapi_config.verify_ssl = self.config.verify_ssl
        self.nipyapi_config.cert_file = self.config.nifi_cert_pem_path # type: ignore
        self.nipyapi_config.key_file = self.config.nifi_cert_key_path # type: ignore
        self.nipyapi_config.ssl_ca_cert = self.config.root_cert_ca_path # type: ignore

        self.logger: Logger = get_logger(self.__class__.__name__)

        self.api_client = ApiClient(self.nipyapi_config)
        self.process_group_api = ProcessGroupsApi(self.api_client)

        if healh_check_on_init:
            self.health_check()

    def health_check(self) -> NiFiHealth:
        start = time.perf_counter()
        nifi_health = NiFiHealth(
            service="nifi",
            service_info=self.config.nifi_api_url
        )

        try:
            result = security.service_login(
                service='nifi',
                username=self.config.nifi_username,
                password=self.config.nifi_password
            )

            nifi_health.connected = bool(result)
            nifi_health.latency_ms = (time.perf_counter() - start) * 1000

            if result:
                nifi_health.status = "healthy"
                self.logger.info(f"✅ Logged in to NiFi, latency {nifi_health.latency_ms:.2f} ms")
            else:
                nifi_health.message = "Authentication returned False"
                self.logger.info("❌ Failed to log in to NiFi")

        except Exception as exc:
            nifi_health.message = str(exc)
            self.logger.info("❌ Failed to log in to NiFi: %s", exc)

        return nifi_health

    def get_root_process_group_id(self) -> str:
        return canvas.get_root_pg_id()

    def get_process_group_by_name(self, process_group_name: str) -> None | list[object] | object:
        return canvas.get_process_group(process_group_name, identifier_type="nam")
    
    def get_process_group_by_id(self, process_group_id: str) -> ProcessGroupEntity:
        return canvas.get_process_group(process_group_id, identifier_type="id")

    def start_process_group(self, process_group_id: str) -> bool:
        return canvas.schedule_process_group(process_group_id, True)
    
    def stop_process_group(self, process_group_id: str) -> bool:
        return canvas.schedule_process_group(process_group_id, False)

    def get_child_process_groups_from_parent_id(self, parent_process_group_id: str) -> list[ProcessGroupEntity]:
        parent_pg = canvas.get_process_group(parent_process_group_id, identifier_type="id")
        return canvas.list_all_process_groups(parent_pg.id)
    
    def get_all_processors_in_process_group(self, process_group_id: str) -> list[ProcessorEntity]:
        return canvas.list_all_processors(process_group_id)
