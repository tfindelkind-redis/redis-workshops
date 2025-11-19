<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->

| Previous | Home | Next |
|----------|:----:|------:|
| [⬅️ Previous: Provision & Connect Lab](../module-07-provision--connect-lab/README.md) | [🏠 Workshop Home](../README.md) | [Next: Monitoring & Alerts Lab ➡️](../module-09-monitoring--alerts-lab/README.md) |

[🏠 Workshop Home](../README.md) > **Module 8 of 11**

### Deploy Redis for Developers - Azure Managed Redis

**Progress:** `███████░░░` 73%

---

<!-- ✏️ EDIT YOUR CONTENT BELOW THIS LINE ✏️ -->

# Module 6: Implement Caching Lab
**Duration:** 60 minutes  
**Format:** Hands-On Lab  
**Level:** Intermediate

---

## 📓 Interactive Jupyter Notebook Available!

**✨ New: Complete this lab interactively in GitHub Codespaces!**

This module includes an interactive Jupyter notebook with:
- ✅ Executable code cells - Run Python code directly in your browser
- ✅ Real-time performance metrics and visualizations
- ✅ Interactive exercises with immediate feedback
- ✅ No local setup required - works in Codespaces

**🚀 To use the interactive notebook:**

1. Open in GitHub Codespaces (or VS Code with Jupyter extension)
2. Navigate to this module folder
3. Open: **`implement-caching-lab.ipynb`**
4. Run cells step-by-step to complete the lab

**📖 Or continue reading below for the traditional guide...**

---

## Lab Overview

**Objective:** Build a real-world Flask API with PostgreSQL backend and implement Redis caching patterns.

**What You'll Build:**
- Flask REST API for product catalog
- PostgreSQL database with sample data
- Cache-aside pattern implementation
- Cache invalidation logic
- Performance benchmarking with Locust
- Metrics dashboard

**Learning Outcomes:**
- Implement cache-aside pattern in production code
- Design cache invalidation strategies
- Measure cache performance (hit rate, latency)
- Optimize database queries with Redis
- Load test cached vs uncached endpoints

**Prerequisites:**
- Module 5 completed (Redis deployed and connected)
- Python 3.8+ installed
- Docker installed (for PostgreSQL)
- Basic Flask knowledge

---

## Lab Architecture

```
┌─────────────────────────────────────────────────────┐
│ Client (Browser/Locust)                             │
└────────────────┬────────────────────────────────────┘
                 │ HTTP Requests
                 ▼
┌─────────────────────────────────────────────────────┐
│ Flask API (Port 5000)                               │
│  - GET /products → List all products                │
│  - GET /products/{id} → Get product details         │
│  - PUT /products/{id} → Update product              │
│  - DELETE /products/{id} → Delete product           │
└────────────────┬────────────────────────────────────┘
                 │
                 ├──────────────┐
                 ▼              ▼
    ┌─────────────────┐   ┌───────────────┐
    │ Redis Cache     │   │ PostgreSQL DB │
    │ (Azure Managed) │   │ (Docker)      │
    │                 │   │               │
    │ TTL: 60s        │   │ Products      │
    │ Pattern:        │   │ - id          │
    │ Cache-Aside     │   │ - name        │
    └─────────────────┘   │ - price       │
                          │ - stock       │
                          └───────────────┘

Performance Flow:
1. Request arrives → Check Redis cache
2. Cache HIT → Return immediately (fast ~2-5ms)
3. Cache MISS → Query PostgreSQL (~20-50ms)
4. Store result in Redis (for next request)
5. Return response
```

---

## Timing Breakdown

| Task | Duration | Type |
|------|----------|------|
| Setup Database | 10 min | Configuration |
| Build Flask API | 15 min | Coding |
| Implement Caching | 15 min | Coding |
| Test & Verify | 10 min | Testing |
| Load Testing | 10 min | Performance |
| **Total** | **60 min** | |

---

## Part 1: Setup Database (10 minutes)

### Task 1.1: Start PostgreSQL with Docker

```bash
# Create project directory
mkdir -p redis-caching-lab
cd redis-caching-lab

# Start PostgreSQL container
docker run -d \\
  --name postgres-lab \\
  -e POSTGRES_PASSWORD=postgres \\
  -e POSTGRES_DB=workshop \\
  -p 5432:5432 \\
  postgres:15

# Wait for PostgreSQL to start
sleep 5

# Verify container is running
docker ps | grep postgres-lab
```

---

### Task 1.2: Create Database Schema

**File: `schema.sql`**

