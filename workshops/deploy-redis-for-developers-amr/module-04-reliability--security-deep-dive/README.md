---
title: Reliability & Security Deep Dive
description: 'Deep dive into Reliability and Security pillars of Azure Well-Architected Framework as applied to Redis deployments.'
duration: 60 minutes
difficulty: intermediate
type: hands-on
---

<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->

| Previous | Home | Next |
|----------|:----:|------:|
| [⬅️ Previous: Well-Architected Framework Overview](../module-03-well-architected-framework-overview/README.md) | [🏠 Workshop Home](../README.md) | [Next: Cost Optimization & Operational Excellence ➡️](../module-05-cost-optimization-operational-excellence/README.md) |

[🏠 Workshop Home](../README.md) > **Module 4 of 11**

### Deploy Redis for Developers - Azure Managed Redis

**Progress:** `███░░░░░░░` 36%

---

<!-- ✏️ EDIT YOUR CONTENT BELOW THIS LINE ✏️ -->

# Module 4A: Reliability & Security Deep Dive
**Duration:** 60 minutes  
**Format:** WAF Deep Dive - Theory + Scenarios -
**Level:** Advanced

---

## Module Overview

**Objective:** Deep dive into Reliability and Security pillars of Azure Well-Architected Framework as applied to Redis deployments.

**Learning Outcomes:**
- Design and configure high availability patterns
- Implement persistence strategies for data durability
- Plan and execute disaster recovery
- Configure network security layers
- Implement Entra ID authentication with RBAC
- Understand compliance requirements

**Prerequisites:**
- Modules 1-3 completed
- Understanding of Azure networking (VNET, subnets, Private Endpoints)
- Basic security concepts (encryption, authentication, authorization)

---

## Timing Breakdown

| Section | Duration | Type |
|---------|----------|------|
| High Availability | 12 min | Theory + Config |
| Persistence Strategies | 10 min | Theory + Examples |
| Disaster Recovery | 8 min | Planning |
| Network Security | 12 min | Implementation |
| Identity & Access | 10 min | Entra ID Setup |
| Compliance | 8 min | Requirements |
| **Total** | **60 min** | |

---

## RELIABILITY PILLAR

## Section 1: High Availability (12 minutes)

### 1.1 Zone Redundancy (5 minutes)

**What is Zone Redundancy?**
- Replicas deployed across multiple availability zones (AZs)
- Each AZ = separate physical datacenter in same region
- Automatic failover if one AZ fails
- **SLA: 99.99%** (52 minutes downtime/year)

**Architecture:**
```
Region: East US
├── AZ 1: Primary node
├── AZ 2: Replica 1
└── AZ 3: Replica 2

Failure scenario:
AZ 1 fails → Automatic promotion of AZ 2 replica
Failover time: <2 minutes
```

**Configuration (Azure CLI):**
```bash
az redis create   --resource-group myRG   --name myRedis   --location eastus   --sku Enterprise_E10   --zones 1 2 3   --replicas-per-primary 2
```

**Configuration (Bicep):**
```bicep
resource redis 'Microsoft.Cache/redis@2023-08-01' = {
  name: 'myRedis'
  location: 'eastus'
  zones: ['1', '2', '3']
  properties: {
    sku: {
      name: 'Enterprise'
      family: 'E'
      capacity: 10
    }
    replicasPerPrimary: 2
  }
}
```

**Benefits:**
- ✅ Protection against datacenter failures
- ✅ No application changes needed
- ✅ Transparent failover
- ✅ 99.99% SLA

**Trade-offs:**
- ⚠️ ~2x cost vs single-zone
- ⚠️ Slightly higher write latency (cross-AZ replication)

**Best Practices:**
- Enable for all production workloads
- Test failover scenarios
- Monitor failover events
- Configure application retry logic

---

### 1.2 Clustering for Scale (4 minutes)

