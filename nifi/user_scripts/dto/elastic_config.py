import json
from pathlib import Path

from pydantic import AliasChoices, Field, PositiveInt, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class ElasticConfig(BaseSettings):
    
    ROOT_DIR = Path(__file__).resolve().parents[3]
    CERT_ROOT_DIR = ROOT_DIR / "security" / "certificates" / "elastic"

    model_config = SettingsConfigDict(
        env_prefix="ELASTICSEARCH_",
        env_file=[ROOT_DIR / "deploy" / "elasticsearch.env",
          ROOT_DIR / "security" / "env" / "users_elasticsearch.env",
        ],
        extra="ignore",
        env_ignore_empty=True,
        populate_by_name=True
    )

    es_port_1: int = Field(validation_alias=AliasChoices("ELASTICSEARCH_NODE_1_OUTPUT_PORT"), ge=1, le=65535)
    es_port_2: int = Field(validation_alias=AliasChoices("ELASTICSEARCH_NODE_2_OUTPUT_PORT"), ge=1, le=65535)
    es_port_3: int = Field(validation_alias=AliasChoices("ELASTICSEARCH_NODE_3_OUTPUT_PORT"), ge=1, le=65535)

    hosts: list[str] = Field(default_factory=list)
    ports: list[int] = [es_port_1, es_port_2, es_port_3]
    timeout: int = Field(default=60)
    verify_ssl: bool = Field(default=False, validation_alias=AliasChoices("SSL_ENABLED"))
    user: str = Field(default="admin", validation_alias=AliasChoices("ELASTIC_USER"))
    password: SecretStr = Field(default_factory=lambda: SecretStr("test"),
                                validation_alias=AliasChoices("ELASTIC_PASSWORD", "OPENSEARCH_INITIAL_ADMIN_PASSWORD"))
    
    root_cert_ca_path = (CERT_ROOT_DIR / "opensearch/elasticsearch/" / "elastic-stack-ca.crt.pem").as_posix()
    elastic_node_cert_key_path = (CERT_ROOT_DIR / "elastic" / 
                                "opensearch/elasticsearch/elasticsearch-1/elasticsearch-1.key").as_posix()
    elastic_node_cert_pem_path = (CERT_ROOT_DIR / "elastic" / 
                                "opensearch/elasticsearch/elasticsearch-1/elasticsearch-1.crt").as_posix()

    @field_validator("hosts", mode="before")
    def parse_list(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

  # def client_kwargs(self) -> dict[str, Any]:
  #     """
  #     Connection kwargs ready for elasticsearch client constructors.
  #     """
  #     return {
  #         "hosts": self.hosts,
  #         "basic_auth": (self.user, self.password.get_secret_value()),
  #         "verify_certs": self.verify_ssl,
  #         "ca_certs": self.ca_cert_path,
  #         "request_timeout": self.timeout,
  #     }