```sql
-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);

-- Sample data (100 products)
INSERT INTO products (sku, name, description, price, stock, category) VALUES
('LAPTOP-001', 'MacBook Pro 16"', 'High-performance laptop', 2499.99, 15, 'Electronics'),
('LAPTOP-002', 'Dell XPS 15', 'Business laptop', 1799.99, 25, 'Electronics'),
('PHONE-001', 'iPhone 15 Pro', 'Latest smartphone', 999.99, 50, 'Electronics'),
('PHONE-002', 'Samsung Galaxy S24', 'Android flagship', 899.99, 40, 'Electronics'),
('TABLET-001', 'iPad Pro 12.9"', 'Professional tablet', 1099.99, 20, 'Electronics'),
('MONITOR-001', 'LG 27" 4K', '4K monitor', 499.99, 30, 'Electronics'),
('KEYBOARD-001', 'Mechanical Keyboard', 'RGB backlit', 149.99, 100, 'Accessories'),
('MOUSE-001', 'Wireless Mouse', 'Ergonomic design', 79.99, 150, 'Accessories'),
('HEADSET-001', 'Noise-Cancelling Headset', 'Premium audio', 299.99, 60, 'Accessories'),
('WEBCAM-001', '1080p Webcam', 'HD video calls', 89.99, 75, 'Accessories');

-- Add more sample data (repeat pattern for 100 products)
-- For demo purposes, we'll use the above 10 products
```

**Load schema:**
```bash
# Copy schema to container
docker cp schema.sql postgres-lab:/schema.sql

# Execute schema
docker exec -it postgres-lab psql -U postgres -d workshop -f /schema.sql

# Verify data
docker exec -it postgres-lab psql -U postgres -d workshop -c "SELECT COUNT(*) FROM products;"
```

---

## Part 2: Build Flask API (15 minutes)

### Task 2.1: Install Dependencies

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install packages
pip install flask redis azure-identity psycopg2-binary python-dotenv

# Create requirements.txt
cat > requirements.txt << EOF
flask==3.0.0
redis==5.0.1
azure-identity==1.15.0
psycopg2-binary==2.9.9
python-dotenv==1.0.0
locust==2.20.0
EOF
```

---

### Task 2.2: Create Flask Application

**File: `app.py`**

```python
"""
Flask API with Redis Caching (Cache-Aside Pattern)
"""

import os
import time
import json
from flask import Flask, jsonify, request
import psycopg2
from psycopg2.extras import RealDictCursor
import redis
from azure.identity import DefaultAzureCredential
from dotenv import load_dotenv

# Load environment
load_dotenv()

app = Flask(__name__)

# Redis configuration
REDIS_HOST = os.getenv('REDIS_HOST')
REDIS_PORT = int(os.getenv('REDIS_PORT', 10001))
CACHE_TTL = 60  # 60 seconds

# PostgreSQL configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'workshop',
    'user': 'postgres',
    'password': 'postgres'
}

# Global clients
redis_client = None
db_pool = None

# Metrics
cache_hits = 0
cache_misses = 0

def get_redis_client():
    """Initialize Redis client with Entra ID"""
    global redis_client
    
    if redis_client is None:
        credential = DefaultAzureCredential()
        token = credential.get_token("https://redis.azure.com/.default")
        
        redis_client = redis.Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            username=token.token,
            password="",
            ssl=True,
            decode_responses=True
        )
    
    return redis_client

def get_db_connection():
    """Get PostgreSQL connection"""
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)

# Cache-aside pattern implementation
class CacheManager:
    """Manages cache operations"""
    
    @staticmethod
    def get_product_key(product_id):
        """Generate cache key for product"""
        return f"product:{product_id}"
    
    @staticmethod
    def get_products_list_key():
        """Generate cache key for products list"""
        return "products:all"
    
    @staticmethod
    def get_cached_product(product_id):
        """Try to get product from cache"""
        global cache_hits, cache_misses
        
        cache = get_redis_client()
        key = CacheManager.get_product_key(product_id)
        
        cached = cache.get(key)
        
        if cached:
            cache_hits += 1
            return json.loads(cached)
        else:
            cache_misses += 1
            return None
    
    @staticmethod
    def set_cached_product(product_id, product_data):
        """Store product in cache"""
        cache = get_redis_client()
        key = CacheManager.get_product_key(product_id)
        
        cache.setex(
            key,
            CACHE_TTL,
            json.dumps(product_data)
        )
    
    @staticmethod
    def invalidate_product(product_id):
        """Remove product from cache"""
        cache = get_redis_client()
        key = CacheManager.get_product_key(product_id)
        cache.delete(key)
        
        # Also invalidate products list
        cache.delete(CacheManager.get_products_list_key())
    
    @staticmethod
    def get_cached_products_list():
        """Try to get products list from cache"""
        global cache_hits, cache_misses
        
        cache = get_redis_client()
        key = CacheManager.get_products_list_key()
        
        cached = cache.get(key)
        
        if cached:
            cache_hits += 1
            return json.loads(cached)
        else:
            cache_misses += 1
            return None
    
    @staticmethod
    def set_cached_products_list(products):
        """Store products list in cache"""
        cache = get_redis_client()
        key = CacheManager.get_products_list_key()
        
        cache.setex(
            key,
            CACHE_TTL,
            json.dumps(products)
        )

