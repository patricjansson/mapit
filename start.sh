#!/bin/bash

# Start backend server
cd backend && npm run dev &
BACKEND_PID=$!

# Start frontend server
cd frontend && npm start &
FRONTEND_PID=$!

# Function to handle script termination
function cleanup {
    echo "Stopping servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

# Set up trap to catch termination signal
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait