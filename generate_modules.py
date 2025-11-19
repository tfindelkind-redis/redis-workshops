#!/usr/bin/env python3
"""
Generate all workshop module checklists for 2-Day Deep Dive Workshop
"""

# Module 2: Azure Redis Architecture
module_02 = """# Module 2: Azure Managed Redis Architecture
**Duration:** 60 minutes  
**Format:** Theory + Architecture Review  
**Level:** Intermediate

---

## Module Overview

**Objective:** Understand Azure Managed Redis offerings, SKU selection, architecture patterns, and security fundamentals.

**Learning Outcomes:**
- Understand Azure Managed Redis vs OSS Redis
- Select appropriate SKU based on requirements
- Design clustering and sharding strategies
- Configure high availability and geo-replication
- Implement authentication and network security

**Prerequisites:**
- Module 1: Redis Fundamentals completed
- Azure basics (resource groups, networking)
- Understanding of cloud pricing models

---

## Timing Breakdown

| Section | Duration | Type |
|---------|----------|------|
| AMR Overview | 12 min | Theory |
| SKU Selection | 18 min | Theory + Decision Framework |
| Enterprise Architecture | 20 min | Architecture Patterns |
| Auth & Security | 10 min | Configuration |
| **Total** | **60 min** | |

---

## Section 1: Azure Managed Redis Overview (12 minutes)

### 1.1 What is Azure Managed Redis? (5 minutes)

**Key Points:**

- **Fully managed** Redis service on Azure
- Based on **Redis Enterprise** (not OSS Redis)
- Microsoft handles: infrastructure, patching, monitoring, scaling
- **Enterprise features** included: Active-Active geo-replication, Redis modules, 99.999% SLA

**vs OSS Redis:**

| Feature | OSS Redis | Azure Managed Redis |
|---------|-----------|---------------------|
| Management | Self-managed | Fully managed |
| HA/DR | Manual setup | Built-in zone redundancy |
| Geo-replication | Manual | Active-Active with CRDTs |
| Modules | Manual install | Pre-installed (RediSearch, RedisJSON, etc) |
| SLA | None | Up to 99.999% |
| Scaling | Manual | Automated |

**Benefits:**
- Reduced operational overhead
- Enterprise-grade reliability
- Integrated with Azure ecosystem (VNET, Entra ID, Monitor)
- Compliance certifications (HIPAA, PCI DSS, SOC 2)

---

### 1.2 Service Tiers (4 minutes)

**Overview:**
- All tiers support Redis 6.x and 7.x
- All include persistence (RDB + AOF)
- All support clustering (except smallest SKUs)

**Key Capabilities:**
- **Memory Optimized:** Maximum memory capacity
- **Balanced:** Good mix of memory, CPU, network
- **Compute Optimized:** High CPU for complex operations
- **Flash Optimized:** Redis on Flash (NVMe + RAM)

---

### 1.3 When to Use Azure Managed Redis (3 minutes)

**Ideal Use Cases:**
- Application caching (web, API)
- Session storage across multiple app servers
- Real-time analytics and leaderboards
- Message queues and pub/sub
- Rate limiting and API throttling

**Not Ideal For:**
- Primary database (use Azure Cosmos DB, SQL Database)
- Long-term archival (use Azure Storage)
- Complex relational queries (use SQL Database)
- Large binary files >100MB per key

---

## Section 2: SKU Selection (18 minutes)

### 2.1 Memory Optimized (M-series) (5 minutes)

**Specifications:**

| SKU | Memory | vCPUs | Connections | Throughput |
|-----|--------|-------|-------------|------------|
| M10 | 12 GB | 2 | 10,000 | 100 MB/s |
| M20 | 25 GB | 2 | 10,000 | 200 MB/s |
| M50 | 50 GB | 4 | 20,000 | 500 MB/s |
| M100 | 100 GB | 8 | 40,000 | 1 GB/s |
| M250 | 256 GB | 32 | 160,000 | 2.5 GB/s |
| M500 | 512 GB | 64 | 320,000 | 5 GB/s |
| M1000 | 1,024 GB | 128 | 640,000 | 10 GB/s |
| M2000 | 1,920 GB | 256 | 1,280,000 | 20 GB/s |

**Best For:**
- Large datasets requiring significant memory
- High cache hit rate scenarios
- Session storage for thousands of concurrent users
- Applications with unpredictable memory growth

**Pricing:** ~$0.75-$40/hour depending on SKU

---

### 2.2 Balanced (B-series) (5 minutes)

**Specifications:**

| SKU | Memory | vCPUs | Connections | Throughput |
|-----|--------|-------|-------------|------------|
| B0 | 0.5 GB | 2 | 256 | 10 MB/s |
| B1 | 1 GB | 2 | 1,000 | 20 MB/s |
| B3 | 3 GB | 2 | 3,000 | 100 MB/s |
| B5 | 5 GB | 2 | 5,000 | 200 MB/s |
| B10 | 10 GB | 4 | 10,000 | 400 MB/s |
| B20 | 20 GB | 4 | 20,000 | 800 MB/s |
| B50 | 51 GB | 8 | 40,000 | 2 GB/s |
| B100 | 102 GB | 16 | 80,000 | 4 GB/s |
| B250 | 256 GB | 32 | 160,000 | 10 GB/s |
| B500 | 512 GB | 64 | 320,000 | 20 GB/s |
| B1000 | 960 GB | 128 | 640,000 | 40 GB/s |

**Important Notes:**
- **B0/B1:** No clustering, no Active-Active, no modules
- **B3+:** Full enterprise features available

**Best For:**
- General-purpose caching
- Development and testing
- Small to medium production workloads
- Cost-conscious deployments

**Pricing:** ~$0.05-$15/hour depending on SKU

---

### 2.3 Compute Optimized (X-series) (4 minutes)

**Specifications:**

| SKU | Memory | vCPUs | Connections | Throughput |
|-----|--------|-------|-------------|------------|
| X3 | 3 GB | 4 | 5,000 | 200 MB/s |
| X5 | 6 GB | 8 | 10,000 | 400 MB/s |
| X10 | 12 GB | 16 | 20,000 | 800 MB/s |
| X20 | 24 GB | 32 | 40,000 | 1.6 GB/s |
| X50 | 61 GB | 80 | 100,000 | 4 GB/s |
| X100 | 122 GB | 160 | 200,000 | 8 GB/s |
| X350 | 360 GB | 320 | 400,000 | 16 GB/s |
| X700 | 720 GB | 320 | 800,000 | 32 GB/s |

**Best For:**
- CPU-intensive operations (Lua scripts, complex queries)
- RediSearch with large indexes
- RedisJSON with deep document queries
- High connection counts
- Sorted set operations at scale

**Pricing:** ~$0.30-$25/hour depending on SKU

---

### 2.4 Flash Optimized (A-series) (4 minutes)

**Specifications:**

| SKU | Total Capacity | RAM | Flash (NVMe) | vCPUs |
|-----|----------------|-----|--------------|-------|
| A250 | 256 GB | 51 GB | 205 GB | 64 |
| A500 | 512 GB | 102 GB | 410 GB | 128 |
| A1500 | 1,536 GB | 307 GB | 1,229 GB | 256 |
| A4500 | 4,723 GB | 945 GB | 3,778 GB | 320 |

**How It Works:**
- Hot data automatically kept in RAM
- Cold data spills to NVMe SSD
- Transparent to application (Redis API unchanged)
- 20-80% of data typically in RAM

**Best For:**
- Large datasets (TB scale)
- Cost optimization for infrequently accessed data
- Cold storage tier for multi-tier caching
- Cost-sensitive large-scale deployments

**Limitations:**
- **Limited module support:** No RedisJSON, RedisGraph, RedisTimeSeries
- **Only RediSearch** and RedisBloom supported
- No Active-Active geo-replication

**Pricing:** ~$2-$15/hour (significantly cheaper per GB than M-series)

---

## Section 3: Enterprise Architecture (20 minutes)

### 3.1 Clustering and Sharding (5 minutes)

**Clustering Overview:**
- Distribute data across multiple nodes
- Scale beyond single-node memory limits
- Horizontal scalability

**Sharding Strategy:**
- Hash slots: 16,384 slots total
- Key hashed to determine slot
- Slots distributed across shards

**Example:**
```bash
# Key goes to hash slot
CRC16("user:1000") % 16384 = slot 5432

# Shard assignment
Shard 1: slots 0-5461
Shard 2: slots 5462-10922
Shard 3: slots 10923-16383
```

**Key Naming for Clustering:**
```bash
# BAD: Different hash slots
user:1000
session:1000

# GOOD: Same hash slot using hash tags
{user:1000}:profile
{user:1000}:session

# {user:1000} portion determines the hash slot
```

**Cluster Configuration:**
- 1-10 shards supported
- Automatic rebalancing on scale
- Zero-downtime scaling

---

### 3.2 High Availability Patterns (5 minutes)

**Zone Redundancy:**
- Replicas in different availability zones
- Automatic failover (<2 minutes)
- SLA: 99.99% (4 nines)

**Active-Active Geo-Replication:**
- Multiple regions with read/write
- Conflict-free Replicated Data Types (CRDTs)
- SLA: 99.999% (5 nines)
- Latency: Local read/write, async replication

**Active-Passive Geo-Replication:**
- Primary region for writes
- Secondary region for reads or DR
- Planned failover or automatic

**Configuration:**
```bash
# Zone redundancy (single region)
az redis create \
  --resource-group myRG \
  --name myRedis \
  --location eastus \
  --sku Premium \
  --zones 1 2 3

# Active-Active (multi-region)
# Configured via Azure portal or ARM template
# Requires Enterprise tier
```

---

### 3.3 Persistence Strategies (5 minutes)

**RDB (Redis Database File):**
- Point-in-time snapshots
- Configurable intervals (15min, 60min)
- Lower disk I/O impact
- Faster restarts
- Potential data loss between snapshots

**AOF (Append-Only File):**
- Log of all write operations
- Better durability
- Options: everysec, always
- Larger file size
- Slower restarts

**Combined Strategy (Recommended):**
```bash
# RDB: Hourly snapshots for fast recovery
# AOF: Every second for minimal data loss

# Recovery preference
1. AOF if available (more recent)
2. RDB as fallback
```

**Configuration:**
```bash
# Via Azure CLI
az redis update \
  --name myRedis \
  --resource-group myRG \
  --set enableNonSslPort=false \
  --set redisConfiguration.rdb-backup-enabled=true \
  --set redisConfiguration.rdb-backup-frequency=60 \
  --set redisConfiguration.aof-backup-enabled=true
```

---

### 3.4 Reference Architectures (5 minutes)

**Architecture 1: Simple Web App Caching**
```
[Users] → [Azure Front Door]
           ↓
    [App Service (multiple instances)]
           ↓
    [Azure Managed Redis - Balanced SKU]
           ↓
    [Azure SQL Database]
```

**Architecture 2: Microservices with Session Sharing**
```
[API Gateway] → [Service Mesh]
                  ↓           ↓           ↓
            [Service A]  [Service B]  [Service C]
                  ↓           ↓           ↓
           [Azure Managed Redis - Memory SKU]
           (Session storage + inter-service cache)
```

**Architecture 3: Global E-commerce**
```
[Region 1]                    [Region 2]
  ↓                             ↓
[App Service]               [App Service]
  ↓                             ↓
[Redis Active-Active] ←→ [Redis Active-Active]
  ↓                             ↓
[Azure SQL]                 [Azure SQL]
(Primary)                   (Read Replica)
```

**Architecture 4: Real-time Analytics**
```
[IoT Devices] → [Event Hub]
                    ↓
            [Azure Functions]
                    ↓
     [Redis Sorted Sets + Streams]
                    ↓
          [Stream Analytics]
                    ↓
          [Power BI Dashboard]
```

---

## Section 4: Authentication & Security (10 minutes)

### 4.1 Authentication Methods (4 minutes)

**Method 1: Access Keys (Default)**
```python
import redis

r = redis.Redis(
    host='myredis.redis.cache.windows.net',
    port=6380,
    password='<primary-access-key>',
    ssl=True
)
```

**Pros:** Simple, works everywhere  
**Cons:** Less secure, no RBAC, difficult to rotate

---

**Method 2: Entra ID (Azure AD) - Recommended**
```python
from azure.identity import DefaultAzureCredential
import redis

# Get token
credential = DefaultAzureCredential()
token = credential.get_token("https://redis.azure.com/.default")

# Connect
r = redis.Redis(
    host='myredis.redis.cache.windows.net',
    port=6380,
    password=token.token,
    ssl=True,
    username='<object-id>'  # User/Service Principal OID
)
```

**RBAC Roles:**
- **Redis Cache Contributor:** Full access, manage cache
- **Data Owner:** Read/write/delete all keys
- **Data Contributor:** Read/write keys  
- **Data Reader:** Read-only access

**Pros:** Better security, RBAC, audit logs, no password rotation  
**Cons:** Slightly more complex setup

---

### 4.2 Network Security (6 minutes)

**Public Endpoint (Default):**
- Accessible from internet
- Firewall rules required
- TLS 1.2 encryption enforced

**VNET Integration:**
- Deploy into Azure VNET subnet
- Private IP address
- Network isolation
- NSG rules for access control

**Private Endpoint (Recommended):**
```bash
# Create private endpoint
az network private-endpoint create \
  --name myRedisEndpoint \
  --resource-group myRG \
  --vnet-name myVnet \
  --subnet mySubnet \
  --private-connection-resource-id <redis-resource-id> \
  --connection-name myConnection \
  --group-id redisCache
```

**Benefits:**
- Private IP in your VNET
- No public internet exposure
- Works with on-premises via VPN/ExpressRoute
- Private DNS for name resolution

**Private DNS Zone:**
```bash
# Create private DNS zone
az network private-dns zone create \
  --resource-group myRG \
  --name privatelink.redis.cache.windows.net

# Link to VNET
az network private-dns link vnet create \
  --resource-group myRG \
  --zone-name privatelink.redis.cache.windows.net \
  --name myDnsLink \
  --virtual-network myVnet \
  --registration-enabled false
```

**TLS Configuration:**
- TLS 1.2 enforced by default
- Non-SSL port (6379) disabled by default
- Certificate validation required

---

## Key Takeaways

### ✅ Must Remember:

1. **SKU Selection:**
   - B-series: General purpose, cost-effective
   - M-series: Maximum memory capacity
   - X-series: High CPU, many connections
   - A-series: Large datasets, cost optimization

2. **High Availability:**
   - Zone redundancy: 99.99% SLA
   - Active-Active: 99.999% SLA, multi-region writes
   - Combined RDB + AOF for persistence

3. **Security:**
   - Prefer Entra ID over access keys
   - Use Private Endpoints for production
   - TLS 1.2 enforced

4. **Clustering:**
   - Use hash tags for multi-key operations
   - 16,384 hash slots distributed across shards

### 🎯 Skills Acquired:

- ✅ Select appropriate Redis SKU
- ✅ Design HA and DR strategies
- ✅ Configure clustering and sharding
- ✅ Implement network security
- ✅ Choose authentication method

---

## Next Module Preview

**Module 3: Well-Architected Framework Overview (45 minutes)**

Preview:
- Introduction to Azure WAF
- 5 pillars overview
- Trade-offs and decision frameworks
- WAF assessment process

---

**Module Status:** ✅ Complete  
**Last Updated:** November 2025  
**Version:** 2.0
"""

# Write all module files
modules = {
    'module-02-azure-redis-architecture-checklist.md': module_02,
}

for filename, content in modules.items():
    with open(filename, 'w') as f:
        f.write(content)
    print(f"Created: {filename} ({len(content.splitlines())} lines)")

print("\nModule 2 creation complete!")
