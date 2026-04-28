import asyncio
from sqlalchemy import select
from app.db.session import AsyncSessionLocal, engine
from app.models.models import User

async def check_user():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == 'testuser@example.com'))
        user = result.scalar_one_or_none()
        if user:
            print(f"User found: ID={user.id}, Email={user.email}")
        else:
            print("User not found")

if __name__ == "__main__":
    asyncio.run(check_user())
