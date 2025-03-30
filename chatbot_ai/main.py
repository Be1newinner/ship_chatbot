from auth import register_user, login_user
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chatbot import chatter
from auth import get_current_user
from db import sessions_collection
from datetime import datetime
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatInput(BaseModel):
    input: str

# Function to get or create a session
def get_user_session(user_id: str):
    session = sessions_collection.find_one({"user_id": user_id})
    if not session:
        session_id = str(uuid.uuid4())
        sessions_collection.insert_one({"user_id": user_id, "session_id": session_id, "created_at": datetime.utcnow()})
        return session_id
    return session["session_id"]

@app.post("/chat")
def reply_bot(input_data: ChatInput, current_user: dict = Depends(get_current_user)):
    """API endpoint for chatbot responses with session tracking."""
    try:
        print("Current User",current_user)
        user_id = str(current_user["_id"])
        session_id = get_user_session(user_id)
        response = chatter(user_id, session_id, input_data.input)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "THE SHIPSAR CHAT BOT IS WORKING"}

class RegisterUser(BaseModel):
    username: str
    email: str
    password: str

class LoginUser(BaseModel):
    email: str
    password: str

@app.post("/register")
def register(user: RegisterUser):
    response = register_user(user.username, user.email, user.password)
    if "error" in response:
        raise HTTPException(status_code=400, detail=response["error"])
    return response

@app.post("/login")
def login(user: LoginUser):
    response = login_user(user.email, user.password)
    if "error" in response:
        raise HTTPException(status_code=400, detail=response["error"])
    return response
