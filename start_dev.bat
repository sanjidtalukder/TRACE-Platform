@echo off
title TRACE Full-Stack Launcher (NASA Space Apps Challenge 2026)
echo ====================================================================
echo   🚀 Starting TRACE Full-Stack Platform
echo   NASA Space Apps Challenge 2026
echo ====================================================================
echo.
echo [1/2] Starting Python FastAPI Backend Server on http://127.0.0.1:8000 ...
start "TRACE Backend Server (Port 8000)" cmd /k "cd /d "%~dp0" && .venv\Scripts\python.exe -m uvicorn server.app.main:app --reload --port 8000"

echo [2/2] Starting Next.js Frontend Client on http://localhost:3000 ...
start "TRACE Frontend Client (Port 3000)" cmd /k "cd /d "%~dp0" && npm run dev"

echo.
echo ====================================================================
echo   🎉 Both servers are now running in their own windows!
echo   - Web Application: http://localhost:3000
echo   - Backend Swagger Docs: http://127.0.0.1:8000/docs
echo   - Health Endpoint: http://127.0.0.1:8000/health
echo ====================================================================
pause
