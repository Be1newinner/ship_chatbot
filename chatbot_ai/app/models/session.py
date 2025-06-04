from beanie import Document
from datetime import datetime

class ChatSession(Document):
    user_id: str
    created_at: datetime = datetime.utcnow()

    class Setting:
        collection = "sessions"
