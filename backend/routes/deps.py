from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..models.user import User
from ..services.auth import get_current_user

bearer_scheme = HTTPBearer()


async def current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    return await get_current_user(credentials.credentials, db)
