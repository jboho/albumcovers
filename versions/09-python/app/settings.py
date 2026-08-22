from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration sourced from the environment (and a local .env).

    The Last.fm API key lives here and never leaves the server: it is read from
    LASTFM_API_KEY and used only by the server-side proxy in app.api.
    """

    lastfm_api_key: str = ""
    lastfm_api_root: str = "https://ws.audioscrobbler.com/2.0/"
    lastfm_timeout_seconds: float = 10.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Cached settings accessor used as a FastAPI dependency."""
    return Settings()
