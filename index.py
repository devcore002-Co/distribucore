import sys
import os
import traceback
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

_error = None
try:
    from backend.main import app as _real_app
    app = _real_app
except Exception as _e:
    _error = traceback.format_exc()


@app.get("/_debug")
async def debug():
    return JSONResponse({"error": _error, "ok": _error is None})
