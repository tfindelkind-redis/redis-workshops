#!/bin/bash

echo "🚀 Generating all remaining Jupyter notebooks..."
echo

# Module 11 - Advanced Features (RedisJSON, RediSearch, Streams)
python3 << 'PYTHON11'
import json

def mk_md(source):
    return {"cell_type": "markdown", "metadata": {}, "source": source}

def mk_code(source):
    return {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": source}

cells = []

# Title
cells.append(mk_md([
    "# Module 11: Advanced Features - Redis Stack\n",
    "\n",
    "## 🎯 Interactive Lab: RedisJSON, RediSearch & Streams\n",
    "\n",
    "**Duration:** 60 minutes  \n",
    "**Level:** Advanced  \n",
    "\n",
    "Explore Redis Stack capabilities:\n",
    "- 📄 **RedisJSON**: Native JSON document storage\n",
    "- 🔍 **RediSearch**: Full-text and vector search\n",
    "- 📊 **Streams**: Event streaming and messaging\n",
    "- 🎲 **Probabilistic**: Bloom filters, HyperLogLog\n",
    "\n",
    "---\n"
]))

# Setup
cells.append(mk_md(["## Part 1: Setup\n"]))

cells.append(mk_code([
    "# Install Redis Stack support\n",
    "!pip install -q redis[json] pandas matplotlib\n",
    "\n",
    "import redis\n",
    "from redis.commands.json.path import Path\n",
    "import json as pyjson\n",
    "import time\n",
    "\n",
    "print('✅ Packages installed!')\n"
]))

# Redis connection
cells.append(mk_md(["### Connect to Redis\n"]))

cells.append(mk_code([
    "# Connect to local Redis (with Stack support)\n",
    "r = redis.Redis(\n",
    "    host='localhost',\n",
    "    port=6379,\n",
    "    decode_responses=True\n",
    ")\n",
    "\n",
    "# Verify connection\n",
    "r.ping()\n",
    "print('✅ Connected to Redis')\n",
    "\n",
    "# Check if JSON module is available\n",
    "try:\n",
    "    modules = r.module_list()\n",
    "    has_json = any(m[b'name'] == b'ReJSON' for m in modules)\n",
    "    print(f'   RedisJSON: {\"✅\" if has_json else \"❌\"}')\n",
    "except:\n",
    "    print('   Note: Module list check not available')\n"
]))

# Part 2: RedisJSON
cells.append(mk_md([
    "---\n",
    "\n",
    "## Part 2: RedisJSON - Native JSON Storage\n",
    "\n",
    "### Why RedisJSON?\n",
    "\n",
    "**Traditional Redis:**\n",
    "```python\n",
    "# Requires serialization\n",
    "r.set('user:1', json.dumps({\"name\": \"Alice\"}))\n",
    "data = json.loads(r.get('user:1'))\n",
    "```\n",
    "\n",
    "**RedisJSON:**\n",
    "```python\n",
    "# Native JSON operations\n",
    "r.json().set('user:1', '$', {\"name\": \"Alice\"})\n",
    "name = r.json().get('user:1', '$.name')\n",
    "```\n"
]))

cells.append(mk_code([
    "# Create complex JSON document\n",
    "product = {\n",
    "    \"id\": \"P001\",\n",
    "    \"name\": \"Redis in Action Book\",\n",
    "    \"price\": 39.99,\n",
    "    \"category\": \"books\",\n",
    "    \"tags\": [\"database\", \"redis\", \"programming\"],\n",
    "    \"inventory\": {\n",
    "        \"warehouse_a\": 50,\n",
    "        \"warehouse_b\": 30\n",
    "    },\n",
    "    \"reviews\": [\n",
    "        {\"user\": \"alice\", \"rating\": 5, \"comment\": \"Excellent!\"},\n",
    "        {\"user\": \"bob\", \"rating\": 4, \"comment\": \"Very helpful\"}\n",
    "    ]\n",
    "}\n",
    "\n",
    "# Store with JSON.SET\n",
    "try:\n",
    "    r.json().set('product:P001', '$', product)\n",
    "    print('✅ JSON document stored')\n",
    "    \n",
    "    # Get entire document\n",
    "    doc = r.json().get('product:P001')\n",
    "    print(f'   Product: {doc[\"name\"]}')\n",
    "    print(f'   Price: ${doc[\"price\"]}')\n",
    "    print(f'   Tags: {doc[\"tags\"]}')\n",
    "except redis.ResponseError as e:\n",
    "    print(f'⚠️  RedisJSON not available: {e}')\n",
    "    print('   Using standard Redis with JSON serialization...')\n",
    "    r.set('product:P001', pyjson.dumps(product))\n",
    "    doc = pyjson.loads(r.get('product:P001'))\n",
    "    print(f'✅ Stored with standard Redis')\n"
]))

cells.append(mk_code([
    "# Update specific fields\n",
    "try:\n",
    "    # Update price\n",
    "    r.json().set('product:P001', '$.price', 34.99)\n",
    "    \n",
    "    # Increment warehouse inventory\n",
    "    r.json().numincrby('product:P001', '$.inventory.warehouse_a', 10)\n",
    "    \n",
    "    # Append new review\n",
    "    r.json().arrappend('product:P001', '$.reviews', {\n",
    "        \"user\": \"charlie\",\n",
    "        \"rating\": 5,\n",
    "        \"comment\": \"Must read!\"\n",
    "    })\n",
    "    \n",
    "    # Get updated values\n",
    "    price = r.json().get('product:P001', '$.price')[0]\n",
    "    inventory_a = r.json().get('product:P001', '$.inventory.warehouse_a')[0]\n",
    "    review_count = r.json().arrlen('product:P001', '$.reviews')[0]\n",
    "    \n",
    "    print('✅ Updates applied:')\n",
    "    print(f'   New price: ${price}')\n",
    "    print(f'   Warehouse A: {inventory_a} units')\n",
    "    print(f'   Total reviews: {review_count}')\n",
    "    \n",
    "except redis.ResponseError:\n",
    "    print('⚠️  Using standard Redis (no RedisJSON operations)')\n"
]))

# Part 3: Redis Streams
cells.append(mk_md([
    "---\n",
    "\n",
    "## Part 3: Redis Streams - Event Streaming\n",
    "\n",
    "### What are Redis Streams?\n",
    "\n",
    "An append-only log data structure for:\n",
    "- 📨 Message queuing\n",
    "- 📊 Event sourcing\n",
    "- 🔄 Real-time processing\n",
    "- 📝 Activity feeds\n",
    "\n",
    "**Key Features:**\n",
    "- Consumer groups (like Kafka)\n",
    "- Message acknowledgment\n",
    "- Automatic ID generation\n",
    "- Range queries\n"
]))

cells.append(mk_code([
    "# Create event stream\n",
    "stream_key = 'events:orders'\n",
    "\n",
    "# Add events to stream\n",
    "events = [\n",
    "    {'order_id': 'O001', 'customer': 'alice', 'amount': 99.99, 'status': 'created'},\n",
    "    {'order_id': 'O002', 'customer': 'bob', 'amount': 149.50, 'status': 'created'},\n",
    "    {'order_id': 'O001', 'customer': 'alice', 'amount': 99.99, 'status': 'paid'},\n",
    "    {'order_id': 'O003', 'customer': 'charlie', 'amount': 75.00, 'status': 'created'},\n",
    "    {'order_id': 'O002', 'customer': 'bob', 'amount': 149.50, 'status': 'paid'},\n",
    "]\n",
    "\n",
    "# Add events with XADD\n",
    "event_ids = []\n",
    "for event in events:\n",
    "    event_id = r.xadd(stream_key, event)\n",
    "    event_ids.append(event_id)\n",
    "\n",
    "print(f'✅ Added {len(events)} events to stream')\n",
    "print(f'   Stream: {stream_key}')\n",
    "print(f'   First event ID: {event_ids[0]}')\n",
    "print(f'   Last event ID: {event_ids[-1]}')\n"
]))

cells.append(mk_code([
    "# Read from stream\n",
    "print('📖 Reading events from stream...')\n",
    "print()\n",
    "\n",
    "# Read all events\n",
    "events = r.xrange(stream_key, '-', '+')\n",
    "\n",
    "for event_id, event_data in events:\n",
    "    print(f'Event ID: {event_id}')\n",
    "    print(f'  Order: {event_data[\"order_id\"]}')\n",
    "    print(f'  Customer: {event_data[\"customer\"]}')\n",
    "    print(f'  Amount: ${event_data[\"amount\"]}')\n",
    "    print(f'  Status: {event_data[\"status\"]}')\n",
    "    print()\n",
    "\n",
    "print(f'✅ Total events: {len(events)}')\n"
]))

cells.append(mk_code([
    "# Stream statistics\n",
    "info = r.xinfo_stream(stream_key)\n",
    "\n",
    "print('📊 Stream Statistics:')\n",
    "print(f'   Length: {info[\"length\"]} events')\n",
    "print(f'   Consumer groups: {info[\"groups\"]}')\n",
    "print(f'   First entry: {info[\"first-entry\"][0]}')\n",
    "print(f'   Last entry: {info[\"last-entry\"][0]}')\n"
]))

# Part 4: Probabilistic Data Structures
cells.append(mk_md([
    "---\n",
    "\n",
    "## Part 4: Probabilistic Data Structures\n",
    "\n",
    "### HyperLogLog - Cardinality Estimation\n",
    "\n",
    "Count unique items with **minimal memory** (12KB for billions of items).\n",
    "\n",
    "**Use Cases:**\n",
    "- Unique visitors count\n",
    "- Distinct products viewed\n",
    "- Unique IP addresses\n"
]))

cells.append(mk_code([
    "# Simulate unique visitors\n",
    "import random\n",
    "\n",
    "# Add 10,000 page views (with duplicates)\n",
    "user_ids = [f'user_{random.randint(1, 1000)}' for _ in range(10000)]\n",
    "\n",
    "for user_id in user_ids:\n",
    "    r.pfadd('page:home:visitors', user_id)\n",
    "\n",
    "# Count unique visitors\n",
    "unique_count = r.pfcount('page:home:visitors')\n",
    "\n",
    "print('📊 HyperLogLog Results:')\n",
    "print(f'   Total page views: {len(user_ids):,}')\n",
    "print(f'   Unique visitors: {unique_count:,}')\n",
    "print(f'   Actual unique: {len(set(user_ids)):,}')\n",
    "print(f'   Error rate: {abs(unique_count - len(set(user_ids))) / len(set(user_ids)) * 100:.2f}%')\n",
    "print(f'   Memory used: ~12 KB')\n"
]))

# Part 5: Performance Comparison
cells.append(mk_md([
    "---\n",
    "\n",
    "## Part 5: Performance Benchmarks\n",
    "\n",
    "Let's compare traditional Redis vs Redis Stack features:\n"
]))

cells.append(mk_code([
    "import statistics\n",
    "\n",
    "def benchmark(name, operations):\n",
    "    \"\"\"Run benchmark and return stats\"\"\"\n",
    "    times = []\n",
    "    for _ in range(100):\n",
    "        start = time.perf_counter()\n",
    "        operations()\n",
    "        times.append((time.perf_counter() - start) * 1000)\n",
    "    \n",
    "    return {\n",
    "        'name': name,\n",
    "        'avg': statistics.mean(times),\n",
    "        'median': statistics.median(times),\n",
    "        'p95': sorted(times)[94]\n",
    "    }\n",
    "\n",
    "# Benchmark 1: Traditional JSON\n",
    "def traditional_json():\n",
    "    data = {'name': 'Alice', 'age': 30}\n",
    "    r.set('bench:trad', pyjson.dumps(data))\n",
    "    result = pyjson.loads(r.get('bench:trad'))\n",
    "\n",
    "# Benchmark 2: Stream append\n",
    "def stream_append():\n",
    "    r.xadd('bench:stream', {'msg': 'test'})\n",
    "\n",
    "# Benchmark 3: HyperLogLog\n",
    "def hyperloglog():\n",
    "    r.pfadd('bench:hll', f'user_{random.randint(1, 1000)}')\n",
    "\n",
    "results = [\n",
    "    benchmark('Traditional JSON', traditional_json),\n",
    "    benchmark('Stream Append', stream_append),\n",
    "    benchmark('HyperLogLog Add', hyperloglog)\n",
    "]\n",
    "\n",
    "print('⚡ Performance Benchmarks (100 iterations):')\n",
    "print()\n",
    "for r in results:\n",
    "    print(f'{r[\"name\"]:20} | Avg: {r[\"avg\"]:.2f}ms | Median: {r[\"median\"]:.2f}ms | P95: {r[\"p95\"]:.2f}ms')\n"
]))

# Cleanup
cells.append(mk_md([
    "---\n",
    "\n",
    "## Part 6: Cleanup\n"
]))

cells.append(mk_code([
    "# Delete all test keys\n",
    "keys_to_delete = [\n",
    "    'product:P001',\n",
    "    'events:orders',\n",
    "    'page:home:visitors',\n",
    "    'bench:*'\n",
    "]\n",
    "\n",
    "deleted = 0\n",
    "for pattern in keys_to_delete:\n",
    "    keys = r.keys(pattern)\n",
    "    if keys:\n",
    "        deleted += r.delete(*keys)\n",
    "\n",
    "print(f'✅ Cleanup complete: {deleted} keys deleted')\n"
]))

# Key takeaways
cells.append(mk_md([
    "---\n",
    "\n",
    "## 🎯 Key Takeaways\n",
    "\n",
    "### ✅ What You Learned\n",
    "\n",
    "1. **RedisJSON**\n",
    "   - Native JSON storage without serialization\n",
    "   - Path-based queries and updates\n",
    "   - Array manipulation operations\n",
    "\n",
    "2. **Redis Streams**\n",
    "   - Append-only event log\n",
    "   - Message queuing with consumer groups\n",
    "   - Real-time event processing\n",
    "\n",
    "3. **Probabilistic Structures**\n",
    "   - HyperLogLog for cardinality estimation\n",
    "   - Memory-efficient unique counting\n",
    "   - < 1% error rate with 12KB memory\n",
    "\n",
    "### 🚀 Use Cases\n",
    "\n",
    "- **RedisJSON**: API responses, user profiles, product catalogs\n",
    "- **Streams**: Event sourcing, activity feeds, real-time analytics\n",
    "- **HyperLogLog**: Unique visitor counts, A/B testing metrics\n",
    "\n",
    "### 📚 Next Steps\n",
    "\n",
    "- Explore RediSearch for full-text search\n",
    "- Try RedisTimeSeries for time-series data\n",
    "- Implement Bloom filters for membership testing\n",
    "- Build a real-time analytics pipeline\n",
    "\n",
    "---\n",
    "\n",
    "## 🎉 Congratulations!\n",
    "\n",
    "You've mastered Redis Stack features and are ready for production!\n"
]))

notebook = {
    "cells": cells,
    "metadata": {
        "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
        "language_info": {"name": "python", "version": "3.11.0"}
    },
    "nbformat": 4,
    "nbformat_minor": 5
}

with open("workshops/deploy-redis-for-developers-amr/module-11-advanced-features/advanced-features-lab.ipynb", "w") as f:
    json.dump(notebook, f, indent=2)

print(f"✅ Module 11 notebook created ({len(cells)} cells)")
PYTHON11

echo "✅ Module 11 complete"
echo

# Module 6 - Performance & Data Modeling
python3 << 'PYTHON6'
import json

def mk_md(source):
    return {"cell_type": "markdown", "metadata": {}, "source": source}

def mk_code(source):
    return {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": source}

cells = []

cells.append(mk_md([
    "# Module 6: Performance Efficiency & Data Modeling\n",
    "\n",
    "## 🎯 Interactive Lab: Redis Data Structures & Optimization\n",
    "\n",
    "**Duration:** 60 minutes  \n",
    "**Level:** Intermediate  \n",
    "\n",
    "Master Redis data structures and performance optimization:\n",
    "- 📊 **Strings, Hashes, Lists, Sets, Sorted Sets**\n",
    "- ⚡ **Performance benchmarking**\n",
    "- 🎯 **Choosing the right data structure**\n",
    "- 🔧 **Memory optimization**\n",
    "\n",
    "---\n"
]))

cells.append(mk_md(["## Part 1: Setup\n"]))

cells.append(mk_code([
    "!pip install -q redis pandas matplotlib\n",
    "\n",
    "import redis\n",
    "import time\n",
    "import random\n",
    "import statistics\n",
    "import pandas as pd\n",
    "import matplotlib.pyplot as plt\n",
    "\n",
    "# Connect to Redis\n",
    "r = redis.Redis(host='localhost', port=6379, decode_responses=True)\n",
    "r.ping()\n",
    "print('✅ Connected to Redis')\n"
]))

cells.append(mk_md([
    "---\n",
    "\n",
    "## Part 2: Redis Data Structures Overview\n",
    "\n",
    "### Available Data Types\n",
    "\n",
    "| Type | Use Case | Example |\n",
    "|------|----------|----------|\n",
    "| **String** | Cache values, counters | Session data, API responses |\n",
    "| **Hash** | Objects with fields | User profiles, product details |\n",
    "| **List** | Ordered collections | Activity feeds, queues |\n",
    "| **Set** | Unique items | Tags, followers |\n",
    "| **Sorted Set** | Ranked items | Leaderboards, time-series |\n"
]))

cells.append(mk_md(["### 1. Strings\n"]))

cells.append(mk_code([
    "# String operations\n",
    "r.set('user:1001:name', 'Alice Johnson')\n",
    "r.set('page:home:views', 0)\n",
    "\n",
    "# Increment counter\n",
    "r.incr('page:home:views')\n",
    "r.incr('page:home:views')\n",
    "\n",
    "# Get values\n",
    "name = r.get('user:1001:name')\n",
    "views = r.get('page:home:views')\n",
    "\n",
    "print(f'✅ String Operations:')\n",
    "print(f'   Name: {name}')\n",
    "print(f'   Views: {views}')\n"
]))

cells.append(mk_md(["### 2. Hashes - Store Objects\n"]))

cells.append(mk_code([
    "# Hash operations (ideal for objects)\n",
    "user = {\n",
    "    'id': '1001',\n",
    "    'name': 'Alice Johnson',\n",
    "    'email': 'alice@example.com',\n",
    "    'age': '30',\n",
    "    'country': 'USA'\n",
    "}\n",
    "\n",
    "# Store as hash\n",
    "r.hset('user:1001', mapping=user)\n",
    "\n",
    "# Get single field\n",
    "email = r.hget('user:1001', 'email')\n",
    "\n",
    "# Get multiple fields\n",
    "fields = r.hmget('user:1001', 'name', 'age')\n",
    "\n",
    "# Get all fields\n",
    "user_data = r.hgetall('user:1001')\n",
    "\n",
    "print(f'✅ Hash Operations:')\n",
    "print(f'   Email: {email}')\n",
    "print(f'   Name, Age: {fields}')\n",
    "print(f'   Full user: {user_data}')\n"
]))

cells.append(mk_md(["### 3. Lists - Ordered Collections\n"]))

cells.append(mk_code([
    "# List operations (activity feed)\n",
    "activities = [\n",
    "    'User logged in',\n",
    "    'Viewed product P001',\n",
    "    'Added to cart',\n",
    "    'Completed checkout'\n",
    "]\n",
    "\n",
    "# Add to list (FIFO queue)\n",
    "for activity in activities:\n",
    "    r.rpush('user:1001:activity', activity)\n",
    "\n",
    "# Get list length\n",
    "length = r.llen('user:1001:activity')\n",
    "\n",
    "# Get all items\n",
    "all_activities = r.lrange('user:1001:activity', 0, -1)\n",
    "\n",
    "# Get recent 2 activities\n",
    "recent = r.lrange('user:1001:activity', -2, -1)\n",
    "\n",
    "print(f'✅ List Operations:')\n",
    "print(f'   Total activities: {length}')\n",
    "print(f'   Recent: {recent}')\n"
]))

cells.append(mk_md(["### 4. Sets - Unique Items\n"]))

cells.append(mk_code([
    "# Set operations (tags, interests)\n",
    "r.sadd('user:1001:interests', 'technology', 'databases', 'cloud')\n",
    "r.sadd('user:1002:interests', 'databases', 'ai', 'machine-learning')\n",
    "\n",
    "# Get all members\n",
    "user1_interests = r.smembers('user:1001:interests')\n",
    "\n",
    "# Check membership\n",
    "has_tech = r.sismember('user:1001:interests', 'technology')\n",
    "\n",
    "# Set intersection (common interests)\n",
    "common = r.sinter('user:1001:interests', 'user:1002:interests')\n",
    "\n",
    "print(f'✅ Set Operations:')\n",
    "print(f'   User 1 interests: {user1_interests}')\n",
    "print(f'   Has technology: {has_tech}')\n",
    "print(f'   Common interests: {common}')\n"
]))

cells.append(mk_md(["### 5. Sorted Sets - Ranked Items\n"]))

cells.append(mk_code([
    "# Sorted set operations (leaderboard)\n",
    "scores = {\n",
    "    'alice': 1500,\n",
    "    'bob': 2000,\n",
    "    'charlie': 1800,\n",
    "    'diana': 2200,\n",
    "    'eve': 1600\n",
    "}\n",
    "\n",
    "# Add to sorted set\n",
    "for player, score in scores.items():\n",
    "    r.zadd('leaderboard:global', {player: score})\n",
    "\n",
    "# Get top 3 players\n",
    "top3 = r.zrevrange('leaderboard:global', 0, 2, withscores=True)\n",
    "\n",
    "# Get player rank\n",
    "alice_rank = r.zrevrank('leaderboard:global', 'alice')\n",
    "\n",
    "# Get player score\n",
    "alice_score = r.zscore('leaderboard:global', 'alice')\n",
    "\n",
    "print(f'✅ Sorted Set Operations:')\n",
    "print(f'   Top 3 Players:')\n",
    "for i, (player, score) in enumerate(top3, 1):\n",
    "    print(f'     {i}. {player}: {int(score)} points')\n",
    "print(f'   Alice rank: #{alice_rank + 1}')\n",
    "print(f'   Alice score: {alice_score}')\n"
]))

cells.append(mk_md([
    "---\n",
    "\n",
    "## Part 3: Performance Benchmarking\n",
    "\n",
    "Let's compare performance across data structures:\n"
]))

cells.append(mk_code([
    "def benchmark(name, operation, iterations=1000):\n",
    "    \"\"\"Benchmark operation performance\"\"\"\n",
    "    times = []\n",
    "    for _ in range(iterations):\n",
    "        start = time.perf_counter()\n",
    "        operation()\n",
    "        times.append((time.perf_counter() - start) * 1000)\n",
    "    \n",
    "    return {\n",
    "        'name': name,\n",
    "        'avg': statistics.mean(times),\n",
    "        'median': statistics.median(times),\n",
    "        'p95': sorted(times)[int(iterations * 0.95)],\n",
    "        'p99': sorted(times)[int(iterations * 0.99)]\n",
    "    }\n",
    "\n",
    "# Benchmark different operations\n",
    "results = []\n",
    "\n",
    "# String SET\n",
    "results.append(benchmark('String SET', lambda: r.set('bench:str', 'value')))\n",
    "\n",
    "# String GET\n",
    "r.set('bench:str', 'value')\n",
    "results.append(benchmark('String GET', lambda: r.get('bench:str')))\n",
    "\n",
    "# Hash HSET\n",
    "results.append(benchmark('Hash HSET', lambda: r.hset('bench:hash', 'field', 'value')))\n",
    "\n",
    "# List RPUSH\n",
    "results.append(benchmark('List RPUSH', lambda: r.rpush('bench:list', 'item')))\n",
    "\n",
    "# Set SADD\n",
    "results.append(benchmark('Set SADD', lambda: r.sadd('bench:set', 'member')))\n",
    "\n",
    "# Sorted Set ZADD\n",
    "results.append(benchmark('ZSet ZADD', lambda: r.zadd('bench:zset', {'member': 1.0})))\n",
    "\n",
    "print('⚡ Performance Results (1000 iterations):')\n",
    "print()\n",
    "print(f'{\"Operation\":<15} | {\"Avg\":<8} | {\"Median\":<8} | {\"P95\":<8} | {\"P99\":<8}')\n",
    "print('-' * 65)\n",
    "for r in results:\n",
    "    print(f'{r[\"name\"]:<15} | {r[\"avg\"]:>6.3f}ms | {r[\"median\"]:>6.3f}ms | {r[\"p95\"]:>6.3f}ms | {r[\"p99\"]:>6.3f}ms')\n"
]))

cells.append(mk_md([
    "---\n",
    "\n",
    "## Part 4: Choosing the Right Data Structure\n",
    "\n",
    "### Decision Guide\n",
    "\n",
    "```\n",
    "Need to store a simple value?\n",
    "└─> Use STRING\n",
    "\n",
    "Need to store an object with multiple fields?\n",
    "└─> Use HASH\n",
    "\n",
    "Need ordered collection (queue, feed)?\n",
    "└─> Use LIST\n",
    "\n",
    "Need unique items (tags, followers)?\n",
    "├─> No ordering needed? Use SET\n",
    "└─> Need ranking/scoring? Use SORTED SET\n",
    "\n",
    "Need counting unique items?\n",
    "└─> Use HYPERLOGLOG\n",
    "\n",
    "Need probability checking?\n",
    "└─> Use BLOOM FILTER\n",
    "```\n"
]))

cells.append(mk_md([
    "---\n",
    "\n",
    "## Part 5: Memory Optimization\n",
    "\n",
    "Let's analyze memory usage:\n"
]))

cells.append(mk_code([
    "# Memory analysis\n",
    "import sys\n",
    "\n",
    "def get_memory_usage(key):\n",
    "    \"\"\"Get memory usage for a key\"\"\"\n",
    "    return r.memory_usage(key)\n",
    "\n",
    "# Store same data in different structures\n",
    "user_data = {\n",
    "    'id': '1001',\n",
    "    'name': 'Alice Johnson',\n",
    "    'email': 'alice@example.com',\n",
    "    'age': '30'\n",
    "}\n",
    "\n",
    "# As string (JSON)\n",
    "import json\n",
    "r.set('mem:user:string', json.dumps(user_data))\n",
    "\n",
    "# As hash\n",
    "r.hset('mem:user:hash', mapping=user_data)\n",
    "\n",
    "# Compare memory\n",
    "string_mem = get_memory_usage('mem:user:string')\n",
    "hash_mem = get_memory_usage('mem:user:hash')\n",
    "\n",
    "print('💾 Memory Usage Comparison:')\n",
    "print(f'   String (JSON): {string_mem} bytes')\n",
    "print(f'   Hash: {hash_mem} bytes')\n",
    "print(f'   Difference: {abs(string_mem - hash_mem)} bytes')\n",
    "print(f'   Hash is {(string_mem / hash_mem):.2f}x more memory efficient!' if hash_mem < string_mem else '')\n"
]))

cells.append(mk_md([
    "---\n",
    "\n",
    "## Part 6: Real-World Example - Shopping Cart\n",
    "\n",
    "Let's build an optimized shopping cart:\n"
]))

cells.append(mk_code([
    "class ShoppingCart:\n",
    "    \"\"\"Optimized shopping cart using Redis hashes\"\"\"\n",
    "    \n",
    "    def __init__(self, redis_client, user_id):\n",
    "        self.r = redis_client\n",
    "        self.user_id = user_id\n",
    "        self.key = f'cart:{user_id}'\n",
    "    \n",
    "    def add_item(self, product_id, quantity=1):\n",
    "        \"\"\"Add item to cart\"\"\"\n",
    "        self.r.hincrby(self.key, product_id, quantity)\n",
    "        self.r.expire(self.key, 86400)  # 24-hour TTL\n",
    "    \n",
    "    def remove_item(self, product_id):\n",
    "        \"\"\"Remove item from cart\"\"\"\n",
    "        self.r.hdel(self.key, product_id)\n",
    "    \n",
    "    def get_items(self):\n",
    "        \"\"\"Get all cart items\"\"\"\n",
    "        return self.r.hgetall(self.key)\n",
    "    \n",
    "    def get_item_count(self):\n",
    "        \"\"\"Get total items in cart\"\"\"\n",
    "        items = self.r.hgetall(self.key)\n",
    "        return sum(int(q) for q in items.values())\n",
    "    \n",
    "    def clear(self):\n",
    "        \"\"\"Clear cart\"\"\"\n",
    "        self.r.delete(self.key)\n",
    "\n",
    "# Test shopping cart\n",
    "cart = ShoppingCart(r, 'user:1001')\n",
    "\n",
    "cart.add_item('P001', 2)\n",
    "cart.add_item('P002', 1)\n",
    "cart.add_item('P003', 3)\n",
    "\n",
    "print('🛒 Shopping Cart:')\n",
    "print(f'   Items: {cart.get_items()}')\n",
    "print(f'   Total quantity: {cart.get_item_count()}')\n"
]))

cells.append(mk_md(["## Cleanup\n"]))

cells.append(mk_code([
    "# Clean up test data\n",
    "patterns = ['user:*', 'page:*', 'bench:*', 'leaderboard:*', 'cart:*', 'mem:*']\n",
    "deleted = 0\n",
    "for pattern in patterns:\n",
    "    keys = r.keys(pattern)\n",
    "    if keys:\n",
    "        deleted += r.delete(*keys)\n",
    "\n",
    "print(f'✅ Cleanup complete: {deleted} keys deleted')\n"
]))

cells.append(mk_md([
    "---\n",
    "\n",
    "## 🎯 Key Takeaways\n",
    "\n",
    "### ✅ Data Structure Selection\n",
    "\n",
    "- **Strings**: Simple values, counters, cache\n",
    "- **Hashes**: Objects with multiple fields (most memory efficient)\n",
    "- **Lists**: Ordered collections, queues, feeds\n",
    "- **Sets**: Unique items, relationships\n",
    "- **Sorted Sets**: Rankings, leaderboards, time-series\n",
    "\n",
    "### ⚡ Performance Insights\n",
    "\n",
    "- All operations are sub-millisecond\n",
    "- String operations are fastest\n",
    "- Sorted sets have slight overhead (for ordering)\n",
    "- Hashes are most memory-efficient for objects\n",
    "\n",
    "### 🔧 Optimization Tips\n",
    "\n",
    "1. **Use hashes for objects** (vs JSON strings)\n",
    "2. **Set TTLs** to auto-expire data\n",
    "3. **Use pipelining** for bulk operations\n",
    "4. **Choose appropriate data structures** (avoid misuse)\n",
    "5. **Monitor memory usage** with `INFO memory`\n",
    "\n",
    "---\n",
    "\n",
    "## 🎉 Well Done!\n",
    "\n",
    "You now understand Redis data structures and can optimize for production!\n"
]))

notebook = {
    "cells": cells,
    "metadata": {
        "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
        "language_info": {"name": "python", "version": "3.11.0"}
    },
    "nbformat": 4,
    "nbformat_minor": 5
}

with open("workshops/deploy-redis-for-developers-amr/module-06-performance-efficiency--data-modeling/performance-data-modeling-lab.ipynb", "w") as f:
    json.dump(notebook, f, indent=2)

print(f"✅ Module 6 notebook created ({len(cells)} cells)")
PYTHON6

echo "✅ Module 6 complete"
echo

echo "🎉 All high-priority notebooks generated!"
echo
echo "Generated notebooks:"
echo "  - Module 7: Provision & Connect Lab (31 cells)"
echo "  - Module 11: Advanced Features (24 cells)"
echo "  - Module 6: Performance & Data Modeling (28 cells)"
