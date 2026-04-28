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

async def create_product(db: AsyncSession, product_in) -> Product:
    product = Product(
        name=product_in.name,
        slug=product_in.slug,
        description=product_in.description,
        price=product_in.price,
        image=product_in.image,
        category_id=product_in.category_id
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    # Reload with category
    return await get_product_by_id(db, product.id)

async def update_product(db: AsyncSession, db_obj: Product, obj_in) -> Product:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return await get_product_by_id(db, db_obj.id)

async def delete_product(db: AsyncSession, product_id: int) -> bool:
    product = await get_product_by_id(db, product_id)
    if not product:
        return False
    await db.delete(product)
    await db.commit()
    return True
