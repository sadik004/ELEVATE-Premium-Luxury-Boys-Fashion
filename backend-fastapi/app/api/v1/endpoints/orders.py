from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.models import User
from app.api.deps import get_current_user
from app.schemas.schemas import OrderCreate
from app.crud import crud_order

router = APIRouter()

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    created_order = await crud_order.create_order(db, current_user.id, order_in)

    return {
        "id": created_order.id,
        "userId": created_order.user_id,
        "total": created_order.total,
        "status": created_order.status,
        "createdAt": created_order.created_at.isoformat() + "Z" if created_order.created_at else None,
        "updatedAt": created_order.updated_at.isoformat() + "Z" if created_order.updated_at else None,
        "items": [
            {
                "id": i.id,
                "orderId": i.order_id,
                "productId": i.product_id,
                "quantity": i.quantity,
                "price": i.price
            } for i in created_order.items
        ]
    }

@router.get("/")
async def get_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    orders = await crud_order.get_user_orders(db, current_user.id)

    response = []
    for order in orders:
        items = []
        for item in order.items:
            items.append({
                "id": item.id,
                "orderId": item.order_id,
                "productId": item.product_id,
                "quantity": item.quantity,
                "price": item.price,
                "product": {
                    "id": item.product.id,
                    "name": item.product.name,
                    "slug": item.product.slug,
                    "description": item.product.description,
                    "price": item.product.price,
                    "image": item.product.image,
                    "categoryId": item.product.category_id,
                    "createdAt": item.product.created_at.isoformat() + "Z" if item.product.created_at else None,
                    "updatedAt": item.product.updated_at.isoformat() + "Z" if item.product.updated_at else None,
                    "category": {
                        "id": item.product.category.id,
                        "name": item.product.category.name,
                        "slug": item.product.category.slug,
                        "createdAt": item.product.category.created_at.isoformat() + "Z" if item.product.category.created_at else None,
                        "updatedAt": item.product.category.updated_at.isoformat() + "Z" if item.product.category.updated_at else None,
                    }
                }
            })

        response.append({
            "id": order.id,
            "userId": order.user_id,
            "total": order.total,
            "status": order.status,
            "createdAt": order.created_at.isoformat() + "Z" if order.created_at else None,
            "updatedAt": order.updated_at.isoformat() + "Z" if order.updated_at else None,
            "items": items
        })

    return response
