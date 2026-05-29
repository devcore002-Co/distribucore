"""Run with: python -m backend.seed"""
import asyncio
from sqlalchemy import select
from .database import AsyncSessionLocal, engine, Base
from .models import User, Category, Supplier, Product, Batch, Client
from .models.user import UserRole
from .models.client import ClientType
from .services.auth import hash_password


CATEGORIES = ["Dairy", "Juice", "Beverage", "Dried Goods", "Confectionery"]

USERS = [
    {"username": "investor", "email": "investor@distribucore.com", "role": UserRole.investor},
    {"username": "ceo", "email": "ceo@distribucore.com", "role": UserRole.ceo},
    {"username": "operations", "email": "operations@distribucore.com", "role": UserRole.operations},
]


async def seed():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        async with AsyncSessionLocal() as db:
            # Seed categories
            for name in CATEGORIES:
                try:
                    exists = await db.execute(select(Category).where(Category.name == name))
                    if not exists.scalar_one_or_none():
                        db.add(Category(name=name))
                except Exception:
                    pass

            # Seed users
            for u in USERS:
                try:
                    exists = await db.execute(select(User).where(User.email == u["email"]))
                    if not exists.scalar_one_or_none():
                        db.add(User(
                            username=u["username"],
                            email=u["email"],
                            role=u["role"],
                            hashed_password=hash_password("changeme123"),
                        ))
                except Exception:
                    pass

            await db.commit()
        print("Seed complete.")
    except Exception as e:
        print(f"Seed failed: {e}")


if __name__ == "__main__":
    asyncio.run(seed())
