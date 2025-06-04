from beanie import Document, PydanticObjectId
from pydantic import EmailStr, BaseModel, Field
from datetime import datetime, timezone
from typing import Optional

class User(Document):
    id: Optional[PydanticObjectId] = None
    username: str
    email: EmailStr
    password: str
    role: str = Field(default="user", frozen=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), frozen=True)

    class Setting:
        collection = "User"
        
    @classmethod
    async def create_user(cls, user_data: dict):
        """Ensure role & created_at before inserting into DB"""
        user = cls(**user_data)
        user.role = "user"
        user.created_at = datetime.now(timezone.utc)
        return await user.insert()

class RegisterUser(BaseModel):
    email: str
    username: str
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "be1newinner",
                "email": "be1newinner@gmail.com",
                "password": "vijay123"
            }
        }

class LoginUser(BaseModel):
    email: str
    password: str
