from pathlib import Path
from typing import Any

from pydantic import AliasChoices, Field, PositiveInt, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class DatabaseConfig(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="DATABASE_",
        env_file=[Path(__file__).resolve().parents[3] / "deploy" / "database.env",
            Path(__file__).resolve().parents[3] / "security" / "env" / "users_database.env",
        ],
        extra="ignore",
        env_ignore_empty=True,
        populate_by_name=True
    )

    host: str = Field(default="localhost", validation_alias=AliasChoices("POSTGRES_HOST"))
    port: int = Field(default=5432,validation_alias=AliasChoices("POSTGRES_PORT"), ge=1, le=65535)

    database_name : str = Field(default="db_samples", validation_alias=AliasChoices("DB", "DB_NAME"))
    username: str = Field(default="test", validation_alias=AliasChoices("POSTGRES_USER_SAMPLES", "POSTGRES_USER"))
    password: SecretStr = Field(default_factory=lambda: SecretStr("test"),
                                validation_alias=AliasChoices("POSTGRES_PASSWORD_SAMPLES", "POSTGRES_PASSWORD"))
    timeout: PositiveInt = Field(default=60, validation_alias=AliasChoices("TIMEOUT"))

    def get_field_values_kwargs(self) -> dict[str, Any]:
        return self.model_dump()
