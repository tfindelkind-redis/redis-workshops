---
description: Establish foundational understanding of Redis as an in-memory data store, covering core data structures, common use cases, and essential tools.
difficulty: beginner
duration: 60 minutes
title: Redis Fundamentals
type: hands-on
---

<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->

| Previous | Home | Next |
|----------|:----:|------:|
|  | [🏠 Workshop Home](../README.md) | [Next: Azure Managed Redis Architecture ➡️](../module-02-azure-managed-redis-architecture/README.md) |

[🏠 Workshop Home](../README.md) > **Module 1 of 11**

### Deploy Redis for Developers - Azure Managed Redis

**Progress:** `░░░░░░░░░░` 9%

---

<!-- ✏️ EDIT YOUR CONTENT BELOW THIS LINE ✏️ -->

# Module 1: Redis Fundamentals

**Duration:** 60 minutes  
**Format:** Theory + Demo
**Level:** Foundation

---

## Module Overview

**Objective:** Establish foundational understanding of Redis as an in-memory data store, covering core data structures, common use cases, and essential tools.

**Learning Outcomes:**

- Understand what Redis is and why it's valuable
- Work with 5 core Redis data structures
- Identify appropriate use cases for Redis
- Use redis-cli and RedisInsight for operations

**Prerequisites:**

- Basic understanding of databases
- Familiarity with key-value concepts
- Command line experience

---

## Timing Breakdown

| Section | Duration | Type |
|---------|----------|------|
| What is Redis? | 10 min | Theory |
| Core Data Structures | 25 min | Theory + Demo |
| Common Use Cases | 15 min | Theory + Examples |
| Redis Tools | 10 min | Demo |
| **Total** | **60 min** | |

---

## Section 1: What is Redis? (10 minutes)

### 1.1 Introduction (3 minutes)

**Key Points to Cover:**

- **Redis = REmote DIctionary Server**

   - Open-source, in-memory data structure store
   - Created by Salvatore Sanfilippo in 2009
   - Written in C, highly optimized

- **Core Characteristics:**

   - In-memory: All data stored in RAM for microsecond latency
   - Data structures: Not just key-value, but rich data types
   - Persistence: Optional disk writes (RDB, AOF)
   - Single-threaded: Atomic operations, simple concurrency model
   - Fast: 100k+ ops/second on commodity hardware

**Demo Command:**

```bash
# Deploy Redis container
docker run --name redis-local -d -p 6379:6379 redis:latest

# Wait for Redis to start
sleep 3

# Connect to Redis and run commands
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
PING
SET greeting "Hello from Redis Workshop!"
GET greeting
REDIS_EOF
```

---

### 1.2 Why Redis? (4 minutes)

**Key Benefits:**

1. **Speed**

   - Microsecond latency (sub-millisecond)
   - In-memory operations
   - Optimized C implementation

2. **Versatility**

   - Multiple data structures
   - Pub/Sub messaging
   - Lua scripting
   - Streams for event processing

3. **Simplicity**

   - Simple command interface
   - Easy to learn and use
   - Clear documentation

4. **Scalability**

   - Clustering support
   - Replication for HA
   - Partitioning strategies

**Use Case Categories:**

- Caching (most common: 60-70% of Redis usage)
- Session storage
- Real-time analytics
- Message queues
- Rate limiting
- Leaderboards and rankings

---

## Section 2: Core Data Structures (25 minutes)

### 2.1 Strings (5 minutes)

**Description:**

- Most basic Redis type
- Binary-safe (can store any data)
- Max size: 512 MB per value
- Used for: caching, counters, flags

**Common Commands:**

```bash
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
GET "=== SET and GET ==="
SET user:1000:name "John Doe"
GET user:1000:name

GET "=== SET with expiration (TTL in seconds) ==="
SETEX session:abc123 3600 "user_data"

GET "=== SET only if not exists ==="
SETNX lock:resource1 "locked"

GET "=== Increment (atomic counter) ==="
INCR page:views
INCRBY page:views 10

GET "=== Decrement ==="
DECR inventory:item:42

GET "=== Multiple operations ==="
MSET user:1:name "Alice" user:2:name "Bob"
MGET user:1:name user:2:name

GET "=== Append ==="
APPEND log:app "New log entry\n"

GET "=== Get string length ==="
STRLEN user:1000:name
REDIS_EOF
```

