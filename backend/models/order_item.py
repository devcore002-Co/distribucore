from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    batch_id: Mapped[int | None] = mapped_column(ForeignKey("batches.id"))
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    # In cents
    unit_price: Mapped[int] = mapped_column(Integer, nullable=False)
    subtotal: Mapped[int] = mapped_column(Integer, nullable=False)

    order: Mapped["Order"] = relationship("Order", back_populates="items")
    product: Mapped["Product"] = relationship("Product", back_populates="order_items")
    batch: Mapped["Batch"] = relationship("Batch", back_populates="order_items")
