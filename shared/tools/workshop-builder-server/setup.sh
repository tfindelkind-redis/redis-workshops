#!/bin/bash

# Workshop Builder Server Setup Script
# Installs dependencies and starts the server

echo "=========================================="
echo "Workshop Builder Server Setup"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo ""
    echo "Please install Node.js first:"
    echo "  macOS: brew install node"
    echo "  Linux: sudo apt install nodejs npm"
    echo "  Or download from: https://nodejs.org/"
    echo ""
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ Setup Complete!"
    echo "=========================================="
    echo ""
    echo "To start the server:"
    echo "  npm start"
    echo ""
    echo "Or run in development mode (auto-reload):"
    echo "  npm run dev"
    echo ""
    echo "The server will run on: http://localhost:3000"
    echo ""
else
    echo ""
    echo "❌ Installation failed"
    echo "Please check the error messages above"
    exit 1
fi
