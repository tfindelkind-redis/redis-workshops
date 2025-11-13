# Redis Core Data Structures

Redis supports five primary data structures. Understanding when to use each is key to effective Redis development.

---

## 1. Strings 📝

The simplest Redis data type - binary-safe strings.

### Basic Operations
```redis
SET user:1000:name "Alice"
GET user:1000:name
# Returns: "Alice"

SETEX session:abc123 3600 "user_data"
# Set with expiration (3600 seconds)

INCR page:views
# Atomic increment
```

### Use Cases
- Simple key-value caching
- Counters and metrics
- Session tokens
- Feature flags
- Distributed locks

### Key Characteristics
- Max size: 512 MB
- Atomic operations (INCR, APPEND)
- Can store any data (text, JSON, binary)

---

## 2. Lists 📋

Ordered collections of strings, implemented as linked lists.

### Basic Operations
```redis
LPUSH tasks "Task 1" "Task 2" "Task 3"
# Add to left (head)

RPUSH tasks "Task 4"
# Add to right (tail)

LRANGE tasks 0 -1
# Get all elements

LPOP tasks
# Remove and return first element
```

### Use Cases
- Message queues (FIFO/LIFO)
- Activity feeds
- Recent items lists
- Job queues with BLPOP (blocking)

### Key Characteristics
- Insertion at head/tail: O(1)
- Access by index: O(N)
- Perfect for queues and stacks

---

## 3. Sets 🎯

Unordered collections of unique strings.

### Basic Operations
```redis
SADD tags:post:123 "redis" "cache" "nosql"
# Add members

SMEMBERS tags:post:123
# Get all members

SISMEMBER tags:post:123 "redis"
# Check membership (returns 1)

SINTER tags:post:123 tags:post:456
# Set intersection
```

### Use Cases
- Tags and categories
- Unique visitor tracking
- Friend relationships
- Permissions and roles
- Real-time analytics

### Key Characteristics
- Uniqueness enforced automatically
- Fast membership testing: O(1)
- Set operations: union, intersection, difference

---

## 4. Hashes 🗂️

Maps of field-value pairs - perfect for objects.

### Basic Operations
```redis
HSET user:1000 name "Alice" email "alice@example.com" age 30
# Set multiple fields

HGET user:1000 name
# Get single field

HGETALL user:1000
# Get all fields

HINCRBY user:1000 age 1
# Increment field value
```

### Use Cases
- User profiles
- Product catalogs
- Session data
- Application configuration
- Object caching

### Key Characteristics
- More memory-efficient than separate keys
- Field-level operations
- Perfect for structured data

---

## 5. Sorted Sets 🏆

Sets ordered by a score - each member has a score.

### Basic Operations
```redis
ZADD leaderboard 1500 "Alice" 2100 "Bob" 1800 "Charlie"
# Add members with scores

ZRANGE leaderboard 0 -1 WITHSCORES
# Get all members sorted by score (ascending)

ZREVRANGE leaderboard 0 2 WITHSCORES
# Get top 3 (descending)

ZINCRBY leaderboard 100 "Alice"
# Increment score
```

### Use Cases
- Leaderboards and rankings
- Priority queues
- Time-series data (score = timestamp)
- Rate limiting windows
- Trending content

### Key Characteristics
- Sorted by score automatically
- Range queries by score or rank
- Operations: O(log N)

---

## Comparison Table

| Data Structure | Ordered? | Unique? | Best For | Complexity |
|----------------|----------|---------|----------|------------|
| **String** | N/A | N/A | Simple values, counters | O(1) |
| **List** | ✅ Yes | ❌ No | Queues, recent items | O(1) push/pop |
| **Set** | ❌ No | ✅ Yes | Unique collections, tags | O(1) add/check |
| **Hash** | ❌ No | ✅ Keys | Objects, profiles | O(1) field ops |
| **Sorted Set** | ✅ Yes | ✅ Yes | Rankings, time-series | O(log N) |

---

## Choosing the Right Data Structure

### Decision Tree

```
Need to store data?
│
├─ Single value?
│  └─ Use STRING
│
├─ Multiple values, order matters?
│  ├─ Values unique?
│  │  └─ Use SORTED SET (with scores)
│  └─ Values can duplicate?
│     └─ Use LIST
│
├─ Multiple values, order doesn't matter?
│  ├─ Values unique?
│  │  └─ Use SET
│  └─ Values are field-value pairs?
│     └─ Use HASH
│
└─ Need ranking/scoring?
   └─ Use SORTED SET
```

---

## Practice Exercise

**Scenario:** Design a simple blog platform using Redis.

**Requirements:**
- Store article metadata (title, author, content)
- Track article views (counter)
- Tag articles
- Show recent articles
- Rank articles by popularity

**Solution:**
```redis
# Article metadata (Hash)
HSET article:1 title "Redis Guide" author "Alice" content "..."

# View counter (String)
INCR article:1:views

# Tags (Set)
SADD article:1:tags "redis" "database" "cache"

# Recent articles (List)
LPUSH recent:articles "article:1"
LTRIM recent:articles 0 99  # Keep only 100 most recent

# Popular articles (Sorted Set - score = views)
ZADD popular:articles 150 "article:1"
ZINCRBY popular:articles 1 "article:1"  # Increment on each view
```

---

**Next:** Explore common Redis use cases and patterns →
