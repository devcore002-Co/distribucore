from datetime import datetime, date
from pydantic import BaseModel
from ..models.payment import PaymentMethod


class PaymentCreate(BaseModel):
    amount: int
    payment_date: date | None = None
    method: PaymentMethod = PaymentMethod.cash
    notes: str | None = None


class PaymentOut(BaseModel):
    id: int
    order_id: int
    client_id: int
    amount: int
    payment_date: date
    method: PaymentMethod
    notes: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
