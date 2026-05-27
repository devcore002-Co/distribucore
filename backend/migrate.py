"""Run with: python -m backend.migrate
Adds lat/lon to clients, creates vehicles and cameras tables.
Safe to run multiple times (idempotent).
"""
import asyncio
from sqlalchemy import text
from .database import engine, Base
from .models import Vehicle, Camera  # noqa: ensure tables are registered


async def migrate():
    # Create new tables (vehicles, cameras) if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Add latitude/longitude to clients if missing (idempotent)
    async with engine.begin() as conn:
        await conn.execute(text("""
            ALTER TABLE clients
            ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
            ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION
        """))

    print("Migration complete.")


if __name__ == "__main__":
    asyncio.run(migrate())
