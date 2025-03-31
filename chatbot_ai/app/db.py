from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from app.models.user import User
from app.models.chat import ChatHistory
from app.models.session import ChatSession

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

async def init_db():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.get_database("chatbot_db")
    await init_beanie(db, document_models=[User, ChatHistory, ChatSession])
