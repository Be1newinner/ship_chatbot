from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.db import init_db
from app.routes import auth, chat, admin
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()  
    yield  
    
app = FastAPI(lifespan=lifespan)

# ✅ Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(chat.router)

@app.get("/")
def root():
    return {"message": "Chatbot API is Running"}
