from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import UserCreate, UserLogin
from app.core.security import verify_password, create_access_token
from app.crud import crud_user

router = APIRouter()

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "createdAt": current_user.created_at.isoformat() + "Z" if current_user.created_at else None
    }

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    existing_user = await crud_user.get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    user = await crud_user.create_user(db, user_in)
    token = create_access_token(subject=user.id)

    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name
        }
    }

@router.post("/login")
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await crud_user.get_user_by_email(db, user_in.email)

    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(user_in.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token(subject=user.id)

    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name
        }
    }
