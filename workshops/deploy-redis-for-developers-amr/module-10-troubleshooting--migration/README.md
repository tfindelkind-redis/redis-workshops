---
title: Troubleshooting & Migration
description: ''
duration: 60 minutes
difficulty: intermediate
type: hands-on
---

<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->

| Previous | Home | Next |
|----------|:----:|------:|
| [⬅️ Previous: Monitoring & Alerts Lab](../module-09-monitoring--alerts-lab/README.md) | [🏠 Workshop Home](../README.md) | [Next: Advanced Features ➡️](../module-11-advanced-features/README.md) |

[🏠 Workshop Home](../README.md) > **Module 10 of 11**

### Deploy Redis for Developers - Azure Managed Redis

**Progress:** `█████████░` 91%

---

<!-- ✏️ EDIT YOUR CONTENT BELOW THIS LINE ✏️ -->

# Module 8: Troubleshooting & Migration

**Duration:** 60 minutes  
**Format:** Hands-On Lab  
**Level:** Advanced

## Overview

This advanced module covers troubleshooting techniques for Azure Cache for Redis and provides comprehensive guidance on migrating Redis workloads to Azure. You'll learn diagnostic commands, performance analysis, common pitfalls, and hands-on migration using multiple tools.

## Learning Objectives

By the end of this module, you will be able to:

- Diagnose common Azure Cache for Redis issues
- Use Redis diagnostic commands effectively
- Analyze performance bottlenecks
- Plan and execute Redis migrations to Azure
- Use RIOT (Redis Input/Output Tool) for data migration
- Implement zero-downtime migration strategies
- Validate migration success

## Prerequisites

- Completion of Module 7 (Monitoring & Alerts)
- Azure Cache for Redis instance (Premium tier recommended)
- Source Redis instance for migration exercises
- Redis CLI tools installed
- Docker (for RIOT tool)

## Part 1: Troubleshooting Azure Cache for Redis

### Common Issues and Solutions

#### Issue 1: High Latency

**Symptoms:**
- Slow response times from Redis
- Timeouts in application logs
- High percentile latencies (P95, P99)

**Diagnostic Commands:**

```bash
# Check Redis server latency
redis-cli -h <your-cache>.redis.cache.windows.net -p 6380 -a <access-key> --tls --latency

# Extended latency statistics
redis-cli -h <your-cache>.redis.cache.windows.net -p 6380 -a <access-key> --tls --latency-history

# Intrinsic latency test (server-side)
redis-cli -h <your-cache>.redis.cache.windows.net -p 6380 -a <access-key> --tls --intrinsic-latency 100
```

**Common Causes:**

1. **Network Issues**
```bash
# Test network connectivity
ping <your-cache>.redis.cache.windows.net

# Check SSL/TLS handshake time
openssl s_client -connect <your-cache>.redis.cache.windows.net:6380 -tls1_2
```

2. **High Server Load**
```bash
# Check server statistics
redis-cli -h <your-cache>.redis.cache.windows.net -p 6380 -a <access-key> --tls INFO SERVER

# Check command statistics
redis-cli -h <your-cache>.redis.cache.windows.net -p 6380 -a <access-key> --tls INFO COMMANDSTATS
```

3. **Memory Pressure**
```bash
# Check memory stats
redis-cli -h <your-cache>.redis.cache.windows.net -p 6380 -a <access-key> --tls INFO MEMORY

# Check eviction statistics
redis-cli -h <your-cache>.redis.cache.windows.net -p 6380 -a <access-key> --tls INFO STATS | grep evicted
```

**Solutions:**

```bash
# Identify slow commands
redis-cli -h <your-cache>.redis.cache.windows.net -p 6380 -a <access-key> --tls SLOWLOG GET 10

# Configure slowlog threshold (microseconds)
redis-cli -h <your-cache>.redis.cache.windows.net -p 6380 -a <access-key> --tls CONFIG SET slowlog-log-slower-than 10000

# Monitor in real-time
redis-cli -h <your-cache>.redis.cache.windows.net -p 6380 -a <access-key> --tls MONITOR
```