**Demo Scenario: Page View Counter**

```bash
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
GET "=== Initialize counter ==="
SET page:/home:views 0

GET "=== Each page view ==="
INCR page:/home:views

GET "=== Check current count ==="
GET page:/home:views

GET "=== Add 100 views ==="
INCRBY page:/home:views 100
REDIS_EOF
```

**Use Cases:**

- Session tokens
- API rate limit counters
- Feature flags
- Serialized objects (JSON)
- Distributed locks

---

### 2.2 Lists (5 minutes)

**Description:**

- Ordered collection of strings
- Implemented as linked lists
- Fast head/tail operations O(1)
- Can contain duplicates
- Max length: 2^32 - 1 elements

**Common Commands:**

```bash
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
GET "=== Push to head (left) ==="
LPUSH queue:jobs "job1"
LPUSH queue:jobs "job2"

GET "=== Push to tail (right) ==="
RPUSH queue:jobs "job3"

GET "=== Pop from head ==="
LPOP queue:jobs

GET "=== Pop from tail ==="
RPOP queue:jobs

GET "=== Blocking pop (wait up to 5 seconds) ==="
BLPOP queue:jobs 5

GET "=== Get range (0 = first, -1 = last) ==="
LRANGE queue:jobs 0 -1

GET "=== Get list length ==="
LLEN queue:jobs

GET "=== Get element at index ==="
LINDEX queue:jobs 0

GET "=== Insert before/after ==="
LINSERT queue:jobs BEFORE "job1" "job0"

GET "=== Trim list ==="
LTRIM queue:jobs 0 99
REDIS_EOF
```

**Demo Scenario: Activity Feed**

```bash
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
GET "=== Add new activities ==="
LPUSH user:123:feed "Posted a photo"
LPUSH user:123:feed "Liked a post"
LPUSH user:123:feed "Followed user:456"

GET "=== Get recent 10 activities ==="
LRANGE user:123:feed 0 9

GET "=== Keep only recent 100 activities ==="
LTRIM user:123:feed 0 99
REDIS_EOF
```

**Use Cases:**

- Message queues
- Activity feeds
- Recent items list
- Job queues (with BLPOP)
- Timeline data

---

### 2.3 Sets (5 minutes)

**Description:**

- Unordered collection of unique strings
- Fast membership testing O(1)
- Set operations: union, intersection, difference
- Max members: 2^32 - 1

**Common Commands:**

```bash
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
GET "=== Add members ==="
SADD tags:post:1 "redis" "database" "nosql"

GET "=== Check membership ==="
SISMEMBER tags:post:1 "redis"

GET "=== Remove member ==="
SREM tags:post:1 "nosql"

GET "=== Get all members ==="
SMEMBERS tags:post:1

GET "=== Get random member ==="
SRANDMEMBER tags:post:1

GET "=== Pop random member ==="
SPOP tags:post:1

GET "=== Get set size ==="
SCARD tags:post:1

GET "=== Set operations ==="
SADD set1 "a" "b" "c"
SADD set2 "b" "c" "d"

GET "=== Union ==="
SUNION set1 set2

GET "=== Intersection ==="
SINTER set1 set2

GET "=== Difference ==="
SDIFF set1 set2

GET "=== Move member between sets ==="
SMOVE set1 set2 "a"
REDIS_EOF
```

**Demo Scenario: Tags and Filtering**

```bash
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
GET "=== Tag blog posts ==="
SADD tags:redis "post:1" "post:2" "post:5"
SADD tags:python "post:2" "post:3" "post:4"
SADD tags:azure "post:1" "post:3" "post:5"

GET "=== Find posts tagged with both redis AND python ==="
SINTER tags:redis tags:python

GET "=== Find posts tagged with redis OR azure ==="
SUNION tags:redis tags:azure

GET "=== Find posts tagged with azure but NOT redis ==="
SDIFF tags:azure tags:redis
REDIS_EOF
```

**Use Cases:**

- Tagging systems
- Unique visitor tracking
- Social graph (followers/following)
- IP whitelisting/blacklisting
- Real-time analytics (unique events)

