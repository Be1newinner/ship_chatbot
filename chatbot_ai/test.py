
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import uuid
import bcrypt
import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId  # Import this
from pymongo import MongoClient
import torch
from transformers import pipeline
from datetime import datetime

MONGO_URI = "mongodb+srv://be1newinner:0r9v0ercEMINIJfK@cluster0.y2mqe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

client = MongoClient(MONGO_URI)
db = client["chatbot_db"]
users_collection = db["users"]
sessions_collection = db["sessions"]
chat_history_collection = db["chat_history"]
activity_log_collection = db["activity_log"]

# Ensure GPU is available
if not torch.cuda.is_available():
    raise RuntimeError("No GPU found! Please enable GPU in runtime settings.")

pipe = pipeline(
    "text-generation",
    model="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
    torch_dtype=torch.bfloat16,  
    device_map="auto"  # ✅ Correct way to use GPU
)

def clean_response(response_text):
    # Removes unwanted system, user, and assistant tags from the response.
    response_text = response_text.split("<|assistant|>")[-1]
    return response_text 

def chatter(user_id: str, session_id: str, msg: str):
    # Generate a chatbot response with context from previous messages.

    # Fetch last 10 messages
    past_chats = list(chat_history_collection.find(
        {"session_id": session_id}).sort("timestamp", -1).limit(10)
    )

    messages = [{"role": "system", "content": "You are a friendly chatbot."}]
    
    # Add past messages to maintain context
    for chat in reversed(past_chats):
        messages.append({"role": "user", "content": chat["message"]})
        messages.append({"role": "assistant", "content": chat["response"]})

    # Append the new user message
    messages.append({"role": "user", "content": msg})

    # Generate prompt for model
    prompt = pipe.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)

    # Generate response
    outputs = pipe(prompt, max_new_tokens=150, do_sample=True, temperature=0.7, top_k=50, top_p=0.95)
    raw_response = outputs[0]["generated_text"]
    
    # Clean the response
    cleaned_response = clean_response(raw_response)

    # Save to database
    chat_data = {
        "session_id": session_id,
        "user_id": user_id,
        "message": msg,
        "response": cleaned_response,
        "timestamp": datetime.utcnow()
    }
    chat_history_collection.insert_one(chat_data)

    return {"assistant": cleaned_response}

security = HTTPBearer()
SECRET_KEY = "default_secret_key"

# Hash password before storing
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

# Verify hashed password
def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

# Generate JWT Token
def generate_token(user_id: str) -> str:
    payload = {"user_id": user_id, "exp": datetime.utcnow() + timedelta(days=1)}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

# Register user
def register_user(username: str, email: str, password: str):
    if users_collection.find_one({"email": email}):
        return {"error": "Email already registered"}
    
    hashed_pw = hash_password(password)
    user_data = {
        "username": username,
        "email": email,
        "password": hashed_pw,
        "created_at": datetime.utcnow()
    }
    users_collection.insert_one(user_data)
    return {"message": "User registered successfully"}


# Login User
def login_user(email: str, password: str):
    user = users_collection.find_one({"email": email})
    
    if not user or not verify_password(password, user["password"]):
        return {"error": "Invalid credentials"}

    token = generate_token(str(user["_id"]))
    return {"message": "Login successful", "token": token}

# Decode JWT token
def decode_token(token: str):
    try:
        print(token)
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Get the current user
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    # print("GET CURRENT USER => ",token)
    payload = decode_token(token)
    print("payload", payload)
    user = users_collection.find_one({"_id": ObjectId(payload["user_id"])})
    print(user)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


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
    # API endpoint for chatbot responses with session tracking.
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


