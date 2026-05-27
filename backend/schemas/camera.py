from datetime import datetime
from pydantic import BaseModel


class CameraBase(BaseModel):
    name: str
    location: str
    stream_url: str | None = None
    is_active: bool = True


class CameraCreate(CameraBase):
    pass


class CameraUpdate(BaseModel):
    name: str | None = None
    location: str | None = None
    stream_url: str | None = None
    is_active: bool | None = None


class CameraOut(CameraBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
