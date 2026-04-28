import asyncio
from app.db.session import AsyncSessionLocal
from app.models.models import User
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as s:
        r = await s.execute(select(User))
        users = r.scalars().all()
        for user in users:
            print(f"Email: {user.email}, Role: {user.role}")

if __name__ == "__main__":
    asyncio.run(main())
