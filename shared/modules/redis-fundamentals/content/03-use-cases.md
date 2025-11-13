# Common Redis Use Cases

Redis excels in specific scenarios. Here are the most common patterns and when to use them.

---

## 1. Caching 🚀

**Problem:** Database queries are slow and expensive.

**Solution:** Cache frequently accessed data in Redis.

### Cache-Aside Pattern
```python
def get_user(user_id):
    # Try cache first
    cache_key = f"user:{user_id}"
    user = redis.get(cache_key)
    
    if user:
        return json.loads(user)  # Cache hit!
    
    # Cache miss - fetch from database
    user = db.query("SELECT * FROM users WHERE id = ?", user_id)
    
    # Store in cache for 1 hour
    redis.setex(cache_key, 3600, json.dumps(user))
    
    return user
```

### When to Use
- Frequently read, infrequently updated data
- Database queries that are expensive
- API responses that rarely change

### Considerations
- Set appropriate TTL (time-to-live)
- Handle cache invalidation on updates
- Monitor cache hit rate (target: >80%)

---

## 2. Session Management 👤

**Problem:** Store user session data across stateless servers.

**Solution:** Centralized session storage in Redis.

### Example
```python
# Store session
session_id = str(uuid.uuid4())
session_data = {
    "user_id": 1001,
    "email": "alice@example.com",
    "cart": ["item1", "item2"]
}
redis.setex(f"session:{session_id}", 1800, json.dumps(session_data))

# Retrieve session
session = redis.get(f"session:{session_id}")

# Extend session on activity
redis.expire(f"session:{session_id}", 1800)
```

### Benefits
- Fast access from any server
- Automatic expiration (no cleanup needed)
- Scales horizontally

---

## 3. Real-Time Leaderboards 🏆

**Problem:** Display rankings that update in real-time.

**Solution:** Sorted Sets with automatic ordering.

### Example: Game Leaderboard
```redis
# Add player scores
ZADD game:leaderboard 1500 "Alice" 2100 "Bob" 1800 "Charlie"

# Get top 10 players
ZREVRANGE game:leaderboard 0 9 WITHSCORES

# Update score
ZINCRBY game:leaderboard 50 "Alice"

# Get player's rank
ZREVRANK game:leaderboard "Alice"

# Get players in score range
ZRANGEBYSCORE game:leaderboard 1500 2000
```

### Use Cases
- Gaming leaderboards
- Social media trending topics
- E-commerce best sellers
- Real-time analytics dashboards

---

## 4. Rate Limiting ⏱️

**Problem:** Prevent API abuse and ensure fair usage.

**Solution:** Track requests using counters with TTL.

### Example: 100 requests per hour
```python
def check_rate_limit(user_id):
    key = f"rate_limit:{user_id}:{hour}"
    
    # Increment counter
    requests = redis.incr(key)
    
    # Set expiration on first request
    if requests == 1:
        redis.expire(key, 3600)  # 1 hour
    
    # Check limit
    if requests > 100:
        return False  # Rate limit exceeded
    
    return True  # Allow request
```

### Advanced: Sliding Window
```redis
# Use Sorted Set with timestamps
ZADD rate_limit:user:1001 1699876543 "req1"
ZADD rate_limit:user:1001 1699876544 "req2"

# Remove old entries (older than 1 hour)
ZREMRANGEBYSCORE rate_limit:user:1001 0 (now - 3600)

# Count requests in window
ZCARD rate_limit:user:1001
```

---

## 5. Message Queues 📬

**Problem:** Decouple services and process tasks asynchronously.

**Solution:** Lists with LPUSH/RPOP or Redis Streams.

### Simple Queue with Lists
```redis
# Producer: Add job to queue
LPUSH jobs:queue '{"type": "send_email", "to": "user@example.com"}'

# Consumer: Get and process job
BRPOP jobs:queue 0  # Blocking pop (waits for data)
```

### Advanced: Redis Streams
```redis
# Add message to stream
XADD notifications * user_id 1001 message "Welcome!"

# Read from stream
XREAD STREAMS notifications 0

# Consumer groups for load balancing
XGROUP CREATE notifications processors $
XREADGROUP GROUP processors consumer1 STREAMS notifications >
```

---