# API Endpoints

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'redis': 'connected' if redis_client else 'disconnected',
        'database': 'connected'
    })

@app.route('/metrics', methods=['GET'])
def metrics():
    """Cache performance metrics"""
    total = cache_hits + cache_misses
    hit_rate = (cache_hits / total * 100) if total > 0 else 0
    
    return jsonify({
        'cache_hits': cache_hits,
        'cache_misses': cache_misses,
        'total_requests': total,
        'hit_rate_percent': round(hit_rate, 2)
    })

@app.route('/products', methods=['GET'])
def get_products():
    """Get all products (with caching)"""
    start_time = time.time()
    
    # Try cache first
    products = CacheManager.get_cached_products_list()
    
    if products:
        # Cache hit
        latency = (time.time() - start_time) * 1000
        return jsonify({
            'data': products,
            'cached': True,
            'latency_ms': round(latency, 2)
        })
    
    # Cache miss - fetch from database
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, sku, name, description, price, stock, category
        FROM products
        ORDER BY id
    """)
    
    products = cursor.fetchall()
    cursor.close()
    conn.close()
    
    # Convert to list of dicts
    products_list = [dict(p) for p in products]
    
    # Store in cache for next time
    CacheManager.set_cached_products_list(products_list)
    
    latency = (time.time() - start_time) * 1000
    
    return jsonify({
        'data': products_list,
        'cached': False,
        'latency_ms': round(latency, 2)
    })

@app.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get single product by ID (with caching)"""
    start_time = time.time()
    
    # Try cache first
    product = CacheManager.get_cached_product(product_id)
    
    if product:
        # Cache hit
        latency = (time.time() - start_time) * 1000
        return jsonify({
            'data': product,
            'cached': True,
            'latency_ms': round(latency, 2)
        })
    
    # Cache miss - fetch from database
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, sku, name, description, price, stock, category
        FROM products
        WHERE id = %s
    """, (product_id,))
    
    product = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    product_dict = dict(product)
    
    # Store in cache for next time
    CacheManager.set_cached_product(product_id, product_dict)
    
    latency = (time.time() - start_time) * 1000
    
    return jsonify({
        'data': product_dict,
        'cached': False,
        'latency_ms': round(latency, 2)
    })

@app.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    """Update product (with cache invalidation)"""
    data = request.get_json()
    
    # Update database
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE products
        SET name = COALESCE(%s, name),
            price = COALESCE(%s, price),
            stock = COALESCE(%s, stock),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
        RETURNING id, sku, name, description, price, stock, category
    """, (
        data.get('name'),
        data.get('price'),
        data.get('stock'),
        product_id
    ))
    
    product = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    # Invalidate cache
    CacheManager.invalidate_product(product_id)
    
    return jsonify({
        'data': dict(product),
        'message': 'Product updated and cache invalidated'
    })

@app.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete product (with cache invalidation)"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({'error': 'Product not found'}), 404
    
    conn.commit()
    cursor.close()
    conn.close()
    
    # Invalidate cache
    CacheManager.invalidate_product(product_id)
    
    return jsonify({
        'message': 'Product deleted and cache invalidated'
    })

if __name__ == '__main__':
    # Initialize Redis on startup
    get_redis_client()
    print("✅ Connected to Redis")
    
    # Start Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)
```

---

## Part 3: Test & Verify (10 minutes)

### Task 3.1: Start Flask API

```bash
# Start the API
python app.py

# Should see:
# ✅ Connected to Redis
#  * Running on http://0.0.0.0:5000
```

---

### Task 3.2: Test Endpoints

**Test 1: Get all products (cache miss, then hit)**
```bash
# First request (cache miss - slow ~30-50ms)
curl http://localhost:5000/products | jq '.cached, .latency_ms'
# Output: false, ~40ms

# Second request (cache hit - fast ~2-5ms)
curl http://localhost:5000/products | jq '.cached, .latency_ms'
# Output: true, ~3ms
```

**Test 2: Get single product**
```bash
# First request (cache miss)
curl http://localhost:5000/products/1 | jq '.cached, .latency_ms'
# Output: false, ~25ms

# Second request (cache hit)
curl http://localhost:5000/products/1 | jq '.cached, .latency_ms'
# Output: true, ~2ms
```

**Test 3: Update product (invalidate cache)**
```bash
# Update product
curl -X PUT http://localhost:5000/products/1 \\
  -H "Content-Type: application/json" \\
  -d '{"price": 2599.99, "stock": 20}'

