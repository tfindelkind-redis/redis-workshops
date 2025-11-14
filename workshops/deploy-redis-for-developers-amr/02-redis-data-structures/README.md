# Module 2: Redis Data Structures

## Overview
**Duration:** 75 minutes  
**Difficulty:** Beginner  
**Type:** Hands-on Lab

## Learning Objectives
By the end of this module, you will:
- Master Redis Strings and their operations
- Work with Lists for queues and timelines
- Use Sets for unique collections
- Store structured data with Hashes
- Implement leaderboards with Sorted Sets

## Prerequisites
- Completed Module 1 or basic Redis knowledge
- Access to Redis instance (local or cloud)
- Redis CLI or RedisInsight

## Data Structure Overview

Redis provides five core data structures:

| Data Structure | Use Cases | Time Complexity |
|----------------|-----------|-----------------|
| **Strings** | Cache, counters, flags | O(1) |
| **Lists** | Queues, feeds, logs | O(1) for head/tail |
| **Sets** | Tags, unique items | O(1) for add/remove |
| **Hashes** | Objects, user profiles | O(1) per field |
| **Sorted Sets** | Leaderboards, rankings | O(log N) |

---

## 1. Strings

Strings are the most basic Redis data type - binary-safe sequences up to 512MB.

### Basic Operations

```bash
# Set a string value
SET user:1000:name "Alice Johnson"
> OK

# Get a string value
GET user:1000:name
> "Alice Johnson"

# Set multiple values at once
MSET user:1001:name "Bob Smith" user:1002:name "Carol White"
> OK

# Get multiple values
MGET user:1000:name user:1001:name user:1002:name
> 1) "Alice Johnson"
> 2) "Bob Smith"
> 3) "Carol White"

# Check if key exists
EXISTS user:1000:name
> (integer) 1

# Delete a key
DEL user:1000:name
> (integer) 1
```

### String Commands with Expiration

```bash
# Set with expiration (seconds)
SETEX session:xyz 3600 "user:1000"
> OK

# Set with expiration (milliseconds)
PSETEX cache:temp 5000 "temporary data"
> OK

# Check time to live
TTL session:xyz
> (integer) 3595

# Set only if key doesn't exist
SETNX lock:resource "locked"
> (integer) 1

# Try again (will fail)
SETNX lock:resource "locked"
> (integer) 0
```

### Numeric Operations

```bash
# Set a counter
SET page:views 100
> OK

# Increment by 1
INCR page:views
> (integer) 101

# Increment by specific amount
INCRBY page:views 50
> (integer) 151

# Decrement
DECR page:views
> (integer) 150

# Decrement by amount
DECRBY page:views 20
> (integer) 130

# Increment floating point
INCRBYFLOAT price 2.5
> "12.5"
```

### Practical Exercise 1: Page View Counter

```bash
# Track page views for different pages
INCR page:home:views
INCR page:home:views
INCR page:about:views

# Get all view counts
MGET page:home:views page:about:views
> 1) "2"
> 2) "1"

# Track daily views with expiration (24 hours)
SETEX page:home:views:2024-11-14 86400 "0"
INCR page:home:views:2024-11-14
```

---

## 2. Lists

Lists are ordered collections of strings, implemented as linked lists.

### Basic List Operations

```bash
# Add to the left (head) of list
LPUSH queue:tasks "task1"
> (integer) 1

LPUSH queue:tasks "task2" "task3"
> (integer) 3

# Add to the right (tail)
RPUSH queue:tasks "task4"
> (integer) 4

# Get range of elements (0 to -1 means all)
LRANGE queue:tasks 0 -1
> 1) "task3"
> 2) "task2"
> 3) "task1"
> 4) "task4"

# Get list length
LLEN queue:tasks
> (integer) 4

# Get element by index
LINDEX queue:tasks 0
> "task3"

# Pop from left (head)
LPOP queue:tasks
> "task3"

# Pop from right (tail)
RPOP queue:tasks
> "task4"
```

### Blocking Operations (for Queues)

```bash
# Block until element is available (0 = wait forever)
BLPOP queue:tasks 0
> 1) "queue:tasks"
> 2) "task2"

# With timeout (5 seconds)
BLPOP queue:tasks 5
> 1) "queue:tasks"
> 2) "task1"
```

