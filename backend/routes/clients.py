from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from ..database import get_db
from ..models.client import Client
from ..models.order import Order, OrderStatus
from ..schemas.client import ClientCreate, ClientUpdate, ClientOut
from .deps import current_user
from ..models.user import User

router = APIRouter(prefix="/clients", tags=["clients"])


@router.get("", response_model=list[ClientOut])
async def list_clients(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    q = select(Client).where(Client.is_active == True).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    return result.scalars().all()


@router.post("", response_model=ClientOut, status_code=status.HTTP_201_CREATED)
async def create_client(
    body: ClientCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    client = Client(**body.model_dump())
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client


@router.get("/credit")
async def clients_with_credit(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(
        select(Client).options(selectinload(Client.orders))
        .where(Client.outstanding_balance > 0, Client.is_active == True)
    )
    clients = result.scalars().all()
    now = datetime.now(timezone.utc)
    output = []
    for c in clients:
        overdue_orders = [
            o for o in c.orders
            if o.balance_due > 0 and o.status != OrderStatus.fulfilled
        ]
        oldest = min((o.order_date for o in overdue_orders), default=now)
        days = (now - (oldest if oldest.tzinfo else oldest.replace(tzinfo=timezone.utc))).days
        output.append({
            "id": c.id,
            "name": c.name,
            "type": c.type,
            "outstanding_balance": c.outstanding_balance,
            "days_overdue": days,
            "bucket": "current" if days <= 30 else "30" if days <= 60 else "60" if days <= 90 else "90+",
        })
    return output


@router.get("/{client_id}", response_model=ClientOut)
async def get_client(
    client_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.put("/{client_id}", response_model=ClientOut)
async def update_client(
    client_id: int,
    body: ClientUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(client, field, value)
    await db.commit()
    await db.refresh(client)
    return client


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    client.is_active = False
    await db.commit()


@router.get("/{client_id}/orders")
async def client_orders(
    client_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(
        select(Order).where(Order.client_id == client_id).order_by(Order.order_date.desc())
    )
    orders = result.scalars().all()
    return [
        {
            "id": o.id,
            "order_date": o.order_date,
            "status": o.status,
            "total_amount": o.total_amount,
            "paid_amount": o.paid_amount,
            "balance_due": o.balance_due,
        }
        for o in orders
    ]


@router.get("/{client_id}/balance")
async def client_balance(
    client_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    orders_result = await db.execute(
        select(Order).where(Order.client_id == client_id, (Order.total_amount - Order.paid_amount) > 0)
    )
    orders = orders_result.scalars().all()
    now = datetime.now(timezone.utc)
    buckets = {"current": 0, "30": 0, "60": 0, "90+": 0}
    for o in orders:
        age = (now - (o.order_date if o.order_date.tzinfo else o.order_date.replace(tzinfo=timezone.utc))).days
        key = "current" if age <= 30 else "30" if age <= 60 else "60" if age <= 90 else "90+"
        buckets[key] += o.balance_due

    return {"outstanding_balance": client.outstanding_balance, "buckets": buckets}
