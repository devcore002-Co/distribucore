@echo off
echo Starting DistribuCore development servers...

:: Start backend
start "DistribuCore Backend" cmd /k "cd backend && uvicorn backend.main:app --reload --port 8000"

:: Start dashboard
start "DistribuCore Dashboard" cmd /k "cd distribution-dashboard && npm run dev"

:: Start public web
start "DistribuCore Web" cmd /k "cd distribution-web && npm run dev"

echo.
echo Servers starting:
echo   Backend API:   http://localhost:8000
echo   Dashboard:     http://localhost:5173
echo   Public Web:    http://localhost:5174
echo   API Docs:      http://localhost:8000/docs
