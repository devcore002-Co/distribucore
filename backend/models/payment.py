from datetime import datetime, date, timezone
from sqlalchemy import Date, DateTime, Integer, ForeignKey, Text, String, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base
import enum


class PaymentMethod(str, enum.Enum):
    cash = "cash"
    bank_transfer = "bank_transfer"
    cheque = "cheque"


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), nullable=False)
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id"), nullable=False)
    # In cents
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    payment_date: Mapped[date] = mapped_column(Date, default=lambda: datetime.now(timezone.utc).date())
    method: Mapped[PaymentMethod] = mapped_column(SAEnum(PaymentMethod), nullable=False, default=PaymentMethod.cash)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    order: Mapped["Order"] = relationship("Order", back_populates="payments")
    client: Mapped["Client"] = relationship("Client", back_populates="payments")
