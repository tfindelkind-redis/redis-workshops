# What is Redis?

## Overview

Redis (**RE**mote **DI**ctionary **S**erver) is an open-source, in-memory data structure store used as a database, cache, message broker, and streaming engine.

## Key Characteristics

### ⚡ In-Memory Performance
- All data stored in RAM for microsecond latency
- Optional persistence to disk (RDB snapshots, AOF logs)
- Typical operations complete in < 1 millisecond

### 🎯 Rich Data Structures
Redis isn't just a simple key-value store. It supports:
- Strings
- Lists
- Sets
- Hashes
- Sorted Sets
- Streams
- Bitmaps
- HyperLogLogs

### 🔄 Multiple Use Cases
- **Caching**: Reduce database load, improve response times
- **Session Storage**: Fast user session management
- **Real-Time Analytics**: Leaderboards, counters, metrics
- **Message Queues**: Pub/Sub, streaming with Redis Streams
- **Distributed Locks**: Coordination between services

## Redis vs Alternatives

| Feature | Redis | Memcached | Relational DB |
|---------|-------|-----------|---------------|
| **Data Structures** | Rich (5+ types) | Key-Value only | Tables/Rows |
| **Persistence** | Optional | No | Yes |
| **Replication** | Yes | No | Yes |
| **Clustering** | Yes | Via client | Built-in |
| **Pub/Sub** | Yes | No | Limited |
| **Speed** | Microseconds | Microseconds | Milliseconds |

## When to Use Redis

✅ **Great for:**
- Caching frequently accessed data
- Real-time leaderboards and counters
- Session management
- Rate limiting
- Pub/Sub messaging

## 🏢 Enterprise Use Cases at Acme Corp

> **Note:** This section has been customized for Acme Corp's enterprise scenarios.

### E-Commerce Session Management
At Acme Corp, we use Redis to handle **10 million+ concurrent user sessions** across our global e-commerce platform:

```python
# Example: Store user session with shopping cart
import redis

r = redis.Redis(host='prod-redis-cluster', port=6379)

# Set session data with 30-minute TTL
session_data = {
    'user_id': 'acme-12345',
    'cart_items': ['SKU-001', 'SKU-045'],
    'total': '149.99',
    'region': 'US-EAST'
}

r.setex(f'session:{session_data["user_id"]}', 
        1800,  # 30 minutes
        json.dumps(session_data))
```

### Real-Time Inventory Management
Our warehouse system uses Redis Sorted Sets for **instant inventory lookups**:

```python
# Track real-time inventory levels
r.zadd('inventory:warehouse1', {
    'SKU-001': 450,  # 450 units in stock
    'SKU-002': 1200,
    'SKU-003': 87
})

# Get low-stock items (< 100 units)
low_stock = r.zrangebyscore('inventory:warehouse1', 0, 100)
```

### Customer Analytics Dashboard
Redis powers our **real-time customer analytics**:
- Page view counters (100K+ req/sec)
- User behavior tracking
- A/B test result aggregation
- Real-time conversion funnels

### Performance Metrics
Our production Redis cluster handles:
- **2M ops/second** sustained throughput
- **<500 microsecond** P99 latency
- **99.99%** uptime SLA
- **50TB** total dataset across 20 nodes

## Exercise: Enterprise Scenario

Let's practice with a real Acme Corp use case. Navigate to the exercises directory and complete `01-basic-commands.md` using our production data patterns.

