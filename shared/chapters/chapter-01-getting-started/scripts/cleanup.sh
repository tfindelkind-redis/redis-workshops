#!/bin/bash

# Chapter 01 Cleanup Script

set -e

CHAPTER_NAME="Getting Started with Redis"
echo "🧹 Cleaning up resources for: $CHAPTER_NAME"

# Remove workspace directory
WORK_DIR="./workspace"
if [ -d "$WORK_DIR" ]; then
    rm -rf "$WORK_DIR"
    echo "✅ Removed workspace directory"
fi

# Clean up practice data
echo "🧹 Removing practice data from Redis..."
redis-cli --scan --pattern "user:*" | xargs -L 1 redis-cli DEL > /dev/null 2>&1 || true
redis-cli --scan --pattern "session:*" | xargs -L 1 redis-cli DEL > /dev/null 2>&1 || true
redis-cli --scan --pattern "temp:*" | xargs -L 1 redis-cli DEL > /dev/null 2>&1 || true
redis-cli --scan --pattern "greeting*" | xargs -L 1 redis-cli DEL > /dev/null 2>&1 || true

echo "✅ Cleanup complete!"
