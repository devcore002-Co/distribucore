from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Float, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from ..database import Base
import enum


class VehicleStatus(str, enum.Enum):
    active = "active"
    parked = "parked"
    maintenance = "maintenance"


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    plate_number: Mapped[str] = mapped_column(String(20), nullable=False)
    driver_name: Mapped[str | None] = mapped_column(String(100))
    status: Mapped[VehicleStatus] = mapped_column(SAEnum(VehicleStatus), default=VehicleStatus.parked)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