### Practical Exercise 2: Activity Feed

```bash
# Add new activities (most recent first)
LPUSH feed:user:1000 "Commented on post #42"
LPUSH feed:user:1000 "Liked photo #123"
LPUSH feed:user:1000 "Followed @alice"

# Get latest 10 activities
LRANGE feed:user:1000 0 9

# Trim feed to last 100 items
LTRIM feed:user:1000 0 99
```

---

## 3. Sets

Sets are unordered collections of unique strings.

### Basic Set Operations

```bash
# Add members to a set
SADD tags:article:1 "redis" "nosql" "cache"
> (integer) 3

# Try to add duplicate (ignored)
SADD tags:article:1 "redis"
> (integer) 0

# Check if member exists
SISMEMBER tags:article:1 "redis"
> (integer) 1

# Get all members
SMEMBERS tags:article:1
> 1) "nosql"
> 2) "redis"
> 3) "cache"

# Get set size
SCARD tags:article:1
> (integer) 3

# Remove member
SREM tags:article:1 "nosql"
> (integer) 1

# Pop random member
SPOP tags:article:1
> "cache"
```

### Set Operations (Union, Intersection, Difference)

```bash
# Create two sets
SADD skills:alice "python" "javascript" "redis"
SADD skills:bob "java" "python" "sql"

# Union - all skills
SUNION skills:alice skills:bob
> 1) "java"
> 2) "sql"
> 3) "python"
> 4) "javascript"
> 5) "redis"

# Intersection - common skills
SINTER skills:alice skills:bob
> 1) "python"

# Difference - alice's unique skills
SDIFF skills:alice skills:bob
> 1) "javascript"
> 2) "redis"

# Store result in new set
SINTERSTORE common:skills skills:alice skills:bob
> (integer) 1
```

### Practical Exercise 3: Online Users

```bash
# User comes online
SADD users:online "user:1000"
SADD users:online "user:1001"
SADD users:online "user:1002"

# Check if user is online
SISMEMBER users:online "user:1000"
> (integer) 1

# Count online users
SCARD users:online
> (integer) 3

# User goes offline
SREM users:online "user:1002"

# Get random online user
SRANDMEMBER users:online
> "user:1001"
```

---

## 4. Hashes

Hashes are maps between string fields and string values - perfect for representing objects.

### Basic Hash Operations

```bash
# Set hash fields
HSET user:1000 name "Alice Johnson"
> (integer) 1

HSET user:1000 email "alice@example.com" age "28"
> (integer) 2

# Set multiple fields at once
HMSET user:1001 name "Bob Smith" email "bob@example.com" age "32"
> OK

# Get single field
HGET user:1000 name
> "Alice Johnson"

# Get multiple fields
HMGET user:1000 name email
> 1) "Alice Johnson"
> 2) "alice@example.com"

# Get all fields and values
HGETALL user:1000
> 1) "name"
> 2) "Alice Johnson"
> 3) "email"
> 4) "alice@example.com"
> 5) "age"
> 6) "28"

# Check if field exists
HEXISTS user:1000 name
> (integer) 1

# Delete field
HDEL user:1000 age
> (integer) 1

# Get all field names
HKEYS user:1000
> 1) "name"
> 2) "email"

# Get all values
HVALS user:1000
> 1) "Alice Johnson"
> 2) "alice@example.com"
```

### Hash Numeric Operations

```bash
# Increment hash field
HINCRBY product:101 stock 50
> (integer) 50

HINCRBY product:101 stock -5
> (integer) 45

# Increment float
HINCRBYFLOAT product:101 price 2.99
> "12.99"
```

### Practical Exercise 4: User Profile

```bash
# Create comprehensive user profile
HMSET user:1000 \
  name "Alice Johnson" \
  email "alice@example.com" \
  age "28" \
  city "Seattle" \
  joined "2024-01-15" \
  verified "true"

# Update single field
HSET user:1000 city "San Francisco"

# Increment login count
HINCRBY user:1000 login_count 1

# Get profile data
HGETALL user:1000
```

---

## 5. Sorted Sets

Sorted Sets are sets where each member has an associated score, kept sorted by score.

### Basic Sorted Set Operations

