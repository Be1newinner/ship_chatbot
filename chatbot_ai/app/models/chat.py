from beanie import Document
from datetime import datetime
from pydantic import BaseModel

class ChatHistory(Document):
    session_id: str
    user_id: str
    message: str
    response: str
    timestamp: datetime = datetime.utcnow()

    class Config:
        collection = "chat_history"
