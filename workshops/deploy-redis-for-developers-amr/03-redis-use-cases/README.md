# Module 3: Redis Use Cases

## Overview
**Duration:** 60 minutes  
**Difficulty:** Intermediate  
**Type:** Hands-on Lab

## Learning Objectives
By the end of this module, you will:
- Implement caching strategies with Redis
- Build session management systems
- Create real-time features with Pub/Sub
- Develop leaderboards and ranking systems
- Implement rate limiting and counters

## Prerequisites
- Completed Modules 1 & 2
- Understanding of Redis data structures
- Access to Redis instance

---

## Use Case 1: Caching

Caching is the most common Redis use case - store frequently accessed data in memory to reduce database load and improve response times.

### Cache-Aside Pattern

The application manages the cache:

```bash
# Pseudo-code flow:
# 1. Try to get from cache
GET user:1000:profile

# 2. If cache miss, get from database
# 3. Store in cache with expiration
SETEX user:1000:profile 3600 '{"id":1000,"name":"Alice","email":"alice@example.com"}'

# 4. Return data
```

### Real Implementation Example

```bash
# Cache database query results (1 hour expiration)
SET cache:products:all '[{"id":1,"name":"Widget"},{"id":2,"name":"Gadget"}]' EX 3600

# Cache expensive computation
SET cache:report:daily:2024-11-14 '{"revenue":15000,"orders":230}' EX 86400

# Cache with key pattern
SET cache:user:1000:friends '[1001,1002,1003]' EX 1800
```

### Cache Invalidation Strategies

**1. Time-based (TTL)**
```bash
# Expire after 1 hour
SETEX cache:product:101 3600 '{"name":"Widget","price":29.99}'

# Check TTL
TTL cache:product:101
> (integer) 3595
```

**2. Event-based (manual invalidation)**
```bash
# When product is updated, delete cache
DEL cache:product:101
DEL cache:products:all

# Or use pattern deletion (requires SCAN)
SCAN 0 MATCH cache:product:* COUNT 100
```

**3. Write-through**
```bash
# Update database AND cache simultaneously
SET cache:product:101 '{"name":"Widget","price":34.99}' EX 3600
```

### Practical Exercise: Product Catalog Cache

```bash
# Cache all products
SET cache:products:list '[{"id":101,"name":"Laptop","price":999},{"id":102,"name":"Mouse","price":29}]' EX 3600

# Cache individual product
SETEX cache:product:101 3600 '{"id":101,"name":"Laptop","price":999,"stock":15}'

# Cache search results
SETEX cache:search:laptop 1800 '[101,105,110]' 

# Invalidate on update
DEL cache:product:101
DEL cache:products:list
DEL cache:search:laptop
```

---

## Use Case 2: Session Management

Store user session data with automatic expiration.

### Basic Session Storage

```bash
# Create session (30 minutes)
SETEX session:abc123def456 1800 '{"userId":1000,"username":"alice","loginTime":"2024-11-14T10:00:00Z"}'

# Validate session
GET session:abc123def456
> '{"userId":1000,"username":"alice","loginTime":"2024-11-14T10:00:00Z"}'

# Extend session (refresh on activity)
EXPIRE session:abc123def456 1800

# Delete session (logout)
DEL session:abc123def456
```

### Session with Hash (more flexible)

```bash
# Create session
HSET session:abc123 userId 1000
HSET session:abc123 username "alice"
HSET session:abc123 loginTime "2024-11-14T10:00:00Z"
HSET session:abc123 ipAddress "192.168.1.100"
EXPIRE session:abc123 1800

# Update session field
HSET session:abc123 lastActivity "2024-11-14T10:25:00Z"
EXPIRE session:abc123 1800

# Get session data
HGETALL session:abc123

# Check if session exists
EXISTS session:abc123
```

### Track Active Sessions

```bash
# Add to active sessions set
SADD sessions:active session:abc123
EXPIRE sessions:active 1800

# Count active sessions
SCARD sessions:active

# Track user's sessions (multi-device)
SADD user:1000:sessions session:abc123 session:def456
```

