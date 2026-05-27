import sys
import os
from fastapi import FastAPI

app = FastAPI()


@app.get("/health")
async def health():
    cwd = os.getcwd()
    cwd_files = os.listdir(cwd)
    task_files = os.listdir("/var/task") if os.path.exists("/var/task") else []
    has_backend = os.path.exists(os.path.join(cwd, "backend"))
    has_backend_task = os.path.exists("/var/task/backend")
    return {
        "cwd": cwd,
        "cwd_files": sorted(cwd_files),
        "task_files": sorted(task_files),
        "has_backend_cwd": has_backend,
        "has_backend_task": has_backend_task,
        "sys_path": sys.path[:5],
        "file": __file__,
    }
