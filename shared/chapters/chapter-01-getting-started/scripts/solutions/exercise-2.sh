#!/bin/bash

# Solution for Exercise 2: Temporary Session Data

set -e

echo "🎯 Running Exercise 2 Solution: Temporary Session Data"
echo ""

echo "Step 1: Create session with 30 second expiration"
redis-cli SETEX session:abc123 30 "user_logged_in"

echo ""
echo "Step 2: Check TTL (Time To Live)"
ttl=$(redis-cli TTL session:abc123)
echo "TTL: $ttl seconds remaining"

echo ""
echo "Step 3: Retrieve the value before it expires"
value=$(redis-cli GET session:abc123)
echo "Session value: $value"

echo ""
echo "✅ Exercise 2 complete!"
echo "ℹ️  The session will automatically expire in $ttl seconds"
