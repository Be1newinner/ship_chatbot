from fastapi import APIRouter
from app.services.auth_service import register_user, login_user
from app.models.user import LoginUser, RegisterUser

router = APIRouter(prefix="/auth", tags=["AUTH"])

@router.post("/register")
async def register(user: RegisterUser):
    return await register_user(user.username, user.email, user.password)

@router.post("/login")
async def login(user: LoginUser):
    return await login_user(user.email, user.password)
