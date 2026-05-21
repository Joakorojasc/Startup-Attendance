from fastapi import APIRouter, Depends
from dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return {
        "sub": user.get("sub"),
        "email": user.get("email"),
        "role": user.get("role", "authenticated"),
    }
