from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.models import Product

async def get_all_products(db: AsyncSession) -> list[Product]:
    result = await db.execute(select(Product).options(selectinload(Product.category)))
    return list(result.scalars().all())

async def get_product_by_id(db: AsyncSession, product_id: int) -> Product | None:
    stmt = select(Product).options(selectinload(Product.category)).where(Product.id == product_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def get_product_by_slug(db: AsyncSession, slug: str) -> Product | None:
    stmt = select(Product).options(selectinload(Product.category)).where(Product.slug == slug)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()