#### Issue 2: Connection Timeouts

**Symptoms:**
- Connection refused errors
- Timeout exceptions
- Connection pool exhaustion

**Diagnostic Steps:**

```bash
# Check current connections
redis-cli -h <your-cache>.redis.cache.windows.net -p 6380 -a <access-key> --tls CLIENT LIST

# Count connected clients
redis-cli -h <your-cache>.redis.cache.windows.net -p 6380 -a <access-key> --tls INFO CLIENTS

# Check rejected connections
redis-cli -h <your-cache>.redis.cache.windows.net -p 6380 -a <access-key> --tls INFO STATS | grep rejected
```

**Solutions:**

```python
# Python: Proper connection pooling
import redis

pool = redis.ConnectionPool(
    host='<your-cache>.redis.cache.windows.net',
    port=6380,
    password='<access-key>',
    ssl=True,
    max_connections=50,
    socket_connect_timeout=5,
    socket_keepalive=True,
    socket_keepalive_options={
        socket.TCP_KEEPIDLE: 1,
        socket.TCP_KEEPINTVL: 1,
        socket.TCP_KEEPCNT: 5
    }
)

client = redis.Redis(connection_pool=pool)
```

```csharp
// C#: Connection multiplexer configuration
var config = ConfigurationOptions.Parse("<your-cache>.redis.cache.windows.net:6380");
config.Password = "<access-key>";
config.Ssl = true;
config.AbortOnConnectFail = false;
config.ConnectTimeout = 5000;
config.SyncTimeout = 5000;
config.KeepAlive = 60;

var connection = ConnectionMultiplexer.Connect(config);
```

#### Issue 3: Memory Evictions

**Symptoms:**
- Keys disappearing unexpectedly
- Cache hit rate dropping
- Increased evicted_keys metric

**Diagnostic Commands:**

```bash
# Check memory usage and eviction policy
redis-cli -h <your-cache>.redis.cache.windows.net -p 6380 -a <access-key> --tls INFO MEMORY

# Check eviction stats
redis-cli -h <your-cache>.redis.cache.windows.net -p 6380 -a <access-key> --tls INFO STATS | grep evicted

# See largest keys
redis-cli -h <your-cache>.redis.cache.windows.net -p 6380 -a <access-key> --tls --bigkeys
```

**Analysis Script:**

```python
import redis
import sys

def analyze_memory_usage(host, port, password):
    r = redis.Redis(
        host=host, 
        port=port, 
        password=password,
        ssl=True
    )
    
    # Get memory info
    info = r.info('memory')
    used_memory = info['used_memory']
    max_memory = info['maxmemory']
    
    print(f"Used Memory: {used_memory / (1024**3):.2f} GB")
    print(f"Max Memory: {max_memory / (1024**3):.2f} GB")
    print(f"Usage: {(used_memory / max_memory * 100):.2f}%")
    
    # Check eviction policy
    policy = r.config_get('maxmemory-policy')
    print(f"Eviction Policy: {policy}")
    
    # Sample key analysis
    cursor = 0
    key_sizes = []
    
    while True:
        cursor, keys = r.scan(cursor, count=100)
        for key in keys:
            try:
                size = r.memory_usage(key)
                key_sizes.append((key, size))
            except:
                pass
        if cursor == 0:
            break
    
    # Sort and display top 10 largest keys
    key_sizes.sort(key=lambda x: x[1], reverse=True)
    print("\nTop 10 Largest Keys:")
    for key, size in key_sizes[:10]:
        print(f"  {key.decode()}: {size / 1024:.2f} KB")

if __name__ == "__main__":
    analyze_memory_usage(
        host="<your-cache>.redis.cache.windows.net",
        port=6380,
        password="<access-key>"
    )
```

**Solutions:**

```bash
# Change eviction policy
az redis update \
  --name my-redis-cache \
  --resource-group rg-redis-workshop \
  --set "redisConfiguration.maxmemory-policy=allkeys-lru"

# Scale up if needed
az redis update \
  --name my-redis-cache \
  --resource-group rg-redis-workshop \
  --sku Premium \
  --vm-size P2
```

