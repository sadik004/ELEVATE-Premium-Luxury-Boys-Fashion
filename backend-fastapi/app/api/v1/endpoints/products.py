from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.api.deps import get_db, get_current_admin
from app.schemas.schemas import ProductResponse, ProductCreate, ProductUpdate
from fastapi_cache.decorator import cache
from app.crud import crud_product
from app.models.models import User

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

@router.post("/", response_model=ProductResponse)
async def create_product(
    product_in: ProductCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return await crud_product.create_product(db, product_in)

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

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    product = await crud_product.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return await crud_product.update_product(db, product, product_in)

@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    success = await crud_product.delete_product(db, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}
