from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .routes import auth, products, batches, suppliers, clients, orders, analytics, export, categories, users, vehicles, cameras
from .seed import seed

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await seed()
    except Exception as e:
        print(f"Seed error (non-fatal): {e}")
    yield

app = FastAPI(title="DistribuCore API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://distribucore-dashboard.vercel.app", "http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(batches.router)
app.include_router(suppliers.router)
app.include_router(clients.router)
app.include_router(orders.router)
app.include_router(analytics.router)
app.include_router(export.router)
app.include_router(categories.router)
app.include_router(users.router)
app.include_router(vehicles.router)
app.include_router(cameras.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
