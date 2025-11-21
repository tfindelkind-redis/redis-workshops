---
title: Cost Optimization & Operational Excellence
description: ''
duration: 45 minutes
difficulty: intermediate
type: hands-on
---

<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->

| Previous | Home | Next |
|----------|:----:|------:|
| [⬅️ Previous: Reliability & Security Deep Dive](../module-04-reliability--security-deep-dive/README.md) | [🏠 Workshop Home](../README.md) | [Next: Performance Efficiency & Data Modeling ➡️](../module-06-performance-efficiency--data-modeling/README.md) |

[🏠 Workshop Home](../README.md) > **Module 5 of 11**

### Deploy Redis for Developers - Azure Managed Redis

**Progress:** `████░░░░░░` 45%

---

<!-- ✏️ EDIT YOUR CONTENT BELOW THIS LINE ✏️ -->

# Module 4B: Cost Optimization & Operational Excellence
**Duration:** 45 minutes  
**Format:** WAF Deep Dive - Theory + Examples  
**Level:** Advanced

---

## Module Overview

**Objective:** Deep dive into Cost Optimization and Operational Excellence pillars for Redis deployments.

**Learning Outcomes:**
- Apply right-sizing formulas for Redis SKU selection
- Leverage reserved capacity for cost savings
- Implement Infrastructure as Code (Bicep/Terraform)
- Design monitoring and alerting strategies
- Build CI/CD pipelines for Redis deployments
- Optimize connection pooling and TTL management

**Prerequisites:**
- Modules 1-4A completed
- Basic understanding of DevOps practices
- Familiarity with IaC concepts

---

## Timing Breakdown

| Section | Duration | Type |
|---------|----------|------|
| Cost Optimization Strategies | 20 min | Theory + Calculations |
| Infrastructure as Code | 12 min | Examples |
| Monitoring & Observability | 8 min | Implementation |
| Operational Best Practices | 5 min | Guidelines |
| **Total** | **45 min** | |

---

## COST OPTIMIZATION PILLAR

## Section 1: Right-Sizing (8 minutes)

### 1.1 Memory Calculation Formula

**Working Set Calculation:**
```
Required Memory = (Working Set × Safety Factor) / Cache Hit Rate

Where:
- Working Set: Active data size in memory
- Safety Factor: 1.3-1.5 (30-50% headroom)
- Cache Hit Rate: Target percentage (90-95%)

Example 1: E-commerce Product Catalog
- Working Set: 20 GB (all active products)
- Safety Factor: 1.4 (40% headroom for peaks)
- Cache Hit Rate: 92%
→ Required: (20 × 1.4) / 0.92 = 30.4 GB
→ Recommended SKU: B50 (51GB) or M50 (50GB)

Example 2: Session Storage
- Concurrent Users: 50,000
- Session Size: 5 KB per user
- Working Set: 50,000 × 5KB = 250 MB
- Safety Factor: 1.5 (growth buffer)
- Cache Hit Rate: 98% (sessions always in cache)
→ Required: (0.25 × 1.5) / 0.98 = 0.38 GB
→ Recommended SKU: B1 (1GB) with room to grow
```

**Connection Calculation:**
```
Required Connections = (App Instances × Connections per Instance)

Example:
- App Service instances: 10
- Connection pool size: 50 per instance
→ Required: 10 × 50 = 500 connections
→ SKU requirement: B3+ (3,000 max connections)

Rule of thumb: Use <80% of max connections for headroom
```

---

### 1.2 SKU Selection Decision Tree (5 minutes)

**Decision Framework:**
```
Start: What's your primary workload characteristic?

├─ Memory-intensive (large working set)?
│  ├─ >500GB needed?
│  │  └─ Consider: A-series (Flash) for cost savings
│  └─ <500GB?
│     └─ Consider: M-series if memory is primary concern
│
├─ CPU-intensive (complex operations, many connections)?
│  └─ Consider: X-series (high vCPU count)
│
└─ Balanced workload (general caching)?
   └─ Consider: B-series (best value)

Then evaluate:
├─ Production workload? → Add zone redundancy
├─ Global users? → Consider Active-Active
└─ Budget constrained? → Start smaller, scale up
```

