from logging import Logger
from typing import List  # noqa: UP035

from dto.nifi_api_config import NiFiAPIConfig
from nipyapi import canvas, security
from nipyapi.nifi import ApiClient, ProcessGroupsApi
from nipyapi.nifi.configuration import Configuration as NiFiConfiguration
from nipyapi.nifi.models.process_group_entity import ProcessGroupEntity
from nipyapi.nifi.models.processor_entity import ProcessorEntity
from nipyapi.registry import ApiClient as RegistryApiClient
from nipyapi.registry import BucketsApi
from nipyapi.registry.configuration import Configuration as RegistryConfiguration
from utils.helpers.logging import get_logger


class NiFiRegistryClient:
    def __init__(self, config: NiFiAPIConfig) -> None:
        self.config = config or NiFiAPIConfig()
        self.nipyapi_config = RegistryConfiguration()
        self.nipyapi_config.host = self.config.nifi_registry_api_url
        self.nipyapi_config.verify_ssl = self.config.VERIFY_SSL
        self.nipyapi_config.cert_file = self.config.NIFI_CERT_PEM_PATH # type: ignore
        self.nipyapi_config.key_file = self.config.NIFI_CERT_KEY_PATH # type: ignore
        self.nipyapi_config.ssl_ca_cert = self.config.ROOT_CERT_CA_PATH # type: ignore

        self.logger: Logger = get_logger(self.__class__.__name__)

        self.api_client = RegistryApiClient(self.nipyapi_config.host)
        self.buckets_api = BucketsApi(self.api_client)

    def list_buckets(self):
        buckets = self.buckets_api.get_buckets()
        for b in buckets:
            self.logger.info("Bucket: %s (%s)", b.name, b.identifier)
        return buckets


class NiFiClient:
    def __init__(self, config: NiFiAPIConfig) -> None:
        self.config = config or NiFiAPIConfig()
        self.nipyapi_config = NiFiConfiguration()
        self.nipyapi_config.host = self.config.nifi_api_url
        self.nipyapi_config.verify_ssl = self.config.VERIFY_SSL
        self.nipyapi_config.cert_file = self.config.NIFI_CERT_PEM_PATH # type: ignore
        self.nipyapi_config.key_file = self.config.NIFI_CERT_KEY_PATH # type: ignore
        self.nipyapi_config.ssl_ca_cert = self.config.ROOT_CERT_CA_PATH # type: ignore

        self.logger: Logger = get_logger(self.__class__.__name__)

        self.api_client = ApiClient(self.nipyapi_config)
        self.process_group_api = ProcessGroupsApi(self.api_client)

        self._login()

    def _login(self) -> None:
        security.service_login(
            service='nifi',
            username=self.config.NIFI_USERNAME,
            password=self.config.NIFI_PASSWORD
        )
        self.logger.info("✅ Logged in to NiFi")

    def get_root_process_group_id(self) -> str:
        return canvas.get_root_pg_id()

    def get_process_group_by_name(self, process_group_name: str) -> None | List[object] | object:
        return canvas.get_process_group(process_group_name, identifier_type="nam")
    
    def get_process_group_by_id(self, process_group_id: str) -> ProcessGroupEntity:
        return canvas.get_process_group(process_group_id, identifier_type="id")

    def start_process_group(self, process_group_id: str) -> bool:
        return canvas.schedule_process_group(process_group_id, True)
    
    def stop_process_group(self, process_group_id: str) -> bool:
        return canvas.schedule_process_group(process_group_id, False)

    def get_child_process_groups_from_parent_id(self, parent_process_group_id: str) -> List[ProcessGroupEntity]:
        parent_pg = canvas.get_process_group(parent_process_group_id, identifier_type="id")
        return canvas.list_all_process_groups(parent_pg.id)
    
    def get_all_processors_in_process_group(self, process_group_id: str) -> List[ProcessorEntity]:
        return canvas.list_all_processors(process_group_id)
