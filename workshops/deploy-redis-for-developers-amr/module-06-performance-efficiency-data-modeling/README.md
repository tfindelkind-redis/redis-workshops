---
title: Performance Efficiency & Data Modeling
description: 'Master performance optimization and data modeling patterns for Redis deployments.'
duration: 60 minutes
difficulty: intermediate
type: hands-on
---

<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->

| Previous | Home | Next |
|----------|:----:|------:|
| [⬅️ Previous: Cost Optimization & Operational Excellence](../module-05-cost-optimization-operational-excellence/README.md) | [🏠 Workshop Home](../README.md) | [Next: Provision & Connect Lab ➡️](../module-07-provision-connect-lab/README.md) |

[🏠 Workshop Home](../README.md) > **Module 6 of 11**

### Deploy Redis for Developers - Azure Managed Redis

**Progress:** `█████░░░░░` 55%

---

<!-- ✏️ EDIT YOUR CONTENT BELOW THIS LINE ✏️ -->

# Module 4C: Performance Efficiency & Data Modeling
**Duration:** 60 minutes  
**Format:** WAF Deep Dive - Theory + Practical Examples  
**Level:** Advanced

---

## Module Overview

**Objective:** Master performance optimization and data modeling patterns for Redis deployments.

**Learning Outcomes:**
- Implement optimal caching patterns (cache-aside, write-through, write-behind, refresh-ahead)
- Design efficient data models using appropriate Redis data structures
- Apply key naming conventions and data modeling best practices
- Optimize connection pooling and command execution
- Identify and avoid performance anti-patterns
- Measure and improve cache performance metrics

**Prerequisites:**
- Modules 1-4B completed
- Understanding of Redis data structures
- Basic performance tuning concepts

---

## Timing Breakdown

| Section | Duration | Type |
|---------|----------|------|
| Caching Patterns | 20 min | Theory + Code Examples |
| Data Modeling Best Practices | 15 min | Design Patterns |
| Key Naming & Organization | 10 min | Standards |
| Performance Tuning | 10 min | Optimization |
| Anti-Patterns to Avoid | 5 min | Warnings |
| **Total** | **60 min** | |

---

## PERFORMANCE EFFICIENCY PILLAR

## Section 1: Caching Patterns (20 minutes)

### 1.1 Cache-Aside Pattern (5 minutes)

**Most Common Pattern - Application Owns Cache**

**Flow:**
```
1. Application checks cache for data
2. If found (cache hit): Return cached data
3. If not found (cache miss):
   a. Fetch from database
   b. Write to cache with TTL
   c. Return data
```

**Implementation:**
```python
import redis
import json
from typing import Optional

class CacheAsidePattern:
    def __init__(self, redis_client, db_client):
        self.cache = redis_client
        self.db = db_client
        self.default_ttl = 3600  # 1 hour
    
    def get_user(self, user_id: int) -> Optional[dict]:
        """Cache-aside pattern for user data"""
        cache_key = f"user:{user_id}"
        
        # 1. Try cache first
        cached = self.cache.get(cache_key)
        if cached:
            print(f"✅ Cache HIT for {cache_key}")
            return json.loads(cached)
        
        # 2. Cache miss - fetch from database
        print(f"❌ Cache MISS for {cache_key}")
        user = self.db.query(f"SELECT * FROM users WHERE id = {user_id}")
        
        if user:
            # 3. Store in cache for next time
            self.cache.setex(
                cache_key,
                self.default_ttl,
                json.dumps(user)
            )
        
        return user
    
    def update_user(self, user_id: int, data: dict):
        """Update user - invalidate cache"""
        # 1. Update database
        self.db.execute(
            f"UPDATE users SET ... WHERE id = {user_id}"
        )
        
        # 2. Invalidate cache (lazy update)
        cache_key = f"user:{user_id}"
        self.cache.delete(cache_key)
        
        # Next read will fetch fresh data from DB

# Usage
cache_aside = CacheAsidePattern(redis_client, db_client)
user = cache_aside.get_user(123)  # First call: DB + cache write
user = cache_aside.get_user(123)  # Second call: cache hit
```

**Pros & Cons:**
```
✅ Pros:
- Cache only what's actually needed (efficient memory usage)
- Resilient: Cache failure doesn't break application
- Simple to implement and understand
- Cache data can survive application restarts

❌ Cons:
- Initial request always slower (cache miss penalty)
- Potential cache stampede on popular keys
- Stale data possible between updates
- Requires invalidation strategy
```

**When to Use:**
- Read-heavy workloads (most common case)
- Unpredictable data access patterns
- Non-critical data (tolerate brief staleness)
- General-purpose caching

---

### 1.2 Write-Through Pattern (4 minutes)

**Application Writes to Cache and DB Simultaneously**

