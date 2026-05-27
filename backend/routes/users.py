from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models.user import User
from ..schemas.user import UserUpdate, UserOut
from ..services.auth import hash_password
from .deps import current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserOut])
async def list_users(db: AsyncSession = Depends(get_db), _: User = Depends(current_user)):
    result = await db.execute(select(User).order_by(User.id))
    return result.scalars().all()


@router.put("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: int,
    body: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(current_user),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if body.password:
        user.hashed_password = hash_password(body.password)
    if body.role:
        user.role = body.role
    await db.commit()
    await db.refresh(user)
    return user