### Practical Exercise: User Session System

```bash
# User logs in
SET session:user1_token1 '{"userId":1000,"role":"admin"}' EX 1800
SADD sessions:active session:user1_token1
SADD user:1000:sessions session:user1_token1

# User activity - refresh session
EXPIRE session:user1_token1 1800

# Get user info from session
GET session:user1_token1

# Logout - remove session
DEL session:user1_token1
SREM sessions:active session:user1_token1
SREM user:1000:sessions session:user1_token1

# Logout all devices
SMEMBERS user:1000:sessions
# Then DEL each session
```

---

## Use Case 3: Pub/Sub Messaging

Real-time messaging system for notifications, chat, live updates.

### Basic Pub/Sub

**Terminal 1 - Subscribe:**
```bash
# Subscribe to channel
SUBSCRIBE notifications
Reading messages... (press Ctrl-C to quit)

# Subscribe to multiple channels
SUBSCRIBE notifications alerts updates

# Pattern subscription
PSUBSCRIBE news:*
```

**Terminal 2 - Publish:**
```bash
# Publish message
PUBLISH notifications "New comment on your post"
> (integer) 1

# Returns number of subscribers who received the message
PUBLISH alerts "Server load high"
> (integer) 0
```

### Practical Example: Chat Application

```bash
# Terminal 1 - User Alice
SUBSCRIBE chat:room:general
Reading messages...

# Terminal 2 - User Bob
SUBSCRIBE chat:room:general
Reading messages...

# Terminal 3 - Send messages
PUBLISH chat:room:general "Alice: Hello everyone!"
> (integer) 2

PUBLISH chat:room:general "Bob: Hi Alice!"
> (integer) 2
```

### Pattern Subscriptions

```bash
# Subscribe to all user notifications
PSUBSCRIBE notifications:user:*

# Publish to specific user
PUBLISH notifications:user:1000 "You have a new message"
PUBLISH notifications:user:1001 "Your order shipped"
```

### Practical Exercise: Real-time Notifications

```bash
# Terminal 1 - User subscribes to their notifications
SUBSCRIBE notifications:user:1000

# Terminal 2 - System sends notifications
PUBLISH notifications:user:1000 '{"type":"like","message":"Alice liked your post"}'
PUBLISH notifications:user:1000 '{"type":"comment","message":"Bob commented on your photo"}'

# Broadcast to all users
PUBLISH notifications:global '{"type":"maintenance","message":"System maintenance in 10 minutes"}'
```

---

## Use Case 4: Leaderboards & Rankings

Perfect for gaming, social apps, trending content.

### Gaming Leaderboard

```bash
# Add player scores
ZADD game:leaderboard 1500 "player:alice"
ZADD game:leaderboard 2300 "player:bob"
ZADD game:leaderboard 1850 "player:carol"
ZADD game:leaderboard 3100 "player:dave"

# Get top 10 players
ZREVRANGE game:leaderboard 0 9 WITHSCORES
> 1) "player:dave"
> 2) "3100"
> 3) "player:bob"
> 4) "2300"
> 5) "player:carol"
> 6) "1850"
> 7) "player:alice"
> 8) "1500"

# Get player's rank (1-indexed)
ZREVRANK game:leaderboard "player:alice"
> (integer) 3
# Alice is 4th place (0-indexed = 3)

# Get player's score
ZSCORE game:leaderboard "player:alice"
> "1500"

# Update score
ZINCRBY game:leaderboard 500 "player:alice"
> "2000"

# Get players around specific score
ZRANGEBYSCORE game:leaderboard 1800 2500 WITHSCORES
```

### Time-based Leaderboards

