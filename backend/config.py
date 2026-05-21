from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_key: str = ""
    supabase_service_key: str = ""
    supabase_jwt_secret: str = ""   # Supabase Dashboard → Settings → API → JWT Secret
    secret_key: str = "dev-secret-key-change-in-production"
    frontend_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
