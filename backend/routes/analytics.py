from datetime import datetime, timezone, timedelta, date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from sqlalchemy.orm import selectinload
from ..database import get_db
from ..models.order import Order, OrderStatus
from ..models.order_item import OrderItem
from ..models.product import Product
from ..models.batch import Batch
from ..models.client import Client
from ..models.category import Category
from .deps import current_user
from ..models.user import User

router = APIRouter(prefix="/analytics", tags=["analytics"])


def _period_start(period: str) -> datetime:
    days = {"30d": 30, "90d": 90, "365d": 365}.get(period, 30)
    return datetime.now(timezone.utc) - timedelta(days=days)


@router.get("/sales-monthly")
async def sales_monthly(
    year: int = Query(default=None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    year = year or datetime.now(timezone.utc).year
    result = await db.execute(
        select(
            extract("month", Order.order_date).label("month"),
            func.sum(Order.total_amount).label("revenue"),
            func.count(Order.id).label("order_count"),
        )
        .where(extract("year", Order.order_date) == year)
        .group_by("month")
        .order_by("month")
    )
    rows = result.all()
    monthly = {int(r.month): {"revenue": int(r.revenue), "order_count": int(r.order_count)} for r in rows}
    return [
        {"month": m, "revenue": monthly.get(m, {}).get("revenue", 0), "order_count": monthly.get(m, {}).get("order_count", 0)}
        for m in range(1, 13)
    ]


@router.get("/top-products")
async def top_products(
    limit: int = Query(10, ge=1, le=50),
    period: str = Query("30d"),
    by: str = Query("revenue"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    since = _period_start(period)
    sort_col = func.sum(OrderItem.subtotal) if by == "revenue" else func.sum(OrderItem.quantity)
    result = await db.execute(
        select(
            Product.id,
            Product.name,
            func.sum(OrderItem.quantity).label("total_qty"),
            func.sum(OrderItem.subtotal).label("total_revenue"),
        )
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.order_date >= since)
        .group_by(Product.id, Product.name)
        .order_by(sort_col.desc())
        .limit(limit)
    )
    return [
        {"id": r.id, "name": r.name, "total_qty": int(r.total_qty), "total_revenue": int(r.total_revenue)}
        for r in result.all()
    ]


@router.get("/category-breakdown")
async def category_breakdown(
    period: str = Query("30d"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    since = _period_start(period)
    result = await db.execute(
        select(
            Category.id,
            Category.name,
            func.sum(OrderItem.subtotal).label("revenue"),
        )
        .join(Product, Product.category_id == Category.id)
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.order_date >= since)
        .group_by(Category.id, Category.name)
    )
    rows = result.all()
    total = sum(int(r.revenue) for r in rows)
    return [
        {
            "id": r.id,
            "name": r.name,
            "revenue": int(r.revenue),
            "percentage": round(int(r.revenue) / total * 100, 1) if total else 0,
        }
        for r in rows
    ]


@router.get("/profit-margins")
async def profit_margins(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(select(Product).where(Product.is_active == True))
    products = result.scalars().all()
    out = []
    for p in products:
        margin_cents = p.selling_price - p.cost_price
        margin_pct = round(margin_cents / p.cost_price * 100, 1) if p.cost_price else 0
        out.append({
            "id": p.id,
            "name": p.name,
            "cost_price": p.cost_price,
            "selling_price": p.selling_price,
            "margin": margin_cents,
            "margin_pct": margin_pct,
        })
    return out


@router.get("/credit-overview")
async def credit_overview(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(
        select(Client).options(selectinload(Client.orders))
        .where(Client.outstanding_balance > 0)
    )
    clients = result.scalars().all()
    now = datetime.now(timezone.utc)
    buckets = {"current": 0, "30": 0, "60": 0, "90+": 0}
    rows = []
    for c in clients:
        overdue = [o for o in c.orders if o.balance_due > 0]
        if not overdue:
            continue
        oldest = min(
            (o.order_date if o.order_date.tzinfo else o.order_date.replace(tzinfo=timezone.utc) for o in overdue),
            default=now,
        )
        days = (now - oldest).days
        bucket = "current" if days <= 30 else "30" if days <= 60 else "60" if days <= 90 else "90+"
        buckets[bucket] += c.outstanding_balance
        rows.append({
            "id": c.id,
            "name": c.name,
            "outstanding_balance": c.outstanding_balance,
            "oldest_invoice_date": oldest.date().isoformat(),
            "days_overdue": days,
            "bucket": bucket,
        })
    total = sum(c.outstanding_balance for c in clients)
    return {"total": total, "buckets": buckets, "clients": rows}


@router.get("/inventory-value")
async def inventory_value(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.batches), selectinload(Product.category))
        .where(Product.is_active == True)
    )
    products = result.scalars().all()
    total_cost = 0
    total_selling = 0
    by_category: dict[str, dict] = {}
    for p in products:
        stock = sum(b.quantity for b in p.batches)
        cost = stock * p.cost_price
        selling = stock * p.selling_price
        total_cost += cost
        total_selling += selling
        cat = p.category.name if p.category else "Uncategorized"
        if cat not in by_category:
            by_category[cat] = {"cost": 0, "selling": 0}
        by_category[cat]["cost"] += cost
        by_category[cat]["selling"] += selling

    return {
        "total_cost": total_cost,
        "total_selling": total_selling,
        "by_category": [
            {"category": k, "cost": v["cost"], "selling": v["selling"]}
            for k, v in by_category.items()
        ],
    }


@router.get("/expiry-risk")
async def expiry_risk(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    today = date.today()
    result = await db.execute(
        select(Batch).options(selectinload(Batch.product))
        .where(Batch.quantity > 0, Batch.expiry_date != None)
        .order_by(Batch.expiry_date)
    )
    batches = result.scalars().all()
    buckets = {"30": [], "60": [], "90": []}
    for b in batches:
        days = (b.expiry_date - today).days
        if days < 0:
            continue
        entry = {
            "batch_id": b.id,
            "product_name": b.product.name if b.product else None,
            "quantity": b.quantity,
            "expiry_date": b.expiry_date.isoformat(),
            "days_until_expiry": days,
        }
        if days <= 30:
            buckets["30"].append(entry)
        elif days <= 60:
            buckets["60"].append(entry)
        elif days <= 90:
            buckets["90"].append(entry)
    return buckets


@router.get("/low-stock")
async def low_stock_analytics(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user),
):
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.batches), selectinload(Product.category))
        .where(Product.is_active == True)
    )
    products = result.scalars().all()
    low = []
    for p in products:
        stock = sum(b.quantity for b in p.batches)
        if stock < p.min_stock_threshold:
            low.append({
                "id": p.id,
                "name": p.name,
                "category": p.category.name if p.category else None,
                "current_stock": stock,
                "min_stock_threshold": p.min_stock_threshold,
                "shortage": p.min_stock_threshold - stock,
            })
    low.sort(key=lambda x: x["shortage"], reverse=True)
    return low