**Cluster Architecture:**
```
Hash Slots: 16,384 total
├── Shard 1: Slots 0-5461 (Primary + 2 replicas)
├── Shard 2: Slots 5462-10922 (Primary + 2 replicas)
└── Shard 3: Slots 10923-16383 (Primary + 2 replicas)

Benefits:
- Scale beyond single-node limits
- Distribute load across nodes
- Parallel processing
```

**When to Use Clustering:**
- Memory requirements > single node capacity
- High throughput requirements (>100K ops/sec)
- Need horizontal scalability

**Hash Tags for Multi-Key Operations:**
```bash
# Without hash tags (different shards)
SET user:1000 "data"    # → Shard 1
SET session:1000 "data" # → Shard 2
# MGET user:1000 session:1000 → ERROR: CROSSSLOT

# With hash tags (same shard)
SET {user:1000}:profile "data"  # → Shard 1
SET {user:1000}:session "data"  # → Shard 1
# MGET {user:1000}:profile {user:1000}:session → SUCCESS
```

**Configuration:**
```bash
# Create clustered instance
az redis create   --resource-group myRG   --name myRedisCluster   --sku Enterprise_E20   --shard-count 3

# Scale shards later
az redis update   --name myRedisCluster   --resource-group myRG   --shard-count 6
```

---

### 1.3 Active-Active Geo-Replication (3 minutes)

**What is Active-Active?**
- Multiple regions, all accept writes
- Conflict-free Replicated Data Types (CRDTs)
- **SLA: 99.999%** (5 minutes downtime/year)
- Local read/write latency

**Architecture:**
```
Region 1 (East US)          Region 2 (West Europe)
├── Redis (Read/Write)  ←→  ├── Redis (Read/Write)
├── App Servers              ├── App Servers
└── Users (Americas)         └── Users (Europe)

Replication: Async, bidirectional
Latency: <1ms local, eventual consistency global
```

**Conflict Resolution (CRDTs):**
```
Example: Counter
User A (East US): INCR counter  # Local: 1
User B (West EU): INCR counter  # Local: 1
After sync: counter = 2 (not 1)

CRDTs ensure: Operations commute
Last-Write-Wins for simple values
```

**Use Cases:**
- Global applications (multi-region users)
- Maximum uptime requirements (5 nines SLA)
- Regional disaster recovery
- Latency-sensitive global apps

**Limitations:**
- Enterprise tier only
- Not all Redis commands supported with CRDTs
- Higher cost (2+ regions × 2x for zone redundancy)

---

## Section 2: Persistence Strategies (10 minutes)

### 2.1 RDB Snapshots (4 minutes)

**How RDB Works:**
```
1. Fork process (copy-on-write)
2. Child process writes snapshot to disk
3. Atomic rename when complete
4. Parent continues serving requests

Snapshot intervals:
- Every 15 minutes (default)
- Every 60 minutes (recommended for cache)
- On-demand via BGSAVE command
```

**Configuration:**
```bash
# Via Azure CLI
az redis update   --name myRedis   --resource-group myRG   --set redisConfiguration.rdb-backup-enabled=true   --set redisConfiguration.rdb-backup-frequency=60   --set redisConfiguration.rdb-storage-connection-string="<storage-account-connection>"
```

**Pros:**
- ✅ Fast recovery (single file load)
- ✅ Lower disk I/O impact
- ✅ Compact file size
- ✅ Good for disaster recovery

**Cons:**
- ❌ Data loss up to last snapshot
- ❌ Fork can be expensive on large datasets
- ❌ Not suitable for critical data

**Best For:**
- Cache data (tolerate data loss)
- Session data with re-login acceptable
- DR backups

---

### 2.2 AOF (Append-Only File) (4 minutes)

**How AOF Works:**
```
1. Every write command appended to log
2. Log persisted based on policy:
   - appendfsync always: Every write (slow)
   - appendfsync everysec: Every second (recommended)
   - appendfsync no: OS decides (fast, risky)
3. On restart: Replay all commands
```

**Configuration:**
```bash
az redis update   --name myRedis   --resource-group myRG   --set redisConfiguration.aof-backup-enabled=true   --set redisConfiguration.aof-storage-connection-string-0="<storage-account-connection>"
```