#### Issue 4: Poor Cache Hit Rate

**Diagnostic Approach:**

```bash
# Get hit/miss stats
redis-cli -h <your-cache>.redis.cache.windows.net -p 6380 -a <access-key> --tls INFO STATS | grep keyspace

# Calculate hit rate
redis-cli -h <your-cache>.redis.cache.windows.net -p 6380 -a <access-key> --tls INFO STATS | grep -E "keyspace_hits|keyspace_misses"
```

**Analysis:**

```python
def calculate_hit_rate(host, port, password):
    r = redis.Redis(host=host, port=port, password=password, ssl=True)
    info = r.info('stats')
    
    hits = info['keyspace_hits']
    misses = info['keyspace_misses']
    total = hits + misses
    
    if total > 0:
        hit_rate = (hits / total) * 100
        print(f"Cache Hit Rate: {hit_rate:.2f}%")
        print(f"Hits: {hits:,}")
        print(f"Misses: {misses:,}")
    else:
        print("No cache operations recorded")
```

**Common Causes:**
1. TTL too short
2. Keys not being found (wrong key names)
3. Cache warming not implemented
4. Evictions due to memory pressure

**Solutions:**

```python
# Implement cache warming
def warm_cache(r, data_source):
    """Pre-populate cache with frequently accessed data"""
    popular_items = data_source.get_popular_items(limit=1000)
    
    pipe = r.pipeline()
    for item in popular_items:
        cache_key = f"item:{item.id}"
        pipe.setex(cache_key, 3600, json.dumps(item.to_dict()))
    
    pipe.execute()
    print(f"Warmed cache with {len(popular_items)} items")

# Implement proper TTL strategy
def set_with_appropriate_ttl(r, key, value, access_frequency):
    """Set TTL based on access patterns"""
    if access_frequency == 'high':
        ttl = 3600  # 1 hour
    elif access_frequency == 'medium':
        ttl = 1800  # 30 minutes
    else:
        ttl = 900   # 15 minutes
    
    r.setex(key, ttl, value)
```

#### Issue 5: Geo-Replication Lag

**For Premium Tier with Geo-Replication:**

```bash
# Check replication status
az redis show \
  --name my-redis-cache \
  --resource-group rg-redis-workshop \
  --query "geoReplicationLinks"

# Check replication offset
redis-cli -h <your-cache>.redis.cache.windows.net -p 6380 -a <access-key> --tls INFO REPLICATION
```

**Monitor Replication Lag:**

```python
def check_replication_lag(primary_host, replica_host, password, port=6380):
    primary = redis.Redis(host=primary_host, port=port, password=password, ssl=True)
    replica = redis.Redis(host=replica_host, port=port, password=password, ssl=True)
    
    # Write test key to primary
    test_key = "replication_test_" + str(time.time())
    primary.set(test_key, "test_value")
    
    # Poll replica until key appears
    start_time = time.time()
    max_wait = 10  # seconds
    
    while time.time() - start_time < max_wait:
        if replica.exists(test_key):
            lag = time.time() - start_time
            print(f"Replication lag: {lag * 1000:.2f} ms")
            # Cleanup
            primary.delete(test_key)
            return lag
        time.sleep(0.01)
    
    print("Replication lag exceeded maximum wait time")
    return None
```

### Diagnostic Command Reference

#### INFO Commands

```bash
# Server information
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY INFO SERVER

# Client connections
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY INFO CLIENTS

# Memory usage
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY INFO MEMORY

# Statistics
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY INFO STATS

# Replication
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY INFO REPLICATION

# CPU usage
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY INFO CPU

# Command statistics
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY INFO COMMANDSTATS

# Keyspace
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY INFO KEYSPACE
```

#### CLIENT Commands

```bash
# List all connected clients
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY CLIENT LIST

# Get current connection ID
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY CLIENT ID

# Kill a specific client
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY CLIENT KILL ID <client-id>

# Set client name
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY CLIENT SETNAME my-app

# Pause all clients
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY CLIENT PAUSE 5000
```

