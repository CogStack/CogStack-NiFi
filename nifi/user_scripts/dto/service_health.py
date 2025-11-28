from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class ServiceHealth(BaseModel):
    """
        Base health check model shared by all services.
    """

    service: str = Field(..., description="Service name, e.g. NiFi, PostgreSQL, OpenSearch/ElasticSearch, etc.")
    status: Literal["healthy", "unhealthy", "degraded"] = Field(description="Current service status",
                                                                default="unhealthy")
    
    message: str | None = Field(default=None, description="Optional status message")
    timestamp: datetime | None = Field(default_factory=datetime.now)
    avg_processing_ms: float | None = Field(default=None)
    service_info: str | None = Field(default=None)
    connected: bool = Field(default=False)
    latency_ms: float = Field(default=0.0, description="Ping latency in milliseconds")

    class Config:
        extra = "ignore"

class MLServiceHealth(ServiceHealth):
    model_name: str | None = Field(None, description="Name of the ML model")
    model_version: str | None = Field(None, description="Version of the ML model")
    model_card: str | None = Field(None, description="URL or path to the model card")

class NiFiHealth(ServiceHealth):
    active_threads: int | None = Field(default=None, description="Number of active threads")
    queued_bytes: int | None = Field(default=None, description="Total queued bytes")
    queued_count: int | None = Field(default=None, description="Number of queued flowfiles")

class ElasticsearchHealth(ServiceHealth):
    cluster_status: str | None = Field(None, description="Cluster health status")
    node_count: int | None = Field(None)
    active_shards: int | None = Field(None)

class DatabaseHealth(ServiceHealth):
    version: str | None = Field(None, description="Database version, e.g PgSQL 17, MSSQL 21, etc.")
    db_name: str | None = Field(None, description="Database name")

class MedCATTrainerHealth(ServiceHealth):
    """Health check model for MedCAT Trainer web service."""
    app_version: str | None = Field(None, description="MedCAT Trainer app version")

class CogstackCohortHealth(ServiceHealth):
    """Health check model for CogStack Cohort service."""
    pass
