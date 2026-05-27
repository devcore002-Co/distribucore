from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models.category import Category
from ..schemas.category import CategoryCreate, CategoryUpdate, CategoryOut
from .deps import current_user
from ..models.user import User

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryOut])
async def list_categories(db: AsyncSession = Depends(get_db), _: User = Depends(current_user)):
    result = await db.execute(select(Category).order_by(Category.name))
    return result.scalars().all()


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
async def create_category(body: CategoryCreate, db: AsyncSession = Depends(get_db), _: User = Depends(current_user)):
    cat = Category(**body.model_dump())
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return cat


@router.put("/{category_id}", response_model=CategoryOut)
async def update_category(category_id: int, body: CategoryUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(current_user)):
    result = await db.execute(select(Category).where(Category.id == category_id))
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(cat, field, value)
    await db.commit()
    await db.refresh(cat)
    return cat


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(current_user)):
    result = await db.execute(select(Category).where(Category.id == category_id))
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    await db.delete(cat)
    await db.commit()
