from datetime import datetime
from pydantic import BaseModel, model_validator
from ..models.order import OrderStatus
from .payment import PaymentOut


class OrderItemIn(BaseModel):
    product_id: int
    quantity: int
    unit_price: int


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    batch_id: int | None = None
    quantity: int
    unit_price: int
    subtotal: int
    product_name: str | None = None

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    client_id: int
    items: list[OrderItemIn]
    notes: str | None = None
    initial_payment: int | None = None
    payment_method: str | None = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderOut(BaseModel):
    id: int
    client_id: int
    client_name: str | None = None
    order_date: datetime
    status: OrderStatus
    total_amount: int
    paid_amount: int
    balance_due: int
    notes: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderDetail(OrderOut):
    items: list[OrderItemOut] = []
    payments: list[PaymentOut] = []
