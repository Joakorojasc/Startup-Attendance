import urllib.request
import json
from fastapi import Header, HTTPException, status
from jose import jwt, JWTError
from jose.backends import ECKey
from config import settings

_jwks_cache: list | None = None

def _get_jwks_key():
    global _jwks_cache
    if _jwks_cache is None:
        url = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
        with urllib.request.urlopen(url) as r:
            _jwks_cache = json.loads(r.read())["keys"]
    return _jwks_cache[0]


async def get_current_user(authorization: str = Header(default=None)) -> dict:
    if not settings.supabase_url.strip():
        return {"sub": "dev-user", "email": "dev@localhost", "role": "authenticated", "user_metadata": {"role": "owner"}}

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación requerido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization[7:]
    try:
        jwk = _get_jwks_key()
        key = ECKey(jwk, algorithm=jwk.get("alg", "ES256"))
        payload = jwt.decode(
            token,
            key,
            algorithms=[jwk.get("alg", "ES256")],
            options={"verify_aud": False},
        )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
