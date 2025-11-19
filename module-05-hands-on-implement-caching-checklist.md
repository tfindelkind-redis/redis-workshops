# Module 5: Hands-On Lab - Implement Caching in Application - Content Checklist

## 📋 Module Metadata

- **Module ID:** module-05-hands-on-implement-caching
- **Title:** Hands-On Lab - Implement Caching in Application
- **Duration:** 50 minutes
- **Type:** Hands-On Lab
- **Difficulty:** Intermediate to Advanced
- **Prerequisites:**
  - Module 3 (Caching Patterns)
  - Module 4 (Provisioned Redis instance)
  - Basic programming knowledge (Python OR C#)
- **Standalone:** No (requires working Redis instance)

---

## 🎯 Learning Objectives

By the end of this lab, participants will be able to:

1. ✅ Implement cache-aside pattern in a real application
2. ✅ Integrate Redis with Python Flask or C# ASP.NET Core application
3. ✅ Implement proper connection pooling
4. ✅ Set appropriate TTLs for different data types
5. ✅ Measure cache hit/miss ratios
6. ✅ Handle cache failures gracefully
7. ✅ Implement cache warming strategies
8. ✅ Optimize application performance with caching

---

## 🧪 Lab Structure (50 minutes)

### Pre-Lab Setup (Provided to Participants)

#### Starter Application Options
- [ ] **Option A: Python Flask E-commerce API**
  - Product catalog API
  - User authentication
  - Shopping cart
  - Order history

- [ ] **Option B: C# ASP.NET Core E-commerce API**
  - Same functionality as Python version
  - RESTful API design
  - Entity Framework for database

#### Starter App Characteristics
```markdown
**Before Caching:**
- Direct database queries for all requests
- Average response time: 200-500ms
- Database CPU: 60-80%
- Limited concurrency (10-20 req/sec)

**After Caching (Goal):**
- Redis cache-aside pattern
- Average response time: 10-50ms
- Database CPU: 10-20%
- High concurrency (100+ req/sec)
```

---

### Lab Exercise 1: Set Up Starter Application (8 minutes)

#### Step 1.1: Clone Starter Repository
- [ ] **Instructions**
  ```bash
  # Clone the workshop starter app
  git clone https://github.com/azure-samples/redis-workshop-starter.git
  cd redis-workshop-starter
  
  # Choose your language
  cd python-flask  # OR cd csharp-aspnet
  ```

#### Step 1.2: Configure Database (SQLite for Lab)
- [ ] **Python Setup**
  ```bash
  # Install dependencies
  pip install -r requirements.txt
  
  # Initialize database
  python init_db.py
  
  # This creates sample data:
  # - 100 products
  # - 10 users
  # - 50 orders
  ```

- [ ] **C# Setup**
  ```bash
  # Restore packages
  dotnet restore
  
  # Apply migrations
  dotnet ef database update
  
  # Seed data
  dotnet run --seed-data
  ```

#### Step 1.3: Configure Redis Connection
- [ ] **Create config file (.env)**
  ```bash
  # Redis Configuration
  REDIS_HOST=your-redis.eastus.redisenterprise.cache.azure.net
  REDIS_PORT=10000
  REDIS_PASSWORD=your-access-key
  REDIS_SSL=true
  
  # Application Configuration
  DATABASE_URL=sqlite:///shop.db
  SECRET_KEY=your-secret-key
  DEBUG=true
  ```

- [ ] **Verify Configuration Script**
  ```python
  # verify_config.py
  import os
  from dotenv import load_dotenv
  
  load_dotenv()
  
  required_vars = [
      'REDIS_HOST', 'REDIS_PORT', 
      'REDIS_PASSWORD', 'DATABASE_URL'
  ]
  
  print("🔍 Verifying configuration...")
  for var in required_vars:
      value = os.getenv(var)
      if value:
          print(f"✅ {var}: {'*' * 10}")
      else:
          print(f"❌ {var}: Missing!")
  ```

#### Step 1.4: Run Starter App Without Caching
- [ ] **Start Application**
  ```bash
  # Python
  python app.py
  
  # C#
  dotnet run
  ```

- [ ] **Test Endpoints**
  ```bash
  # Health check
  curl http://localhost:5000/health
  
  # Get products (slow - no cache)
  curl http://localhost:5000/api/products
  
  # Get single product
  curl http://localhost:5000/api/products/1
  
  # Get user profile
  curl http://localhost:5000/api/users/1
  ```

- [ ] **Measure Baseline Performance**
  ```bash
  # Use Apache Bench or similar
  ab -n 100 -c 10 http://localhost:5000/api/products
  
  # Record baseline metrics:
  # - Requests per second
  # - Average response time
  # - 95th percentile latency
  ```

---

### Lab Exercise 2: Implement Redis Cache Layer (15 minutes)

#### Step 2.1: Create Redis Client Module
- [ ] **Python Implementation (redis_client.py)**
  ```python
  import redis
  import os
  import json
  from redis.connection import ConnectionPool
  from dotenv import load_dotenv
  
  load_dotenv()
  
  class RedisCache:
      """Redis cache client with connection pooling"""
      
      def __init__(self):
          self.pool = ConnectionPool(
              host=os.getenv('REDIS_HOST'),
              port=int(os.getenv('REDIS_PORT', 10000)),
              password=os.getenv('REDIS_PASSWORD'),
              ssl=True,
              ssl_cert_reqs='required',
              max_connections=50,
              socket_keepalive=True,
              socket_timeout=5,
              retry_on_timeout=True,
              health_check_interval=30,
              decode_responses=True
          )
          self.client = redis.Redis(connection_pool=self.pool)
          
          # Statistics
          self.hits = 0
          self.misses = 0
      
      def get(self, key):
          """Get value from cache"""
          try:
              value = self.client.get(key)
              if value:
                  self.hits += 1
                  return json.loads(value)
              else:
                  self.misses += 1
                  return None
          except Exception as e:
              print(f"Cache GET error: {e}")
              self.misses += 1
              return None
      
      def set(self, key, value, ttl=3600):
          """Set value in cache with TTL"""
          try:
              serialized = json.dumps(value)
              self.client.setex(key, ttl, serialized)
              return True
          except Exception as e:
              print(f"Cache SET error: {e}")
              return False
      
      def delete(self, key):
          """Delete key from cache"""
          try:
              self.client.delete(key)
              return True
          except Exception as e:
              print(f"Cache DELETE error: {e}")
              return False
      
      def delete_pattern(self, pattern):
          """Delete all keys matching pattern"""
          try:
              cursor = 0
              while True:
                  cursor, keys = self.client.scan(
                      cursor, match=pattern, count=100
                  )
                  if keys:
                      self.client.delete(*keys)
                  if cursor == 0:
                      break
              return True
          except Exception as e:
              print(f"Cache DELETE pattern error: {e}")
              return False
      
      def get_stats(self):
          """Get cache statistics"""
          total = self.hits + self.misses
          hit_ratio = (self.hits / total * 100) if total > 0 else 0
          return {
              'hits': self.hits,
              'misses': self.misses,
              'total': total,
              'hit_ratio': f"{hit_ratio:.2f}%"
          }
      
      def ping(self):
          """Test connection"""
          try:
              return self.client.ping()
          except Exception as e:
              print(f"Cache PING error: {e}")
              return False
  
  # Singleton instance
  cache = RedisCache()
  ```

- [ ] **C# Implementation (RedisCache.cs)**
  ```csharp
  using StackExchange.Redis;
  using System.Text.Json;
  
  public class RedisCache
  {
      private readonly IConnectionMultiplexer _redis;
      private readonly IDatabase _db;
      private long _hits = 0;
      private long _misses = 0;
      
      public RedisCache(IConfiguration config)
      {
          var redisConfig = new ConfigurationOptions
          {
              EndPoints = { 
                  $"{config["REDIS_HOST"]}:{config["REDIS_PORT"]}" 
              },
              Password = config["REDIS_PASSWORD"],
              Ssl = true,
              AbortOnConnectFail = false,
              ConnectTimeout = 5000,
              SyncTimeout = 5000,
              KeepAlive = 60,
              ConnectRetry = 3,
              ReconnectRetryPolicy = new ExponentialRetry(5000)
          };
          
          _redis = ConnectionMultiplexer.Connect(redisConfig);
          _db = _redis.GetDatabase();
      }
      
      public async Task<T?> GetAsync<T>(string key)
      {
          try
          {
              var value = await _db.StringGetAsync(key);
              if (value.HasValue)
              {
                  Interlocked.Increment(ref _hits);
                  return JsonSerializer.Deserialize<T>(value!);
              }
              else
              {
                  Interlocked.Increment(ref _misses);
                  return default;
              }
          }
          catch (Exception ex)
          {
              Console.WriteLine($"Cache GET error: {ex.Message}");
              Interlocked.Increment(ref _misses);
              return default;
          }
      }
      
      public async Task<bool> SetAsync<T>(
          string key, T value, TimeSpan? ttl = null)
      {
          try
          {
              var serialized = JsonSerializer.Serialize(value);
              await _db.StringSetAsync(
                  key, 
                  serialized, 
                  ttl ?? TimeSpan.FromHours(1)
              );
              return true;
          }
          catch (Exception ex)
          {
              Console.WriteLine($"Cache SET error: {ex.Message}");
              return false;
          }
      }
      
      public async Task<bool> DeleteAsync(string key)
      {
          try
          {
              await _db.KeyDeleteAsync(key);
              return true;
          }
          catch (Exception ex)
          {
              Console.WriteLine($"Cache DELETE error: {ex.Message}");
              return false;
          }
      }
      
      public object GetStats()
      {
          long total = _hits + _misses;
          double hitRatio = total > 0 ? (_hits / (double)total * 100) : 0;
          
          return new
          {
              Hits = _hits,
              Misses = _misses,
              Total = total,
              HitRatio = $"{hitRatio:F2}%"
          };
      }
      
      public async Task<bool> PingAsync()
      {
          try
          {
              var ping = await _db.PingAsync();
              return true;
          }
          catch
          {
              return false;
          }
      }
  }
  ```

#### Step 2.2: Implement Cache-Aside for Product Catalog
- [ ] **Python Implementation (routes/products.py)**
  ```python
  from flask import Blueprint, jsonify
  from models import Product
  from redis_client import cache
  
  products_bp = Blueprint('products', __name__)
  
  @products_bp.route('/api/products', methods=['GET'])
  def get_products():
      """Get all products with caching"""
      
      cache_key = "products:all"
      
      # Try cache first
      cached_data = cache.get(cache_key)
      if cached_data:
          return jsonify({
              'data': cached_data,
              'source': 'cache'
          })
      
      # Cache miss - query database
      products = Product.query.all()
      products_data = [p.to_dict() for p in products]
      
      # Store in cache (TTL: 5 minutes)
      cache.set(cache_key, products_data, ttl=300)
      
      return jsonify({
          'data': products_data,
          'source': 'database'
      })
  
  @products_bp.route('/api/products/<int:product_id>', methods=['GET'])
  def get_product(product_id):
      """Get single product with caching"""
      
      cache_key = f"product:{product_id}"
      
      # Try cache first
      cached_data = cache.get(cache_key)
      if cached_data:
          return jsonify({
              'data': cached_data,
              'source': 'cache'
          })
      
      # Cache miss - query database
      product = Product.query.get_or_404(product_id)
      product_data = product.to_dict()
      
      # Store in cache (TTL: 10 minutes)
      cache.set(cache_key, product_data, ttl=600)
      
      return jsonify({
          'data': product_data,
          'source': 'database'
      })
  
  @products_bp.route('/api/products/<int:product_id>', methods=['PUT'])
  def update_product(product_id):
      """Update product and invalidate cache"""
      
      product = Product.query.get_or_404(product_id)
      
      # Update product in database
      # ... update logic ...
      
      # Invalidate cache
      cache.delete(f"product:{product_id}")
      cache.delete("products:all")
      
      return jsonify({
          'message': 'Product updated',
          'data': product.to_dict()
      })
  ```

- [ ] **C# Implementation (Controllers/ProductsController.cs)**
  ```csharp
  [ApiController]
  [Route("api/[controller]")]
  public class ProductsController : ControllerBase
  {
      private readonly ApplicationDbContext _context;
      private readonly RedisCache _cache;
      
      public ProductsController(
          ApplicationDbContext context, 
          RedisCache cache)
      {
          _context = context;
          _cache = cache;
      }
      
      [HttpGet]
      public async Task<ActionResult<ApiResponse>> GetProducts()
      {
          string cacheKey = "products:all";
          
          // Try cache first
          var cachedData = await _cache.GetAsync<List<Product>>(cacheKey);
          if (cachedData != null)
          {
              return Ok(new ApiResponse
              {
                  Data = cachedData,
                  Source = "cache"
              });
          }
          
          // Cache miss - query database
          var products = await _context.Products.ToListAsync();
          
          // Store in cache (TTL: 5 minutes)
          await _cache.SetAsync(
              cacheKey, 
              products, 
              TimeSpan.FromMinutes(5)
          );
          
          return Ok(new ApiResponse
          {
              Data = products,
              Source = "database"
          });
      }
      
      [HttpGet("{id}")]
      public async Task<ActionResult<ApiResponse>> GetProduct(int id)
      {
          string cacheKey = $"product:{id}";
          
          // Try cache first
          var cachedData = await _cache.GetAsync<Product>(cacheKey);
          if (cachedData != null)
          {
              return Ok(new ApiResponse
              {
                  Data = cachedData,
                  Source = "cache"
              });
          }
          
          // Cache miss - query database
          var product = await _context.Products.FindAsync(id);
          if (product == null)
              return NotFound();
          
          // Store in cache (TTL: 10 minutes)
          await _cache.SetAsync(
              cacheKey, 
              product, 
              TimeSpan.FromMinutes(10)
          );
          
          return Ok(new ApiResponse
          {
              Data = product,
              Source = "database"
          });
      }
      
      [HttpPut("{id}")]
      public async Task<IActionResult> UpdateProduct(
          int id, Product product)
      {
          if (id != product.Id)
              return BadRequest();
          
          _context.Entry(product).State = EntityState.Modified;
          await _context.SaveChangesAsync();
          
          // Invalidate cache
          await _cache.DeleteAsync($"product:{id}");
          await _cache.DeleteAsync("products:all");
          
          return Ok(new { 
              message = "Product updated", 
              data = product 
          });
      }
  }
  ```

#### Step 2.3: Implement Session Caching
- [ ] **User Session Cache (Python)**
  ```python
  from flask import session
  from redis_client import cache
  import uuid
  
  def create_user_session(user_id, user_data):
      """Create user session in Redis"""
      
      session_id = str(uuid.uuid4())
      cache_key = f"session:{session_id}"
      
      session_data = {
          'user_id': user_id,
          'username': user_data['username'],
          'email': user_data['email'],
          'created_at': datetime.now().isoformat()
      }
      
      # Store session (TTL: 30 minutes)
      cache.set(cache_key, session_data, ttl=1800)
      
      # Store session ID in Flask session
      session['session_id'] = session_id
      
      return session_id
  
  def get_user_session(session_id):
      """Retrieve user session from Redis"""
      
      cache_key = f"session:{session_id}"
      return cache.get(cache_key)
  
  def invalidate_session(session_id):
      """Logout - remove session"""
      
      cache_key = f"session:{session_id}"
      cache.delete(cache_key)
      session.pop('session_id', None)
  ```

---

### Lab Exercise 3: Implement Advanced Patterns (12 minutes)

#### Step 3.1: Cache Warming on Startup
- [ ] **Warm Popular Products**
  ```python
  def warm_cache():
      """Pre-load popular products into cache"""
      
      print("🔥 Warming cache...")
      
      # Get top 20 most viewed products
      popular_products = Product.query\\
          .order_by(Product.view_count.desc())\\
          .limit(20)\\
          .all()
      
      for product in popular_products:
          cache_key = f"product:{product.id}"
          cache.set(cache_key, product.to_dict(), ttl=600)
      
      # Cache all products list
      all_products = Product.query.all()
      products_data = [p.to_dict() for p in all_products]
      cache.set("products:all", products_data, ttl=300)
      
      print(f"✅ Cached {len(popular_products)} popular products")
  
  # Call on application startup
  if __name__ == '__main__':
      with app.app_context():
          warm_cache()
      app.run()
  ```

#### Step 3.2: Implement Cache Stampede Prevention
- [ ] **Lock-Based Approach**
  ```python
  import time
  
  def get_with_lock(cache_key, fetch_func, ttl=300):
      """Get data with lock to prevent stampede"""
      
      # Try cache first
      data = cache.get(cache_key)
      if data:
          return data
      
      # Try to acquire lock
      lock_key = f"lock:{cache_key}"
      lock_acquired = cache.client.set(
          lock_key, 
          "1", 
          ex=10,  # Lock expires in 10 seconds
          nx=True  # Only set if not exists
      )
      
      if lock_acquired:
          try:
              # This thread fetches data
              data = fetch_func()
              cache.set(cache_key, data, ttl=ttl)
              return data
          finally:
              # Release lock
              cache.delete(lock_key)
      else:
          # Another thread is fetching, wait and retry
          time.sleep(0.1)
          return cache.get(cache_key) or fetch_func()
  
  # Usage
  @app.route('/api/expensive-data')
  def get_expensive_data():
      data = get_with_lock(
          "expensive:data",
          lambda: expensive_database_query(),
          ttl=600
      )
      return jsonify(data)
  ```

#### Step 3.3: Probabilistic Early Expiration
- [ ] **XFetch Algorithm**
  ```python
  import random
  import time
  
  def get_with_early_expiration(
      cache_key, 
      fetch_func, 
      ttl=300, 
      beta=1.0
  ):
      """
      Probabilistic early expiration to prevent stampede
      Based on XFetch algorithm
      """
      
      # Get cached value and TTL
      data = cache.get(cache_key)
      remaining_ttl = cache.client.ttl(cache_key)
      
      if data and remaining_ttl > 0:
          # Calculate probability of early refresh
          delta = time.time() * beta * random.random()
          
          if delta * remaining_ttl < ttl:
              # Not yet time to refresh
              return data
      
      # Refresh data
      new_data = fetch_func()
      cache.set(cache_key, new_data, ttl=ttl)
      
      return new_data
  ```

---

### Lab Exercise 4: Performance Testing & Monitoring (10 minutes)

#### Step 4.1: Load Testing with Cache
- [ ] **Simple Load Test Script (load_test.py)**
  ```python
  import requests
  import time
  import statistics
  from concurrent.futures import ThreadPoolExecutor, as_completed
  
  BASE_URL = "http://localhost:5000"
  
  def test_endpoint(endpoint):
      """Test single request and measure time"""
      start = time.time()
      response = requests.get(f"{BASE_URL}{endpoint}")
      duration = (time.time() - start) * 1000  # milliseconds
      return duration, response.status_code
  
  def load_test(endpoint, num_requests=100, concurrency=10):
      """Run load test on endpoint"""
      
      print(f"🔧 Testing: {endpoint}")
      print(f"📊 Requests: {num_requests}, Concurrency: {concurrency}")
      
      durations = []
      errors = 0
      
      with ThreadPoolExecutor(max_workers=concurrency) as executor:
          futures = [
              executor.submit(test_endpoint, endpoint) 
              for _ in range(num_requests)
          ]
          
          for future in as_completed(futures):
              try:
                  duration, status = future.result()
                  if status == 200:
                      durations.append(duration)
                  else:
                      errors += 1
              except Exception as e:
                  errors += 1
      
      # Calculate statistics
      if durations:
          results = {
              'total_requests': num_requests,
              'successful': len(durations),
              'errors': errors,
              'avg_time_ms': statistics.mean(durations),
              'median_time_ms': statistics.median(durations),
              'min_time_ms': min(durations),
              'max_time_ms': max(durations),
              'p95_time_ms': statistics.quantiles(durations, n=20)[18],
              'p99_time_ms': statistics.quantiles(durations, n=100)[98]
          }
          
          print("\n📈 Results:")
          for key, value in results.items():
              print(f"  {key}: {value:.2f}")
          
          return results
      else:
          print("❌ All requests failed!")
          return None
  
  if __name__ == '__main__':
      # Test without cache (comment out after first run)
      # print("\n=== Without Cache ===")
      # load_test('/api/products', num_requests=100, concurrency=10)
      
      # Test with cache
      print("\n=== With Cache ===")
      load_test('/api/products', num_requests=100, concurrency=10)
      
      # Test cache hit ratio
      response = requests.get(f"{BASE_URL}/api/cache/stats")
      print(f"\n📊 Cache Stats: {response.json()}")
  ```

#### Step 4.2: Add Cache Statistics Endpoint
- [ ] **Metrics Endpoint (Python)**
  ```python
  @app.route('/api/cache/stats', methods=['GET'])
  def cache_stats():
      """Get cache statistics"""
      
      stats = cache.get_stats()
      
      # Add Redis server info
      try:
          info = cache.client.info('stats')
          stats['redis_stats'] = {
              'total_connections_received': info.get('total_connections_received'),
              'total_commands_processed': info.get('total_commands_processed'),
              'keyspace_hits': info.get('keyspace_hits'),
              'keyspace_misses': info.get('keyspace_misses'),
              'used_memory_human': cache.client.info('memory').get('used_memory_human')
          }
      except:
          pass
      
      return jsonify(stats)
  ```

#### Step 4.3: Compare Performance Metrics
- [ ] **Comparison Table Template**
  ```markdown
  ## Performance Comparison Results
  
  | Metric | Without Cache | With Cache | Improvement |
  |--------|---------------|------------|-------------|
  | Avg Response Time | ___ ms | ___ ms | ___% |
  | P95 Latency | ___ ms | ___ ms | ___% |
  | P99 Latency | ___ ms | ___ ms | ___% |
  | Requests/sec | ___ | ___ | ___% |
  | Database CPU | ___% | ___% | ___% reduction |
  | Cache Hit Ratio | N/A | ___% | - |
  
  ### Expected Improvements:
  - 10-20x faster response times
  - 80-95% cache hit ratio
  - 70-90% reduction in database load
  ```

---

### Lab Exercise 5: Error Handling & Resilience (5 minutes)

#### Step 5.1: Implement Circuit Breaker
- [ ] **Circuit Breaker for Redis**
  ```python
  from enum import Enum
  import time
  
  class CircuitState(Enum):
      CLOSED = "closed"
      OPEN = "open"
      HALF_OPEN = "half_open"
  
  class CircuitBreaker:
      def __init__(
          self, 
          failure_threshold=5, 
          timeout=60, 
          success_threshold=2
      ):
          self.failure_threshold = failure_threshold
          self.timeout = timeout
          self.success_threshold = success_threshold
          self.failure_count = 0
          self.success_count = 0
          self.last_failure_time = None
          self.state = CircuitState.CLOSED
      
      def call(self, func, *args, **kwargs):
          """Execute function with circuit breaker"""
          
          if self.state == CircuitState.OPEN:
              if time.time() - self.last_failure_time > self.timeout:
                  self.state = CircuitState.HALF_OPEN
                  self.success_count = 0
              else:
                  raise Exception("Circuit breaker is OPEN")
          
          try:
              result = func(*args, **kwargs)
              
              if self.state == CircuitState.HALF_OPEN:
                  self.success_count += 1
                  if self.success_count >= self.success_threshold:
                      self.state = CircuitState.CLOSED
                      self.failure_count = 0
              
              return result
              
          except Exception as e:
              self.failure_count += 1
              self.last_failure_time = time.time()
              
              if self.failure_count >= self.failure_threshold:
                  self.state = CircuitState.OPEN
              
              raise
  
  # Usage with Redis
  redis_circuit_breaker = CircuitBreaker(
      failure_threshold=5, 
      timeout=60
  )
  
  def safe_cache_get(key):
      """Get from cache with circuit breaker"""
      try:
          return redis_circuit_breaker.call(cache.get, key)
      except:
          # Fallback to database
          return None
  ```

#### Step 5.2: Graceful Degradation
- [ ] **Fallback Pattern**
  ```python
  def get_product_resilient(product_id):
      """Get product with graceful degradation"""
      
      cache_key = f"product:{product_id}"
      
      # Try cache first
      try:
          cached_data = cache.get(cache_key)
          if cached_data:
              return cached_data, 'cache'
      except Exception as e:
          print(f"Cache error (degraded mode): {e}")
      
      # Fallback to database
      product = Product.query.get(product_id)
      if product:
          product_data = product.to_dict()
          
          # Try to update cache (best effort)
          try:
              cache.set(cache_key, product_data, ttl=600)
          except:
              pass  # Don't fail if cache is down
          
          return product_data, 'database'
      
      return None, None
  ```

---

## 📊 Deliverables Checklist

### 1. Starter Applications (Two Versions)
- [ ] **Python Flask Application**
  - Complete e-commerce API
  - SQLite database with sample data
  - REST endpoints
  - README with setup instructions

- [ ] **C# ASP.NET Core Application**
  - Equivalent functionality to Python version
  - Entity Framework with SQLite
  - Swagger/OpenAPI documentation
  - README with setup instructions

### 2. Lab Guide with Solutions
- [ ] **Step-by-Step Instructions**
  - Exercise 1: Setup (with validation)
  - Exercise 2: Basic caching (code snippets)
  - Exercise 3: Advanced patterns (examples)
  - Exercise 4: Performance testing (scripts)
  - Exercise 5: Error handling (patterns)

### 3. Testing Scripts
- [ ] **load_test.py** - Load testing tool
- [ ] **verify_cache.py** - Cache validation
- [ ] **benchmark.sh** - Automated benchmarking

### 4. Performance Report Template
- [ ] **Excel/Google Sheets Template**
  - Before/after comparison
  - Charts for visualization
  - Recommendations section

---

## 💻 Complete Starter App Repository Structure

```
module-05-lab/
├── README.md
├── docs/
│   ├── lab-instructions.md
│   ├── troubleshooting.md
│   └── performance-tips.md
├── python-flask/
│   ├── app.py
│   ├── models.py
│   ├── redis_client.py
│   ├── routes/
│   │   ├── products.py
│   │   ├── users.py
│   │   └── orders.py
│   ├── init_db.py
│   ├── requirements.txt
│   ├── .env.template
│   └── tests/
│       ├── test_caching.py
│       └── load_test.py
├── csharp-aspnet/
│   ├── Program.cs
│   ├── Controllers/
│   │   ├── ProductsController.cs
│   │   ├── UsersController.cs
│   │   └── OrdersController.cs
│   ├── Services/
│   │   └── RedisCache.cs
│   ├── Models/
│   ├── Data/
│   ├── appsettings.json
│   └── ShopApi.csproj
└── scripts/
    ├── load-test.sh
    ├── compare-performance.py
    └── warm-cache.py
```

---

## ⏱️ Time Allocation (50 minutes)

| Exercise | Duration | Type |
|----------|----------|------|
| Exercise 1: Setup Starter App | 8 min | Setup |
| Exercise 2: Implement Caching | 15 min | Coding |
| Exercise 3: Advanced Patterns | 12 min | Coding |
| Exercise 4: Performance Testing | 10 min | Testing |
| Exercise 5: Error Handling | 5 min | Discussion |

---

## ✅ Content Creation Checklist

### Applications
- [ ] Build Python Flask starter app
- [ ] Build C# ASP.NET Core starter app
- [ ] Create database seed scripts
- [ ] Test both applications thoroughly

### Lab Materials
- [ ] Write detailed lab instructions
- [ ] Create code solution files
- [ ] Write testing scripts
- [ ] Create performance report template

### Quality Assurance
- [ ] Test lab with fresh environment
- [ ] Verify timing for each exercise
- [ ] Check all code compiles and runs
- [ ] Proofread all documentation

---

**Status:** ✅ Checklist Complete - Ready for Content Development  
**Version:** 1.0  
**Last Updated:** November 18, 2025