**AOF Rewrite:**
```
Problem: AOF grows indefinitely
Solution: Background rewrite
├── Original: SET key1 "a", SET key1 "b", SET key1 "c"
└── Rewritten: SET key1 "c"

Trigger: Auto when file size 2x
```

**Pros:**
- ✅ Minimal data loss (1 second max)
- ✅ Better durability
- ✅ Human-readable log

**Cons:**
- ❌ Slower restarts (replay all commands)
- ❌ Larger file size
- ❌ Higher disk I/O

**Best For:**
- Session storage
- Shopping carts
- Critical application state

---

### 2.3 Combined Strategy (2 minutes)

**Recommended: RDB + AOF**
```
Configuration:
├── RDB: Hourly snapshots
└── AOF: Every second

Recovery Process:
1. Check if AOF exists
2. If yes: Use AOF (more recent)
3. If no: Use RDB
4. If neither: Start empty

Benefits:
- Fast recovery (RDB)
- Minimal data loss (AOF)
- Best of both worlds
```

**Configuration:**
```bicep
resource redis 'Microsoft.Cache/redis@2023-08-01' = {
  name: 'myRedis'
  properties: {
    redisConfiguration: {
      'rdb-backup-enabled': 'true'
      'rdb-backup-frequency': '60'
      'aof-backup-enabled': 'true'
      'aof-storage-connection-string-0': storageAccount.connectionString
    }
  }
}
```

---

## Section 3: Disaster Recovery (8 minutes)

### 3.1 DR Planning (4 minutes)

**Key Metrics:**

**RPO (Recovery Point Objective):**
- How much data loss is acceptable?
- RDB only: Up to snapshot interval (15-60 min)
- AOF everysec: Up to 1 second
- Active-Active: Near zero (async replication lag only)

**RTO (Recovery Time Objective):**
- How long can recovery take?
- Failover within region: <2 minutes
- Restore from backup: 5-30 minutes
- Provision new instance: 10-20 minutes

**DR Strategy Matrix:**
```
                    RPO         RTO         Cost
Zone Redundancy     1 sec       <2 min      2x
Backup/Restore      15-60 min   10-30 min   1.1x
Active-Passive      1 sec       5-10 min    2x
Active-Active       Near 0      <1 min      4x
```

---

### 3.2 DR Scenarios (4 minutes)

**Scenario 1: Single-Region Failure**
```
Setup: Active-Passive
├── Primary: East US (zone-redundant)
└── Secondary: West US (read-only replica)

Failure: East US region down
Recovery:
1. Promote West US to primary (manual/automatic)
2. Update DNS or application config
3. Verify data integrity
RTO: 5-10 minutes
```

**Scenario 2: Data Corruption**
```
Setup: Backups enabled (RDB hourly)
Failure: Application bug corrupts data
Recovery:
1. Identify last good backup
2. Create new Redis instance
3. Restore from backup
4. Update application connection
5. Verify data integrity
RTO: 15-30 minutes
```

**Scenario 3: Global Outage**
```
Setup: Active-Active (3 regions)
Failure: Any single region fails
Recovery:
- Automatic (no action needed)
- Traffic routes to healthy regions
- Local writes continue
RTO: <1 minute (transparent)
```

**DR Runbook Template:**
```markdown
# Redis DR Runbook

## Detection
- Monitor: Azure Service Health
- Alert: Redis unavailable for >2 min
- Verify: Check Azure portal, ping Redis

## Assessment
- Determine scope: Region, AZ, or instance
- Check RPO: Last successful backup time
- Estimate RTO: Based on DR strategy

## Recovery Steps
1. If zone failure: Wait for auto-failover (2 min)
2. If region failure: 
   a. Promote secondary region
   b. Update application config
   c. Verify connectivity
3. If data corruption:
   a. Provision new instance
   b. Restore from backup
   c. Redirect traffic

## Verification
- Test write operations
- Verify data integrity (sample keys)
- Monitor application error rates
- Check latency metrics

## Communication
- Notify stakeholders
- Update status page
- Post-incident review within 48h
```