# Next GET will be cache miss (cache was invalidated)
curl http://localhost:5000/products/1 | jq '.cached'
# Output: false
```

**Test 4: Check metrics**
```bash
curl http://localhost:5000/metrics | jq
# Output:
# {
#   "cache_hits": 15,
#   "cache_misses": 5,
#   "total_requests": 20,
#   "hit_rate_percent": 75.0
# }
```

---

## Part 4: Load Testing with Locust (10 minutes)

### Task 4.1: Create Locust Test

**File: `locustfile.py`**

```python
"""
Load testing with Locust
"""

from locust import HttpUser, task, between

class ProductAPIUser(HttpUser):
    wait_time = between(0.5, 2)  # Wait 0.5-2 seconds between requests
    
    @task(10)  # Weight: 10 (most common)
    def get_products(self):
        """Get all products"""
        self.client.get("/products")
    
    @task(20)  # Weight: 20 (very common)
    def get_product_by_id(self):
        """Get single product (random ID)"""
        product_id = self.environment.stats.total.num_requests % 10 + 1
        self.client.get(f"/products/{product_id}")
    
    @task(1)  # Weight: 1 (rare)
    def update_product(self):
        """Update product"""
        product_id = 1
        self.client.put(
            f"/products/{product_id}",
            json={"stock": 100}
        )
    
    @task(5)  # Weight: 5
    def check_metrics(self):
        """Check cache metrics"""
        self.client.get("/metrics")
```

---

### Task 4.2: Run Load Test

```bash
# Start Locust
locust -f locustfile.py --host=http://localhost:5000

# Open browser: http://localhost:8089
# Configuration:
#   - Number of users: 50
#   - Spawn rate: 10 users/second
#   - Host: http://localhost:5000

# Click "Start swarming"
# Run for 2-3 minutes
# Observe:
#   - Requests/second
#   - Response times (should be <10ms with cache)
#   - Cache hit rate (check /metrics endpoint)
```

**Expected Results:**
```
Cached requests:     ~2-5ms (p50), ~10ms (p95)
Uncached requests:   ~30-50ms (p50), ~80ms (p95)
Cache hit rate:      85-95% after warmup
Throughput:          500-1000 req/sec (cached)
```

---

## Part 5: Performance Analysis (5 minutes)

### Task 5.1: Compare Cached vs Uncached

**Test without cache (disable Redis):**
```python
# Temporarily modify app.py to skip cache
# Comment out cache check in get_products():
# products = CacheManager.get_cached_products_list()
# if products:
#     return ...

# Restart app and run Locust again
# Compare results:
```

**Results Comparison:**

| Metric | Without Cache | With Cache | Improvement |
|--------|---------------|------------|-------------|
| Avg Response Time | 45ms | 4ms | **11x faster** |
| p95 Response Time | 85ms | 8ms | **10x faster** |
| Throughput | 150 req/sec | 1200 req/sec | **8x more** |
| Database Load | High (100%) | Low (10-15%) | **85% reduction** |

---

### Task 5.2: Check Redis Metrics in Azure Portal

1. Open Azure Portal → Your Redis Cache
2. Go to **Metrics** blade
3. Add charts:
   - **Cache Hits** vs **Cache Misses**
   - **Connected Clients**
   - **Operations Per Second**
   - **Used Memory**
   - **Server Load**

**Expected Observations:**
- Cache hits should be 85-95%
- Ops/sec: 500-1000+
- Memory usage: <1% (small dataset)
- Server load: <20%

---

## Key Takeaways

### ✅ What You Learned:
1. Implement cache-aside pattern in Flask
2. Design cache invalidation on writes
3. Measure cache performance (hit rate, latency)
4. Load test with Locust
5. Analyze performance improvements

### ✅ Performance Gains:
- **11x faster** response times
- **8x higher** throughput
- **85% reduction** in database load
- **90%+ cache hit rate** after warmup

### 🎯 Skills Acquired:
- ✅ Build production caching layer
- ✅ Implement cache invalidation
- ✅ Measure cache effectiveness
- ✅ Load test applications
- ✅ Optimize database with Redis

---

## Next Module Preview

**Module 7: Monitoring & Alerts Lab (45 minutes)**

Preview:
- Configure Log Analytics workspace
- Create Azure Workbook dashboard
- Write KQL queries for metrics
- Set up alert rules
- Create action groups

---

**Lab Status:** ✅ Complete  
**Last Updated:** November 2025  
**Version:** 2.0

<!-- ✏️ EDIT YOUR CONTENT ABOVE THIS LINE ✏️ -->

---

<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->

## Navigation

| Previous | Home | Next |
|----------|:----:|------:|
| [⬅️ Previous: Provision & Connect Lab](../module-07-provision--connect-lab/README.md) | [🏠 Workshop Home](../README.md) | [Next: Monitoring & Alerts Lab ➡️](../module-09-monitoring--alerts-lab/README.md) |

---

*Module 8 of 11*
