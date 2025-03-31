from beanie import PydanticObjectId
from app.models.chat import ChatHistory
from app.models.session import ChatSession
from app.models.user import User

async def fetch_chat_messages(session_id: PydanticObjectId, page: int, page_size: int):
    # Fetch all messages from a specific chat session
    skip = (page - 1) * page_size
    messages = await ChatHistory.find(ChatHistory.session_id == str(session_id)).skip(skip).limit(page_size).to_list()
    total_chats = await ChatHistory.find(ChatHistory.session_id == str(session_id)).count()

    return {
        "message": f"Chats for session {session_id} retrieved successfully!",
        "page": page,
        "page_size": page_size,
        "total_chats": total_chats,
        "data": messages
    }

async def fetch_all_chats(page: int, page_size: int):
    # Fetch all chat sessions.
    skip = (page - 1) * page_size
    sessions = await ChatSession.find_all().skip(skip).limit(page_size).to_list()
    total_sessions = await ChatSession.find_all().count()

    return {
        "message": "Session list retrieved successfully!",
        "page": page,
        "page_size": page_size,
        "total_sessions": total_sessions,
        "data": sessions
    }

async def fetch_all_users(page: int, page_size: int):
    # Fetch all users (excluding sensitive fields).
    skip = (page - 1) * page_size
    users = await User.find_all().skip(skip).limit(page_size).project(User.username, User.email, User.role).to_list()
    total_users = await User.find_all().count()

    return {
        "message": "User list retrieved successfully!",
        "page": page,
        "page_size": page_size,
        "total_users": total_users,
        "data": users
    }

async def count_total_users():
    # Count total number of users.
    total_users = await User.find_all().count()
    return {"total_users": total_users}

async def count_total_sessions():
    # Count total number of chat sessions.
    total_sessions = await ChatSession.find_all().count()
    return {"total_sessions": total_sessions}
