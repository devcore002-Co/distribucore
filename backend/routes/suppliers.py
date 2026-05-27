from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from ..database import get_db
from ..models.supplier import Supplier
from ..models.product import Product
from ..schemas.supplier import SupplierCreate, SupplierUpdate, SupplierOut
from ..schemas.product import ProductOut
from .deps import current_user
from ..models.user import User

router = APIRouter(prefix="/suppliers", tags=["suppliers"])


@router.get("", response_model=list[SupplierOut])
async def list_suppliers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    q = select(Supplier).where(Supplier.is_active == True).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    return result.scalars().all()


@router.post("", response_model=SupplierOut, status_code=status.HTTP_201_CREATED)
async def create_supplier(
    body: SupplierCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    supplier = Supplier(**body.model_dump())
    db.add(supplier)
    await db.commit()
    await db.refresh(supplier)
    return supplier


@router.get("/{supplier_id}", response_model=SupplierOut)
async def get_supplier(
    supplier_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier


@router.put("/{supplier_id}", response_model=SupplierOut)
async def update_supplier(
    supplier_id: int,
    body: SupplierUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(supplier, field, value)
    await db.commit()
    await db.refresh(supplier)
    return supplier


@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_supplier(
    supplier_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    supplier.is_active = False
    await db.commit()


@router.get("/{supplier_id}/products")
async def supplier_products(
    supplier_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.batches), selectinload(Product.category), selectinload(Product.supplier))
        .where(Product.supplier_id == supplier_id, Product.is_active == True)
    )
    products = result.scalars().all()
    return [
        ProductOut.model_validate(p).model_copy(update={"total_stock": sum(b.quantity for b in p.batches)}).model_dump()
        for p in products
    ]