---

## SECURITY PILLAR

## Section 4: Network Security (12 minutes)

### 4.1 Security Layers (3 minutes)

**Defense in Depth:**
```
Layer 1: Network Isolation
├── Private Endpoint (recommended)
├── VNET Integration
└── Public + Firewall (minimum)

Layer 2: Transport Security
├── TLS 1.2 enforced
├── Certificate validation
└── Non-SSL port disabled

Layer 3: Authentication
├── Entra ID (recommended)
├── Access Keys (legacy)
└── Client certificate auth

Layer 4: Authorization
├── RBAC roles
├── Least privilege
└── Audit logs

Layer 5: Monitoring
├── Diagnostic logs
├── Security alerts
└── Threat detection
```

---

### 4.2 Private Endpoint Configuration (5 minutes)

**Architecture:**
```
Application VNET (10.0.0.0/16)
├── App Subnet (10.0.1.0/24)
│   └── App Service
├── Data Subnet (10.0.2.0/24)
│   └── Private Endpoint → Redis (Private IP: 10.0.2.10)
└── Private DNS Zone
    └── privatelink.redis.cache.windows.net
        └── myredis.redis.cache.windows.net → 10.0.2.10
```

**Step-by-Step Configuration:**

**1. Create VNET and Subnets:**
```bash
# Create VNET
az network vnet create   --resource-group myRG   --name myVnet   --address-prefix 10.0.0.0/16   --subnet-name dataSubnet   --subnet-prefix 10.0.2.0/24

# Disable private endpoint network policies
az network vnet subnet update   --name dataSubnet   --resource-group myRG   --vnet-name myVnet   --disable-private-endpoint-network-policies true
```

**2. Create Redis Instance:**
```bash
az redis create   --resource-group myRG   --name myRedis   --location eastus   --sku Enterprise_E10   --zones 1 2 3   --public-network-access Disabled
```

**3. Create Private Endpoint:**
```bash
# Get Redis resource ID
REDIS_ID=$(az redis show --name myRedis --resource-group myRG --query id -o tsv)

# Create private endpoint
az network private-endpoint create   --name myRedisEndpoint   --resource-group myRG   --vnet-name myVnet   --subnet dataSubnet   --private-connection-resource-id $REDIS_ID   --group-id redisCache   --connection-name myConnection
```

**4. Create Private DNS Zone:**
```bash
# Create private DNS zone
az network private-dns zone create   --resource-group myRG   --name privatelink.redis.cache.windows.net

# Link DNS zone to VNET
az network private-dns link vnet create   --resource-group myRG   --zone-name privatelink.redis.cache.windows.net   --name myDnsLink   --virtual-network myVnet   --registration-enabled false

# Create DNS record
az network private-endpoint dns-zone-group create   --resource-group myRG   --endpoint-name myRedisEndpoint   --name myZoneGroup   --private-dns-zone privatelink.redis.cache.windows.net   --zone-name redis
```

**5. Verify Connectivity:**
```bash
# From VM in same VNET
nslookup myredis.redis.cache.windows.net
# Should return private IP: 10.0.2.10

# Test Redis connection
redis-cli -h myredis.redis.cache.windows.net -p 6380 --tls ping
```

---

### 4.3 Network Security Groups (NSGs) (4 minutes)

**NSG Rules for Redis Subnet:**
```bash
# Create NSG
az network nsg create   --resource-group myRG   --name redisNSG

# Allow Redis from app subnet only
az network nsg rule create   --resource-group myRG   --nsg-name redisNSG   --name AllowRedisFromAppSubnet   --priority 100   --source-address-prefixes 10.0.1.0/24   --destination-port-ranges 6380   --access Allow   --protocol Tcp

# Deny all other inbound
az network nsg rule create   --resource-group myRG   --nsg-name redisNSG   --name DenyAllInbound   --priority 4096   --source-address-prefixes '*'   --destination-port-ranges '*'   --access Deny

# Associate NSG with subnet
az network vnet subnet update   --resource-group myRG   --vnet-name myVnet   --name dataSubnet   --network-security-group redisNSG
```

