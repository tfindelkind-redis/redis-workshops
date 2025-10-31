# Chapter 01: Getting Started with Redis

**Estimated Time:** 45 minutes  
**Difficulty:** Beginner  
**Version:** 1.0.0  
**Last Updated:** 2025-10-31

## 📋 Overview

This chapter introduces you to Redis, an in-memory data structure store used as a database, cache, and message broker. You'll learn the basics of Redis, how to install it, and perform fundamental operations.

## 🎯 Learning Objectives

By the end of this chapter, you will be able to:
- Understand what Redis is and its use cases
- Install and run Redis locally
- Connect to Redis using redis-cli
- Perform basic CRUD operations with Redis strings
- Understand Redis data expiration

## 📚 Prerequisites

- Basic command-line knowledge
- macOS, Linux, or Windows with WSL
- Internet connection for installation

## 🛠️ Setup

### Required Tools
- Redis server and CLI (we'll install this together)
- Terminal/Command prompt

### Initial Setup
Run the setup script to check your environment:

```bash
./scripts/setup.sh
```

## 📖 Chapter Content

### Section 1: What is Redis?

Redis (REmote DIctionary Server) is an open-source, in-memory data structure store that can be used as:
- **Database**: Persistent storage with various data structures
- **Cache**: High-performance caching layer
- **Message Broker**: Pub/sub messaging

**Key Features:**
- Extremely fast (all data in memory)
- Rich data types (strings, lists, sets, hashes, etc.)
- Atomic operations
- Built-in replication
- Persistence options

### Section 2: Installing Redis

#### macOS (using Homebrew)
```bash
brew install redis
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install redis-server
```

#### Verify Installation
```bash
redis-cli --version
```

### Section 3: Starting Redis

Start the Redis server:
```bash
redis-server
```

In a new terminal, verify it's running:
```bash
redis-cli ping
```

**Expected Output:**
```
PONG
```

### Section 4: Basic Redis Commands

#### Setting and Getting Values

```bash
# Set a key-value pair
redis-cli SET greeting "Hello, Redis!"

# Get the value
redis-cli GET greeting
```

**Expected Output:**
```
OK
"Hello, Redis!"
```

#### Working with Multiple Keys

```bash
# Set multiple values
redis-cli MSET user:1:name "Alice" user:1:email "alice@example.com"

# Get multiple values
redis-cli MGET user:1:name user:1:email
```

#### Checking if Keys Exist

```bash
# Check if key exists (returns 1 if exists, 0 if not)
redis-cli EXISTS greeting

# Delete a key
redis-cli DEL greeting

# Check again
redis-cli EXISTS greeting
```

### Section 5: Data Expiration

Redis allows you to set expiration times on keys:

```bash
# Set a key with 10 second expiration
redis-cli SETEX temp:data 10 "This will expire"

# Check time to live (TTL)
redis-cli TTL temp:data

# Wait 10 seconds and try to get it
sleep 10
redis-cli GET temp:data
```

## 🧪 Practice Exercises

### Exercise 1: User Profile Storage
**Objective:** Practice storing and retrieving user data  

**Instructions:**
1. Store a user's name with key `user:100:name`
2. Store the user's email with key `user:100:email`
3. Store the user's age with key `user:100:age`
4. Retrieve all three values
5. Delete the age field
6. Verify the age field is gone

**Solution:** See `scripts/solutions/exercise-1.sh`

### Exercise 2: Temporary Session Data
**Objective:** Practice working with expiring data

**Instructions:**
1. Create a session token with key `session:abc123` and value "user_logged_in"
2. Set it to expire in 30 seconds
3. Check the TTL
4. Retrieve the value before it expires

**Solution:** See `scripts/solutions/exercise-2.sh`

## ✅ Knowledge Check

1. What does Redis stand for?
   - [ ] Rapid Entry Data Information System
   - [x] REmote DIctionary Server
   - [ ] Relational Data Integration Service
   - [ ] Real-time Data Indexing System

2. Where does Redis primarily store data?
   - [x] In memory (RAM)
   - [ ] On disk
   - [ ] In the cloud
   - [ ] In a distributed file system

3. What command checks if a Redis server is running?
   - [ ] redis-cli CHECK
   - [ ] redis-cli STATUS
   - [x] redis-cli PING
   - [ ] redis-cli TEST

**Answers:** See `answers.md`

## 🔗 Resources

### Scripts
- `scripts/setup.sh` - Environment setup and verification
- `scripts/demo.sh` - Live demonstration of concepts
- `scripts/cleanup.sh` - Clean up practice data
- `scripts/solutions/` - Exercise solutions

### Additional Reading
- [Redis Official Documentation](https://redis.io/docs/)
- [Redis Commands Reference](https://redis.io/commands/)
- [Try Redis Online](https://try.redis.io/)

## 🐛 Troubleshooting

### Common Issues

**Issue: "Could not connect to Redis" error**
- **Solution:** Make sure Redis server is running with `redis-server` command

**Issue: "Command not found: redis-cli"**
- **Solution:** Redis is not installed or not in PATH. Reinstall Redis or add to PATH

**Issue: Port 6379 already in use**
- **Solution:** Another Redis instance is running. Stop it or use a different port with `redis-server --port 6380`

## 🎓 Summary

Key takeaways from this chapter:
- Redis is an in-memory data store with multiple use cases
- Basic operations include SET, GET, DEL, EXISTS
- Keys can have expiration times using SETEX or EXPIRE
- redis-cli is the command-line interface for Redis
- Redis stores data in memory for high performance

## 🧭 Navigation

**Workshop:** [Redis Fundamentals](../../../workshops/redis-fundamentals/README.md)

**Previous:** [← Workshop Overview](../../../workshops/redis-fundamentals/README.md)  
**Next:** [Chapter 2: Building the Chat Interface →](../../../workshops/redis-fundamentals/chapters/building-the-chat-interface/README.md)

---

📚 **Workshop Chapters:**
1. **Getting Started with Redis** (Current)
2. [Building the Chat Interface](../../../workshops/redis-fundamentals/chapters/building-the-chat-interface/README.md)

## 📝 Changelog

### Version 1.0.0 (2025-10-31)
- Initial release
- Covers installation and basic commands
- Includes hands-on exercises
