from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Boolean, Integer, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base
import enum


class ClientType(str, enum.Enum):
    b2b = "b2b"
    wholesaler = "wholesaler"
    distributor = "distributor"


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    type: Mapped[ClientType] = mapped_column(SAEnum(ClientType), nullable=False, default=ClientType.b2b)
    phone: Mapped[str | None] = mapped_column(String(50))
    email: Mapped[str | None] = mapped_column(String(255))
    address: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)
    # Outstanding balance in cents
    outstanding_balance: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    orders: Mapped[list["Order"]] = relationship("Order", back_populates="client")
    payments: Mapped[list["Payment"]] = relationship("Payment", back_populates="client")
