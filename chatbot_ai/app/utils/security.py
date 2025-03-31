import bcrypt
import jwt
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from beanie import PydanticObjectId
from app.models.session import ChatSession
from app.models.user import User
from pydantic import BaseModel
# from bson import ObjectId

load_dotenv()
security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt).decode()

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed_password.encode())

def generate_token(user_id: str, role: str) -> str:
    payload = {"user_id": user_id, "exp": datetime.utcnow() + timedelta(days=1), "role": role}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        user = await User.get(payload["user_id"])
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Decode JWT token
def decode_token(token: str):
    try:
        # print(token)
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ✅ Function to get or create a session using Beanie
async def get_user_session(user_id: PydanticObjectId):
    session = await ChatSession.find_one(ChatSession.user_id == str(user_id))
    
    if not session:
        new_session = ChatSession(user_id=str(user_id), created_at=datetime.utcnow())
        await new_session.insert()
        return new_session.id  # Beanie automatically generates an ObjectId
    
    return session.id

class UserView(BaseModel):
    # id: ObjectId
    role: str

    class Settings:
        projection = {"id": 1, "role": 1}


# ✅ ADMIN-ONLY Middleware using Beanie
async def admin_required(current_user: dict = Depends(get_current_user)):
    print(current_user.id)
    user = await User.find_one(User.id == current_user.id).project(UserView)
   
    print(user)
    
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can access this resource.")
    # return current_user
    return current_user