**Cost Comparison (Monthly, Pay-as-You-Go):**
```
Small Workload (3-10GB):
├─ B3 (3GB):    ~$120/month  ← Best value
├─ X3 (3GB):    ~$300/month  (4x CPU vs B3)
└─ M10 (12GB):  ~$550/month  (4x memory vs B3)

Medium Workload (50-100GB):
├─ B50 (51GB):  ~$500/month  ← Best value
├─ M50 (50GB):  ~$750/month  (less CPU)
├─ X50 (61GB):  ~$1,200/month (lots of CPU)
└─ A250 (256GB): ~$1,500/month (if using Flash)

Large Workload (250-500GB):
├─ B250 (256GB):  ~$2,000/month ← Best value
├─ M250 (256GB):  ~$4,000/month (more memory focus)
├─ A250 (256GB):  ~$1,500/month ← Cheapest if Flash works
└─ X350 (360GB):  ~$5,000/month (extreme CPU)

Rule: Start with B-series unless specific need identified
```

---

### 1.3 Reserved Capacity Savings (7 minutes)

**Commitment Tiers:**
```
Pay-as-You-Go (baseline):    100% cost
1-Year Reserved:              76% cost (24% savings)
3-Year Reserved:              52% cost (48% savings)

Example: B50 SKU
├─ Pay-as-You-Go: $500/month = $6,000/year
├─ 1-Year Reserved: $380/month = $4,560/year (save $1,440)
└─ 3-Year Reserved: $260/month = $3,120/year (save $2,880)

Over 3 years:
├─ Pay-as-You-Go: $18,000
├─ 1-Year (renewed): ~$13,680 (save $4,320)
└─ 3-Year: $9,360 (save $8,640 = 48%)
```

**When to Use Reserved Capacity:**
```
✅ Good Candidates:
├─ Production workloads (stable capacity)
├─ Predictable usage patterns
├─ Business committed to Redis long-term
├─ Cost optimization is priority
└─ Low risk of major architecture changes

❌ Not Recommended:
├─ Development/test environments
├─ Proof-of-concept projects
├─ Highly variable workloads
├─ Uncertain capacity requirements
└─ Potential migration to different service
```

**Purchase Strategy:**
```bash
# View available reserved capacity SKUs
az redis reserved-capacity list-skus \
  --location eastus \
  --sku-family B \
  --output table

# Purchase 1-year reserved capacity
az redis reserved-capacity purchase \
  --name "Redis-B50-Reserved-1Year" \
  --resource-group myRG \
  --sku B50 \
  --term P1Y \
  --quantity 1
```

**Mixed Strategy (Optimal):**
```
Total Capacity Needed: 100 GB

Baseline (reserved): 80 GB → B100 (3-year reserved)
├─ Cost: ~$800/month
└─ Handles: Normal traffic (80% of time)

Burst (pay-as-you-go): +20 GB → Scale to B100 + B20
├─ Additional cost: ~$200/month when needed
└─ Handles: Peak traffic (20% of time)

Total annual cost: 
($800 × 12) + ($200 × 2.4) = $9,600 + $480 = $10,080

vs. Full capacity reserved:
B100 + B20 reserved = ~$1,000 × 12 = $12,000

Savings: $1,920/year with flexible scaling
```

---

## Section 2: Cost Optimization Techniques (5 minutes)

### 2.1 TTL Management

**Automatic Expiration:**
```python
# Set TTL on all cache entries
redis.setex('product:123', 3600, product_data)  # 1 hour
redis.setex('session:abc', 1800, session_data)  # 30 minutes

# TTL Strategy by Data Type
cache_ttls = {
    'product_catalog': 3600,      # 1 hour
    'user_profile': 1800,         # 30 minutes
    'session': 900,               # 15 minutes
    'api_response': 300,          # 5 minutes
    'trending_items': 60,         # 1 minute
}

# Check remaining TTL
ttl = redis.ttl('product:123')
if ttl == -1:  # No expiration set!
    redis.expire('product:123', 3600)
```

**Eviction Policies:**
```bash
# Configure eviction policy
az redis update \
  --name myRedis \
  --resource-group myRG \
  --set redisConfiguration.maxmemory-policy=allkeys-lru

# Available policies:
# allkeys-lru: Evict least recently used (recommended for cache)
# allkeys-lfu: Evict least frequently used
# volatile-lru: Evict LRU among keys with TTL
# volatile-ttl: Evict keys closest to expiration
# noeviction: Return errors when memory full (not recommended)
```

---

### 2.2 Connection Pooling

**Cost Impact:**
- Each connection consumes memory (~30KB)
- Too many connections = wasted memory
- Connection churn = CPU overhead