#### MEMORY Commands

```bash
# Get memory usage of a key
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY MEMORY USAGE mykey

# Memory doctor analysis
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY MEMORY DOCTOR

# Memory statistics
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY MEMORY STATS

# Memory usage with samples
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY MEMORY USAGE mykey SAMPLES 5
```

#### Performance Analysis

```bash
# Latency monitoring
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY LATENCY DOCTOR

# Latency history
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY LATENCY HISTORY command

# Latency latest
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY LATENCY LATEST

# Slowlog
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY SLOWLOG GET 25
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY SLOWLOG LEN
redis-cli --tls -h $REDIS_HOST -p 6380 -a $REDIS_KEY SLOWLOG RESET
```

## Part 2: Migration to Azure Cache for Redis

### Migration Planning

#### Pre-Migration Assessment

**1. Inventory Source Redis**

```bash
# Get Redis version
redis-cli -h source-redis.example.com INFO SERVER | grep redis_version

# Get database size
redis-cli -h source-redis.example.com INFO KEYSPACE

# Get memory usage
redis-cli -h source-redis.example.com INFO MEMORY | grep used_memory_human

# Count keys per database
for db in {0..15}; do
  echo "DB $db:"
  redis-cli -h source-redis.example.com -n $db DBSIZE
done
```

**2. Analyze Data Patterns**

```python
def analyze_redis_data(host, port, password=None):
    """Analyze Redis data patterns"""
    r = redis.Redis(host=host, port=port, password=password)
    
    analysis = {
        'total_keys': 0,
        'key_types': {},
        'key_patterns': {},
        'ttl_distribution': {
            'no_expiry': 0,
            'expired': 0,
            'expiring': 0
        }
    }
    
    cursor = 0
    while True:
        cursor, keys = r.scan(cursor, count=1000)
        
        for key in keys:
            analysis['total_keys'] += 1
            
            # Key type
            key_type = r.type(key).decode()
            analysis['key_types'][key_type] = analysis['key_types'].get(key_type, 0) + 1
            
            # Key pattern (first part before :)
            pattern = key.decode().split(':')[0] if b':' in key else 'no_pattern'
            analysis['key_patterns'][pattern] = analysis['key_patterns'].get(pattern, 0) + 1
            
            # TTL analysis
            ttl = r.ttl(key)
            if ttl == -1:
                analysis['ttl_distribution']['no_expiry'] += 1
            elif ttl == -2:
                analysis['ttl_distribution']['expired'] += 1
            else:
                analysis['ttl_distribution']['expiring'] += 1
        
        if cursor == 0:
            break
    
    return analysis

# Run analysis
results = analyze_redis_data('source-redis.example.com', 6379)
print(json.dumps(results, indent=2))
```

**3. Calculate Required Azure Cache Tier**

```python
def recommend_azure_tier(memory_mb, ops_per_second, ha_required=True):
    """Recommend Azure Cache tier based on requirements"""
    
    tiers = {
        'C0': {'memory': 250, 'bandwidth': 15, 'connections': 256},
        'C1': {'memory': 1024, 'bandwidth': 25, 'connections': 1000},
        'C2': {'memory': 2560, 'bandwidth': 50, 'connections': 2000},
        'C3': {'memory': 6144, 'bandwidth': 100, 'connections': 5000},
        'C4': {'memory': 13312, 'bandwidth': 200, 'connections': 10000},
        'C5': {'memory': 26624, 'bandwidth': 400, 'connections': 15000},
        'C6': {'memory': 53248, 'bandwidth': 1000, 'connections': 20000},
        'P1': {'memory': 6144, 'bandwidth': 1500, 'connections': 7500},
        'P2': {'memory': 13312, 'bandwidth': 3000, 'connections': 15000},
        'P3': {'memory': 26624, 'bandwidth': 3000, 'connections': 15000},
        'P4': {'memory': 53248, 'bandwidth': 6000, 'connections': 30000},
        'P5': {'memory': 120832, 'bandwidth': 10000, 'connections': 40000},
    }
    
    # Add 30% headroom
    required_memory = memory_mb * 1.3
    
    recommendations = []
    for tier, specs in tiers.items():
        if specs['memory'] >= required_memory:
            if ha_required and tier.startswith('C') and int(tier[1]) < 1:
                continue  # Skip C0 for HA
            recommendations.append(tier)
    
    return recommendations[0] if recommendations else 'P5+'

# Example
recommended = recommend_azure_tier(memory_mb=8000, ops_per_second=10000, ha_required=True)
print(f"Recommended tier: {recommended}")
```

