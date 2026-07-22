from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://blackbox:blackbox@localhost:5432/blackbox"
    redis_url: str = "redis://localhost:6379/0"
    anthropic_api_key: str = ""
    methodology_version: str = "v1"


settings = Settings()
