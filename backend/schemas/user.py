from datetime import datetime
from pydantic import BaseModel, EmailStr
from ..models.user import UserRole


class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    password: str | None = None
    role: UserRole | None = None


class UserOut(UserBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: str
    password: str
