from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "ParkVision API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "development_secret_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    DATABASE_URL: str = "postgresql://user:password@db:5432/parkvision"
    
    class Config:
        env_file = ".env"

settings = Settings()