### Migration Methods

#### Method 1: Using RIOT (Redis Input/Output Tool)

**RIOT** is the most efficient tool for migrating Redis data.

**Installation:**

```bash
# Using Docker
docker pull redis/riot

# Or download binary
wget https://github.com/redis-developer/riot/releases/latest/download/riot-redis-<version>.zip
unzip riot-redis-<version>.zip
```

**Basic Migration:**

```bash
# Simple replication from source to target
docker run -it --rm redis/riot replicate \
  redis://source-redis.example.com:6379 \
  rediss://:${TARGET_PASSWORD}@${TARGET_HOST}.redis.cache.windows.net:6380 \
  --mode live \
  --log-keys
```

**Advanced Migration with Filtering:**

```bash
# Migrate specific key patterns
docker run -it --rm redis/riot replicate \
  redis://source-redis.example.com:6379 \
  rediss://:${TARGET_PASSWORD}@${TARGET_HOST}.redis.cache.windows.net:6380 \
  --scan-match "user:*" \
  --scan-count 1000 \
  --mode live \
  --threads 4
```

**Migration with Transformation:**

```bash
# Migrate and transform keys
docker run -it --rm redis/riot replicate \
  redis://source-redis.example.com:6379 \
  rediss://:${TARGET_PASSWORD}@${TARGET_HOST}.redis.cache.windows.net:6380 \
  --key-transform "prefix:newapp:" \
  --ttl-policy keep \
  --mode live
```

**Complete Migration Script:**

```bash
#!/bin/bash
# migrate-redis.sh

SOURCE_HOST="source-redis.example.com"
SOURCE_PORT=6379
TARGET_HOST="${AZURE_REDIS_NAME}.redis.cache.windows.net"
TARGET_PORT=6380
TARGET_PASSWORD="${AZURE_REDIS_KEY}"

echo "Starting Redis migration from $SOURCE_HOST to $TARGET_HOST"

# Phase 1: Initial bulk copy
echo "Phase 1: Bulk copy of existing data"
docker run -it --rm redis/riot replicate \
  redis://${SOURCE_HOST}:${SOURCE_PORT} \
  rediss://:${TARGET_PASSWORD}@${TARGET_HOST}:${TARGET_PORT} \
  --mode snapshot \
  --threads 8 \
  --batch-size 500 \
  --log-file migration-phase1.log

# Phase 2: Live replication
echo "Phase 2: Starting live replication"
docker run -d --name redis-live-sync redis/riot replicate \
  redis://${SOURCE_HOST}:${SOURCE_PORT} \
  rediss://:${TARGET_PASSWORD}@${TARGET_HOST}:${TARGET_PORT} \
  --mode live \
  --threads 4 \
  --log-file migration-phase2.log

echo "Live replication started. Monitor with: docker logs -f redis-live-sync"
echo ""
echo "When ready to cutover:"
echo "1. Verify replication lag is minimal"
echo "2. Stop application writes to source"
echo "3. Wait for replication to complete"
echo "4. Update application to point to Azure Redis"
echo "5. Stop live sync: docker stop redis-live-sync"
```

#### Method 2: Using redis-dump-go

**For smaller datasets:**

```bash
# Install redis-dump-go
go install github.com/yannh/redis-dump-go/v2@latest

# Export from source
redis-dump-go \
  -host source-redis.example.com \
  -port 6379 \
  -output dump.json

# Import to Azure Redis
cat dump.json | redis-cli \
  -h ${TARGET_HOST}.redis.cache.windows.net \
  -p 6380 \
  -a ${TARGET_PASSWORD} \
  --tls \
  --pipe
```

