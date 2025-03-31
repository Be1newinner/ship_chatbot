from transformers import pipeline
from app.utils.chatbot import ChatService
from fastapi import HTTPException
from app.models.chat import ChatHistory

async def generate_response(session_id: str, user_id: str, msg: str):
     # API endpoint for chatbot responses with session tracking. 
    try:
        chat_service = ChatService()
        response = await chat_service.process_message(session_id, user_id, msg)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def fetch_history_service(user_id: str, page: int, page_size: int):
    try:
        skip = (page - 1) * page_size

        messages = await ChatHistory.find({"user_id": user_id}).skip(skip).limit(page_size).to_list()

        total_chats = await ChatHistory.find({"user_id": user_id}).count()

        return {
            "message": "Chats for this session retrieved successfully!",
            "page": page,
            "page_size": page_size,
            "total_chats": total_chats,
            "data": messages
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