---

### 2.4 Hashes (5 minutes)

**Description:**

- Maps between string fields and values
- Perfect for representing objects
- Efficient memory usage for small hashes
- Max fields: 2^32 - 1

**Common Commands:**

```bash
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
GET "=== Set single field ==="
HSET user:1000 name "John Doe"
HSET user:1000 email "john@example.com"
HSET user:1000 age 30

GET "=== Set multiple fields at once ==="
HMSET user:1001 name "Jane Smith" email "jane@example.com" age 28

GET "=== Get single field ==="
HGET user:1000 name

GET "=== Get multiple fields ==="
HMGET user:1000 name email

GET "=== Get all fields and values ==="
HGETALL user:1000

GET "=== Check if field exists ==="
HEXISTS user:1000 email

GET "=== Delete field ==="
HDEL user:1000 age

GET "=== Get all field names ==="
HKEYS user:1000

GET "=== Get all values ==="
HVALS user:1000

GET "=== Get number of fields ==="
HLEN user:1000

GET "=== Increment field value ==="
HINCRBY user:1000 login_count 1
REDIS_EOF
```

**Demo Scenario: User Profile**

```bash
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
GET "=== Create user profile ==="
HMSET user:5000 username "alice" email "alice@example.com" created_at "2025-01-15" last_login "2025-11-19" login_count 42

GET "=== Get full profile ==="
HGETALL user:5000

GET "=== Update last login ==="
HSET user:5000 last_login "2025-11-19T09:30:00Z"
HINCRBY user:5000 login_count 1

GET "=== Get specific fields ==="
HMGET user:5000 username email login_count
REDIS_EOF
```

**Use Cases:**

- User profiles
- Product catalogs
- Session data
- Configuration settings
- Rate limiting with multiple dimensions

---

### 2.5 Sorted Sets (5 minutes)

**Description:**

- Set of unique members, each with a score
- Ordered by score (low to high by default)
- Fast range queries by score or rank
- Max members: 2^32 - 1

**Common Commands:**

```bash
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
GET "=== Add members with scores ==="
ZADD leaderboard 100 "player1"
ZADD leaderboard 250 "player2"
ZADD leaderboard 180 "player3"

GET "=== Add multiple members ==="
ZADD leaderboard 90 "player4" 300 "player5"

GET "=== Get rank (0-based, lowest score = rank 0) ==="
ZRANK leaderboard "player1"

GET "=== Get reverse rank (highest score = rank 0) ==="
ZREVRANK leaderboard "player5"

GET "=== Get score ==="
ZSCORE leaderboard "player2"

GET "=== Increment score ==="
ZINCRBY leaderboard 50 "player1"

GET "=== Get range by rank (ascending) ==="
ZRANGE leaderboard 0 2

GET "=== Get range by rank (descending) ==="
ZREVRANGE leaderboard 0 2

GET "=== Get range with scores ==="
ZRANGE leaderboard 0 -1 WITHSCORES

GET "=== Get range by score ==="
ZRANGEBYSCORE leaderboard 100 200

GET "=== Count members in score range ==="
ZCOUNT leaderboard 100 200

GET "=== Get sorted set size ==="
ZCARD leaderboard

GET "=== Remove member ==="
ZREM leaderboard "player4"

GET "=== Remove by rank range ==="
ZREMRANGEBYRANK leaderboard 0 0

GET "=== Remove by score range ==="
ZREMRANGEBYSCORE leaderboard 0 100
REDIS_EOF
```

**Demo Scenario: Real-Time Leaderboard**

```bash
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
GET "=== Initialize leaderboard ==="
ZADD game:scores 1500 "alice"
ZADD game:scores 2200 "bob"
ZADD game:scores 1800 "charlie"
ZADD game:scores 2500 "diana"

GET "=== Player scores points ==="
ZINCRBY game:scores 300 "alice"

GET "=== Get top 3 players ==="
ZREVRANGE game:scores 0 2 WITHSCORES

GET "=== Get player rank (1-based for display) ==="
ZREVRANK game:scores "alice"

GET "=== Get players in score range ==="
ZRANGEBYSCORE game:scores 1500 2000 WITHSCORES
REDIS_EOF
```