#### Method 3: Using RDB Export/Import

**For Premium tier with Import/Export feature:**

```bash
# 1. Create storage account for import/export
az storage account create \
  --name redismigration \
  --resource-group rg-redis-workshop \
  --location eastus \
  --sku Standard_LRS

# 2. Get storage account connection string
STORAGE_CONN=$(az storage account show-connection-string \
  --name redismigration \
  --resource-group rg-redis-workshop \
  --query connectionString -o tsv)

# 3. Create container
az storage container create \
  --name redis-backup \
  --connection-string "$STORAGE_CONN"

# 4. Export from source Redis (if Azure Cache)
az redis export \
  --name source-redis-cache \
  --resource-group rg-source \
  --prefix backup- \
  --container redis-backup \
  --file-format rdb

# 5. Import to target Redis
az redis import \
  --name target-redis-cache \
  --resource-group rg-redis-workshop \
  --files "redis-backup/backup-*.rdb" \
  --file-format rdb
```

### Zero-Downtime Migration Strategy

**Architecture:**

```
[Application] → [Proxy/Router] → [Source Redis (read/write)]
                                → [Target Redis (write only)]
```

**Implementation using Redis Proxy:**

```javascript
// dual-write-proxy.js
const redis = require('redis');
const express = require('express');

const sourceClient = redis.createClient({
  socket: { host: 'source-redis.example.com', port: 6379 }
});

const targetClient = redis.createClient({
  socket: {
    host: process.env.AZURE_REDIS_HOST,
    port: 6380,
    tls: true
  },
  password: process.env.AZURE_REDIS_KEY
});

await sourceClient.connect();
await targetClient.connect();

// Dual-write function
async function dualWrite(key, value, ttl = null) {
  try {
    // Write to source (required for immediate reads)
    const sourcePromise = ttl 
      ? sourceClient.setEx(key, ttl, value)
      : sourceClient.set(key, value);
    
    // Write to target (async, non-blocking)
    const targetPromise = ttl
      ? targetClient.setEx(key, ttl, value).catch(err => console.error('Target write failed:', err))
      : targetClient.set(key, value).catch(err => console.error('Target write failed:', err));
    
    await sourcePromise;  // Wait for source
    // Don't wait for target
    
    return true;
  } catch (error) {
    console.error('Dual write error:', error);
    throw error;
  }
}

// Read from source only (during migration)
async function read(key) {
  return await sourceClient.get(key);
}

// After migration: gradual read migration
async function readWithFallback(key) {
  try {
    // Try target first
    const value = await targetClient.get(key);
    if (value !== null) return value;
    
    // Fallback to source
    return await sourceClient.get(key);
  } catch (error) {
    // If target fails, fallback to source
    return await sourceClient.get(key);
  }
}
```

**Migration Phases:**

```javascript
// Phase 1: Dual write (Day 1-3)
class MigrationPhase1 {
  async write(key, value, ttl) {
    await dualWrite(key, value, ttl);
  }
  
  async read(key) {
    return await sourceClient.get(key);
  }
}

// Phase 2: Dual write + percentage reads from target (Day 4-7)
class MigrationPhase2 {
  constructor(targetReadPercentage = 10) {
    this.targetReadPercentage = targetReadPercentage;
  }
  
  async write(key, value, ttl) {
    await dualWrite(key, value, ttl);
  }
  
  async read(key) {
    if (Math.random() * 100 < this.targetReadPercentage) {
      return await readWithFallback(key);
    }
    return await sourceClient.get(key);
  }
}

// Phase 3: Primary reads from target (Day 8-10)
class MigrationPhase3 {
  async write(key, value, ttl) {
    await dualWrite(key, value, ttl);
  }
  
  async read(key) {
    return await readWithFallback(key);
  }
}

// Phase 4: Target only (Day 11+)
class MigrationPhase4 {
  async write(key, value, ttl) {
    return ttl
      ? await targetClient.setEx(key, ttl, value)
      : await targetClient.set(key, value);
  }
  
  async read(key) {
    return await targetClient.get(key);
  }
}
```