**Optimal Configuration:**
```python
import redis

# Create connection pool (reuse connections)
pool = redis.ConnectionPool(
    host='myredis.redis.cache.windows.net',
    port=6380,
    max_connections=50,        # Limit per app instance
    socket_keepalive=True,     # Keep connections alive
    socket_connect_timeout=5,  # 5 second timeout
    retry_on_timeout=True,
    health_check_interval=30,  # Check every 30 sec
    ssl=True
)

# Reuse pool across application
r = redis.Redis(connection_pool=pool)

# Sizing formula:
# Pool size = (Expected concurrent requests) / (Request duration in seconds)
# Example: 100 concurrent requests, 0.01s duration
# Pool size = 100 / 0.01 = 1000 connections
# But: Add safety factor → 1000 × 0.1 = 100 connections
```

---

### 2.3 Data Compression

**When to Compress:**
```python
import json
import gzip

def set_compressed(redis_client, key, data, ttl=3600):
    """Store compressed data in Redis"""
    # Serialize
    json_str = json.dumps(data)
    
    # Compress (if > 1KB)
    if len(json_str) > 1024:
        compressed = gzip.compress(json_str.encode('utf-8'))
        redis_client.setex(f"{key}:gz", ttl, compressed)
    else:
        redis_client.setex(key, ttl, json_str)

# Savings example:
# Original: 100KB JSON → 10KB compressed (90% savings)
# 1000 such keys: 100MB → 10MB (90MB savings)
```

**Cost Benefit Analysis:**
```
Trade-off:
├─ Pros: 70-90% memory reduction for text data
├─ Cons: CPU overhead for compression/decompression
└─ Decision: Compress if memory-constrained, data >1KB

When to use:
✅ Large JSON objects (product catalogs)
✅ HTML fragments
✅ Serialized data structures
❌ Small values (<1KB overhead not worth it)
❌ Already compressed (images, videos)
```

---

## OPERATIONAL EXCELLENCE PILLAR

## Section 3: Infrastructure as Code (12 minutes)

### 3.1 Bicep Template (6 minutes)

**Complete Redis Deployment:**
```bicep
// Parameters
param location string = resourceGroup().location
param redisName string
param redisSku string = 'Enterprise'
param redisFamily string = 'E'
param redisCapacity int = 10
param enableZoneRedundancy bool = true

// Virtual Network
resource vnet 'Microsoft.Network/virtualNetworks@2023-04-01' = {
  name: '${redisName}-vnet'
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: ['10.0.0.0/16']
    }
    subnets: [
      {
        name: 'dataSubnet'
        properties: {
          addressPrefix: '10.0.2.0/24'
          privateEndpointNetworkPolicies: 'Disabled'
        }
      }
    ]
  }
}

// Redis Cache
resource redis 'Microsoft.Cache/redis@2023-08-01' = {
  name: redisName
  location: location
  zones: enableZoneRedundancy ? ['1', '2', '3'] : []
  properties: {
    sku: {
      name: redisSku
      family: redisFamily
      capacity: redisCapacity
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
    publicNetworkAccess: 'Disabled'
    redisConfiguration: {
      'maxmemory-policy': 'allkeys-lru'
      'rdb-backup-enabled': 'true'
      'rdb-backup-frequency': '60'
      'aof-backup-enabled': 'true'
    }
    replicasPerPrimary: 2
  }
}

// Private Endpoint
resource privateEndpoint 'Microsoft.Network/privateEndpoints@2023-04-01' = {
  name: '${redisName}-pe'
  location: location
  properties: {
    subnet: {
      id: vnet.properties.subnets[0].id
    }
    privateLinkServiceConnections: [
      {
        name: '${redisName}-plsc'
        properties: {
          privateLinkServiceId: redis.id
          groupIds: ['redisCache']
        }
      }
    ]
  }
}

// Private DNS Zone
resource privateDnsZone 'Microsoft.Network/privateDnsZones@2020-06-01' = {
  name: 'privatelink.redis.cache.windows.net'
  location: 'global'
}

resource dnsZoneLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = {
  parent: privateDnsZone
  name: '${redisName}-link'
  location: 'global'
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: vnet.id
    }
  }
}

// Diagnostic Settings
resource diagnosticSettings 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: '${redisName}-diag'
  scope: redis
  properties: {
    workspaceId: logAnalyticsWorkspace.id
    logs: [
      {
        category: 'ConnectedClientList'
        enabled: true
      }
    ]
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
      }
    ]
  }
}

// Log Analytics Workspace
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${redisName}-logs'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// Outputs
output redisId string = redis.id
output redisHostName string = redis.properties.hostName
output privateDnsZoneId string = privateDnsZone.id
```

