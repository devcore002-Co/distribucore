from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..schemas.user import Token, LoginRequest, UserOut
from ..services.auth import authenticate_user, create_access_token
from .deps import current_user
from ..models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, body.email, body.password)
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token}


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(current_user)):
    return user