```bash
# Daily leaderboard
ZADD leaderboard:daily:2024-11-14 100 "player:alice"
ZADD leaderboard:daily:2024-11-14 250 "player:bob"
EXPIRE leaderboard:daily:2024-11-14 86400

# Weekly leaderboard
ZADD leaderboard:weekly:2024-W46 1500 "player:alice"
EXPIRE leaderboard:weekly:2024-W46 604800

# All-time leaderboard
ZADD leaderboard:alltime 15000 "player:alice"
```

### Trending Content

```bash
# Track article views with time decay
# Score = views * time_factor
ZADD trending:articles 150 "article:101"
ZADD trending:articles 280 "article:102"
ZADD trending:articles 95 "article:103"

# Get top trending
ZREVRANGE trending:articles 0 9 WITHSCORES

# Update views
ZINCRBY trending:articles 1 "article:101"
```

### Practical Exercise: Social Media Leaderboard

```bash
# Track user influence (followers + likes + comments)
ZADD influencers 15000 "user:alice"
ZADD influencers 23000 "user:bob"
ZADD influencers 8500 "user:carol"

# Get top 5 influencers
ZREVRANGE influencers 0 4 WITHSCORES

# User gains 100 new followers
ZINCRBY influencers 100 "user:alice"

# Get users with 10k-20k influence
ZRANGEBYSCORE influencers 10000 20000 WITHSCORES

# Get user's rank
ZREVRANK influencers "user:carol"
```

---

## Use Case 5: Rate Limiting

Control API usage, prevent abuse, implement throttling.

### Simple Counter-based Rate Limiting

```bash
# Allow 100 requests per hour per user
SET ratelimit:user:1000:hour:2024-11-14-10 0 EX 3600
INCR ratelimit:user:1000:hour:2024-11-14-10
> (integer) 1

# Check if limit exceeded
GET ratelimit:user:1000:hour:2024-11-14-10
> "1"

# If value >= 100, reject request
```

### Sliding Window Rate Limiting

```bash
# Add request timestamp
ZADD ratelimit:user:1000 1699963200 "req1"
ZADD ratelimit:user:1000 1699963205 "req2"

# Remove requests older than 1 hour (3600 seconds)
ZREMRANGEBYSCORE ratelimit:user:1000 0 (1699963200-3600)

# Count requests in last hour
ZCOUNT ratelimit:user:1000 (NOW-3600) +inf
> (integer) 2

# If count < 100, allow request
```

### Token Bucket Rate Limiting

```bash
# User has 100 tokens, refills at 10 tokens/minute
HSET tokens:user:1000 count 100
HSET tokens:user:1000 lastRefill "2024-11-14T10:00:00Z"

# Check tokens
HGET tokens:user:1000 count
> "100"

# Consume token
HINCRBY tokens:user:1000 count -1
> (integer) 99

# Refill tokens (every minute)
HINCRBY tokens:user:1000 count 10
HSET tokens:user:1000 lastRefill "2024-11-14T10:01:00Z"
```

### Practical Exercise: API Rate Limiting

```bash
# 1. Simple hourly limit (100 requests/hour)
INCR ratelimit:api:user:1000:2024-11-14-10
EXPIRE ratelimit:api:user:1000:2024-11-14-10 3600

# 2. Check limit
GET ratelimit:api:user:1000:2024-11-14-10
# If >= 100, return 429 Too Many Requests

# 3. Per-endpoint limits
INCR ratelimit:api:user:1000:endpoint:/search:2024-11-14-10
EXPIRE ratelimit:api:user:1000:endpoint:/search:2024-11-14-10 3600

# 4. IP-based rate limiting
INCR ratelimit:ip:192.168.1.100:2024-11-14-10
EXPIRE ratelimit:ip:192.168.1.100:2024-11-14-10 3600
```

---

## Use Case 6: Counters & Analytics

Track metrics, statistics, real-time analytics.

### Page Views & Visitors

