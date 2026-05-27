import sys
import os
import traceback

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

try:
    from backend.main import app  # noqa: F401
except Exception as _import_error:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    app = FastAPI()

    _tb = traceback.format_exc()

    @app.get("/{path:path}")
    @app.post("/{path:path}")
    async def _error_handler(path: str):
        return JSONResponse(
            status_code=500,
            content={"import_error": str(_import_error), "traceback": _tb},
        )
