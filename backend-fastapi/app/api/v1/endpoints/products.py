from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.session import get_db
from app.schemas.schemas import ProductResponse
from fastapi_cache.decorator import cache
from app.crud import crud_product

router = APIRouter()

@router.get("/", response_model=List[ProductResponse])
@cache(expire=60)
async def get_products(db: AsyncSession = Depends(get_db)):
    try:
        products = await crud_product.get_all_products(db)
        return products
    except Exception as e:
        print(f"GET /products error: {e}")
        return []

@router.get("/{slugOrId}", response_model=ProductResponse)
async def get_product(slugOrId: str = Path(...), db: AsyncSession = Depends(get_db)):
    try:
        is_id = slugOrId.isdigit()

        if is_id:
            product = await crud_product.get_product_by_id(db, int(slugOrId))
        else:
            product = await crud_product.get_product_by_slug(db, slugOrId)

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        return product
    except HTTPException:
        raise
    except Exception as e:
        print(f"GET /products/:id error: {e}")
        raise HTTPException(status_code=404, detail="Product not found")
