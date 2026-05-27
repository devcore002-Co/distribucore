from datetime import datetime, date
from pydantic import BaseModel


class BatchBase(BaseModel):
    product_id: int
    quantity: int
    expiry_date: date | None = None
    purchase_date: date | None = None
    cost_price_at_time: int = 0
    notes: str | None = None


class BatchCreate(BatchBase):
    pass


class BatchUpdate(BaseModel):
    quantity: int | None = None
    expiry_date: date | None = None
    purchase_date: date | None = None
    cost_price_at_time: int | None = None
    notes: str | None = None


class BatchOut(BatchBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