**Flow:**
```
1. Application writes data
2. Update cache first (or simultaneously with DB)
3. Update database
4. Return success
```

**Implementation:**
```python
class WriteThroughPattern:
    def __init__(self, redis_client, db_client):
        self.cache = redis_client
        self.db = db_client
        self.default_ttl = 3600
    
    def save_user(self, user_id: int, data: dict):
        """Write-through: Update cache and DB together"""
        cache_key = f"user:{user_id}"
        
        try:
            # 1. Write to cache first (fast)
            self.cache.setex(
                cache_key,
                self.default_ttl,
                json.dumps(data)
            )
            
            # 2. Write to database (durable)
            self.db.execute(
                "UPDATE users SET ... WHERE id = ?",
                (user_id,)
            )
            
            print(f"✅ Write-through complete for {cache_key}")
            return True
            
        except Exception as e:
            # Rollback cache if DB fails
            self.cache.delete(cache_key)
            raise e
    
    def get_user(self, user_id: int) -> Optional[dict]:
        """Read: Always fresh from cache"""
        cache_key = f"user:{user_id}"
        
        cached = self.cache.get(cache_key)
        if cached:
            return json.loads(cached)
        
        # Fallback to DB if cache miss
        user = self.db.query(f"SELECT * FROM users WHERE id = {user_id}")
        if user:
            self.cache.setex(cache_key, self.default_ttl, json.dumps(user))
        
        return user
```

**Pros & Cons:**
```
✅ Pros:
- Cache always consistent with database
- No cache invalidation logic needed
- Reads are always fast (cache-hit)
- Predictable performance

❌ Cons:
- Write latency higher (cache + DB)
- Wasted cache space (writes everything)
- Cache failure blocks writes
- Not ideal for write-heavy workloads
```

**When to Use:**
- Consistency critical (financial data)
- Read >> Write ratio
- Predictable data access patterns
- Small datasets that fit in cache

---

### 1.3 Write-Behind (Write-Back) Pattern (4 minutes)

**Write to Cache, Async Write to DB**

**Flow:**
```
1. Application writes to cache
2. Return success immediately
3. Background worker writes to DB (async)
4. Handle DB failures/retries
```

**Implementation:**
```python
import asyncio
from queue import Queue

class WriteBehindPattern:
    def __init__(self, redis_client, db_client):
        self.cache = redis_client
        self.db = db_client
        self.write_queue = Queue()
        self.default_ttl = 3600
        
        # Start background worker
        asyncio.create_task(self.background_writer())
    
    def save_user(self, user_id: int, data: dict):
        """Write-behind: Update cache immediately"""
        cache_key = f"user:{user_id}"
        
        # 1. Write to cache (fast - main thread)
        self.cache.setex(
            cache_key,
            self.default_ttl,
            json.dumps(data)
        )
        
        # 2. Queue DB write (async - background)
        self.write_queue.put({
            'key': cache_key,
            'user_id': user_id,
            'data': data
        })
        
        print(f"✅ Cache updated, DB write queued for {cache_key}")
        return True  # Immediate response
    
    async def background_writer(self):
        """Background worker to persist to DB"""
        while True:
            try:
                # Get pending writes from queue
                write_task = self.write_queue.get(timeout=1)
                
                # Write to database
                await self.db.execute_async(
                    "UPDATE users SET ... WHERE id = ?",
                    (write_task['user_id'],)
                )
                
                print(f"✅ DB persisted: {write_task['key']}")
                
            except Empty:
                await asyncio.sleep(0.1)
            except Exception as e:
                # Retry logic or DLQ
                print(f"❌ DB write failed: {e}")
                # Could re-queue or log to DLQ

# Advanced: Batch writes
class BatchWriteBehind(WriteBehindPattern):
    async def background_writer(self):
        """Batch writes every 5 seconds or 100 items"""
        batch = []
        last_write = time.time()
        
        while True:
            try:
                item = self.write_queue.get(timeout=0.1)
                batch.append(item)
                
                # Flush conditions
                if len(batch) >= 100 or (time.time() - last_write) >= 5:
                    await self.flush_batch(batch)
                    batch = []
                    last_write = time.time()
                    
            except Empty:
                if batch and (time.time() - last_write) >= 5:
                    await self.flush_batch(batch)
                    batch = []
                    last_write = time.time()
    
    async def flush_batch(self, batch):
        """Batch write to DB"""
        values = [(item['user_id'], item['data']) for item in batch]
        await self.db.executemany(
            "UPDATE users SET ... WHERE id = ?",
            values
        )
        print(f"✅ Batch written: {len(batch)} records")
```

**Pros & Cons:**
```
✅ Pros:
- Extremely fast writes (cache only)
- Can batch DB writes (efficiency)
- Reduces DB load significantly
- Best write performance

❌ Cons:
- Data loss risk (cache failure before DB write)
- Complex error handling (retries, DLQ)
- Eventual consistency (not immediate)
- Requires queue management
```

