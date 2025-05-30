#!/bin/bash

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js är inte installerat. Vänligen installera Node.js först."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm är inte installerat. Vänligen installera npm först."
    exit 1
fi

# Function to check and install dependencies in a directory
check_and_install_deps() {
    local dir=$1
    if [ -d "$dir" ]; then
        echo "Kontrollerar beroenden i $dir..."
        if [ -f "$dir/package.json" ]; then
            if [ ! -d "$dir/node_modules" ]; then
                echo "Installerar beroenden i $dir..."
                cd "$dir" && npm install
                cd ..
            fi
        fi
    fi
}

# Check and install dependencies for both frontend and backend
check_and_install_deps "frontend"
check_and_install_deps "backend"

# Start both servers
echo "Startar serverna..."
cd backend && npm start &
cd frontend && npm start