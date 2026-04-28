from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.models import Order, OrderItem, Product
from app.schemas.schemas import OrderCreate

async def create_order(db: AsyncSession, user_id: int, order_in: OrderCreate) -> Order:
    order = Order(
        user_id=user_id,
        total=order_in.total,
        status="PENDING"
    )
    db.add(order)
    await db.flush()

    for item in order_in.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.id,
            quantity=item.quantity,
            price=item.price
        )
        db.add(order_item)

    await db.commit()

    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order.id)
    )
    return result.scalar_one()

async def get_user_orders(db: AsyncSession, user_id: int) -> list[Order]:
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.category)
        )
        .where(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
    )
    return list(result.scalars().all())