**When to Use:**
- Write-heavy workloads (analytics, logging)
- Can tolerate eventual consistency
- Need maximum write throughput
- Have robust error handling

---

### 1.4 Refresh-Ahead (Read-Through) Pattern (4 minutes)

**Proactively Refresh Cache Before Expiration**

**Flow:**
```
1. Application reads from cache
2. If TTL < threshold (e.g., 20% remaining):
   a. Return cached data immediately
   b. Trigger async refresh from DB
3. Cache always "warm" for popular keys
```

**Implementation:**
```python
import time
import asyncio

class RefreshAheadPattern:
    def __init__(self, redis_client, db_client):
        self.cache = redis_client
        self.db = db_client
        self.default_ttl = 3600  # 1 hour
        self.refresh_threshold = 0.2  # Refresh at 20% TTL remaining
    
    def get_user(self, user_id: int) -> Optional[dict]:
        """Refresh-ahead: Proactive cache refresh"""
        cache_key = f"user:{user_id}"
        
        # Get cached data
        cached = self.cache.get(cache_key)
        
        if cached:
            # Check remaining TTL
            ttl = self.cache.ttl(cache_key)
            threshold_seconds = self.default_ttl * self.refresh_threshold
            
            # If TTL low, trigger async refresh
            if ttl > 0 and ttl < threshold_seconds:
                print(f"🔄 TTL low ({ttl}s), refreshing {cache_key}")
                asyncio.create_task(self.refresh_cache(cache_key, user_id))
            
            return json.loads(cached)
        
        # Cache miss - fetch and cache
        return self.fetch_and_cache(user_id)
    
    async def refresh_cache(self, cache_key: str, user_id: int):
        """Background refresh from database"""
        try:
            user = await self.db.query_async(
                f"SELECT * FROM users WHERE id = {user_id}"
            )
            
            if user:
                self.cache.setex(
                    cache_key,
                    self.default_ttl,
                    json.dumps(user)
                )
                print(f"✅ Cache refreshed: {cache_key}")
                
        except Exception as e:
            print(f"❌ Refresh failed: {e}")
    
    def fetch_and_cache(self, user_id: int) -> Optional[dict]:
        """Synchronous fetch for cache miss"""
        user = self.db.query(f"SELECT * FROM users WHERE id = {user_id}")
        
        if user:
            cache_key = f"user:{user_id}"
            self.cache.setex(cache_key, self.default_ttl, json.dumps(user))
        
        return user

# Advanced: ML-based prediction
class PredictiveRefresh(RefreshAheadPattern):
    """Use access patterns to predict which keys need refresh"""
    
    def __init__(self, redis_client, db_client):
        super().__init__(redis_client, db_client)
        self.access_counter = {}  # Track access frequency
    
    def get_user(self, user_id: int) -> Optional[dict]:
        """Track access patterns"""
        cache_key = f"user:{user_id}"
        
        # Increment access counter
        self.access_counter[cache_key] = self.access_counter.get(cache_key, 0) + 1
        
        # High-traffic keys: refresh earlier (10% TTL)
        if self.access_counter[cache_key] > 100:
            self.refresh_threshold = 0.1
        
        return super().get_user(user_id)
```

**Pros & Cons:**
```
✅ Pros:
- No cache miss penalty for hot keys
- Predictable latency (always cache hit)
- Reduces DB load (only for popular keys)
- User always gets fast response

❌ Cons:
- Complex to implement
- Wasted refreshes for unpopular keys
- Requires TTL monitoring
- Background tasks management
```

**When to Use:**
- High-traffic endpoints (homepage, trending items)
- Predictable access patterns
- Latency-sensitive applications
- Can predict popular keys

---

### 1.5 Pattern Comparison (3 minutes)

**Decision Matrix:**

```
Pattern          | Read Perf | Write Perf | Consistency | Complexity | Use Case
-----------------|-----------|------------|-------------|------------|------------------
Cache-Aside      | Good      | Good       | Eventual    | Low        | General purpose ✅
Write-Through    | Excellent | Fair       | Strong      | Medium     | Read-heavy, consistency critical
Write-Behind     | Excellent | Excellent  | Eventual    | High       | Write-heavy, analytics
Refresh-Ahead    | Excellent | Good       | Eventual    | High       | Hot keys, predictable access

Performance Ranking:
Read:  Refresh-Ahead > Write-Through ≈ Write-Behind > Cache-Aside
Write: Write-Behind >> Cache-Aside ≈ Refresh-Ahead > Write-Through

Consistency Ranking:
Write-Through (strong) > Cache-Aside ≈ Write-Behind ≈ Refresh-Ahead (eventual)
```