## 6. Pub/Sub Messaging 📡

**Problem:** Real-time notifications to multiple subscribers.

**Solution:** Redis Pub/Sub channels.

### Example: Chat Application
```python
# Publisher
redis.publish("chat:room:general", "Hello everyone!")

# Subscriber
pubsub = redis.pubsub()
pubsub.subscribe("chat:room:general")

for message in pubsub.listen():
    print(message['data'])
```

### Use Cases
- Chat applications
- Live notifications
- Real-time dashboards
- Event broadcasting

---

## 7. Distributed Locks 🔒

**Problem:** Coordinate actions across multiple servers.

**Solution:** SET with NX (not exists) and EX (expiration).

### Example
```python
def acquire_lock(lock_name, timeout=10):
    lock_key = f"lock:{lock_name}"
    lock_value = str(uuid.uuid4())
    
    # Try to acquire lock
    acquired = redis.set(
        lock_key,
        lock_value,
        ex=timeout,  # Auto-release after timeout
        nx=True      # Only set if not exists
    )
    
    return (acquired, lock_value)

def release_lock(lock_name, lock_value):
    # Use Lua script to ensure atomicity
    script = """
    if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
    else
        return 0
    end
    """
    redis.eval(script, 1, f"lock:{lock_name}", lock_value)
```

---

## 8. Counting and Analytics 📊

**Problem:** Track metrics and events in real-time.

**Solution:** Atomic counters and HyperLogLog.

### Example: Page Views
```redis
# Increment counter
INCR page:home:views

# Unique visitors with HyperLogLog
PFADD unique:visitors:2025-11 "user:1001"
PFADD unique:visitors:2025-11 "user:1002"
PFCOUNT unique:visitors:2025-11  # Approximate count
```

### Use Cases
- Page view counters
- API usage tracking
- Unique visitor counts
- Real-time metrics

---

## 9. Time-Series Data ⏰

**Problem:** Store and query time-ordered data.

**Solution:** Sorted Sets with timestamps as scores.

### Example: Temperature Readings
```redis
# Add reading (score = timestamp)
ZADD sensor:temp:device1 1699876543 "22.5"
ZADD sensor:temp:device1 1699876603 "22.7"

# Get readings in time range
ZRANGEBYSCORE sensor:temp:device1 1699876543 1699880143

# Get latest reading
ZREVRANGE sensor:temp:device1 0 0 WITHSCORES
```

---

## 10. Full-Text Search 🔍

**Problem:** Search through text content quickly.

**Solution:** Use RediSearch module.

### Example (with RediSearch)
```redis
# Create index
FT.CREATE products 
    ON HASH 
    PREFIX 1 product: 
    SCHEMA name TEXT WEIGHT 5.0 description TEXT price NUMERIC

# Add documents
HSET product:1 name "Redis Guide" description "Complete guide..." price 29.99

# Search
FT.SEARCH products "guide" LIMIT 0 10
```

---

## Use Case Summary

| Use Case | Data Structure | Complexity | Scalability |
|----------|----------------|------------|-------------|
| **Caching** | String, Hash | Simple | ⭐⭐⭐⭐⭐ |
| **Session Management** | String, Hash | Simple | ⭐⭐⭐⭐⭐ |
| **Leaderboards** | Sorted Set | Medium | ⭐⭐⭐⭐ |
| **Rate Limiting** | String, Sorted Set | Medium | ⭐⭐⭐⭐⭐ |
| **Message Queues** | List, Streams | Medium | ⭐⭐⭐⭐ |
| **Pub/Sub** | Pub/Sub | Simple | ⭐⭐⭐⭐ |
| **Distributed Locks** | String | Complex | ⭐⭐⭐ |
| **Analytics** | String, HyperLogLog | Simple | ⭐⭐⭐⭐⭐ |
| **Time-Series** | Sorted Set | Medium | ⭐⭐⭐ |
| **Search** | RediSearch | Complex | ⭐⭐⭐⭐ |

---

## Anti-Patterns ⚠️

**Don't use Redis for:**
- Large binary files (use object storage)
- Primary database without persistence
- Complex relational queries
- ACID transactions across multiple keys
- Long-term archival storage

---

**Next:** See Redis in action with a live demo →
