from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.db import init_db
from app.routes import auth, chat, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()  
    yield  
    
app = FastAPI(lifespan=lifespan)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(chat.router)

@app.get("/")
def root():
    return {"message": "Chatbot API is Running"}
