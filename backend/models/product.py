from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Boolean, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    barcode: Mapped[str | None] = mapped_column(String(100), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"))
    supplier_id: Mapped[int | None] = mapped_column(ForeignKey("suppliers.id"))
    # Stored in cents
    cost_price: Mapped[int] = mapped_column(Integer, default=0)
    selling_price: Mapped[int] = mapped_column(Integer, default=0)
    min_stock_threshold: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    category: Mapped["Category"] = relationship("Category", back_populates="products")
    supplier: Mapped["Supplier"] = relationship("Supplier", back_populates="products")
    batches: Mapped[list["Batch"]] = relationship("Batch", back_populates="product", cascade="all, delete-orphan")
    order_items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="product")
