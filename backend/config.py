from pathlib import Path
from pydantic_settings import BaseSettings

_HERE = Path(__file__).parent


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    model_config = {"env_file": str(_HERE / ".env"), "extra": "ignore"}


settings = Settings()
