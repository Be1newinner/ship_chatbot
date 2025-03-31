from app.models.user import User
from app.utils.security import hash_password, verify_password, generate_token

async def register_user(username: str, email: str, password: str):
    if await User.find_one(User.email == email):
        return {"error": "Email already registered"}
    
    user = User(username=username, email=email, password=hash_password(password))
    await user.insert()
    return {"message": "User registered successfully"}

async def login_user(email: str, password: str):
    user = await User.find_one(User.email == email)
    if not user or not verify_password(password, user.password):
        return {"error": "Invalid credentials"}
    
    token = generate_token(str(user.id), user.role)
    return {"message": "Login successful", "token": token, "data": {"id": str(user.id), "email": user.email}}
