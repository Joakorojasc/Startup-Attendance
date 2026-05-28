import secrets
import string
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from dependencies.auth import get_current_user
from database import get_supabase

router = APIRouter(prefix="/users", tags=["users"])


def _app_role(user: dict) -> str:
    return (user.get("user_metadata") or {}).get("role", "viewer")


def require_owner(user: dict = Depends(get_current_user)):
    if _app_role(user) != "owner":
        raise HTTPException(status_code=403, detail="Solo el dueño puede gestionar usuarios")
    return user


class CreateUserBody(BaseModel):
    email: str
    role: str
    name: str | None = None


@router.get("")
async def list_users(_: dict = Depends(require_owner)):
    client = get_supabase()
    result = client.auth.admin.list_users()
    return [
        {
            "id": u.id,
            "email": u.email,
            "role": (u.user_metadata or {}).get("role", "viewer"),
            "name": (u.user_metadata or {}).get("name"),
            "created_at": str(u.created_at),
        }
        for u in result
    ]


@router.post("")
async def create_user(body: CreateUserBody, _: dict = Depends(require_owner)):
    if body.role not in ("owner", "admin", "viewer"):
        raise HTTPException(status_code=400, detail="Rol inválido")
    temp_pw = "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(10))
    client = get_supabase()
    try:
        result = client.auth.admin.create_user({
            "email": body.email,
            "password": temp_pw,
            "email_confirm": True,
            "user_metadata": {
                "role": body.role,
                "name": body.name or body.email.split("@")[0],
            },
        })
        return {
            "id": result.user.id,
            "email": result.user.email,
            "role": body.role,
            "temp_password": temp_pw,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{user_id}")
async def delete_user(user_id: str, _: dict = Depends(require_owner)):
    client = get_supabase()
    try:
        client.auth.admin.delete_user(user_id)
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