**Deploy:**
```bash
az deployment group create \
  --resource-group myRG \
  --template-file redis.bicep \
  --parameters redisName=myProdRedis
```

---

### 3.2 Terraform Alternative (6 minutes)

**Complete Configuration:**
```hcl
# Variables
variable "redis_name" {
  type = string
}

variable "location" {
  type    = string
  default = "eastus"
}

variable "redis_sku" {
  type    = string
  default = "Premium"
}

variable "redis_capacity" {
  type    = number
  default = 3
}

# Resource Group
resource "azurerm_resource_group" "rg" {
  name     = "${var.redis_name}-rg"
  location = var.location
}

# Virtual Network
resource "azurerm_virtual_network" "vnet" {
  name                = "${var.redis_name}-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_subnet" "data_subnet" {
  name                 = "dataSubnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.2.0/24"]
  
  enforce_private_link_endpoint_network_policies = true
}

# Redis Cache
resource "azurerm_redis_cache" "redis" {
  name                = var.redis_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  capacity            = var.redis_capacity
  family              = "P"
  sku_name            = var.redis_sku
  
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"
  public_network_access_enabled = false
  
  zones = ["1", "2", "3"]
  
  redis_configuration {
    maxmemory_policy = "allkeys-lru"
    rdb_backup_enabled = true
    rdb_backup_frequency = 60
    rdb_storage_connection_string = azurerm_storage_account.backup.primary_connection_string
  }
  
  tags = {
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}

# Storage Account for Backups
resource "azurerm_storage_account" "backup" {
  name                     = "${var.redis_name}backup"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "GRS"
}

# Private Endpoint
resource "azurerm_private_endpoint" "redis_pe" {
  name                = "${var.redis_name}-pe"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  subnet_id           = azurerm_subnet.data_subnet.id

  private_service_connection {
    name                           = "${var.redis_name}-plsc"
    private_connection_resource_id = azurerm_redis_cache.redis.id
    is_manual_connection          = false
    subresource_names             = ["redisCache"]
  }
}

# Private DNS Zone
resource "azurerm_private_dns_zone" "redis_dns" {
  name                = "privatelink.redis.cache.windows.net"
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_private_dns_zone_virtual_network_link" "dns_link" {
  name                  = "${var.redis_name}-link"
  resource_group_name   = azurerm_resource_group.rg.name
  private_dns_zone_name = azurerm_private_dns_zone.redis_dns.name
  virtual_network_id    = azurerm_virtual_network.vnet.id
}

# Outputs
output "redis_id" {
  value = azurerm_redis_cache.redis.id
}

output "redis_hostname" {
  value = azurerm_redis_cache.redis.hostname
}

output "redis_primary_key" {
  value     = azurerm_redis_cache.redis.primary_access_key
  sensitive = true
}
```

**Deploy:**
```bash
terraform init
terraform plan -var="redis_name=myProdRedis"
terraform apply -var="redis_name=myProdRedis"
```

---

## Section 4: Monitoring & Observability (8 minutes)

### 4.1 Key Metrics to Monitor (4 minutes)

**Tier 1: Critical Alerts (Page On-Call)**
```
Memory Usage:
├─ Metric: used_memory_percentage
├─ Alert: >85%
├─ Action: Scale up or investigate memory leak

CPU Usage:
├─ Metric: percentProcessorTime
├─ Alert: >90% for 5+ minutes
├─ Action: Scale up or optimize queries

Connection Count:
├─ Metric: connectedclients
├─ Alert: >80% of max_connections
├─ Action: Check connection pooling

Cache Hit Rate:
├─ Metric: cachehitrate
├─ Alert: <85%
├─ Action: Review caching strategy

Server Load:
├─ Metric: serverLoad
├─ Alert: >80%
├─ Action: Scale up or optimize
```

**Tier 2: Warning Alerts (Investigate)**
```
Evicted Keys:
├─ Metric: evictedkeys
├─ Alert: >1000/min
├─ Action: Increase memory or adjust TTLs

Cache Misses:
├─ Metric: cachemisses
├─ Alert: Increasing trend
├─ Action: Review cache warming

Operation Latency:
├─ Metric: commands_per_sec
├─ Alert: p99 latency >10ms
├─ Action: Investigate slow commands
```

