from beanie import Document, PydanticObjectId
from pydantic import EmailStr, BaseModel
from datetime import datetime, timezone
from typing import Optional

class User(Document):
    id: Optional[PydanticObjectId] = None
    username: str
    email: EmailStr
    password: str
    role: str = "user"
    created_at: datetime = Optional[datetime.now(timezone.utc)]

    class Config:  
        collection = "users"

class LoginUser(BaseModel):
    email: str
    password: str