from datetime import datetime
from pydantic import BaseModel


class SupplierBase(BaseModel):
    name: str
    contact_name: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    notes: str | None = None
    is_active: bool = True


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: str | None = None
    contact_name: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    notes: str | None = None
    is_active: bool | None = None


class SupplierOut(SupplierBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
