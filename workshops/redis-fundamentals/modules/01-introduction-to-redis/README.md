# Module 1: Introduction to Redis

## Overview
**Duration:** 45 minutes  
**Difficulty:** Beginner  
**Type:** Lecture + Demo

## Learning Objectives
By the end of this module, you will:
- Understand what Redis is and its core architecture
- Know when to use Redis in your applications
- Understand Redis key features and benefits
- Be familiar with Redis use cases and deployment models

## What is Redis?

Redis (**RE**mote **DI**ctionary **S**erver) is an open-source, in-memory data structure store that can be used as:
- **Database** - Persistent data storage
- **Cache** - High-performance data caching
- **Message Broker** - Pub/Sub messaging
- **Streaming Engine** - Real-time data processing

### Key Characteristics

1. **In-Memory Storage**
   - Data is stored in RAM for ultra-fast access
   - Optional persistence to disk
   - Typical latency: sub-millisecond

2. **Data Structures**
   - Not just key-value, but rich data types
   - Strings, Lists, Sets, Hashes, Sorted Sets
   - Advanced types: Bitmaps, HyperLogLogs, Streams, Geospatial indexes

3. **Simple Yet Powerful**
   - Over 200+ commands
   - Atomic operations
   - Built-in replication
   - Lua scripting support

## Why Use Redis?

### Speed
- **In-memory operations** - No disk I/O for reads
- **Single-threaded** - No lock contention
- **Optimized data structures** - Operations are O(1) or O(log N)

**Performance Examples:**
- GET/SET: ~100,000 operations/second on modest hardware
- Pipeline: Millions of operations/second

### Versatility
Redis can replace multiple specialized systems:
- Cache (Memcached replacement)
- Session store (DynamoDB, Cassandra)
- Message queue (RabbitMQ, Kafka for simple cases)
- Leaderboards (custom SQL queries)

### Simplicity
```bash
# Set a value
SET user:1000:name "John Doe"

# Get a value
GET user:1000:name
> "John Doe"

# Increment a counter
INCR page:views
> (integer) 1
```

## Redis vs Other Databases

| Feature | Redis | Memcached | MongoDB | PostgreSQL |
|---------|-------|-----------|---------|------------|
| Speed | Extremely Fast | Very Fast | Fast | Moderate |
| Data Structures | Rich (10+) | Simple (key-value) | Documents | Tables/JSON |
| Persistence | Optional | No | Yes | Yes |
| Query Language | Commands | Simple | MQL | SQL |
| Best For | Cache, Real-time | Pure cache | Documents | Complex queries |

## Common Use Cases

### 1. Caching
Cache frequently accessed data to reduce database load:
```bash
# Cache user profile
SET user:1000:profile '{"name":"John","email":"john@example.com"}' EX 3600
```

### 2. Session Management
Store user session data:
```bash
# Store session with 30-minute expiry
SETEX session:abc123 1800 '{"userId":1000,"loggedIn":"2024-11-14"}'
```

### 3. Real-time Analytics
Track page views, user actions:
```bash
# Increment daily active users
INCR stats:dau:2024-11-14
# Add user to today's set
SADD users:active:2024-11-14 user:1000
```

### 4. Leaderboards
Gaming scores, trending content:
```bash
# Add score to leaderboard
ZADD leaderboard 9500 "player1"
# Get top 10
ZREVRANGE leaderboard 0 9 WITHSCORES
```

### 5. Pub/Sub Messaging
Real-time notifications, chat:
```bash
# Subscribe to channel
SUBSCRIBE chat:room:lobby

# Publish message
PUBLISH chat:room:lobby "Hello everyone!"
```

## Redis Architecture

### Single-Threaded Model
- One main thread handles all commands
- No race conditions or locks needed
- Predictable performance

### Persistence Options

**RDB (Redis Database Backup)**
- Point-in-time snapshots
- Compact, fast to load
- Good for backups

**AOF (Append-Only File)**
- Logs every write operation
- More durable, less data loss
- Larger file size

**Hybrid**
- RDB + AOF for best of both worlds

### Replication
```
┌─────────────┐
│   Primary   │ ← Writes
└──────┬──────┘
       │ Replicates
       ├──────┬──────┐
┌──────▼─┐  ┌─▼──────┐
│ Replica│  │ Replica│ ← Reads
└────────┘  └────────┘
```

## Deployment Models

### 1. Standalone
- Single Redis instance
- Simple, good for development
- No high availability

### 2. Sentinel
- Automatic failover
- Monitoring and notifications
- 3+ nodes recommended

### 3. Cluster
- Horizontal scaling
- Data sharding across nodes
- 6+ nodes (3 primaries, 3 replicas)

### 4. Managed Services
- **Azure Cache for Redis / Azure Managed Redis**
- **AWS ElastiCache**
- **Google Cloud Memorystore**
- Automated backups, patching, monitoring

## When NOT to Use Redis

❌ **Primary database for critical data** - Unless persistence is configured  
❌ **Complex querying** - No JOIN, GROUP BY, etc.  
❌ **Large datasets** - RAM is expensive compared to disk  
❌ **Strictly ACID transactions** - Limited transaction support  

## Demo: Your First Redis Commands

Let's connect to Redis and try basic commands:

```bash
# Start Redis CLI
redis-cli

# Test connection
PING
> PONG

# Set your first key
SET mykey "Hello Redis"
> OK

# Get the value
GET mykey
> "Hello Redis"

# Set with expiration (10 seconds)
SETEX tempkey 10 "This will expire"

# Check time to live
TTL tempkey
> (integer) 8

# Wait 10 seconds and try again
GET tempkey
> (nil)

# Check Redis info
INFO server
```

## Key Takeaways

✅ Redis is an in-memory data structure store  
✅ Offers sub-millisecond latency  
✅ Supports rich data types beyond key-value  
✅ Use for caching, sessions, real-time analytics, messaging  
✅ Choose managed services (like Azure Managed Redis) for production  

## Next Steps

In Module 2, we'll dive deep into Redis data structures with hands-on exercises!

## Additional Resources

- [Redis Official Documentation](https://redis.io/docs/)
- [Redis University - Free Courses](https://university.redis.com/)
- [Interactive Redis Tutorial](https://try.redis.io/)
- [Redis Commands Reference](https://redis.io/commands/)
