from datetime import datetime
from pydantic import BaseModel
from .batch import BatchOut
from .category import CategoryOut
from .supplier import SupplierOut


class ProductBase(BaseModel):
    barcode: str | None = None
    name: str
    category_id: int | None = None
    supplier_id: int | None = None
    cost_price: int = 0
    selling_price: int = 0
    min_stock_threshold: int = 0
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    barcode: str | None = None
    name: str | None = None
    category_id: int | None = None
    supplier_id: int | None = None
    cost_price: int | None = None
    selling_price: int | None = None
    min_stock_threshold: int | None = None
    is_active: bool | None = None


class ProductOut(ProductBase):
    id: int
    created_at: datetime
    total_stock: int = 0
    category: CategoryOut | None = None
    supplier: SupplierOut | None = None

    model_config = {"from_attributes": True}


class ProductWithBatches(ProductOut):
    batches: list[BatchOut] = []
