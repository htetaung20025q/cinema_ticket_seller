#!/usr/bin/env bash
# Apex Cinema - Instant Developer Startup Script

set -e

echo "=========================================================="
echo "      🍿 Starting Apex Cinema Full-Stack System 🍿      "
echo "=========================================================="

# Ensure we are in the project root directory
cd "$(dirname "$0")"

# Trap CTRL+C (SIGINT/SIGTERM) to kill all spawned background server processes cleanly
cleanup() {
    echo ""
    echo "🛑 Shutting down Apex Cinema backend and frontend servers..."
    kill $(jobs -p) 2>/dev/null || true
    echo "✔ All servers stopped. Goodbye!"
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Start FastAPI Backend API Server on Port 8000
echo "🚀 [1/2] Launching FastAPI Backend API Server (Port 8000)..."
export PYTHONPATH=.
./venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Give backend a moment to initialize database schemas and SQLite failover
sleep 2

# 2. Start React Vite Frontend Application on Port 5173
echo "🚀 [2/2] Launching React (Vite) Frontend UI (Port 5173)..."
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

echo "=========================================================="
echo " 🌟 APEX CINEMA IS LIVE AND READY FOR TESTING! 🌟 "
echo " 👉 Frontend UI:  http://localhost:5173"
echo " 👉 Backend API & Docs: http://localhost:8000/docs"
echo " 👉 Demo Account: demo@cinevibe.com (password123)"
echo "=========================================================="
echo "Press [CTRL + C] in this window anytime to stop both servers."

# Wait indefinitely for background servers
wait
