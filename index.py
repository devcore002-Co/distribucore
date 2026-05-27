import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

_import_error = None
try:
    import backend.config as _cfg
    _config_ok = str(_cfg.settings.ALGORITHM)
except Exception as e:
    import traceback
    _import_error = traceback.format_exc()
    _config_ok = "FAILED"

try:
    import backend.database as _db
    _db_ok = "OK"
except Exception as e:
    import traceback
    _import_error = (_import_error or "") + "\n\nDB: " + traceback.format_exc()
    _db_ok = "FAILED"

try:
    from backend.main import app as _real_app
    _main_ok = "OK"
    app = _real_app
except Exception as e:
    import traceback
    _import_error = (_import_error or "") + "\n\nMAIN: " + traceback.format_exc()
    _main_ok = "FAILED"

    @app.get("/{path:path}")
    async def _debug(path: str):
        return JSONResponse({"config": _config_ok, "db": _db_ok, "main": _main_ok, "error": _import_error}, status_code=500)

    @app.get("/health")
    async def _health():
        return JSONResponse({"config": _config_ok, "db": _db_ok, "main": _main_ok, "error": _import_error}, status_code=500)
