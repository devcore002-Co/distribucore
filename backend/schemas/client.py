from datetime import datetime
from pydantic import BaseModel
from ..models.client import ClientType


class ClientBase(BaseModel):
    name: str
    type: ClientType = ClientType.b2b
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    notes: str | None = None
    is_active: bool = True


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    name: str | None = None
    type: ClientType | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    notes: str | None = None
    is_active: bool | None = None


class ClientOut(ClientBase):
    id: int
    outstanding_balance: int
    created_at: datetime

    model_config = {"from_attributes": True}