**Use Cases:**

- Leaderboards and rankings
- Priority queues
- Trending items (score = timestamp or popularity)
- Rate limiting with sliding window
- Time series data (score = timestamp)

---

## Section 3: Common Use Cases (15 minutes)

### 3.1 Caching (4 minutes)

**Overview:**

- Most common Redis use case (60-70% of deployments)
- Reduce database load
- Improve response times

**Pattern: Cache-Aside (Lazy Loading)**

```python
def get_user(user_id):
    # Try cache first
    cache_key = f"user:{user_id}"
    cached = redis.get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    # Cache miss - fetch from database
    user = database.query("SELECT * FROM users WHERE id = ?", user_id)
    
    # Store in cache with TTL
    redis.setex(cache_key, 3600, json.dumps(user))
    
    return user
```

**TTL Strategy:**

- Short-lived data: 5-15 minutes
- User sessions: 30-60 minutes
- Product catalog: 1-24 hours
- Static content: Days to weeks

**Eviction Policies:**

- `allkeys-lru`: Remove least recently used keys
- `volatile-lru`: Remove LRU among keys with TTL
- `allkeys-lfu`: Remove least frequently used
- `volatile-ttl`: Remove keys closest to expiration

---

### 3.2 Session Storage (3 minutes)

**Overview:**

- Store user session data
- Share sessions across application servers
- Fast read/write for every request

**Implementation:**

```python
# Store session
session_data = {
    "user_id": 1000,
    "username": "alice",
    "role": "admin",
    "login_time": "2025-11-19T09:00:00Z"
}

redis.setex(
    f"session:{session_token}",
    3600,  # 1 hour TTL
    json.dumps(session_data)
)

# Retrieve session
session = redis.get(f"session:{session_token}")
if session:
    user_data = json.loads(session)
```

**Best Practices:**

- Use hash structure for complex sessions
- Set appropriate TTL (30-60 minutes)
- Refresh TTL on activity
- Clear session on logout

---

### 3.3 Real-Time Analytics (3 minutes)

**Overview:**

- Count events in real-time
- Track metrics and KPIs
- Low latency requirements

**Examples:**

**1. Page Views Counter:**

```bash
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
GET "=== Increment view count ==="
INCR page:/products:views

GET "=== Get current count ==="
GET page:/products:views
REDIS_EOF
```

**2. Unique Visitors (HyperLogLog):**

```bash
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
GET "=== Add visitor (deduplication automatic) ==="
PFADD unique:visitors:2025-11-19 "user123"
PFADD unique:visitors:2025-11-19 "user456"
PFADD unique:visitors:2025-11-19 "user123"

GET "=== Get unique count ==="
PFCOUNT unique:visitors:2025-11-19
REDIS_EOF
```

**3. Trending Items:**

```bash
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
GET "=== Increment item popularity ==="
ZINCRBY trending:products 1 "product:42"

GET "=== Get top 10 trending ==="
ZREVRANGE trending:products 0 9 WITHSCORES
REDIS_EOF
```

---

### 3.4 Rate Limiting (3 minutes)

**Overview:**

- Prevent abuse (API throttling, DDoS protection)
- Enforce quotas (requests per minute/hour)
- Multiple algorithms available

**Fixed Window Algorithm:**

```python
def rate_limit_fixed_window(user_id, limit=100, window=60):
    key = f"rate_limit:{user_id}:{int(time.time() // window)}"
    current = redis.incr(key)
    
    if current == 1:
        redis.expire(key, window)
    
    return current <= limit

# Check before processing request
if not rate_limit_fixed_window(user_id):
    return "Rate limit exceeded", 429
```

**Sliding Window with Sorted Set:**

```python
def rate_limit_sliding_window(user_id, limit=100, window=60):
    now = time.time()
    key = f"rate_limit:{user_id}"
    
    # Remove old entries
    redis.zremrangebyscore(key, 0, now - window)
    
    # Count current requests
    current = redis.zcard(key)
    
    if current < limit:
        # Add new request
        redis.zadd(key, {str(now): now})
        redis.expire(key, window)
        return True
    
    return False
```

**Token Bucket (Advanced):**

- More complex but fairer
- Allows bursts
- Use Redis Lua script for atomicity

