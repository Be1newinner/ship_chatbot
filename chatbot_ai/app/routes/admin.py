from fastapi import APIRouter, Query, Depends
from beanie import PydanticObjectId
from app.utils.security import admin_required
from app.services.admin_service import (
    fetch_chat_messages,
    fetch_all_chats,
    fetch_all_users,
    count_total_users,
    count_total_sessions
)

router = APIRouter(prefix="/admin", tags=["ADMIN"])

# ✅ 1. Fetch all messages from a specific session (ADMIN-ONLY)
@router.get("/chat/{session_id}")
async def get_chat_messages(
    session_id: PydanticObjectId,
    current_user: dict = Depends(admin_required),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100)
):
    return await fetch_chat_messages(session_id, page, page_size)

# ✅ 2. Fetch all chat sessions (ADMIN-ONLY)
@router.get("/all-chats")
async def read_all_chats(
    current_user: dict = Depends(admin_required),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100)
):
    return await fetch_all_chats(page, page_size)

# ✅ 3. Fetch all users (ADMIN-ONLY)
@router.get("/all-users")
async def get_all_users(
    current_user: dict = Depends(admin_required),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100)
):
    return await fetch_all_users(page, page_size)

# ✅ 4. Count users (ADMIN-ONLY)
@router.get("/count/users")
async def count_users(current_user: dict = Depends(admin_required)):
    return await count_total_users()

# ✅ 5. Count sessions (ADMIN-ONLY)
@router.get("/count/sessions")
async def count_sessions(current_user: dict = Depends(admin_required)):
    return await count_total_sessions()
