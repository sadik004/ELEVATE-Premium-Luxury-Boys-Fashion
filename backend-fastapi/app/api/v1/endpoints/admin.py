from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.api.deps import get_current_admin, get_db
from app.models.models import User, Product, Order, Payment
from app.schemas.schemas import UserResponse, OrderResponse

router = APIRouter()

@router.get("/stats")
async def get_admin_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    # Total Revenue (only PAID orders)
    revenue_result = await db.execute(
        select(func.sum(Order.total)).where(Order.status == "PAID")
    )
    total_revenue = revenue_result.scalar() or 0.0

    # Total Orders
    orders_count_result = await db.execute(select(func.count(Order.id)))
    total_orders = orders_count_result.scalar() or 0

    # Total Users
    users_count_result = await db.execute(select(func.count(User.id)))
    total_users = users_count_result.scalar() or 0

    # Total Products
    products_count_result = await db.execute(select(func.count(Product.id)))
    total_products = products_count_result.scalar() or 0

    # Average Order Value
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0.0

    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "total_users": total_users,
        "total_products": total_products,
        "avg_order_value": avg_order_value
    }

@router.get("/orders", response_model=List[OrderResponse])
async def get_all_orders(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    result = await db.execute(select(Order).order_by(Order.created_at.desc()))
    return result.scalars().all()

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()
