#!/bin/bash

# Chapter Demo Script
# This script demonstrates key concepts from the chapter

set -e

echo "🎬 Running chapter demonstration..."
echo ""

# Add your demo commands here
# Example:

echo "Step 1: [Description]"
redis-cli SET demo:key "demo value"
echo ""

echo "Step 2: [Description]"
redis-cli GET demo:key
echo ""

echo "Step 3: [Description]"
redis-cli DEL demo:key
echo ""

echo "✅ Demo complete!"