### Migration Validation

**Validation Script:**

```python
#!/usr/bin/env python3
import redis
import sys
from collections import defaultdict

def validate_migration(source_config, target_config):
    """Comprehensive migration validation"""
    
    source = redis.Redis(**source_config)
    target = redis.Redis(**target_config)
    
    results = {
        'key_count': {},
        'mismatches': [],
        'missing_keys': [],
        'type_mismatches': [],
        'value_mismatches': []
    }
    
    # Count keys
    results['key_count']['source'] = source.dbsize()
    results['key_count']['target'] = target.dbsize()
    
    print(f"Source keys: {results['key_count']['source']}")
    print(f"Target keys: {results['key_count']['target']}")
    
    # Sample validation (check random keys)
    cursor = 0
    checked = 0
    max_check = 10000
    
    while cursor != 0 or checked == 0:
        cursor, keys = source.scan(cursor, count=100)
        
        for key in keys:
            if checked >= max_check:
                break
                
            checked += 1
            
            # Check if key exists in target
            if not target.exists(key):
                results['missing_keys'].append(key.decode())
                continue
            
            # Check key type
            source_type = source.type(key).decode()
            target_type = target.type(key).decode()
            
            if source_type != target_type:
                results['type_mismatches'].append({
                    'key': key.decode(),
                    'source_type': source_type,
                    'target_type': target_type
                })
                continue
            
            # Check value (for strings only, to keep it simple)
            if source_type == 'string':
                source_value = source.get(key)
                target_value = target.get(key)
                
                if source_value != target_value:
                    results['value_mismatches'].append({
                        'key': key.decode(),
                        'source_value': source_value[:100],  # Truncate
                        'target_value': target_value[:100]
                    })
        
        if checked >= max_check:
            break
    
    # Print results
    print(f"\nValidation Results (checked {checked} keys):")
    print(f"Missing keys: {len(results['missing_keys'])}")
    print(f"Type mismatches: {len(results['type_mismatches'])}")
    print(f"Value mismatches: {len(results['value_mismatches'])}")
    
    if results['missing_keys']:
        print("\nFirst 10 missing keys:")
        for key in results['missing_keys'][:10]:
            print(f"  - {key}")
    
    return results

# Run validation
source_config = {
    'host': 'source-redis.example.com',
    'port': 6379,
    'decode_responses': False
}

target_config = {
    'host': f"{os.environ['AZURE_REDIS_NAME']}.redis.cache.windows.net",
    'port': 6380,
    'password': os.environ['AZURE_REDIS_KEY'],
    'ssl': True,
    'decode_responses': False
}

results = validate_migration(source_config, target_config)

# Exit with error if validation failed
if results['missing_keys'] or results['type_mismatches'] or results['value_mismatches']:
    sys.exit(1)

print("\n✅ Validation passed!")
```

### Post-Migration Tasks

**1. Update Application Configuration:**

```bash
# Update connection strings in Azure App Service
az webapp config appsettings set \
  --name my-web-app \
  --resource-group rg-redis-workshop \
  --settings \
    REDIS_HOST="${AZURE_REDIS_NAME}.redis.cache.windows.net" \
    REDIS_PORT="6380" \
    REDIS_PASSWORD="${AZURE_REDIS_KEY}" \
    REDIS_SSL="true"
```

**2. Monitor Post-Migration:**

```bash
# Watch key metrics
watch -n 5 'az monitor metrics list \
  --resource ${REDIS_ID} \
  --metric serverLoad connectedclients \
  --interval PT1M \
  --aggregation Average \
  --output table'
```

**3. Performance Comparison:**