**Real-World Example:**
```python
class HybridCachingStrategy:
    """Combine patterns based on data type"""
    
    def __init__(self, redis_client, db_client):
        self.cache_aside = CacheAsidePattern(redis_client, db_client)
        self.write_through = WriteThroughPattern(redis_client, db_client)
        self.refresh_ahead = RefreshAheadPattern(redis_client, db_client)
    
    def get_data(self, data_type: str, data_id: int):
        """Route to appropriate pattern"""
        
        if data_type == 'user_profile':
            # Write-through: Consistency critical
            return self.write_through.get_user(data_id)
        
        elif data_type == 'product':
            # Refresh-ahead: Hot keys, high traffic
            return self.refresh_ahead.get_user(data_id)
        
        elif data_type == 'order_history':
            # Cache-aside: General purpose
            return self.cache_aside.get_user(data_id)
        
        else:
            # Default: Cache-aside
            return self.cache_aside.get_user(data_id)
```

---

## Section 2: Data Modeling Best Practices (15 minutes)

### 2.1 Data Structure Selection (5 minutes)

**Decision Tree:**

```
What are you storing?

├─ Simple value (string, number, boolean)?
│  └─ Use: STRING
│     Examples: counters, flags, tokens, cached JSON
│
├─ Ordered collection?
│  ├─ Need ranking/scoring?
│  │  └─ Use: SORTED SET
│  │     Examples: leaderboards, time-series, priority queues
│  │
│  └─ Need FIFO/LIFO?
│     └─ Use: LIST
│        Examples: queues, recent items, activity feeds
│
├─ Unique collection (no duplicates)?
│  ├─ Need set operations (union, intersection)?
│  │  └─ Use: SET
│  │     Examples: tags, followers, unique visitors
│  │
│  └─ Need to check membership?
│     └─ Use: SET or BLOOM FILTER
│        Examples: blacklists, seen items
│
└─ Object with multiple fields?
   └─ Use: HASH
      Examples: user profile, product details, session data
```

**Performance Characteristics:**

| Operation | String | List | Set | Sorted Set | Hash |
|-----------|--------|------|-----|------------|------|
| Get single item | O(1) | O(N) | O(1) | O(log N) | O(1) |
| Add item | O(1) | O(1) | O(1) | O(log N) | O(1) |
| Remove item | O(1) | O(N) | O(1) | O(log N) | O(1) |
| Get all items | O(1) | O(N) | O(N) | O(N) | O(N) |
| Range query | N/A | O(N) | N/A | O(log N + M) | N/A |

---

### 2.2 Real-World Data Modeling Examples (10 minutes)

**Example 1: User Profile**

```python
# ❌ Bad: Single large JSON string
redis.set('user:123', json.dumps({
    'id': 123,
    'name': 'John Doe',
    'email': 'john@example.com',
    'settings': {...},  # 50 fields
    'preferences': {...}  # 100 fields
}))

# Problem: Must deserialize entire object to update one field
# Problem: Race conditions on concurrent updates

# ✅ Good: Use Hash for structured data
redis.hset('user:123', mapping={
    'id': '123',
    'name': 'John Doe',
    'email': 'john@example.com'
})

# Update single field (atomic, no race conditions)
redis.hset('user:123', 'email', 'newemail@example.com')

# Get single field (efficient)
email = redis.hget('user:123', 'email')

# Get multiple fields
user_data = redis.hmget('user:123', ['name', 'email'])

# Bonus: Field-level TTL with separate keys
redis.setex('user:123:session_token', 1800, token)  # 30 min TTL
redis.setex('user:123:temp_password', 300, temp_pwd)  # 5 min TTL
```

**Example 2: Leaderboard / Ranking**

```python
# ✅ Use Sorted Set for rankings
# Score-based ordering (automatic sorting)

# Add player scores
redis.zadd('leaderboard:global', {
    'player:123': 1500,  # Score: 1500
    'player:456': 2300,
    'player:789': 1100
})

# Get top 10 players (O(log N + 10))
top_10 = redis.zrevrange('leaderboard:global', 0, 9, withscores=True)
# Returns: [('player:456', 2300), ('player:123', 1500), ...]

# Get player rank (O(log N))
rank = redis.zrevrank('leaderboard:global', 'player:123')
# Returns: 1 (0-indexed, so rank 2)

# Get player score (O(1))
score = redis.zscore('leaderboard:global', 'player:123')
# Returns: 1500

# Increment score atomically (O(log N))
redis.zincrby('leaderboard:global', 100, 'player:123')
# New score: 1600

# Get players within score range
redis.zrangebyscore('leaderboard:global', 1000, 2000, withscores=True)

# Count players above threshold
count = redis.zcount('leaderboard:global', 1500, '+inf')
```

**Example 3: Session Storage**

