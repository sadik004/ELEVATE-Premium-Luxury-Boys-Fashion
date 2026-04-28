from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.session import get_db
from app.schemas.schemas import CategoryResponse
from app.crud import crud_category
from fastapi_cache.decorator import cache

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
@cache(expire=60)
async def get_categories(db: AsyncSession = Depends(get_db)):
    categories = await crud_category.get_all_categories(db)
    return categories
