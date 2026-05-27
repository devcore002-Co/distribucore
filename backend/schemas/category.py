from datetime import datetime
from pydantic import BaseModel


class CategoryBase(BaseModel):
    name: str


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = None


class CategoryOut(CategoryBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