**Tier 3: Informational (Dashboard Only)**
```
- Total operations per second
- Network bandwidth usage
- Number of keys
- Expired keys per minute
- Failed connections
```

---

### 4.2 Alert Rules Configuration (4 minutes)

**Azure CLI:**
```bash
# Memory alert
az monitor metrics alert create \
  --name RedisHighMemory \
  --resource-group myRG \
  --scopes $(az redis show --name myRedis --resource-group myRG --query id -o tsv) \
  --condition "avg used_memory_percentage > 85" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action-group MyActionGroup \
  --description "Redis memory usage above 85%"

# CPU alert
az monitor metrics alert create \
  --name RedisHighCPU \
  --resource-group myRG \
  --scopes $(az redis show --name myRedis --resource-group myRG --query id -o tsv) \
  --condition "avg percentProcessorTime > 90" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action-group MyActionGroup

# Cache hit rate alert
az monitor metrics alert create \
  --name RedisLowCacheHitRate \
  --resource-group myRG \
  --scopes $(az redis show --name myRedis --resource-group myRG --query id -o tsv) \
  --condition "avg cachehitrate < 85" \
  --window-size 15m \
  --evaluation-frequency 5m \
  --action-group MyActionGroup
```

**Action Group:**
```bash
az monitor action-group create \
  --name MyActionGroup \
  --resource-group myRG \
  --short-name RedisAlert \
  --email-receiver name=DevOps email=devops@example.com \
  --sms-receiver name=OnCall phone=+1234567890
```

---

## Section 5: CI/CD Pipeline (5 minutes)

**GitHub Actions Example:**
```yaml
name: Deploy Redis Infrastructure

on:
  push:
    branches: [main]
    paths:
      - 'infrastructure/redis/**'

env:
  AZURE_RESOURCE_GROUP: myRG
  LOCATION: eastus

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Validate Bicep
        run: |
          az bicep build --file ./infrastructure/redis/main.bicep

      - name: Preview Changes (What-If)
        run: |
          az deployment group what-if \
            --resource-group ${{ env.AZURE_RESOURCE_GROUP }} \
            --template-file ./infrastructure/redis/main.bicep \
            --parameters @./infrastructure/redis/parameters.prod.json

      - name: Deploy Infrastructure
        run: |
          az deployment group create \
            --resource-group ${{ env.AZURE_RESOURCE_GROUP }} \
            --template-file ./infrastructure/redis/main.bicep \
            --parameters @./infrastructure/redis/parameters.prod.json \
            --mode Incremental

      - name: Run Tests
        run: |
          # Test Redis connectivity
          python ./tests/test_redis_connection.py
```

---

## Key Takeaways

### ✅ Cost Optimization Must-Dos:
1. Right-size using formula: (Working Set × 1.4) / Hit Rate
2. Use reserved capacity for stable workloads (48% savings)
3. Implement TTLs on all cached data
4. Use connection pooling (50 connections per app instance)
5. Monitor and optimize regularly

### ✅ Operational Excellence Must-Dos:
1. Use IaC (Bicep or Terraform) for all deployments
2. Implement comprehensive monitoring (memory, CPU, connections)
3. Set up alert rules for critical metrics
4. Build CI/CD pipeline for infrastructure changes
5. Document runbooks for common scenarios

### 🎯 Skills Acquired:
- ✅ Calculate right-size Redis capacity
- ✅ Evaluate reserved capacity ROI
- ✅ Write Bicep/Terraform templates
- ✅ Configure monitoring and alerts
- ✅ Build infrastructure CI/CD pipeline

---

## Next Module Preview

**Module 4C: Performance Efficiency & Data Modeling (60 minutes)**

Preview:
- Caching patterns (cache-aside, write-through, write-behind)
- Data modeling best practices
- Key naming conventions
- Connection pooling deep dive
- Performance tuning techniques

---

**Module Status:** ✅ Complete  
**Last Updated:** November 2025  
**Version:** 2.0

<!-- ✏️ EDIT YOUR CONTENT ABOVE THIS LINE ✏️ -->

---

<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->

## Navigation

| Previous | Home | Next |
|----------|:----:|------:|
| [⬅️ Previous: Reliability & Security Deep Dive](../module-04-reliability--security-deep-dive/README.md) | [🏠 Workshop Home](../README.md) | [Next: Performance Efficiency & Data Modeling ➡️](../module-06-performance-efficiency--data-modeling/README.md) |

---

*Module 5 of 11*
