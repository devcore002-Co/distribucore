import sys
import os

# Make the repo root importable so `backend` package resolves correctly
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from backend.main import app  # noqa: F401 — Vercel looks for `app` in this module
