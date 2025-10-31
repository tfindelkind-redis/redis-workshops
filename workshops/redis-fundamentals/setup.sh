#!/bin/bash

# Redis Fundamentals Workshop Setup Script

set -e

WORKSHOP_NAME="Redis Fundamentals Workshop"
echo "🚀 Setting up: $WORKSHOP_NAME"
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check if Redis is available
if ! command -v redis-cli &> /dev/null; then
    echo "⚠️  Redis not found. We'll guide you through installation in Chapter 1."
else
    echo "✅ Redis found: $(redis-cli --version)"
fi

echo ""
echo "✅ Workshop setup complete!"
echo ""
echo "📚 Next steps:"
echo "1. Read the workshop README.md"
echo "2. Start with Chapter 1: Getting Started with Redis"
echo "3. Follow each chapter in order"
echo ""
echo "Happy learning! 🎓"
