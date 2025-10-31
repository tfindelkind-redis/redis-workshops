#!/bin/bash

# Solution for Exercise 1: User Profile Storage

set -e

echo "🎯 Running Exercise 1 Solution: User Profile Storage"
echo ""

echo "Step 1: Store user name"
redis-cli SET user:100:name "John Doe"

echo "Step 2: Store user email"
redis-cli SET user:100:email "john.doe@example.com"

echo "Step 3: Store user age"
redis-cli SET user:100:age "30"

echo ""
echo "Step 4: Retrieve all three values"
echo "Name: $(redis-cli GET user:100:name)"
echo "Email: $(redis-cli GET user:100:email)"
echo "Age: $(redis-cli GET user:100:age)"

echo ""
echo "Step 5: Delete the age field"
redis-cli DEL user:100:age

echo ""
echo "Step 6: Verify age is gone (should return nil)"
result=$(redis-cli GET user:100:age)
if [ "$result" = "" ]; then
    echo "✅ Age field successfully deleted"
else
    echo "❌ Age field still exists: $result"
fi

echo ""
echo "✅ Exercise 1 complete!"
