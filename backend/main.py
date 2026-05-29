from fastapi import FastAPI, Request
from fastapi.responses import Response
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

@app.middleware("http")
async def add_cors_header(request: Request, call_next):
    if request.method == "OPTIONS":
        return Response(
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Max-Age": "3600",
            }
        )
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

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
    return {"status": "DEPLOYED_AT_" + str(__import__('datetime').datetime.now())}
