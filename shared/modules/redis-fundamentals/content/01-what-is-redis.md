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
- Temporary data with TTL

❌ **Not ideal for:**
- Primary database for critical data (use with persistence)
- Large blob storage (>100MB values)
- Complex queries and joins
- ACID transactions across multiple keys

## Architecture Overview

```
┌─────────────────────────────────────┐
│         Application Layer           │
│  (Web App, API, Microservices)     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         Redis Client                │
│  (Connection Pool, Commands)        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         Redis Server                │
│  ┌───────────────────────────────┐  │
│  │      In-Memory Data           │  │
│  │  Key-Value Store + Structures │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │   Optional Persistence        │  │
│  │     (RDB / AOF)               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Key Takeaways

- 🚀 Redis is extremely fast (in-memory)
- 🎨 Rich data structures beyond key-value
- 🔧 Versatile - cache, database, message broker
- 🌍 Used by Twitter, GitHub, Stack Overflow, and thousands more
- 📊 Perfect for real-time, high-performance workloads

---

**Next:** Learn about Redis's core data structures →
