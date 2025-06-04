from beanie import Document
from datetime import datetime

class ChatHistory(Document):
    session_id: str
    user_id: str
    message: str
    response: str
    timestamp: datetime = datetime.now()

    class Setting:
        collection = "chat_history"
