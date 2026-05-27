from datetime import datetime, timezone
from sqlalchemy import DateTime, Integer, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base
import enum


class OrderStatus(str, enum.Enum):
    pending = "pending"
    fulfilled = "fulfilled"
    partial = "partial"
    credited = "credited"


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id"), nullable=False)
    order_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    status: Mapped[OrderStatus] = mapped_column(SAEnum(OrderStatus), nullable=False, default=OrderStatus.pending)
    # All amounts in cents
    total_amount: Mapped[int] = mapped_column(Integer, default=0)
    paid_amount: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    client: Mapped["Client"] = relationship("Client", back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments: Mapped[list["Payment"]] = relationship("Payment", back_populates="order")

    @property
    def balance_due(self) -> int:
        return self.total_amount - self.paid_amount
