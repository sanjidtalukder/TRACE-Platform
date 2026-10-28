from typing import Optional, List, Union, Any
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "TRACE server"
    PROJECT_VERSION: str = "0.1.0"

    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    SECRET_KEY: str = "trace_dev_secret_key_change_in_production_32bytes_min"

    # CORS Origins (configurable via environment variable)
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://traceclient-production.up.railway.app",
        "*"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            if v.strip() == "*":
                return ["*"]
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # Database URL
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/trace_db"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def parse_database_url(cls, v: Any) -> str:
        if isinstance(v, str) and v.count("@") > 1:
            prefix, host_db = v.rsplit("@", 1)
            if "://" in prefix:
                scheme, user_pass = prefix.split("://", 1)
                if ":" in user_pass:
                    user, password = user_pass.split(":", 1)
                    import urllib.parse
                    encoded_pw = urllib.parse.quote(urllib.parse.unquote(password))
                    return f"{scheme}://{user}:{encoded_pw}@{host_db}"
        return v

    # Supabase Credentials (SERVER ONLY)
    SUPABASE_URL: str = "https://your-project.supabase.co"
    SUPABASE_ANON_KEY: str = "your-supabase-anon-key"
    SUPABASE_PUBLISHABLE_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: str = "your-supabase-service-role-key"
    SUPABASE_SECRET_KEY: Optional[str] = None
    SUPABASE_JWKS_URL: Optional[str] = None

    # NASA / Earthdata Configuration (SERVER ONLY)
    EARTHDATA_USERNAME: Optional[str] = None
    EARTHDATA_PASSWORD: Optional[str] = None
    EARTHDATA_TOKEN: Optional[str] = None
    CMR_BASE_URL: str = "https://cmr.earthdata.nasa.gov"
    ASF_API_BASE_URL: str = "https://api.daac.asf.alaska.edu"
    FIRMS_MAP_KEY: Optional[str] = None
    FIRMS_BASE_URL: str = "https://firms.modaps.eosdis.nasa.gov/api"

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