---

### 3.5 Message Queues (2 minutes)

**Overview:**

- Decouple services
- Background job processing
- Event-driven architecture

**Simple Queue with Lists:**

```python
# Producer
redis.rpush("queue:jobs", json.dumps(job_data))

# Consumer
while True:
    job = redis.blpop("queue:jobs", timeout=5)
    if job:
        process_job(json.loads(job[1]))
```

**Better Alternative: Redis Streams** (covered in Module 9)

- Supports consumer groups
- Automatic retry
- Message acknowledgment

---

## Section 4: Redis Tools (10 minutes)

### 4.1 redis-cli (5 minutes)

**Overview:**

- Command-line interface
- Included with Redis installation
- Essential for debugging and administration

**Basic Usage:**

```bash
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
GET "=== Connect to local Redis ==="
redis-cli

GET "=== Connect to remote Redis ==="
redis-cli -h redis.example.com -p 6379

GET "=== Authenticate ==="
redis-cli -a yourpassword

GET "=== Execute single command ==="
redis-cli GET user:1000

GET "=== Execute multiple commands ==="
redis-cli <<EOF
SET key1 "value1"
SET key2 "value2"
GET key1
EOF
REDIS_EOF
```

**Useful Commands:**

```bash
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
GET "=== Get server info ==="
INFO

GET "=== Get specific section ==="
INFO memory
INFO stats
INFO replication

GET "=== Monitor all commands in real-time ==="
MONITOR

GET "=== Get slow queries ==="
SLOWLOG GET 10

GET "=== Check memory usage of key ==="
MEMORY USAGE user:1000

GET "=== Scan keys (better than KEYS for production) ==="
SCAN 0 MATCH user:* COUNT 100

GET "=== Get database size ==="
DBSIZE

GET "=== Flush database (DANGEROUS) ==="
FLUSHDB
FLUSHALL

GET "=== Client list ==="
CLIENT LIST

GET "=== Configuration ==="
CONFIG GET maxmemory
CONFIG SET maxmemory 2gb
REDIS_EOF
```

**Performance Testing:**

```bash
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
GET "=== Benchmark Redis ==="
redis-benchmark -q -n 100000

GET "=== Benchmark specific commands ==="
redis-benchmark -t set,get -q -n 100000

GET "=== Test latency ==="
redis-cli --latency
redis-cli --latency-history
REDIS_EOF
```

---

### 4.2 RedisInsight (5 minutes)

**Overview:**

- Official Redis GUI
- Free, cross-platform
- Features: Browser, Profiler, CLI, Slowlog

**Key Features:**

1. **Browser:**

   - Visual key explorer
   - Filter and search keys
   - View/edit values
   - TTL management

2. **Workbench:**

   - Command execution
   - Multi-command support
   - Command history
   - Syntax highlighting

3. **Profiler:**

   - Real-time command monitoring
   - Performance analysis
   - Identify slow operations

4. **Memory Analysis:**

   - Memory usage by key pattern
   - Identify memory hogs
   - Optimize memory usage

5. **Slowlog:**

   - View slow queries
   - Identify performance issues
   - Tune commands

**Demo:**

- Show connecting to Redis
- Browse keys with different data types
- Execute commands in workbench
- Use profiler to monitor operations

**Download:** https://redis.com/redis-enterprise/redis-insight/

---

## Common Anti-Patterns to Avoid

### ❌ Don't Do These:

1. **Using KEYS command in production**

```bash
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
GET "=== BAD: Blocks server, O(N) complexity ==="
KEYS user:*

GET "=== GOOD: Use SCAN instead ==="
SCAN 0 MATCH user:* COUNT 100
REDIS_EOF
```

2. **Storing large objects as strings**

```bash
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
GET "=== BAD: 10MB JSON as single string ==="
SET user:1000 "{ huge JSON with 10MB data }"

GET "=== GOOD: Use hashes or break into smaller parts ==="
HMSET user:1000 name "Alice" email "alice@example.com"
REDIS_EOF
```

3. **Not setting TTLs on cache data**

```bash
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
GET "=== BAD: Memory leak, data never expires ==="
SET cache:product:42 "data"

GET "=== GOOD: Always set TTL ==="
SETEX cache:product:42 3600 "data"
REDIS_EOF
```

