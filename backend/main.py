from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from starlette.responses import Response
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

# CORS must be added first
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
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
