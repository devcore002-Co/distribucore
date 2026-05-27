from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, products, batches, suppliers, clients, orders, analytics, export, categories, users, vehicles, cameras

app = FastAPI(title="DistribuCore API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://distribucore-dashboard-dev-core-s-projects.vercel.app",
        "https://distribucore-web-dev-core-s-projects.vercel.app",
    ],
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
