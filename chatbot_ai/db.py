from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["chatbot_db"]
users_collection = db["users"]
sessions_collection = db["sessions"]
chat_history_collection = db["chat_history"]
activity_log_collection = db["activity_log"]
