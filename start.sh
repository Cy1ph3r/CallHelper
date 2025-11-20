#!/bin/bash

# =====================================================
# Call Helper - Complete Project Startup Script
# =====================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Call Helper - Starting Project                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    pkill -f "python3 app.py" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    pkill -f "node.*vite" 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup SIGINT SIGTERM

# Check if npm dependencies are installed
echo -e "${BLUE}Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing npm dependencies...${NC}"
    npm install --legacy-peer-deps
fi

# Check Python dependencies
echo -e "${BLUE}Checking Python dependencies...${NC}"
python3 -c "import flask" 2>/dev/null || {
    echo -e "${YELLOW}Installing Python dependencies...${NC}"
    pip install --break-system-packages -r requirements.txt 2>/dev/null || pip install -r requirements.txt
}

echo ""
echo -e "${GREEN}✅ All dependencies ready${NC}"
echo ""

# Kill any processes using ports 5000 and 5173
echo -e "${BLUE}Cleaning up ports...${NC}"
lsof -ti:5000 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null || true
echo -e "${GREEN}✅ Ports cleaned${NC}"
echo ""

# Start Backend Server
echo -e "${BLUE}Starting Backend (Flask)...${NC}"
python3 app.py > /tmp/call-helper-backend.log 2>&1 &
BACKEND_PID=$!
sleep 2

# Check if backend started successfully
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Backend running (PID: $BACKEND_PID)${NC}"
    echo -e "   URL: ${BLUE}http://localhost:5000${NC}"
else
    echo -e "${RED}✗ Failed to start backend${NC}"
    echo "Check logs: tail /tmp/call-helper-backend.log"
    exit 1
fi

echo ""

# Start Frontend Server
echo -e "${BLUE}Starting Frontend (React + Vite)...${NC}"
npm run dev -- --port 5173 > /tmp/call-helper-frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 4

# Check if frontend started successfully
if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Frontend running (PID: $FRONTEND_PID)${NC}"
    echo -e "   URL: ${BLUE}http://localhost:5173${NC}"
else
    echo -e "${RED}✗ Failed to start frontend${NC}"
    echo "Check logs: tail /tmp/call-helper-frontend.log"
    pkill -f "python3 app.py"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                   🚀 PROJECT RUNNING 🚀                     ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║                                                              ║"
echo -e "║  🌐 Frontend:  ${BLUE}http://localhost:5173${NC}$(printf '%26s' '║')"
echo -e "║  🔌 Backend:   ${BLUE}http://localhost:5000${NC}$(printf '%27s' '║')"
echo "║                                                              ║"
echo "║                                                              ║"
echo "║                                                              ║"
echo "║                                                              ║"
echo "║                                                              ║"
echo "║                                                              ║"
echo "║  ⌨️  Press Ctrl+C to stop all servers                       ║"
echo "║                                                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Keep script running
wait