```bash
# Increment page views
INCR stats:page:home:views
> (integer) 1542

# Track unique visitors (using Sets)
SADD stats:page:home:visitors:2024-11-14 "user:1000"
SADD stats:page:home:visitors:2024-11-14 "user:1001"

# Get unique visitor count
SCARD stats:page:home:visitors:2024-11-14
> (integer) 2

# Daily active users
SADD stats:dau:2024-11-14 "user:1000" "user:1001" "user:1002"
SCARD stats:dau:2024-11-14
> (integer) 3
```

### Real-time Statistics

```bash
# Track orders per hour
INCR stats:orders:2024-11-14:10
INCR stats:orders:2024-11-14:11
GET stats:orders:2024-11-14:11
> "45"

# Track revenue
INCRBYFLOAT stats:revenue:2024-11-14 99.99
> "4523.50"

# Track errors
INCR stats:errors:500:2024-11-14
```

### Practical Exercise: Real-time Dashboard

```bash
# 1. Track active users
SADD stats:active:now "user:1000" "user:1001"
EXPIRE stats:active:now 60

# 2. Track requests per second
INCR stats:rps:$(date +%s)
EXPIRE stats:rps:$(date +%s) 60

# 3. Track top pages (Sorted Set)
ZINCRBY stats:popular:pages 1 "/home"
ZINCRBY stats:popular:pages 1 "/products"
ZREVRANGE stats:popular:pages 0 9 WITHSCORES

# 4. Track error rate
INCR stats:requests:total
INCR stats:requests:errors
# Error rate = errors / total
```

---

## Complete Project: E-commerce Application

Combine multiple use cases:

```bash
# 1. Cache product catalog
SETEX cache:products 3600 '[{"id":101,"name":"Laptop"},{"id":102,"name":"Mouse"}]'

# 2. Session management
SETEX session:xyz 1800 '{"userId":1000,"cart":["101","102"]}'

# 3. Shopping cart (Hash)
HMSET cart:user:1000 product:101 1 product:102 2
EXPIRE cart:user:1000 3600

# 4. Inventory counter
HINCRBY inventory product:101 -1
# Check if stock available: >= 0

# 5. Popular products (Sorted Set by purchase count)
ZINCRBY trending:products 1 "product:101"

# 6. Recently viewed (List)
LPUSH user:1000:recent:views "product:101"
LTRIM user:1000:recent:views 0 19
# Keep only last 20

# 7. Real-time order notifications (Pub/Sub)
PUBLISH notifications:user:1000 '{"type":"order","status":"shipped","orderId":5001}'

# 8. Daily sales counter
INCR stats:sales:2024-11-14
INCRBYFLOAT stats:revenue:2024-11-14 99.99
```

---

## Best Practices

✅ **Set expiration** - Always use `EXPIRE` or TTL for temporary data  
✅ **Use appropriate data structures** - Don't force everything into Strings  
✅ **Monitor memory** - Use `INFO memory` to track usage  
✅ **Namespace keys** - Use prefixes like `cache:`, `session:`, `stats:`  
✅ **Handle failures** - Implement fallback to database if cache miss  
✅ **Batch operations** - Use pipelines for multiple commands  

## Common Pitfalls

❌ **No expiration** - Keys live forever, memory fills up  
❌ **Large keys** - Don't store massive values in single key  
❌ **Blocking commands** - Avoid `KEYS *` in production  
❌ **No error handling** - Always handle connection failures  

---

## Key Takeaways

✅ Redis excels at caching, sessions, real-time features  
✅ Choose patterns based on your use case  
✅ Combine data structures for complex applications  
✅ Always set expiration for temporary data  
✅ Monitor and optimize for your workload  

## Next Steps

- Explore Redis Cluster for scaling
- Learn Redis Streams for event processing
- Study Redis persistence options
- Implement Redis in your applications
- Consider Azure Managed Redis for production

## Additional Resources

- [Redis Use Cases Documentation](https://redis.io/docs/manual/patterns/)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/distributed-locks/)
- [Caching Strategies](https://redis.io/docs/manual/patterns/caching/)
- [Real-time Patterns](https://redis.io/docs/manual/pubsub/)
