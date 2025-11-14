#!/bin/bash

# Workshop Setup Script
# This script sets up the environment for the entire workshop

set -e

WORKSHOP_NAME="redis-production-workshop"
echo "🚀 Setting up: $WORKSHOP_NAME"
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check if Redis is available
if ! command -v redis-cli &> /dev/null; then
    echo "❌ Redis not found. Please install Redis first."
    exit 1
fi

echo "✅ All prerequisites met"
echo ""

# Run setup for each chapter
echo "📚 Setting up workshop chapters..."

# Add chapter setup commands here
# Example:
# cd "$SCRIPT_DIR/../../shared/chapters/chapter-01-getting-started" && ./scripts/setup.sh

echo ""
echo "✅ Workshop setup complete!"
echo ""
echo "You're ready to start the workshop. Follow the README.md for instructions."