**Best Practices:**
- ✅ Deny all by default
- ✅ Allow only necessary ports (6380 for TLS)
- ✅ Use service tags when possible
- ✅ Log NSG flow logs for audit
- ✅ Regular review of rules

---

## Section 5: Identity & Access Management (10 minutes)

### 5.1 Entra ID Authentication (6 minutes)

**Why Entra ID?**
- ✅ No password rotation needed
- ✅ RBAC for granular permissions
- ✅ Audit logs for compliance
- ✅ Centralized identity management
- ✅ Support for managed identities

**Configuration Steps:**

**1. Enable Entra ID on Redis:**
```bash
az redis update   --name myRedis   --resource-group myRG   --set 'redisConfiguration.aad-enabled=true'
```

**2. Assign RBAC Role:**
```bash
# Get Redis resource ID
REDIS_ID=$(az redis show --name myRedis --resource-group myRG --query id -o tsv)

# Assign role to user
az role assignment create   --role "Redis Cache Contributor"   --assignee user@example.com   --scope $REDIS_ID

# Assign role to managed identity
az role assignment create   --role "Redis Cache Contributor"   --assignee <managed-identity-client-id>   --scope $REDIS_ID
```

**3. Application Code (Python):**
```python
from azure.identity import DefaultAzureCredential
import redis

# Get Entra ID token
credential = DefaultAzureCredential()
token_response = credential.get_token("https://redis.azure.com/.default")

# Connect with token
r = redis.Redis(
    host='myredis.redis.cache.windows.net',
    port=6380,
    ssl=True,
    password=token_response.token,
    username='<object-id>'  # User or Service Principal OID
)

# Test connection
r.ping()
```

**4. Token Refresh:**
```python
# Tokens expire after 1 hour - implement refresh logic
def get_redis_client():
    credential = DefaultAzureCredential()
    token = credential.get_token("https://redis.azure.com/.default")
    
    return redis.Redis(
        host='myredis.redis.cache.windows.net',
        port=6380,
        ssl=True,
        password=token.token,
        username='<object-id>'
    )

# Refresh every 45 minutes
```

---

### 5.2 RBAC Roles (4 minutes)

**Built-in Roles:**

**1. Redis Cache Contributor**
- Manage Redis cache instances
- Cannot access data (no data plane access)
- For: DevOps, infrastructure teams

**2. Redis Cache Owner**
- Full control of Redis resource
- Can assign roles to others
- Cannot access data
- For: Administrators

**3. Redis Cache Data Owner**
- Read, write, delete all keys
- Full data access
- For: Application owners, senior devs

**4. Redis Cache Data Contributor**
- Read and write keys
- Cannot delete
- For: Applications, developers

**5. Redis Cache Data Reader**
- Read-only access to data
- For: Monitoring, reporting tools

**Custom Role Example:**
```json
{
  "Name": "Redis Cache Read-Write Specific Pattern",
  "Description": "Can read/write keys matching pattern user:*",
  "Actions": [],
  "NotActions": [],
  "DataActions": [
    "Microsoft.Cache/redis/data/read",
    "Microsoft.Cache/redis/data/write"
  ],
  "NotDataActions": [
    "Microsoft.Cache/redis/data/delete"
  ],
  "AssignableScopes": [
    "/subscriptions/{subscription-id}/resourceGroups/{rg}/providers/Microsoft.Cache/redis/{redis-name}"
  ],
  "Condition": "((!(ActionMatches{'Microsoft.Cache/redis/data/write'})) OR (@Request[subPath] StringStartsWith 'user:'))"
}
```

**Role Assignment Best Practices:**
- Least privilege principle
- Use managed identities over service principals
- Regular access reviews (quarterly)
- Separate dev/test/prod permissions
- Document role assignments

---

## Section 6: Compliance & Governance (8 minutes)

### 6.1 Compliance Frameworks (4 minutes)

**Supported Certifications:**

