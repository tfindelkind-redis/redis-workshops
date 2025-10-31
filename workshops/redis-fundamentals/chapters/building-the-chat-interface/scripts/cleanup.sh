#!/bin/bash

# Chapter Cleanup Script
# This script cleans up resources created during the chapter

set -e

CHAPTER_NAME="Building the Chat Interface"
echo "🧹 Cleaning up resources for: $CHAPTER_NAME"

# Remove workspace directory
WORK_DIR="./workspace"
if [ -d "$WORK_DIR" ]; then
    rm -rf "$WORK_DIR"
    echo "✅ Removed workspace directory"
fi

# Optional: Clean up Redis data
read -p "Do you want to flush the Redis database? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    redis-cli FLUSHDB
    echo "✅ Flushed Redis database"
else
    echo "ℹ️  Keeping Redis data"
fi

echo "✅ Cleanup complete!"
