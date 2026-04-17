import asyncio
import re
import random
from sqlalchemy import select, delete
from sqlalchemy.dialects.postgresql import insert
from app.db.session import AsyncSessionLocal, engine
from app.models.models import User, Category, Product, Order, OrderItem

async def seed_database():
    print("Connecting to database...")
    async with AsyncSessionLocal() as session:
        # Clear existing data safely to avoid foreign key constraint errors
        print("Clearing existing data...")
        await session.execute(delete(OrderItem))
        await session.execute(delete(Order))
        await session.execute(delete(Product))
        await session.execute(delete(Category))
        await session.commit()

        # Categories
        categories_data = [
            {"name": "Suits & Tuxedos", "slug": "suits-tuxedos"},
            {"name": "Shirts & Tops", "slug": "shirts-tops"},
            {"name": "Trousers & Shorts", "slug": "trousers-shorts"},
            {"name": "Outerwear", "slug": "outerwear"},
            {"name": "Accessories", "slug": "accessories"},
        ]

        print("Upserting categories...")
        # Since we just deleted them, we can just insert
        for cat_data in categories_data:
            cat = Category(**cat_data)
            session.add(cat)

        await session.commit()

        # Fetch categories to map IDs
        result = await session.execute(select(Category))
        categories = result.scalars().all()

        suits_cat = next(c for c in categories if c.slug == "suits-tuxedos")
        out_cat = next(c for c in categories if c.slug == "outerwear")

        raw_products = [
            {"name": "Midnight Blue Wool Suit", "image": "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7"},
            {"name": "Charcoal Grey Tuxedo", "image": "https://images.unsplash.com/photo-1520975922203-bf6e8f1b1f6b"},
            {"name": "Ivory Linen Suit", "image": "https://images.unsplash.com/photo-1520975661595-6453be3f7070"},
            {"name": "Velvet Dinner Jacket", "image": "https://images.unsplash.com/photo-1542060748-10c28b62716a"},
            {"name": "Classic Black Suit", "image": "https://images.unsplash.com/photo-1516826957135-700dedea698c"},
            {"name": "Navy Slim Fit Suit", "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"},
            {"name": "Double Breasted Suit", "image": "https://images.unsplash.com/photo-1520974735194-1c0bba3c1b7b"},
            {"name": "Wedding White Tuxedo", "image": "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543"},
            {"name": "Casual Blazer", "image": "https://images.unsplash.com/photo-1490111718993-d98654ce6cf7"},
            {"name": "Formal Coat", "image": "https://images.unsplash.com/photo-1520975661595-6453be3f7070"},
            {"name": "Luxury Overcoat", "image": "https://images.unsplash.com/photo-1542060748-10c28b62716a"},
            {"name": "Winter Trench Coat", "image": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f"},
            {"name": "Business Suit Set", "image": "https://images.unsplash.com/photo-1516826957135-700dedea698c"},
            {"name": "Premium Wool Coat", "image": "https://images.unsplash.com/photo-1520975922203-bf6e8f1b1f6b"},
            {"name": "Modern Grey Suit", "image": "https://images.unsplash.com/photo-1520974735194-1c0bba3c1b7b"},
            {"name": "Designer Blazer", "image": "https://images.unsplash.com/photo-1490111718993-d98654ce6cf7"},
            {"name": "Elegant Evening Suit", "image": "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543"},
            {"name": "Luxury Cashmere Coat", "image": "https://images.unsplash.com/photo-1542060748-10c28b62716a"},
            {"name": "Office Formal Suit", "image": "https://images.unsplash.com/photo-1516826957135-700dedea698c"},
            {"name": "Classic Brown Blazer", "image": "https://images.unsplash.com/photo-1490111718993-d98654ce6cf7"},
            {"name": "Premium Black Overcoat", "image": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f"}
        ]

        def generate_slug(name):
            slug = name.lower()
            slug = re.sub(r'[^a-z0-9]+', '-', slug)
            return re.sub(r'(^-|-$)+', '', slug)

        def get_category_for_name(name):
            lower_name = name.lower()
            if "coat" in lower_name or "overcoat" in lower_name:
                return out_cat.id
            if "blazer" in lower_name:
                return suits_cat.id
            return suits_cat.id

        processed_products = []
        for p in raw_products:
            random_price = float(random.randint(200, 900))
            processed_products.append({
                "name": p["name"],
                "slug": generate_slug(p["name"]),
                "description": "A premium luxury piece crafted with the finest materials for a sophisticated look.",
                "price": random_price,
                "image": p["image"],
                "category_id": get_category_for_name(p["name"])
            })

        print(f"Seeding {len(processed_products)} premium products...")

        for p_data in processed_products:
            product = Product(**p_data)
            session.add(product)

        await session.commit()
        print("Seeding completed.")

async def main():
    try:
        await seed_database()
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
