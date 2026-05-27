from datetime import datetime, date, timezone
from sqlalchemy import Date, DateTime, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base


class Batch(Base):
    __tablename__ = "batches"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=0)
    expiry_date: Mapped[date | None] = mapped_column(Date)
    purchase_date: Mapped[date | None] = mapped_column(Date)
    # Stored in cents
    cost_price_at_time: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    product: Mapped["Product"] = relationship("Product", back_populates="batches")
    order_items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="batch")
