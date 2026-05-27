from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from ..database import get_db
from ..models.batch import Batch
from ..models.product import Product
from ..schemas.batch import BatchCreate, BatchUpdate, BatchOut
from .deps import current_user
from ..models.user import User

router = APIRouter(prefix="/batches", tags=["batches"])


@router.post("", response_model=BatchOut, status_code=status.HTTP_201_CREATED)
async def create_batch(
    body: BatchCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    batch = Batch(**body.model_dump())
    db.add(batch)
    await db.commit()
    await db.refresh(batch)
    return batch


@router.put("/{batch_id}", response_model=BatchOut)
async def update_batch(
    batch_id: int,
    body: BatchUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(select(Batch).where(Batch.id == batch_id))
    batch = result.scalar_one_or_none()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(batch, field, value)
    await db.commit()
    await db.refresh(batch)
    return batch


@router.delete("/{batch_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_batch(
    batch_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(select(Batch).where(Batch.id == batch_id))
    batch = result.scalar_one_or_none()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    await db.delete(batch)
    await db.commit()


@router.get("/expiring", response_model=list[BatchOut])
async def expiring_batches(
    days: int = Query(30, ge=1),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    cutoff = date.today() + timedelta(days=days)
    result = await db.execute(
        select(Batch).where(Batch.expiry_date <= cutoff, Batch.quantity > 0)
        .order_by(Batch.expiry_date)
    )
    return result.scalars().all()


@router.get("/low-stock")
async def low_stock(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.batches), selectinload(Product.category))
        .where(Product.is_active == True)
    )
    products = result.scalars().all()
    low = []
    for p in products:
        total = sum(b.quantity for b in p.batches)
        if total < p.min_stock_threshold:
            low.append({
                "id": p.id,
                "name": p.name,
                "barcode": p.barcode,
                "category": p.category.name if p.category else None,
                "current_stock": total,
                "min_stock_threshold": p.min_stock_threshold,
                "shortage": p.min_stock_threshold - total,
            })
    low.sort(key=lambda x: x["shortage"], reverse=True)
    return low
