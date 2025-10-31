#!/bin/bash

# Chapter Setup Script
# This script prepares the environment for the chapter exercises

set -e

CHAPTER_NAME="Building the Chat Interface"
echo "🚀 Setting up environment for: $CHAPTER_NAME"

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check if Redis CLI is available
if ! command -v redis-cli &> /dev/null; then
    echo "❌ redis-cli not found. Please install Redis."
    exit 1
fi

echo "✅ Redis CLI found"

# Check Redis connection
if ! redis-cli ping &> /dev/null; then
    echo "⚠️  Warning: Cannot connect to Redis. Make sure Redis is running."
    echo "   You can start Redis with: redis-server"
fi

# Create working directory
WORK_DIR="./workspace"
mkdir -p "$WORK_DIR"
echo "✅ Created workspace directory: $WORK_DIR"

# Initialize any data or configuration
echo "📝 Initializing chapter resources..."

# Add your setup commands here
# Example:
# redis-cli FLUSHDB
# redis-cli SET setup:complete "true"

echo "✅ Setup complete! You're ready to start the chapter."
echo ""
echo "Next steps:"
echo "1. Read through the chapter README.md"
echo "2. Follow the exercises in order"
echo "3. Run cleanup.sh when finished"
