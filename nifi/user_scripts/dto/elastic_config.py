import json
from pathlib import Path
from typing import ClassVar

from pydantic import AliasChoices, Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class ElasticConfig(BaseSettings):
    
    ROOT_DIR: ClassVar = Path(__file__).resolve().parents[3]
    CERT_ROOT_DIR: ClassVar = ROOT_DIR / "security" / "certificates" / "elastic"

    model_config = SettingsConfigDict(
        env_prefix="ELASTICSEARCH_",
        env_file=[ROOT_DIR / "deploy" / "elasticsearch.env",
          ROOT_DIR / "security" / "env" / "users_elasticsearch.env",
        ],
        extra="ignore",
        env_ignore_empty=True,
        populate_by_name=True
    )

    elasticsearch_version: str = Field(default="opensearch", validation_alias=AliasChoices("VERSION"))
    kibana_version: str = Field(default="opensearch-dashboards", validation_alias=AliasChoices("KIBANA_VERSION"))

    es_port_1: int = Field(default=9200, 
                                    validation_alias=AliasChoices("ELASTICSEARCH_NODE_1_OUTPUT_PORT"), ge=1, le=65535)
    es_port_2: int = Field(default=9201, 
                                    validation_alias=AliasChoices("ELASTICSEARCH_NODE_2_OUTPUT_PORT"), ge=1, le=65535)
    es_port_3: int = Field(default=9202, 
                                    validation_alias=AliasChoices("ELASTICSEARCH_NODE_3_OUTPUT_PORT"), ge=1, le=65535)

    kibana_host: str = Field(default="https://localhost:5601",
                                    validation_alias=AliasChoices("KIBANA_HOST", "kibana_host"))
    
    kibana_port: int = Field(default=5601,
                                    validation_alias=AliasChoices("KIBANA_SERVER_OUTPUT_PORT"), ge=1, le=65535)

    hosts: list[str] = Field(default_factory=list)
    timeout: int = Field(default=60)
    verify_ssl: bool = Field(default=False, validation_alias=AliasChoices("SSL_ENABLED", "ELASTICSEARCH_SSL_ENABLED"))
    user: str = Field(default="admin", validation_alias=AliasChoices("ELASTIC_USER"))
    password: SecretStr = Field(default_factory=lambda: SecretStr("admin"),
                                validation_alias=AliasChoices("ELASTIC_PASSWORD",
                                                              "password",
                                                              "ELASTICSEARCH_PASSWORD",
                                                              "OPENSEARCH_INITIAL_ADMIN_PASSWORD"))
    
    elastic_root_cert_ca_path: ClassVar = (CERT_ROOT_DIR / "opensearch" / "elastic-stack-ca.crt.pem").as_posix()
    elastic_node_cert_key_path: ClassVar = (CERT_ROOT_DIR / "opensearch" / 
                                "elasticsearch/elasticsearch-1/elasticsearch-1.key").as_posix()
    elastic_node_cert_pem_path: ClassVar = (CERT_ROOT_DIR / "opensearch" / 
                                "elasticsearch/elasticsearch-1/elasticsearch-1.crt").as_posix()
    
    kibana_client_cert_key_path: ClassVar = (CERT_ROOT_DIR / "opensearch" / "es_kibana_client.key").as_posix()
    kibana_client_cert_pem_path: ClassVar = (CERT_ROOT_DIR / "opensearch" / "es_kibana_client.pem").as_posix()

    @field_validator("hosts", mode="before")
    def parse_list(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    @property
    def ports(self) -> list[int]:
        return [self.es_port_1, self.es_port_2, self.es_port_3]

    def auth_credentials(self) -> tuple[str, str]:
        """convenience for requests auth=(user, password)."""
        return (self.user, self.password.get_secret_value())
    
    def get_ssl_certs_paths(self) -> tuple[str, str]:
        """convenience for requests cert=(cert_path, key_path)."""
        return (self.elastic_node_cert_pem_path, self.elastic_node_cert_key_path)

    def get_kibana_ssl_certs_path(self) -> tuple[str, str]:
        return (self.kibana_client_cert_pem_path, self.kibana_client_cert_key_path)