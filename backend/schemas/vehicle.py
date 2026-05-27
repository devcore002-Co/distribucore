from datetime import datetime
from pydantic import BaseModel
from ..models.vehicle import VehicleStatus


class VehicleBase(BaseModel):
    name: str
    plate_number: str
    driver_name: str | None = None
    status: VehicleStatus = VehicleStatus.parked
    latitude: float | None = None
    longitude: float | None = None


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    name: str | None = None
    plate_number: str | None = None
    driver_name: str | None = None
    status: VehicleStatus | None = None
    latitude: float | None = None
    longitude: float | None = None


class VehicleOut(VehicleBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