```python
# ✅ Use Hash for session data
session_id = 'sess:abc123'

# Store session
redis.hset(session_id, mapping={
    'user_id': '123',
    'username': 'john_doe',
    'login_time': str(time.time()),
    'ip_address': '192.168.1.1',
    'role': 'admin'
})

# Set session expiration
redis.expire(session_id, 1800)  # 30 minutes

# Update last activity (extend TTL)
redis.hset(session_id, 'last_activity', str(time.time()))
redis.expire(session_id, 1800)  # Reset TTL

# Get session
session = redis.hgetall(session_id)

# Check if session exists
if redis.exists(session_id):
    # Valid session
    pass
```

**Example 4: Product Catalog Cache**

```python
# ✅ Use Hash for each product
product_id = 'product:12345'

redis.hset(product_id, mapping={
    'name': 'Laptop',
    'price': '999.99',
    'stock': '15',
    'category': 'electronics',
    'description': '...'
})
redis.expire(product_id, 3600)  # 1 hour TTL

# ✅ Use Sorted Set for category index
redis.zadd('category:electronics', {
    'product:12345': time.time(),  # Score: timestamp
    'product:67890': time.time()
})

# Get recent products in category
recent = redis.zrevrange('category:electronics', 0, 19)  # Top 20

# ✅ Use Set for tags
redis.sadd('tag:laptop', 'product:12345', 'product:67890')
redis.sadd('tag:portable', 'product:12345')

# Find products with multiple tags (intersection)
products = redis.sinter('tag:laptop', 'tag:portable')
```

**Example 5: Rate Limiting**

```python
# ✅ Fixed Window Rate Limit
def is_rate_limited_fixed_window(user_id: str, limit: int = 100) -> bool:
    """Allow `limit` requests per hour"""
    key = f"ratelimit:{user_id}:{int(time.time() / 3600)}"
    
    current = redis.incr(key)
    
    if current == 1:
        redis.expire(key, 3600)  # 1 hour window
    
    return current > limit

# ✅ Sliding Window Rate Limit (more accurate)
def is_rate_limited_sliding_window(user_id: str, limit: int = 100) -> bool:
    """Allow `limit` requests per sliding hour"""
    key = f"ratelimit:{user_id}"
    now = time.time()
    window = 3600  # 1 hour
    
    # Remove old entries
    redis.zremrangebyscore(key, 0, now - window)
    
    # Count recent requests
    count = redis.zcard(key)
    
    if count < limit:
        # Add new request
        redis.zadd(key, {str(now): now})
        redis.expire(key, window)
        return False
    
    return True

# ✅ Token Bucket Rate Limit (burst support)
def is_rate_limited_token_bucket(user_id: str, capacity: int = 100, rate: int = 10) -> bool:
    """Allow bursts up to `capacity`, refill at `rate` per second"""
    key = f"ratelimit:tb:{user_id}"
    
    # Lua script for atomic operation
    lua_script = """
    local key = KEYS[1]
    local capacity = tonumber(ARGV[1])
    local rate = tonumber(ARGV[2])
    local now = tonumber(ARGV[3])
    
    local tokens = tonumber(redis.call('HGET', key, 'tokens'))
    local last_update = tonumber(redis.call('HGET', key, 'last_update'))
    
    if not tokens then
        tokens = capacity
        last_update = now
    end
    
    local elapsed = now - last_update
    local new_tokens = math.min(capacity, tokens + (elapsed * rate))
    
    if new_tokens >= 1 then
        redis.call('HSET', key, 'tokens', new_tokens - 1)
        redis.call('HSET', key, 'last_update', now)
        redis.call('EXPIRE', key, 3600)
        return 0  # Allow
    else
        return 1  # Deny
    end
    """
    
    result = redis.eval(lua_script, 1, key, capacity, rate, time.time())
    return result == 1
```

**Example 6: Activity Feed (Recent Items)**

```python
# ✅ Use List for ordered activity feed
feed_key = 'feed:user:123'

# Add new activity (LPUSH = add to front)
redis.lpush(feed_key, json.dumps({
    'type': 'comment',
    'user': 'jane_doe',
    'content': 'Great post!',
    'timestamp': time.time()
}))

# Keep only last 100 items (trim)
redis.ltrim(feed_key, 0, 99)

# Set expiration
redis.expire(feed_key, 86400)  # 24 hours

# Get recent activities (pagination)
page_size = 20
page = 1
start = (page - 1) * page_size
end = start + page_size - 1

activities = redis.lrange(feed_key, start, end)
activities = [json.loads(a) for a in activities]

# Get total count
total = redis.llen(feed_key)
```

---

## Section 3: Key Naming Conventions (10 minutes)

### 3.1 Naming Standards (5 minutes)

**Best Practices:**