```python
def compare_performance(source_config, target_config, operations=1000):
    """Compare performance between source and target"""
    import time
    
    source = redis.Redis(**source_config)
    target = redis.Redis(**target_config)
    
    results = {'source': {}, 'target': {}}
    
    for name, client in [('source', source), ('target', target)]:
        # Test SET operations
        start = time.time()
        for i in range(operations):
            client.set(f'perf_test:{i}', f'value{i}')
        set_time = time.time() - start
        
        # Test GET operations
        start = time.time()
        for i in range(operations):
            client.get(f'perf_test:{i}')
        get_time = time.time() - start
        
        # Cleanup
        for i in range(operations):
            client.delete(f'perf_test:{i}')
        
        results[name] = {
            'set_ops_per_sec': operations / set_time,
            'get_ops_per_sec': operations / get_time,
            'avg_set_latency_ms': (set_time / operations) * 1000,
            'avg_get_latency_ms': (get_time / operations) * 1000
        }
    
    print("Performance Comparison:")
    print(f"\nSource Redis:")
    print(f"  SET: {results['source']['set_ops_per_sec']:.0f} ops/sec")
    print(f"  GET: {results['source']['get_ops_per_sec']:.0f} ops/sec")
    print(f"\nTarget Redis (Azure):")
    print(f"  SET: {results['target']['set_ops_per_sec']:.0f} ops/sec")
    print(f"  GET: {results['target']['get_ops_per_sec']:.0f} ops/sec")
    
    return results
```

## Hands-On Exercises

### Exercise 1: Diagnose Performance Issues

1. Connect to your Redis instance
2. Run `INFO` commands to gather metrics
3. Identify the slowest commands using `SLOWLOG`
4. Analyze memory usage with `MEMORY DOCTOR`
5. Create a diagnostic report

### Exercise 2: Simulate and Resolve Issues

1. Generate high load to trigger alerts
2. Diagnose using monitoring tools
3. Implement solutions (scale up, optimize queries)
4. Verify resolution

### Exercise 3: Perform a Test Migration

1. Set up a source Redis with sample data
2. Create target Azure Cache for Redis
3. Use RIOT to migrate data
4. Validate migration success
5. Measure performance difference

### Exercise 4: Implement Zero-Downtime Migration

1. Set up dual-write proxy
2. Migrate existing data
3. Gradually shift reads to target
4. Complete cutover
5. Decommission source

## Best Practices

### Troubleshooting

1. **Always gather context first** - Use INFO commands before making changes
2. **Monitor during changes** - Watch metrics when making configuration changes
3. **Document everything** - Keep a log of issues and resolutions
4. **Test in non-production** - Validate fixes in staging environment

### Migration

1. **Plan thoroughly** - Assess data size, patterns, and downtime tolerance
2. **Test the migration** - Always do a dry run first
3. **Validate extensively** - Check key counts, data integrity, performance
4. **Have a rollback plan** - Keep source Redis until confident in migration
5. **Monitor closely** - Watch metrics for 24-48 hours post-migration

## Summary

In this module, you've learned to:

- ✅ Diagnose common Azure Cache for Redis issues
- ✅ Use Redis diagnostic commands effectively
- ✅ Analyze performance problems systematically
- ✅ Plan and execute Redis migrations
- ✅ Use RIOT for efficient data migration
- ✅ Implement zero-downtime migration strategies
- ✅ Validate migration success comprehensively

## Additional Resources

- [Azure Cache for Redis troubleshooting](https://docs.microsoft.com/azure/azure-cache-for-redis/cache-troubleshoot-client)
- [RIOT documentation](https://redis.io/docs/stack/riot/)
- [Redis commands reference](https://redis.io/commands)
- [Migration best practices](https://docs.microsoft.com/azure/azure-cache-for-redis/cache-how-to-import-export-data)

## Next Steps

Continue to **Module 9: Advanced Features** to explore Redis Stack capabilities including JSON, Search, and Time Series.

---

**Lab Status:** ✅ Complete  
**Last Updated:** November 2025  
**Version:** 2.0

<!-- ✏️ EDIT YOUR CONTENT ABOVE THIS LINE ✏️ -->

---

<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->

## Navigation

| Previous | Home | Next |
|----------|:----:|------:|
| [⬅️ Previous: Monitoring & Alerts Lab](../module-09-monitoring--alerts-lab/README.md) | [🏠 Workshop Home](../README.md) | [Next: Advanced Features ➡️](../module-11-advanced-features/README.md) |

---

*Module 10 of 11*