4. **Using SELECT to switch databases**

```bash
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
GET "=== BAD: Multiple databases are deprecated ==="
SELECT 1

GET "=== GOOD: Use key prefixes or multiple Redis instances ==="
SET app1:user:1000 "data"
SET app2:user:1000 "data"
REDIS_EOF
```

5. **Not using connection pooling**

```python
# BAD: New connection per request
def get_data():
    r = redis.Redis()
    return r.get("key")

# GOOD: Reuse connection pool
pool = redis.ConnectionPool()
r = redis.Redis(connection_pool=pool)
```

---

## Hands-On Exercises

### Exercise 1: Data Structure Practice (5 minutes)

**Scenario:** Build a simple blog post system

```bash
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
GET "=== 1. Create a blog post (hash) ==="
HMSET post:1 title "Getting Started with Redis" author "alice" created "2025-11-19" views 0

GET "=== 2. Add tags (set) ==="
SADD post:1:tags "redis" "database" "tutorial"

GET "=== 3. Track views (counter) ==="
INCR post:1:views

GET "=== 4. Add to author's posts (list) ==="
LPUSH author:alice:posts "post:1"

GET "=== 5. Add to trending (sorted set with score = views) ==="
ZADD trending:posts 1 "post:1"

GET "=== Later, increment trend score ==="
ZINCRBY trending:posts 10 "post:1"
REDIS_EOF
```

### Exercise 2: Caching Pattern (5 minutes)

**Scenario:** Implement cache-aside pattern

```bash
redis-cli -h localhost -p 6379 <<'REDIS_EOF'
GET "=== 1. Try to get from cache ==="
GET cache:user:1000

GET "=== 2. Cache miss - would fetch from DB here ==="
GET "... database query ..."

GET "=== 3. Store in cache with 1-hour TTL ==="
SETEX cache:user:1000 3600 '{"id":1000,"name":"Alice"}'

GET "=== 4. Verify TTL ==="
TTL cache:user:1000

GET "=== 5. Get cached value ==="
GET cache:user:1000

GET "=== 6. Invalidate cache (on update) ==="
DEL cache:user:1000
REDIS_EOF
```

---

## Key Takeaways

### ✅ Must Remember:

1. **Redis is fast** because it's in-memory and single-threaded
2. **Choose the right data structure** for your use case:

   - Strings: Simple values, counters
   - Lists: Queues, feeds
   - Sets: Unique items, tags
   - Hashes: Objects, profiles
   - Sorted Sets: Rankings, leaderboards

3. **Always set TTLs** on cached data to prevent memory bloat
4. **Use SCAN instead of KEYS** in production
5. **Connection pooling** is essential for performance
6. **Redis is not a primary database** - use it alongside your main datastore

### 🎯 Skills Acquired:

- ✅ Understand Redis core concepts
- ✅ Work with 5 basic data structures
- ✅ Identify appropriate use cases
- ✅ Use redis-cli and RedisInsight
- ✅ Avoid common anti-patterns

---

## Next Module Preview

**Module 2: Azure Managed Redis Architecture (60 minutes)**

In the next module, we'll explore:

- Azure Managed Redis overview and benefits
- SKU selection (Memory, Balanced, Compute, Flash)
- Clustering and sharding strategies
- High availability and geo-replication
- Authentication and network security

**Transition Question:** "Now that we understand Redis fundamentals, how do we deploy and manage Redis in production at enterprise scale? That's what we'll cover next with Azure Managed Redis."

---

## Additional Resources

**Official Documentation:**

- Redis Commands: https://redis.io/commands/
- Redis Data Types: https://redis.io/docs/data-types/
- Redis Best Practices: https://redis.io/docs/management/optimization/

**Interactive Learning:**

- Try Redis: https://try.redis.io/
- Redis University: https://university.redis.com/

**Community:**

- Redis Discord: https://discord.gg/redis
- Redis Forums: https://forum.redis.com/

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
|  | [🏠 Workshop Home](../README.md) | [Next: Azure Managed Redis Architecture ➡️](../module-02-azure-managed-redis-architecture/README.md) |

---

*Module 1 of 11*
