from datetime import datetime, timezone, date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from ..database import get_db
from ..models.order import Order, OrderStatus
from ..models.order_item import OrderItem
from ..models.batch import Batch
from ..models.client import Client
from ..models.payment import Payment, PaymentMethod
from ..schemas.order import OrderCreate, OrderStatusUpdate, OrderOut, OrderDetail, OrderItemOut
from ..schemas.payment import PaymentCreate, PaymentOut
from .deps import current_user
from ..models.user import User

router = APIRouter(prefix="/orders", tags=["orders"])


async def _deduct_stock_fifo(db: AsyncSession, product_id: int, quantity: int) -> list[tuple[int, int]]:
    """Deduct qty from batches FIFO by purchase_date. Returns list of (batch_id, qty_deducted)."""
    result = await db.execute(
        select(Batch)
        .where(Batch.product_id == product_id, Batch.quantity > 0)
        .order_by(Batch.purchase_date.asc().nullsfirst(), Batch.id.asc())
    )
    batches = result.scalars().all()
    deductions = []
    remaining = quantity
    for batch in batches:
        if remaining <= 0:
            break
        deduct = min(batch.quantity, remaining)
        batch.quantity -= deduct
        remaining -= deduct
        deductions.append((batch.id, deduct))
    if remaining > 0:
        raise HTTPException(status_code=400, detail=f"Insufficient stock for product {product_id}")
    return deductions


@router.get("", response_model=list[OrderOut])
async def list_orders(
    status_filter: OrderStatus | None = Query(None, alias="status"),
    client_id: int | None = Query(None),
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    q = select(Order).options(selectinload(Order.client))
    if status_filter:
        q = q.where(Order.status == status_filter)
    if client_id:
        q = q.where(Order.client_id == client_id)
    if date_from:
        q = q.where(Order.order_date >= datetime.combine(date_from, datetime.min.time()).replace(tzinfo=timezone.utc))
    if date_to:
        q = q.where(Order.order_date <= datetime.combine(date_to, datetime.max.time()).replace(tzinfo=timezone.utc))
    q = q.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    orders = result.scalars().all()
    out = []
    for o in orders:
        d = OrderOut.model_validate(o).model_copy(update={
            "client_name": o.client.name if o.client else None,
            "balance_due": o.balance_due,
        })
        out.append(d)
    return out


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(
    body: OrderCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    client_result = await db.execute(select(Client).where(Client.id == body.client_id))
    client = client_result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    total = sum(item.quantity * item.unit_price for item in body.items)
    order = Order(
        client_id=body.client_id,
        total_amount=total,
        paid_amount=0,
        notes=body.notes,
        status=OrderStatus.pending,
    )
    db.add(order)
    await db.flush()

    for item in body.items:
        deductions = await _deduct_stock_fifo(db, item.product_id, item.quantity)
        primary_batch_id = deductions[0][0] if deductions else None
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            batch_id=primary_batch_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            subtotal=item.quantity * item.unit_price,
        )
        db.add(order_item)

    order.status = OrderStatus.fulfilled

    if body.initial_payment and body.initial_payment > 0:
        method = PaymentMethod(body.payment_method) if body.payment_method else PaymentMethod.cash
        payment = Payment(
            order_id=order.id,
            client_id=body.client_id,
            amount=body.initial_payment,
            method=method,
        )
        db.add(payment)
        order.paid_amount = body.initial_payment

    balance = order.total_amount - order.paid_amount
    client.outstanding_balance += balance

    await db.commit()
    await db.refresh(order)
    return OrderOut.model_validate(order).model_copy(update={"client_name": client.name, "balance_due": order.balance_due})


@router.get("/{order_id}", response_model=OrderDetail)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.client),
            selectinload(Order.items).selectinload(OrderItem.product),
            selectinload(Order.payments),
        )
        .where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    detail = OrderDetail.model_validate(order)
    detail.client_name = order.client.name if order.client else None
    detail.balance_due = order.balance_due
    detail.items = [
        OrderItemOut(
            id=i.id,
            product_id=i.product_id,
            batch_id=i.batch_id,
            quantity=i.quantity,
            unit_price=i.unit_price,
            subtotal=i.subtotal,
            product_name=i.product.name if i.product else None,
        )
        for i in order.items
    ]
    detail.payments = [PaymentOut.model_validate(p) for p in order.payments]
    return detail


@router.put("/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: int,
    body: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(select(Order).options(selectinload(Order.client)).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = body.status
    await db.commit()
    await db.refresh(order)
    return OrderOut.model_validate(order).model_copy(update={"client_name": order.client.name if order.client else None, "balance_due": order.balance_due})


@router.post("/{order_id}/payments", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
async def record_payment(
    order_id: int,
    body: PaymentCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    order_result = await db.execute(select(Order).options(selectinload(Order.client)).where(Order.id == order_id))
    order = order_result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    payment = Payment(
        order_id=order_id,
        client_id=order.client_id,
        amount=body.amount,
        payment_date=body.payment_date or datetime.now(timezone.utc).date(),
        method=body.method,
        notes=body.notes,
    )
    db.add(payment)

    order.paid_amount += body.amount
    if order.paid_amount >= order.total_amount:
        order.status = OrderStatus.fulfilled
    else:
        order.status = OrderStatus.partial

    client_result = await db.execute(select(Client).where(Client.id == order.client_id))
    client = client_result.scalar_one()
    client.outstanding_balance = max(0, client.outstanding_balance - body.amount)

    await db.commit()
    await db.refresh(payment)
    return payment
