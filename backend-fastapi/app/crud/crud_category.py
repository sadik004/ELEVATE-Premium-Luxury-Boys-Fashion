from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import Category

async def get_all_categories(db: AsyncSession) -> list[Category]:
    result = await db.execute(select(Category))
    return list(result.scalars().all())
