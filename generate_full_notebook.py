#!/usr/bin/env python3
"""
Generate complete Jupyter notebook for Redis Caching Lab
This creates all 35 cells with full content
"""
import json
import sys

def mk_md(source):
    """Create markdown cell"""
    return {"cell_type": "markdown", "metadata": {}, "source": source}

def mk_code(source):
    """Create code cell"""
    return {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": source}

cells = []

# PART 1: SETUP
cells.append(mk_md([
    "# 🚀 Implement Caching Lab - Interactive Edition\n",
    "\n",
    "**Duration:** 45-60 minutes  \n",
    "**Level:** Intermediate\n",
    "\n",
    "Welcome to the interactive caching lab! In this hands-on notebook, you'll:\n",
    "\n",
    "- ✅ Implement the **cache-aside pattern** with Redis\n",
    "- ✅ Measure **real performance improvements** (10-100x speedup)\n",
    "- ✅ Visualize cache effectiveness with **interactive charts**\n",
    "- ✅ Learn cache invalidation strategies\n",
    "- ✅ Apply best practices for production systems\n",
    "\n",
    "**No Docker or external database required!** We'll use a mock database to keep things simple."
]))

cells.append(mk_md([
    "## 📚 What You'll Learn\n",
    "\n",
    "By the end of this lab, you'll understand:\n",
    "\n",
    "1. **Cache-Aside Pattern** - The most common caching strategy\n",
    "2. **Performance Measurement** - Quantify latency improvements\n",
    "3. **Hit Rate Optimization** - Maximize cache effectiveness\n",
    "4. **Cache Invalidation** - Keep data fresh and consistent\n",
    "5. **TTL Strategy** - Balance freshness vs. performance\n",
    "\n",
    "Let's get started! 🎯"
]))

cells.append(mk_md([
    "---\n",
    "## Part 1: Setup and Dependencies (5 minutes)\n",
    "\n",
    "First, let's import all the packages we'll need."
]))

cells.append(mk_code([
    "# Core libraries\n",
    "import redis\n",
    "import time\n",
    "import json\n",
    "import random\n",
    "from typing import Dict, Optional, List\n",
    "\n",
    "# Data visualization\n",
    "import matplotlib.pyplot as plt\n",
    "import pandas as pd\n",
    "\n",
    "# Configure matplotlib for inline display\n",
    "%matplotlib inline\n",
    "\n",
    "print(\"✅ All packages imported successfully!\")"
]))

cells.append(mk_md([
    "### 🔧 Configure Redis Connection\n",
    "\n",
    "We'll connect to Redis running locally in Codespaces. You can also connect to Azure Redis by changing the configuration."
]))

cells.append(mk_code([
    "# Redis configuration\n",
    "USE_LOCAL_REDIS = True  # Set to False for Azure Redis\n",
    "\n",
    "if USE_LOCAL_REDIS:\n",
    "    # Local Redis (in Codespaces)\n",
    "    redis_client = redis.Redis(\n",
    "        host='localhost',\n",
    "        port=6379,\n",
    "        decode_responses=True\n",
    "    )\n",
    "else:\n",
    "    # Azure Redis\n",
    "    redis_client = redis.Redis(\n",
    "        host='your-cache.redis.cache.windows.net',\n",
    "        port=6380,\n",
    "        password='your-access-key',\n",
    "        ssl=True,\n",
    "        decode_responses=True\n",
    "    )\n",
    "\n",
    "# Test connection\n",
    "try:\n",
    "    redis_client.ping()\n",
    "    print(\"✅ Connected to Redis successfully!\")\n",
    "    print(f\"   Server version: {redis_client.info('server')['redis_version']}\")\n",
    "except Exception as e:\n",
    "    print(f\"❌ Redis connection failed: {e}\")\n",
    "    print(\"   Make sure Redis is running!\")"
]))

cells.append(mk_md([
    "### 📊 Create Mock Database\n",
    "\n",
    "Instead of PostgreSQL, we'll use an in-memory database that simulates realistic query latency."
]))

cells.append(mk_code([
    "class MockDatabase:\n",
    "    def __init__(self):\n",
    "        self.products = [\n",
    "            {\"id\": 1, \"name\": \"Laptop Pro 15\", \"price\": 999.99, \"category\": \"Electronics\", \"stock\": 50},\n",
    "            {\"id\": 2, \"name\": \"Wireless Mouse\", \"price\": 29.99, \"category\": \"Electronics\", \"stock\": 200},\n",
    "            {\"id\": 3, \"name\": \"USB-C Cable\", \"price\": 12.99, \"category\": \"Accessories\", \"stock\": 500},\n",
    "            {\"id\": 4, \"name\": \"4K Monitor\", \"price\": 399.99, \"category\": \"Electronics\", \"stock\": 30},\n",
    "            {\"id\": 5, \"name\": \"Mechanical Keyboard\", \"price\": 89.99, \"category\": \"Electronics\", \"stock\": 75},\n",
    "            {\"id\": 6, \"name\": \"Desk Lamp\", \"price\": 34.99, \"category\": \"Office\", \"stock\": 120},\n",
    "            {\"id\": 7, \"name\": \"Ergonomic Chair\", \"price\": 299.99, \"category\": \"Furniture\", \"stock\": 40},\n",
    "            {\"id\": 8, \"name\": \"Webcam HD\", \"price\": 69.99, \"category\": \"Electronics\", \"stock\": 90},\n",
    "            {\"id\": 9, \"name\": \"Headphones\", \"price\": 149.99, \"category\": \"Electronics\", \"stock\": 60},\n",
    "            {\"id\": 10, \"name\": \"Phone Stand\", \"price\": 19.99, \"category\": \"Accessories\", \"stock\": 300}\n",
    "        ]\n",
    "        self.query_count = 0\n",
    "    \n",
    "    def get_product_by_id(self, product_id: int) -> Optional[Dict]:\n",
    "        time.sleep(0.025)  # Simulate 25ms database query\n",
    "        self.query_count += 1\n",
    "        for product in self.products:\n",
    "            if product['id'] == product_id:\n",
    "                return product.copy()\n",
    "        return None\n",
    "    \n",
    "    def reset_stats(self):\n",
    "        self.query_count = 0\n",
    "\n",
    "db = MockDatabase()\n",
    "print(f\"✅ Mock database created with {len(db.products)} products\")"
]))

cells.append(mk_md([
    "### 🧪 Test the Mock Database\n",
    "\n",
    "Let's verify our database works and measure its latency."
]))

cells.append(mk_code([
    "start_time = time.time()\n",
    "product = db.get_product_by_id(1)\n",
    "elapsed_ms = (time.time() - start_time) * 1000\n",
    "\n",
    "print(f\"Product: {product['name']}\")\n",
    "print(f\"Price: ${product['price']}\")\n",
    "print(f\"Query time: {elapsed_ms:.2f}ms\")\n",
    "print(f\"Total queries: {db.query_count}\")\n",
    "print(\"\\n💡 Notice: Database queries take 25-30ms each\")"
]))

# PART 2: CACHE-ASIDE PATTERN
cells.append(mk_md([
    "---\n",
    "## Part 2: Implement Cache-Aside Pattern (15 minutes)\n",
    "\n",
    "The cache-aside pattern:\n",
    "\n",
    "```\n",
    "1. Check cache first\n",
    "2. If hit → return cached data (fast!)\n",
    "3. If miss → query database\n",
    "4. Store in cache for next time\n",
    "5. Return data\n",
    "```"
]))

cells.append(mk_code([
    "class CacheManager:\n",
    "    def __init__(self, redis_client: redis.Redis, ttl: int = 60):\n",
    "        self.redis = redis_client\n",
    "        self.ttl = ttl\n",
    "        self.hits = 0\n",
    "        self.misses = 0\n",
    "    \n",
    "    def get_cached_product(self, product_id: int) -> Optional[Dict]:\n",
    "        key = f\"product:{product_id}\"\n",
    "        try:\n",
    "            cached_data = self.redis.get(key)\n",
    "            if cached_data:\n",
    "                self.hits += 1\n",
    "                return json.loads(cached_data)\n",
    "            else:\n",
    "                self.misses += 1\n",
    "                return None\n",
    "        except Exception as e:\n",
    "            print(f\"Cache read error: {e}\")\n",
    "            self.misses += 1\n",
    "            return None\n",
    "    \n",
    "    def set_cached_product(self, product_id: int, product_data: Dict):\n",
    "        key = f\"product:{product_id}\"\n",
    "        try:\n",
    "            self.redis.setex(key, self.ttl, json.dumps(product_data))\n",
    "        except Exception as e:\n",
    "            print(f\"Cache write error: {e}\")\n",
    "    \n",
    "    def invalidate_product(self, product_id: int):\n",
    "        key = f\"product:{product_id}\"\n",
    "        self.redis.delete(key)\n",
    "    \n",
    "    def get_stats(self) -> Dict:\n",
    "        total = self.hits + self.misses\n",
    "        hit_rate = (self.hits / total * 100) if total > 0 else 0\n",
    "        return {\"hits\": self.hits, \"misses\": self.misses, \"total\": total, \"hit_rate\": hit_rate}\n",
    "    \n",
    "    def reset_stats(self):\n",
    "        self.hits = 0\n",
    "        self.misses = 0\n",
    "\n",
    "cache = CacheManager(redis_client, ttl=60)\n",
    "print(\"✅ Cache manager created with 60-second TTL\")"
]))

cells.append(mk_md([
    "### 🔗 Create Helper Function\n",
    "\n",
    "This function implements the complete cache-aside pattern:"
]))

cells.append(mk_code([
    "def get_product_with_cache(product_id: int, cache_manager: CacheManager, database: MockDatabase) -> Dict:\n",
    "    start_time = time.time()\n",
    "    \n",
    "    # Check cache first\n",
    "    product = cache_manager.get_cached_product(product_id)\n",
    "    \n",
    "    if product:\n",
    "        source = \"cache\"\n",
    "    else:\n",
    "        # Cache miss - get from database\n",
    "        product = database.get_product_by_id(product_id)\n",
    "        if product:\n",
    "            cache_manager.set_cached_product(product_id, product)\n",
    "        source = \"database\"\n",
    "    \n",
    "    elapsed_ms = (time.time() - start_time) * 1000\n",
    "    \n",
    "    return {\"product\": product, \"latency_ms\": elapsed_ms, \"source\": source}\n",
    "\n",
    "print(\"✅ Helper function created\")"
]))

# PART 3: PERFORMANCE TESTING
cells.append(mk_md([
    "---\n",
    "## Part 3: Performance Testing (15 minutes)\n",
    "\n",
    "Let's measure the real performance improvement from caching!"
]))

cells.append(mk_md([
    "### 🧪 Test 1: Single Product Lookup\n",
    "\n",
    "Compare first request (cache miss) vs. second request (cache hit)."
]))

cells.append(mk_code([
    "cache.reset_stats()\n",
    "db.reset_stats()\n",
    "redis_client.flushdb()\n",
    "\n",
    "# First request - cache miss\n",
    "result1 = get_product_with_cache(1, cache, db)\n",
    "print(\"First request (cache miss):\")\n",
    "print(f\"  Latency: {result1['latency_ms']:.2f}ms\")\n",
    "print(f\"  Source: {result1['source']}\")\n",
    "\n",
    "# Second request - cache hit\n",
    "result2 = get_product_with_cache(1, cache, db)\n",
    "print(\"\\nSecond request (cache hit):\")\n",
    "print(f\"  Latency: {result2['latency_ms']:.2f}ms\")\n",
    "print(f\"  Source: {result2['source']}\")\n",
    "\n",
    "speedup = result1['latency_ms'] / result2['latency_ms']\n",
    "print(f\"\\n🚀 Speedup: {speedup:.1f}x faster with cache!\")"
]))

cells.append(mk_md([
    "### 📈 Test 2: Realistic Traffic Pattern\n",
    "\n",
    "Simulate 100 requests with 80% focused on popular products."
]))

cells.append(mk_code([
    "cache.reset_stats()\n",
    "db.reset_stats()\n",
    "redis_client.flushdb()\n",
    "\n",
    "results = []\n",
    "num_requests = 100\n",
    "\n",
    "print(f\"Simulating {num_requests} requests...\")\n",
    "\n",
    "for i in range(num_requests):\n",
    "    if random.random() < 0.8:\n",
    "        product_id = random.randint(1, 3)\n",
    "    else:\n",
    "        product_id = random.randint(4, 10)\n",
    "    \n",
    "    result = get_product_with_cache(product_id, cache, db)\n",
    "    results.append({\n",
    "        \"request_num\": i + 1,\n",
    "        \"product_id\": product_id,\n",
    "        \"latency\": result[\"latency_ms\"],\n",
    "        \"source\": result[\"source\"]\n",
    "    })\n",
    "\n",
    "stats = cache.get_stats()\n",
    "print(f\"\\n✅ Test complete!\")\n",
    "print(f\"Cache Hits: {stats['hits']} ({stats['hit_rate']:.1f}%)\")\n",
    "print(f\"Database Queries: {db.query_count}\")\n",
    "print(f\"\\n💡 We avoided {stats['hits']} database queries!\")"
]))

cells.append(mk_md([
    "### 🔄 Test 3: Cache Invalidation\n",
    "\n",
    "What happens when we update a product?"
]))

cells.append(mk_code([
    "result = get_product_with_cache(1, cache, db)\n",
    "print(f\"Before update: Price = ${result['product']['price']}\")\n",
    "\n",
    "# Update in database\n",
    "db.products[0]['price'] = 799.99\n",
    "print(\"\\n✏️ Updated price in database to $799.99\")\n",
    "\n",
    "# Still returns old cached value\n",
    "result = get_product_with_cache(1, cache, db)\n",
    "print(f\"\\nWithout invalidation: Price = ${result['product']['price']} ⚠️\")\n",
    "\n",
    "# Invalidate cache\n",
    "cache.invalidate_product(1)\n",
    "print(\"\\n🗑️ Cache invalidated\")\n",
    "\n",
    "# Now get fresh data\n",
    "result = get_product_with_cache(1, cache, db)\n",
    "print(f\"\\nAfter invalidation: Price = ${result['product']['price']} ✅\")\n",
    "print(\"\\n💡 Always invalidate cache when updating data!\")"
]))

# PART 4: VISUALIZATIONS
cells.append(mk_md([
    "---\n",
    "## Part 4: Visualize Performance (10 minutes)\n",
    "\n",
    "Let's create charts to visualize cache effectiveness!"
]))

cells.append(mk_md([
    "### 📊 Chart 1: Request Latency Scatter Plot"
]))

cells.append(mk_code([
    "df = pd.DataFrame(results)\n",
    "\n",
    "plt.figure(figsize=(14, 6))\n",
    "colors = ['red' if s == 'database' else 'green' for s in df['source']]\n",
    "plt.scatter(df['request_num'], df['latency'], c=colors, alpha=0.6, s=50)\n",
    "plt.xlabel('Request Number', fontsize=12)\n",
    "plt.ylabel('Latency (ms)', fontsize=12)\n",
    "plt.title('Request Latency: Cache Miss (Red) vs Hit (Green)', fontsize=14, fontweight='bold')\n",
    "plt.grid(True, alpha=0.3)\n",
    "\n",
    "from matplotlib.patches import Patch\n",
    "legend = [Patch(facecolor='red', alpha=0.6, label='Cache Miss'),\n",
    "          Patch(facecolor='green', alpha=0.6, label='Cache Hit')]\n",
    "plt.legend(handles=legend, loc='upper right')\n",
    "plt.tight_layout()\n",
    "plt.show()"
]))

cells.append(mk_md([
    "### 📊 Chart 2: Average Latency Comparison"
]))

cells.append(mk_code([
    "cached = df[df['source'] == 'cache']['latency']\n",
    "uncached = df[df['source'] == 'database']['latency']\n",
    "\n",
    "plt.figure(figsize=(10, 6))\n",
    "bars = plt.bar(['Database', 'Redis Cache'], [uncached.mean(), cached.mean()],\n",
    "               color=['#ff6b6b', '#51cf66'], width=0.6)\n",
    "plt.ylabel('Average Latency (ms)', fontsize=12)\n",
    "plt.title('Performance Comparison', fontsize=14, fontweight='bold')\n",
    "plt.grid(True, alpha=0.3, axis='y')\n",
    "\n",
    "for bar in bars:\n",
    "    height = bar.get_height()\n",
    "    plt.text(bar.get_x() + bar.get_width()/2, height + 0.5,\n",
    "             f'{height:.2f}ms', ha='center', fontweight='bold')\n",
    "\n",
    "speedup = uncached.mean() / cached.mean()\n",
    "plt.text(0.5, max(uncached.mean(), cached.mean()) * 0.7,\n",
    "         f'{speedup:.1f}x\\nfaster!', ha='center', fontsize=16,\n",
    "         bbox=dict(boxstyle='round', facecolor='yellow', alpha=0.7))\n",
    "plt.tight_layout()\n",
    "plt.show()\n",
    "\n",
    "print(f\"\\nSpeedup: {speedup:.1f}x faster with cache\")"
]))

cells.append(mk_md([
    "### 📊 Chart 3: Cache Hit Rate Over Time"
]))

cells.append(mk_code([
    "df['is_hit'] = (df['source'] == 'cache').astype(int)\n",
    "df['cumulative_hits'] = df['is_hit'].cumsum()\n",
    "df['hit_rate'] = (df['cumulative_hits'] / df['request_num']) * 100\n",
    "\n",
    "plt.figure(figsize=(14, 6))\n",
    "plt.plot(df['request_num'], df['hit_rate'], linewidth=2, color='#4ecdc4')\n",
    "plt.fill_between(df['request_num'], df['hit_rate'], alpha=0.3, color='#4ecdc4')\n",
    "plt.xlabel('Request Number', fontsize=12)\n",
    "plt.ylabel('Cache Hit Rate (%)', fontsize=12)\n",
    "plt.title('Cache Hit Rate Over Time', fontsize=14, fontweight='bold')\n",
    "plt.grid(True, alpha=0.3)\n",
    "plt.ylim(0, 100)\n",
    "\n",
    "final_hit_rate = df['hit_rate'].iloc[-1]\n",
    "plt.axhline(y=final_hit_rate, color='red', linestyle='--', alpha=0.5)\n",
    "plt.text(num_requests * 0.7, final_hit_rate + 5,\n",
    "         f'Final: {final_hit_rate:.1f}%', fontsize=12,\n",
    "         bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))\n",
    "plt.tight_layout()\n",
    "plt.show()"
]))

# PART 5: EXERCISES
cells.append(mk_md([
    "---\n",
    "## Part 5: Advanced Exercises (15 minutes)\n",
    "\n",
    "Try these exercises to deepen your understanding!"
]))

cells.append(mk_md([
    "### 🎯 Exercise 1: Test TTL Expiration\n",
    "\n",
    "Create a cache with TTL=5 seconds and observe expiration.\n",
    "\n",
    "**Hints:**\n",
    "- Create `CacheManager` with `ttl=5`\n",
    "- Make requests before and after waiting 6 seconds"
]))

cells.append(mk_code([
    "# Your code here\n",
    "print(\"Exercise 1: TTL Expiration Test\")\n",
    "\n",
    "# TODO: Implement TTL testing"
]))

cells.append(mk_md([
    "### 🎯 Exercise 2: Implement Cache Warming\n",
    "\n",
    "Write a function to pre-load popular products before traffic starts."
]))

cells.append(mk_code([
    "# Your code here\n",
    "def warm_cache(product_ids: List[int], cache_manager: CacheManager, database: MockDatabase):\n",
    "    \"\"\"Pre-load products into cache\"\"\"\n",
    "    # TODO: Implement cache warming\n",
    "    pass"
]))

cells.append(mk_md([
    "### 🎯 Exercise 3: Compare Different TTL Values\n",
    "\n",
    "Test with TTL=30s, 60s, 300s and compare hit rates."
]))

cells.append(mk_code([
    "# Your code here\n",
    "ttl_values = [30, 60, 300]\n",
    "\n",
    "# TODO: Test and compare different TTL values"
]))

# PART 6: WRAP UP
cells.append(mk_md([
    "---\n",
    "## Part 6: Key Takeaways\n",
    "\n",
    "## 🎓 What You've Learned\n",
    "\n",
    "### ✅ Cache-Aside Pattern\n",
    "- Check cache first, fall back to database\n",
    "- Store in cache on miss\n",
    "- Simple but effective!\n",
    "\n",
    "### ✅ Performance Benefits\n",
    "- **10-100x speedup** with caching\n",
    "- Hit rates of **80-90%** are common\n",
    "- Dramatically reduces database load\n",
    "\n",
    "### ✅ Cache Invalidation\n",
    "- **Must invalidate on updates**\n",
    "- Use TTL as safety net\n",
    "\n",
    "### ✅ TTL Strategy\n",
    "- Shorter TTL = fresher data, more DB queries\n",
    "- Longer TTL = better performance, staler data\n",
    "\n",
    "---\n",
    "\n",
    "## 🚀 Next Steps\n",
    "\n",
    "1. Apply these patterns to your own app\n",
    "2. Explore other patterns (write-through, write-behind)\n",
    "3. Learn advanced Redis features (Pub/Sub, Streams, JSON)\n",
    "4. Study monitoring with Azure Monitor\n",
    "\n",
    "## 📚 Resources\n",
    "\n",
    "- [Redis Caching Best Practices](https://redis.io/docs/manual/patterns/caching/)\n",
    "- [Cache-Aside Pattern](https://learn.microsoft.com/azure/architecture/patterns/cache-aside)\n",
    "- [Redis Python Client](https://redis-py.readthedocs.io/)\n",
    "- [Azure Cache for Redis](https://learn.microsoft.com/azure/azure-cache-for-redis/)"
]))

cells.append(mk_md([
    "## 🧹 Cleanup\n",
    "\n",
    "Run this cell to clean up Redis:"
]))

cells.append(mk_code([
    "redis_client.flushdb()\n",
    "cache.reset_stats()\n",
    "db.reset_stats()\n",
    "\n",
    "print(\"✅ Cleanup complete!\")\n",
    "print(\"\\n🎉 Thank you for completing the Caching Lab!\")\n",
    "print(\"   You're now ready to implement Redis caching in production!\")"
]))

# Create notebook
notebook = {
    "cells": cells,
    "metadata": {
        "kernelspec": {
            "display_name": "Python (Redis Workshop)",
            "language": "python",
            "name": "redis-workshop"
        },
        "language_info": {
            "codemirror_mode": {"name": "ipython", "version": 3},
            "file_extension": ".py",
            "mimetype": "text/x-python",
            "name": "python",
            "nbconvert_exporter": "python",
            "pygments_lexer": "ipython3",
            "version": "3.11.0"
        }
    },
    "nbformat": 4,
    "nbformat_minor": 4
}

output_path = "workshops/deploy-redis-for-developers-amr/module-08-implement-caching-lab/implement-caching-lab.ipynb"
with open(output_path, 'w') as f:
    json.dump(notebook, f, indent=1)

print(f"✅ Created complete notebook with {len(cells)} cells: {output_path}")
print(f"   File size: {len(json.dumps(notebook))} bytes")