```
✅ Use colons (:) as separators
✅ Start general → specific (namespace:object:id:field)
✅ Use lowercase
✅ Be consistent across application
✅ Include version for schema changes
✅ Avoid special characters

Examples:
user:123:profile           ✅ Good
user_123_profile           ❌ Inconsistent
user/123/profile           ❌ Confusing
User:123:Profile           ❌ Mixed case
userprofile123             ❌ Not structured
```

**Naming Patterns:**

```
# Entity pattern
<entity>:<id>
user:123
product:456
order:789

# Entity with field
<entity>:<id>:<field>
user:123:email
user:123:preferences
user:123:session

# Collection pattern
<entity>:<collection_type>:<key>
users:by_email:john@example.com  → points to user:123
products:by_sku:ABC123          → points to product:456

# Index pattern
<entity>:<index_name>
users:active           → Set of active user IDs
products:featured      → Sorted set of featured products
orders:by_date:2024-11 → Sorted set of orders

# Aggregation pattern
<entity>:<metric>:<period>
user:123:pageviews:2024-11-19
product:456:views:2024-11
site:visitors:2024-11-19

# Versioning pattern
<entity>:<id>:v<version>
user:123:profile:v2
cache:product:456:v3
```

**Real-World Example:**

```python
class KeyNamespace:
    """Centralized key naming"""
    
    @staticmethod
    def user(user_id: int) -> str:
        return f"user:{user_id}"
    
    @staticmethod
    def user_sessions(user_id: int) -> str:
        return f"user:{user_id}:sessions"
    
    @staticmethod
    def user_by_email(email: str) -> str:
        return f"user:by_email:{email}"
    
    @staticmethod
    def product(product_id: int) -> str:
        return f"product:{product_id}"
    
    @staticmethod
    def product_views(product_id: int, date: str) -> str:
        return f"product:{product_id}:views:{date}"
    
    @staticmethod
    def category_products(category: str) -> str:
        return f"category:{category}:products"
    
    @staticmethod
    def session(session_id: str) -> str:
        return f"session:{session_id}"

# Usage
user_key = KeyNamespace.user(123)
session_key = KeyNamespace.session('abc123')
```

---

### 3.2 Key Organization Strategies (5 minutes)

**Strategy 1: Hierarchical Namespaces**

```python
# Environment-based
prod:user:123:profile
staging:user:123:profile
dev:user:123:profile

# Application-based
myapp:user:123
myapp:product:456
myapp:cache:homepage

# Tenant-based (multi-tenancy)
tenant:acme:user:123
tenant:globex:user:123
```

**Strategy 2: Expiration Groups**

```python
# Short-lived (seconds/minutes)
temp:verification_code:abc123  → 5 min
temp:otp:123456               → 2 min
temp:cart:user:123            → 30 min

# Medium-lived (hours)
cache:product:123             → 1 hour
cache:api_response:xyz        → 30 min
session:abc123                → 2 hours

# Long-lived (days/weeks)
user:123:preferences          → 7 days
product:123:details           → 24 hours
analytics:daily:2024-11-19    → 30 days

# Permanent (no TTL)
user:123:id                   → never expires
product:123:id                → never expires
```

**Strategy 3: Scan-Friendly Patterns**

```python
# Use prefix for bulk operations
# Good: Can use SCAN with pattern
user:*              # All user keys
user:123:*          # All keys for user 123
cache:product:*     # All cached products

# Bad: Hard to find related keys
user_123_profile
user_456_email
product_123_cache

# Bulk operations
# Delete all sessions
for key in redis.scan_iter('session:*', count=100):
    redis.delete(key)

# Delete all expired cache
for key in redis.scan_iter('cache:*', count=100):
    ttl = redis.ttl(key)
    if ttl == -1:  # No expiration set
        redis.delete(key)
```

**Strategy 4: Secondary Indexes**

```python
# Primary key
redis.hset('user:123', mapping={
    'email': 'john@example.com',
    'username': 'john_doe'
})

# Secondary indexes (for lookups)
redis.set('user:by_email:john@example.com', '123')
redis.set('user:by_username:john_doe', '123')

# Lookup by email
user_id = redis.get('user:by_email:john@example.com')
user = redis.hgetall(f'user:{user_id}')

# Lookup by username
user_id = redis.get('user:by_username:john_doe')
user = redis.hgetall(f'user:{user_id}')

# Important: Keep indexes in sync!
def update_user_email(user_id: int, old_email: str, new_email: str):
    # Update primary data
    redis.hset(f'user:{user_id}', 'email', new_email)
    
    # Update index (atomic with Lua script recommended)
    redis.delete(f'user:by_email:{old_email}')
    redis.set(f'user:by_email:{new_email}', user_id)
```

---

## Section 4: Performance Tuning (10 minutes)

### 4.1 Connection Pooling (3 minutes)

**Optimal Configuration:**

