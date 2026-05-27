from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from ..database import get_db
from ..models.product import Product
from ..models.batch import Batch
from ..schemas.product import ProductCreate, ProductUpdate, ProductOut, ProductWithBatches
from .deps import current_user
from ..models.user import User

router = APIRouter(prefix="/products", tags=["products"])


def _with_stock(product: Product) -> ProductOut:
    total = sum(b.quantity for b in product.batches)
    return ProductOut.model_validate(product).model_copy(update={"total_stock": total})


@router.get("", response_model=list[ProductOut])
async def list_products(
    search: str | None = Query(None),
    category_id: int | None = Query(None),
    supplier_id: int | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    q = select(Product).options(
        selectinload(Product.batches),
        selectinload(Product.category),
        selectinload(Product.supplier),
    ).where(Product.is_active == True)

    if search:
        q = q.where(
            (Product.name.ilike(f"%{search}%")) | (Product.barcode.ilike(f"%{search}%"))
        )
    if category_id:
        q = q.where(Product.category_id == category_id)
    if supplier_id:
        q = q.where(Product.supplier_id == supplier_id)

    q = q.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    products = result.scalars().all()
    return [_with_stock(p) for p in products]


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(
    body: ProductCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    product = Product(**body.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.batches), selectinload(Product.category), selectinload(Product.supplier))
        .where(Product.id == product.id)
    )
    return _with_stock(result.scalar_one())


@router.get("/barcode/{barcode}", response_model=ProductOut)
async def get_by_barcode(
    barcode: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.batches), selectinload(Product.category), selectinload(Product.supplier))
        .where(Product.barcode == barcode)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return _with_stock(product)


@router.get("/{product_id}", response_model=ProductWithBatches)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.batches), selectinload(Product.category), selectinload(Product.supplier))
        .where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    total = sum(b.quantity for b in product.batches)
    out = ProductWithBatches.model_validate(product)
    out.total_stock = total
    return out


@router.put("/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: int,
    body: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    await db.commit()
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.batches), selectinload(Product.category), selectinload(Product.supplier))
        .where(Product.id == product_id)
    )
    return _with_stock(result.scalar_one())


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    await db.commit()
