from pydantic import BaseModel, Field


class PGConfig(BaseModel):
    host: str = Field(default="localhost")
    port: int = Field(default=5432)
    db: str = Field(default="samples_db")
    user: str = Field(default="test")
    password: str = Field(default="test")
    timeout: int = Field(default=50)