```python
import redis

# ✅ Good: Connection pool (reuse connections)
pool = redis.ConnectionPool(
    host='myredis.redis.cache.windows.net',
    port=6380,
    max_connections=50,           # Per app instance
    socket_connect_timeout=5,     # 5 sec connection timeout
    socket_timeout=5,             # 5 sec command timeout
    socket_keepalive=True,        # Keep TCP alive
    socket_keepalive_options={
        socket.TCP_KEEPIDLE: 60,   # Start probes after 60s
        socket.TCP_KEEPINTVL: 10,  # Probe every 10s
        socket.TCP_KEEPCNT: 3      # 3 failed probes = dead
    },
    retry_on_timeout=True,
    health_check_interval=30,     # Check connection every 30s
    ssl=True,
    ssl_cert_reqs='required'
)

# Reuse pool across application
redis_client = redis.Redis(connection_pool=pool)

# ❌ Bad: New connection every request
def bad_pattern():
    r = redis.Redis(host='...', port=6380, ssl=True)
    r.get('key')
    # Connection lost after function exits!
```

**Pool Sizing Formula:**

```
Pool Size = (Expected Concurrent Requests) × (Avg Request Duration) × (Safety Factor)

Example:
- 1000 requests/second
- 10ms avg Redis operation
- Safety factor: 1.5
→ Pool size = 1000 × 0.01 × 1.5 = 15 connections

Add buffer: 15 × 2 = 30 connections recommended

Typical values:
- Web API (low traffic): 10-20 connections
- Web API (high traffic): 50-100 connections
- Background worker: 5-10 connections
- Batch processor: 20-50 connections
```

---

### 4.2 Pipelining (3 minutes)

**Batch Multiple Commands:**

```python
# ❌ Bad: Multiple round-trips (slow)
for i in range(1000):
    redis.set(f'key:{i}', f'value:{i}')
# Result: 1000 network round-trips (~1-5ms each)
# Total: 1-5 seconds!

# ✅ Good: Use pipeline (batch)
pipe = redis.pipeline(transaction=False)
for i in range(1000):
    pipe.set(f'key:{i}', f'value:{i}')
pipe.execute()
# Result: 1 network round-trip
# Total: 1-5ms (1000x faster!)

# Example: Bulk user retrieval
def get_users_bulk(user_ids: list[int]) -> list[dict]:
    """Efficient bulk retrieval"""
    pipe = redis.pipeline(transaction=False)
    
    # Queue all commands
    for user_id in user_ids:
        pipe.hgetall(f'user:{user_id}')
    
    # Execute in one round-trip
    results = pipe.execute()
    
    return results

# Before: 100 users = 100ms (1ms per call)
# After:  100 users = 2ms (one pipeline)
```

**Transaction vs Non-Transaction Pipeline:**

```python
# Transaction pipeline (MULTI/EXEC)
# All commands succeed or all fail (atomic)
pipe = redis.pipeline(transaction=True)
pipe.set('key1', 'value1')
pipe.incr('counter')
pipe.lpush('list', 'item')
pipe.execute()  # Atomic

# Non-transaction pipeline (faster)
# Commands independent, better performance
pipe = redis.pipeline(transaction=False)
pipe.get('key1')
pipe.get('key2')
pipe.get('key3')
results = pipe.execute()  # [value1, value2, value3]
```

---

### 4.3 Lua Scripts for Atomic Operations (4 minutes)

**Why Lua Scripts:**

```
✅ Atomic execution (no race conditions)
✅ Reduce network round-trips
✅ Server-side logic (less data transfer)
✅ Better performance for complex operations
```

**Example 1: Atomic Get-and-Set:**

```python
# ❌ Bad: Race condition
value = redis.get('counter')
new_value = int(value) + 1
redis.set('counter', new_value)
# Problem: Another client can modify between GET and SET

# ✅ Good: Lua script (atomic)
lua_script = """
local current = redis.call('GET', KEYS[1])
if not current then
    current = 0
end
local new_value = tonumber(current) + tonumber(ARGV[1])
redis.call('SET', KEYS[1], new_value)
return new_value
"""

new_value = redis.eval(lua_script, 1, 'counter', 10)
# Atomic: No race conditions
```

**Example 2: Rate Limiting (Sliding Window):**

```python
lua_script = """
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])

-- Remove old entries
redis.call('ZREMRANGEBYSCORE', key, 0, now - window)

-- Count current requests
local count = redis.call('ZCARD', key)

if count < limit then
    -- Allow request
    redis.call('ZADD', key, now, now)
    redis.call('EXPIRE', key, window)
    return 0
else
    -- Deny request
    return 1
end
"""

# Usage
is_limited = redis.eval(
    lua_script,
    1,
    f'ratelimit:user:123',
    time.time(),
    3600,  # 1 hour window
    100    # 100 requests limit
)

if is_limited:
    raise RateLimitExceeded()
```

