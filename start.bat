@echo off
REM =====================================================
REM Call Helper - Windows Startup Script
REM =====================================================

echo ============================================================
echo          Call Helper - Starting Project
echo ============================================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing npm dependencies...
    call npm install --legacy-peer-deps
)

REM Install Python dependencies
echo Checking Python dependencies...
pip install -r requirements.txt >nul 2>&1

echo.
echo All dependencies ready
echo.

REM Start backend in new window
echo Starting Backend (Flask)...
start "Call Helper - Backend" cmd /k "venv\Scripts\activate && python app.py"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
echo Starting Frontend (React + Vite)...
start "Call Helper - Frontend" cmd /k "npm run dev"

echo.
echo ============================================================
echo                   PROJECT RUNNING
echo ============================================================
echo.
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:5000
echo.
echo   Close the separate windows to stop the servers
echo.
echo ============================================================
echo.

pause