```bash
# Add members with scores
ZADD leaderboard 100 "player1"
> (integer) 1

ZADD leaderboard 250 "player2" 180 "player3"
> (integer) 2

# Get range by rank (lowest to highest)
ZRANGE leaderboard 0 -1 WITHSCORES
> 1) "player1"
> 2) "100"
> 3) "player3"
> 4) "180"
> 5) "player2"
> 6) "250"

# Get range by rank (highest to lowest)
ZREVRANGE leaderboard 0 -1 WITHSCORES
> 1) "player2"
> 2) "250"
> 3) "player3"
> 4) "180"
> 5) "player1"
> 6) "100"

# Get member rank
ZRANK leaderboard "player1"
> (integer) 0

# Get reverse rank (0 is highest)
ZREVRANK leaderboard "player2"
> (integer) 0

# Get member score
ZSCORE leaderboard "player2"
> "250"

# Increment score
ZINCRBY leaderboard 50 "player1"
> "150"
```

### Range Queries

```bash
# Get members with score between 100 and 200
ZRANGEBYSCORE leaderboard 100 200 WITHSCORES
> 1) "player1"
> 2) "150"
> 3) "player3"
> 4) "180"

# Count members in score range
ZCOUNT leaderboard 100 200
> (integer) 2

# Remove member
ZREM leaderboard "player3"
> (integer) 1

# Remove by rank
ZREMRANGEBYRANK leaderboard 0 0
> (integer) 1

# Remove by score
ZREMRANGEBYSCORE leaderboard 0 100
> (integer) 0
```

### Practical Exercise 5: Game Leaderboard

```bash
# Add player scores
ZADD game:leaderboard 9500 "player1"
ZADD game:leaderboard 12300 "player2"
ZADD game:leaderboard 8700 "player3"
ZADD game:leaderboard 15600 "player4"

# Get top 3 players
ZREVRANGE game:leaderboard 0 2 WITHSCORES
> 1) "player4"
> 2) "15600"
> 3) "player2"
> 4) "12300"
> 5) "player1"
> 6) "9500"

# Update player score
ZINCRBY game:leaderboard 2000 "player1"
> "11500"

# Get player's rank (1-based)
ZREVRANK game:leaderboard "player1"
> (integer) 2

# Count players above 10000
ZCOUNT game:leaderboard 10000 +inf
> (integer) 3
```

---

## Practical Lab: Build a Task Management System

Combine multiple data structures:

```bash
# 1. Create task (Hash)
HMSET task:1001 \
  title "Deploy Redis cluster" \
  status "pending" \
  priority "high" \
  assigned "user:1000" \
  created "2024-11-14"

# 2. Add to pending queue (List)
LPUSH queue:pending "task:1001"

# 3. Add tags (Set)
SADD task:1001:tags "redis" "devops" "deployment"

# 4. Track priority (Sorted Set, higher score = higher priority)
ZADD tasks:by:priority 3 "task:1001"

# 5. Assign to user (Set)
SADD user:1000:tasks "task:1001"

# --- Complete a task ---

# Remove from pending
LREM queue:pending 1 "task:1001"

# Update status
HSET task:1001 status "completed"

# Remove from priority queue
ZREM tasks:by:priority "task:1001"

# Get user's tasks
SMEMBERS user:1000:tasks
```

---

## Key Takeaways

✅ **Strings** - Simple values, counters, cache  
✅ **Lists** - Queues, feeds, timelines  
✅ **Sets** - Unique collections, tags, online users  
✅ **Hashes** - Objects, user profiles, product data  
✅ **Sorted Sets** - Leaderboards, rankings, priority queues  

## Best Practices

1. **Choose the right data structure** - Don't use Lists when you need uniqueness (use Sets)
2. **Use meaningful key names** - `user:1000:profile` not `u1000p`
3. **Consider memory** - Hashes are more memory-efficient than multiple Strings
4. **Use expiration** - `EXPIRE` or `SETEX` for temporary data
5. **Batch operations** - Use `MGET`, `HMSET` to reduce round trips

## Next Steps

In Module 3, we'll apply these data structures to real-world use cases!

## Additional Resources

- [Redis Data Types Documentation](https://redis.io/docs/data-types/)
- [Redis Commands by Data Type](https://redis.io/commands/)
- [Redis Data Structures Deep Dive](https://university.redis.com/courses/ru101/)