**HIPAA (Healthcare):**
- Requirements:
  - Private Endpoint (no public access)
  - TLS 1.2 encryption
  - Audit logging enabled
  - BAA agreement with Microsoft
- Configuration:
```bash
az redis create   --resource-group myRG   --name myRedisHIPAA   --sku Enterprise_E10   --public-network-access Disabled   --minimum-tls-version 1.2
```

**PCI DSS (Payment Cards):**
- Requirements:
  - Network isolation (VNET/Private Endpoint)
  - Strong authentication (Entra ID)
  - Encryption at rest and in transit
  - Regular security scans
  - Access logging

**GDPR (EU Data Privacy):**
- Requirements:
  - Data residency (deploy in EU regions)
  - Right to deletion (implement key deletion)
  - Access logs for audit
  - Data encryption
- Configuration:
```bash
# Deploy in EU region
az redis create   --resource-group myRG   --name myRedisGDPR   --location westeurope   --sku Enterprise_E10
```

**SOC 2:**
- Requirements:
  - Comprehensive logging
  - Change management (IaC)
  - Incident response plan
  - Regular audits

---

### 6.2 Audit & Monitoring (4 minutes)

**Diagnostic Settings:**
```bash
# Enable all logs
az monitor diagnostic-settings create   --resource $REDIS_ID   --name RedisAuditLogs   --logs '[
    {
      "category": "ConnectedClientList",
      "enabled": true
    },
    {
      "category": "AuthenticationFailures",
      "enabled": true
    }
  ]'   --metrics '[
    {
      "category": "AllMetrics",
      "enabled": true
    }
  ]'   --workspace $LOG_ANALYTICS_ID
```

**Key Audit Events:**
```
Security Events:
├── Authentication failures
├── Authorization failures
├── Connection attempts
├── Configuration changes
└── Key access patterns

Compliance Events:
├── Data access (who, when, what)
├── Data modifications
├── Data deletions
├── Administrative actions
└── Network access attempts
```

**Log Analytics Queries:**
```kusto
// Authentication failures
AzureDiagnostics
| where Category == "AuthenticationFailures"
| where TimeGenerated > ago(24h)
| summarize FailureCount = count() by IPAddress, bin(TimeGenerated, 1h)
| where FailureCount > 10

// Unusual access patterns
AzureDiagnostics
| where Category == "ConnectedClientList"
| where IPAddress !in ("10.0.1.0/24")  // Not from app subnet
| project TimeGenerated, IPAddress, Location

// Configuration changes
AzureActivity
| where ResourceProvider == "Microsoft.Cache"
| where OperationName contains "write"
| project TimeGenerated, Caller, OperationName, ActivityStatus
```

---

## Key Takeaways

### ✅ Reliability Must-Haves:
1. Zone redundancy for production (99.99% SLA)
2. Combined RDB + AOF persistence
3. Documented DR plan with tested runbooks
4. Monitoring and alerting for failures

### ✅ Security Must-Haves:
1. Private Endpoint (no public access)
2. Entra ID authentication with RBAC
3. TLS 1.2 enforced
4. Comprehensive audit logging
5. NSG rules limiting access

### 🎯 Skills Acquired:
- ✅ Configure zone redundancy and HA
- ✅ Implement persistence strategies
- ✅ Plan disaster recovery
- ✅ Deploy Private Endpoints
- ✅ Set up Entra ID authentication
- ✅ Apply RBAC roles
- ✅ Meet compliance requirements

---

## Next Module Preview

**Module 4B: Cost Optimization & Operational Excellence (45 minutes)**

Preview:
- Right-sizing formulas and reserved capacity
- Infrastructure as Code (Bicep/Terraform)
- CI/CD pipelines for Redis
- Monitoring and alerting strategies
- Cost optimization techniques

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
| [⬅️ Previous: Well-Architected Framework Overview](../module-03-well-architected-framework-overview/README.md) | [🏠 Workshop Home](../README.md) | [Next: Cost Optimization & Operational Excellence ➡️](../module-05-cost-optimization-operational-excellence/README.md) |

---

*Module 4 of 11*
