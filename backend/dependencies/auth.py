from fastapi import Header, HTTPException, status
from jose import jwt, JWTError
from config import settings


async def get_current_user(authorization: str = Header(default=None)) -> dict:
    # Dev mode: if JWT secret not configured, skip auth
    if not settings.supabase_jwt_secret:
        return {"sub": "dev-user", "email": "dev@localhost", "role": "admin"}

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación requerido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization[7:]
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
