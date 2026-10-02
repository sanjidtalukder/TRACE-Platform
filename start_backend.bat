@echo off
title TRACE Python Backend Server (Port 8000)
echo ====================================================================
echo   🛰️ Starting TRACE Python FastAPI Backend Server
echo   NASA Space Apps Challenge 2026
echo ====================================================================
echo.
cd /d "%~dp0"
.venv\Scripts\python.exe -m uvicorn server.app.main:app --reload --port 8000
