from fastapi import APIRouter, Depends, Query
from app.services.chat_service import generate_response, fetch_history_service
from app.utils.security import get_current_user

router = APIRouter(prefix="/chat", tags=["CHAT"])

@router.post("/")
async def chat(user_input: str, current_user=Depends(get_current_user)):
    # API endpoint for generating chatbot. 
    return await generate_response(session_id="dummy_session", user_id=str(current_user.id), msg=user_input)
  
@router.get("/")
async def fetch_history(
    current_user: dict = Depends(get_current_user),       
    page: int = Query(1, alias="page", ge=1),
    page_size: int = Query(10, alias="page_size", ge=1, le=100)):
    # print(current_user.id)
    # API endpoint for chatbot history. 
    return await fetch_history_service(str(current_user.id), page,page_size)