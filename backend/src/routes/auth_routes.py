from fastapi import APIRouter, Response
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/auth", tags=["Auth"])

COOKIE_NAME = "guest_mode"


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


@router.post("/login")
def login(data: LoginSchema, response: Response):
    """
    Guest-mode compatibility endpoint.
    Authentication is removed from the project, so any login payload returns
    a local guest profile and sets a harmless cookie for old clients.
    """
    response.set_cookie(
        key=COOKIE_NAME,
        value="enabled",
        httponly=True,
        max_age=60 * 60 * 24,
        secure=False,
        samesite="lax",
    )
    return {
        "msg": "Guest mode enabled",
        "user_id": 0,
        "email": data.email,
        "name": "Local User",
        "is_verified": True,
        "provider": "guest",
        "avatar": None,
    }


@router.get("/me")
def me():
    return {
        "user_id": 0,
        "email": "guest@local",
        "name": "Local User",
        "is_verified": True,
        "provider": "guest",
        "avatar": None,
    }


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(COOKIE_NAME)
    return {"msg": "Guest mode disabled"}
