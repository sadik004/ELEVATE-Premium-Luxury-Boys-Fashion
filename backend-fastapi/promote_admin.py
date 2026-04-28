import asyncio
from app.db.session import AsyncSessionLocal
from app.models.models import User
from sqlalchemy import select, update

async def main():
    async with AsyncSessionLocal() as s:
        # Check current state
        r = await s.execute(select(User).where(User.email == "admin@example.com"))
        user = r.scalar_one_or_none()
        if user:
            print(f"Current role for {user.email}: {user.role}")
            await s.execute(
                update(User)
                .where(User.email == "admin@example.com")
                .values(role="admin")
            )
            await s.commit()
            print("Role updated to 'admin'")
        else:
            print("User admin@example.com not found in backend")

if __name__ == "__main__":
    asyncio.run(main())