**Example 3: Conditional Update:**

```python
lua_script = """
local key = KEYS[1]
local expected = ARGV[1]
local new_value = ARGV[2]

local current = redis.call('GET', key)

if current == expected then
    redis.call('SET', key, new_value)
    return 1
else
    return 0
end
"""

# Optimistic locking pattern
success = redis.eval(
    lua_script,
    1,
    'config:version',
    '1.2.3',  # Expected version
    '1.2.4'   # New version
)

if not success:
    raise ConcurrentModificationError()
```

---

## Section 5: Anti-Patterns to Avoid (5 minutes)

### ❌ Anti-Pattern 1: Using KEYS Command

```python
# ❌ Bad: KEYS blocks server
all_users = redis.keys('user:*')  # Blocks Redis!
for key in all_users:
    redis.delete(key)

# ✅ Good: Use SCAN (non-blocking)
for key in redis.scan_iter('user:*', count=100):
    redis.delete(key)
```

### ❌ Anti-Pattern 2: Large Objects in Redis

```python
# ❌ Bad: Store 10MB object
large_data = load_file('10MB.json')
redis.set('large:object', large_data)  # Blocks server!

# ✅ Good: Store in blob storage, reference in Redis
blob_url = upload_to_blob_storage(large_data)
redis.set('object:123:url', blob_url)

# Rule: Keep Redis values < 100KB
```

### ❌ Anti-Pattern 3: Missing TTLs

```python
# ❌ Bad: No expiration (memory leak)
redis.set('cache:product:123', data)

# ✅ Good: Always set TTL
redis.setex('cache:product:123', 3600, data)

# Audit script
for key in redis.scan_iter('cache:*'):
    if redis.ttl(key) == -1:  # No TTL
        print(f'WARNING: {key} has no TTL!')
```

### ❌ Anti-Pattern 4: Using SELECT (Multiple Databases)

```python
# ❌ Bad: SELECT databases (deprecated)
redis.select(0)  # DB 0
redis.set('key', 'value')
redis.select(1)  # DB 1
redis.set('key', 'value')

# ✅ Good: Use key namespaces
redis.set('app1:key', 'value')
redis.set('app2:key', 'value')
```

### ❌ Anti-Pattern 5: Not Using Connection Pooling

```python
# ❌ Bad: New connection per request
def get_user(user_id):
    r = redis.Redis(host='...', port=6380)
    return r.get(f'user:{user_id}')
    # Connection closed!

# ✅ Good: Shared connection pool
pool = redis.ConnectionPool(...)
redis_client = redis.Redis(connection_pool=pool)

def get_user(user_id):
    return redis_client.get(f'user:{user_id}')
```

---

## Key Takeaways

### ✅ Caching Patterns:
1. **Cache-Aside**: Default choice, read-heavy workloads
2. **Write-Through**: Consistency critical, always fresh cache
3. **Write-Behind**: Write-heavy, maximum throughput
4. **Refresh-Ahead**: Hot keys, predictable access patterns

### ✅ Data Modeling:
1. Use **Hash** for objects with fields
2. Use **Sorted Set** for rankings/leaderboards
3. Use **List** for ordered collections (feeds, queues)
4. Use **Set** for unique collections (tags, followers)

### ✅ Key Naming:
1. Pattern: `namespace:object:id:field`
2. Use colons (`:`) as separators
3. Lowercase, consistent naming
4. Include version for schema changes

### ✅ Performance:
1. **Always** use connection pooling
2. Use **pipelining** for bulk operations (100x faster)
3. Use **Lua scripts** for atomic operations
4. Set **TTLs** on all cache entries

### 🎯 Skills Acquired:
- ✅ Implement 4 caching patterns
- ✅ Design efficient data models
- ✅ Apply key naming conventions
- ✅ Optimize with pipelining and Lua scripts
- ✅ Avoid common anti-patterns

---

## Next Module Preview

**Module 5: Provision & Connect Lab (60 minutes)**

Preview:
- Hands-on: Deploy Redis with Bicep/Terraform
- Configure VNET and Private Endpoint
- Set up Entra ID authentication
- Write Python connection script
- Test connectivity and troubleshoot

---

**Module Status:** ✅ Complete  
**Last Updated:** November 2025  
**Version:** 2.0

<!-- ✏️ EDIT YOUR CONTENT ABOVE THIS LINE ✏️ -->

---

<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->

## Navigation

| Previous | Home | Next |
|----------|:----:|------:|
| [⬅️ Previous: Cost Optimization & Operational Excellence](../module-05-cost-optimization-operational-excellence/README.md) | [🏠 Workshop Home](../README.md) | [Next: Provision & Connect Lab ➡️](../module-07-provision-connect-lab/README.md) |

---

*Module 6 of 11*
