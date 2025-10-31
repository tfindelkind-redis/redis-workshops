#!/bin/bash

# Chapter 01 Setup Script
# Prepares environment for Redis basics chapter

set -e

CHAPTER_NAME="Getting Started with Redis"
echo "🚀 Setting up environment for: $CHAPTER_NAME"

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check if Redis CLI is available
if ! command -v redis-cli &> /dev/null; then
    echo "❌ redis-cli not found."
    echo ""
    echo "Please install Redis:"
    echo "  macOS:  brew install redis"
    echo "  Linux:  sudo apt install redis-server"
    echo ""
    exit 1
fi

echo "✅ Redis CLI found: $(redis-cli --version)"

# Check Redis connection
echo "🔍 Checking Redis server connection..."
if redis-cli ping &> /dev/null; then
    echo "✅ Redis server is running"
else
    echo "⚠️  Redis server is not running"
    echo ""
    echo "Please start Redis:"
    echo "  redis-server"
    echo ""
    echo "Or in the background:"
    echo "  redis-server --daemonize yes"
    echo ""
    exit 1
fi

# Create working directory
WORK_DIR="./workspace"
mkdir -p "$WORK_DIR"
echo "✅ Created workspace directory: $WORK_DIR"

# Clear any existing practice data
echo "🧹 Cleaning up any previous practice data..."
redis-cli --scan --pattern "user:*" | xargs -L 1 redis-cli DEL > /dev/null 2>&1 || true
redis-cli --scan --pattern "session:*" | xargs -L 1 redis-cli DEL > /dev/null 2>&1 || true
redis-cli --scan --pattern "temp:*" | xargs -L 1 redis-cli DEL > /dev/null 2>&1 || true

echo "✅ Setup complete! You're ready to start the chapter."
echo ""
echo "Next steps:"
echo "1. Read through the chapter README.md"
echo "2. Follow along with the examples"
echo "3. Complete the practice exercises"
echo "4. Run cleanup.sh when finished"
