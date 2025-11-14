# Module 4: Azure Managed Redis Deployment

## Overview
**Duration:** 60 minutes  
**Difficulty:** Intermediate  
**Type:** Hands-on Lab

## Learning Objectives
By the end of this module, you will:
- Understand Azure Managed Redis (AMR) tiers and features
- Deploy Redis using Azure Portal and Azure CLI
- Configure networking, security, and access controls
- Monitor performance using Azure Monitor
- Implement backup and disaster recovery

## Prerequisites
- Azure subscription ([Free trial](https://azure.microsoft.com/free/))
- Azure CLI installed or Azure Cloud Shell access
- Completed Modules 1-3 or basic Redis knowledge
- Understanding of Azure basics

---

## What is Azure Managed Redis?

Azure offers two Redis services:
1. **Azure Cache for Redis** - Older service, still widely used
2. **Azure Managed Redis** - New service with improved features (we'll focus on this)

### Key Benefits

✅ **Fully Managed** - Automatic updates, patching, backups  
✅ **High Availability** - Built-in replication and failover  
✅ **Enterprise Features** - RediSearch, RedisJSON, RedisBloom  
✅ **Integrated Monitoring** - Azure Monitor, metrics, alerts  
✅ **Security** - Private endpoints, managed identity, encryption  
✅ **Scalability** - Easy tier upgrades and clustering  

---

## Azure Managed Redis Tiers

| Tier | Use Case | Replication | SLA | Max Memory | Features |
|------|----------|-------------|-----|------------|----------|
| **Basic** | Dev/Test | No | None | 53 GB | Single node |
| **Standard** | Production | Yes | 99.9% | 53 GB | Primary + Replica |
| **Premium** | Enterprise | Yes | 99.95% | 1.2 TB | Clustering, geo-replication |
| **Enterprise** | Mission-critical | Yes | 99.99% | 2 TB | Redis modules, active-active |

### Tier Selection Guide

- **Basic**: Development, testing, non-critical workloads
- **Standard**: Most production workloads, HA required
- **Premium**: Large datasets, clustering, geo-replication
- **Enterprise**: Redis modules (Search, JSON), active-active geo

---

## Deployment Option 1: Azure Portal

### Step 1: Create Redis Instance

1. Navigate to [Azure Portal](https://portal.azure.com)
2. Click **Create a resource**
3. Search for **Azure Managed Redis** or **Azure Cache for Redis**
4. Click **Create**

### Step 2: Configure Basics

```
Resource Group: workshop-redis-rg
Region: East US
Name: my-redis-workshop
Tier: Standard
Size: C1 (1 GB)
```

### Step 3: Configure Networking

**Public Access (for workshop):**
- Enable public endpoint
- Add your IP to firewall rules

**Private Access (production):**
- Use Private Endpoint
- Connect to Virtual Network

### Step 4: Review and Create

- Review settings
- Click **Create**
- Wait 10-15 minutes for deployment

---

## Deployment Option 2: Azure CLI

### Step 1: Login and Setup

```bash
# Login to Azure
az login

# Set subscription
az account set --subscription "Your Subscription Name"

# Create resource group
az group create \
  --name workshop-redis-rg \
  --location eastus
```

### Step 2: Deploy Redis

```bash
# Create Azure Cache for Redis (Standard tier)
az redis create \
  --resource-group workshop-redis-rg \
  --name my-redis-workshop \
  --location eastus \
  --sku Standard \
  --vm-size c1 \
  --enable-non-ssl-port false

# This takes 10-15 minutes
```

### Step 3: Get Connection Details

```bash
# Get hostname
az redis show \
  --resource-group workshop-redis-rg \
  --name my-redis-workshop \
  --query "hostName" \
  --output tsv

# Get access keys
az redis list-keys \
  --resource-group workshop-redis-rg \
  --name my-redis-workshop
```

### Step 4: Configure Firewall (allow your IP)

```bash
# Add firewall rule
az redis firewall-rules create \
  --resource-group workshop-redis-rg \
  --name my-redis-workshop \
  --rule-name AllowMyIP \
  --start-ip YOUR_PUBLIC_IP \
  --end-ip YOUR_PUBLIC_IP
```

---

## Deployment Option 3: Azure Bicep (Infrastructure as Code)

### main.bicep

```bicep
@description('Name for the Redis cache')
param redisName string = 'redis-${uniqueString(resourceGroup().id)}'

@description('Location for all resources')
param location string = resourceGroup().location

@description('Redis tier')
@allowed([
  'Basic'
  'Standard'
  'Premium'
])
param redisSku string = 'Standard'

@description('Redis size')
param redisSize string = 'C1'

resource redis 'Microsoft.Cache/redis@2023-08-01' = {
  name: redisName
  location: location
  properties: {
    sku: {
      name: redisSku
      family: redisSku == 'Premium' ? 'P' : 'C'
      capacity: int(substring(redisSize, 1))
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
    redisConfiguration: {
      'maxmemory-policy': 'allkeys-lru'
    }
  }
}

output redisHostName string = redis.properties.hostName
output redisPrimaryKey string = redis.listKeys().primaryKey
```

### Deploy Bicep

```bash
# Deploy
az deployment group create \
  --resource-group workshop-redis-rg \
  --template-file main.bicep \
  --parameters redisSku=Standard redisSize=C1
```

---

## Connecting to Azure Managed Redis

### Using Redis CLI

```bash
# Get connection details first
REDIS_HOST="my-redis-workshop.redis.cache.windows.net"
REDIS_KEY="your-primary-key-here"

# Connect (SSL required)
redis-cli -h $REDIS_HOST \
  -p 6380 \
  --tls \
  -a $REDIS_KEY

# Test connection
> PING
PONG

# Set a value
> SET hello "Azure Redis"
OK

# Get the value
> GET hello
"Azure Redis"
```

### Using Connection String

Format for applications:
```
rediss://:PRIMARY_KEY@HOSTNAME:6380
```

Example:
```
rediss://:AbCdEf123...@my-redis-workshop.redis.cache.windows.net:6380
```

---

## Configuration Best Practices

### 1. Memory Management

```bash
# Configure eviction policy
az redis update \
  --resource-group workshop-redis-rg \
  --name my-redis-workshop \
  --set redisConfiguration.maxmemory-policy="allkeys-lru"
```

**Eviction Policies:**
- `noeviction` - Return errors when memory is full
- `allkeys-lru` - Remove least recently used keys
- `volatile-lru` - Remove LRU keys with expiration
- `allkeys-random` - Remove random keys
- `volatile-ttl` - Remove keys with shortest TTL

### 2. Persistence (Premium tier only)

```bash
# Enable RDB persistence
az redis patch-schedule set \
  --resource-group workshop-redis-rg \
  --name my-redis-workshop \
  --schedule-entries '[{"dayOfWeek":"Everyday","startHourUtc":3,"maintenanceWindow":"PT5H"}]'
```

### 3. TLS/SSL Configuration

```bash
# Disable non-SSL port (recommended)
az redis update \
  --resource-group workshop-redis-rg \
  --name my-redis-workshop \
  --set enableNonSslPort=false

# Set minimum TLS version
az redis update \
  --resource-group workshop-redis-rg \
  --name my-redis-workshop \
  --set minimumTlsVersion="1.2"
```

---

## Security Best Practices

### 1. Private Endpoint (recommended for production)

```bash
# Create Virtual Network
az network vnet create \
  --resource-group workshop-redis-rg \
  --name redis-vnet \
  --address-prefix 10.0.0.0/16 \
  --subnet-name redis-subnet \
  --subnet-prefix 10.0.1.0/24

# Create Private Endpoint
az network private-endpoint create \
  --resource-group workshop-redis-rg \
  --name redis-private-endpoint \
  --vnet-name redis-vnet \
  --subnet redis-subnet \
  --private-connection-resource-id $(az redis show -g workshop-redis-rg -n my-redis-workshop --query id -o tsv) \
  --group-id redisCache \
  --connection-name redis-connection
```

### 2. Managed Identity

```bash
# Enable managed identity
az redis identity assign \
  --resource-group workshop-redis-rg \
  --name my-redis-workshop \
  --type SystemAssigned

# Use managed identity in applications (no keys needed)
```

### 3. Firewall Rules

```bash
# Allow specific IP ranges only
az redis firewall-rules create \
  --resource-group workshop-redis-rg \
  --name my-redis-workshop \
  --rule-name AllowOfficeNetwork \
  --start-ip 203.0.113.0 \
  --end-ip 203.0.113.255
```

### 4. Access Keys Rotation

```bash
# Regenerate primary key
az redis regenerate-keys \
  --resource-group workshop-redis-rg \
  --name my-redis-workshop \
  --key-type Primary

# Best practice: Rotate keys regularly
```

---

## Monitoring & Diagnostics

### 1. Azure Monitor Metrics

Key metrics to monitor:
- **Connected Clients** - Active connections
- **Operations per Second** - Request rate
- **Cache Hits / Misses** - Effectiveness
- **Server Load** - CPU usage
- **Used Memory** - Memory consumption
- **Evicted Keys** - Keys removed due to memory

```bash
# Get metrics using Azure CLI
az monitor metrics list \
  --resource $(az redis show -g workshop-redis-rg -n my-redis-workshop --query id -o tsv) \
  --metric "connectedclients" \
  --start-time 2024-11-14T00:00:00Z \
  --end-time 2024-11-14T23:59:59Z
```

### 2. Enable Diagnostic Logs

```bash
# Create Log Analytics workspace
az monitor log-analytics workspace create \
  --resource-group workshop-redis-rg \
  --workspace-name redis-logs

# Enable diagnostic settings
az monitor diagnostic-settings create \
  --name redis-diagnostics \
  --resource $(az redis show -g workshop-redis-rg -n my-redis-workshop --query id -o tsv) \
  --workspace $(az monitor log-analytics workspace show -g workshop-redis-rg -n redis-logs --query id -o tsv) \
  --logs '[{"category":"ConnectedClientList","enabled":true}]' \
  --metrics '[{"category":"AllMetrics","enabled":true}]'
```

### 3. Set Up Alerts

```bash
# Alert when CPU > 80%
az monitor metrics alert create \
  --name redis-high-cpu \
  --resource-group workshop-redis-rg \
  --scopes $(az redis show -g workshop-redis-rg -n my-redis-workshop --query id -o tsv) \
  --condition "avg percentProcessorTime > 80" \
  --description "Redis CPU usage is high" \
  --evaluation-frequency 5m \
  --window-size 15m
```

### 4. Use RedisInsight (GUI Tool)

```bash
# Download RedisInsight
# https://redis.com/redis-enterprise/redis-insight/

# Connect using:
# Host: my-redis-workshop.redis.cache.windows.net
# Port: 6380
# Password: [Primary Key]
# Use TLS: Yes
```

---

## Scaling

### Vertical Scaling (Change Size)

```bash
# Scale up to C2 (2.5 GB)
az redis update \
  --resource-group workshop-redis-rg \
  --name my-redis-workshop \
  --sku Standard \
  --vm-size c2

# Note: Scaling causes brief connection disruption
```

### Horizontal Scaling (Premium Tier - Clustering)

```bash
# Create Premium tier with clustering
az redis create \
  --resource-group workshop-redis-rg \
  --name my-redis-cluster \
  --location eastus \
  --sku Premium \
  --vm-size p1 \
  --shard-count 3

# Scale shard count
az redis update \
  --resource-group workshop-redis-rg \
  --name my-redis-cluster \
  --shard-count 6
```

---

## Backup & Disaster Recovery

### RDB Export (Premium tier)

```bash
# Create storage account
az storage account create \
  --name redisbackupstorage \
  --resource-group workshop-redis-rg \
  --location eastus \
  --sku Standard_LRS

# Export RDB snapshot
az redis export \
  --resource-group workshop-redis-rg \
  --name my-redis-workshop \
  --prefix backup-$(date +%Y%m%d) \
  --container https://redisbackupstorage.blob.core.windows.net/backups \
  --file-format RDB
```

### Geo-Replication (Premium tier)

```bash
# Create secondary Redis in another region
az redis create \
  --resource-group workshop-redis-rg \
  --name my-redis-secondary \
  --location westus \
  --sku Premium \
  --vm-size p1

# Link for geo-replication
az redis server-link create \
  --resource-group workshop-redis-rg \
  --name my-redis-workshop \
  --server-to-link $(az redis show -g workshop-redis-rg -n my-redis-secondary --query id -o tsv) \
  --replication-role Secondary
```

---

## Practical Exercise: Deploy Production-Ready Redis

```bash
# 1. Create resource group
az group create --name prod-redis-rg --location eastus

# 2. Create Virtual Network
az network vnet create \
  --resource-group prod-redis-rg \
  --name prod-vnet \
  --address-prefix 10.0.0.0/16 \
  --subnet-name redis-subnet \
  --subnet-prefix 10.0.1.0/24

# 3. Deploy Redis Standard tier
az redis create \
  --resource-group prod-redis-rg \
  --name prod-redis-cache \
  --location eastus \
  --sku Standard \
  --vm-size c2 \
  --enable-non-ssl-port false \
  --minimum-tls-version "1.2"

# 4. Configure private endpoint
az network private-endpoint create \
  --resource-group prod-redis-rg \
  --name redis-pe \
  --vnet-name prod-vnet \
  --subnet redis-subnet \
  --private-connection-resource-id $(az redis show -g prod-redis-rg -n prod-redis-cache --query id -o tsv) \
  --group-id redisCache \
  --connection-name redis-pe-connection

# 5. Enable diagnostics
az monitor log-analytics workspace create \
  --resource-group prod-redis-rg \
  --workspace-name prod-redis-logs

az monitor diagnostic-settings create \
  --name diagnostics \
  --resource $(az redis show -g prod-redis-rg -n prod-redis-cache --query id -o tsv) \
  --workspace $(az monitor log-analytics workspace show -g prod-redis-rg -n prod-redis-logs --query id -o tsv) \
  --logs '[{"category":"ConnectedClientList","enabled":true}]' \
  --metrics '[{"category":"AllMetrics","enabled":true}]'

# 6. Set up alert
az monitor metrics alert create \
  --name high-memory \
  --resource-group prod-redis-rg \
  --scopes $(az redis show -g prod-redis-rg -n prod-redis-cache --query id -o tsv) \
  --condition "avg usedmemorypercentage > 90" \
  --description "Redis memory usage is critical"
```

---

## Cost Optimization

### 1. Choose Right Tier
- Use Basic for dev/test
- Standard for most production workloads
- Premium only when clustering/geo-replication needed

### 2. Right-Size Your Instance
```bash
# Monitor memory usage
az monitor metrics list \
  --resource $(az redis show -g workshop-redis-rg -n my-redis-workshop --query id -o tsv) \
  --metric "usedmemory"

# If consistently < 50%, consider smaller size
```

### 3. Use Reserved Instances
- Save up to 55% with 1 or 3-year commitments
- Available in Azure Portal → Reservations

### 4. Delete Unused Instances
```bash
# Delete Redis instance
az redis delete \
  --resource-group workshop-redis-rg \
  --name my-redis-workshop \
  --yes
```

---

## Troubleshooting

### Connection Issues

```bash
# Test connectivity
redis-cli -h my-redis-workshop.redis.cache.windows.net -p 6380 --tls PING

# Check firewall rules
az redis firewall-rules list \
  --resource-group workshop-redis-rg \
  --name my-redis-workshop

# Verify your IP
curl ifconfig.me
```

### Performance Issues

```bash
# Check server load
# In redis-cli:
INFO stats

# Check slow queries
SLOWLOG GET 10

# Check connected clients
CLIENT LIST
```

### Memory Issues

```bash
# Check memory usage
INFO memory

# Check eviction stats
INFO stats

# Consider:
# 1. Increase cache size
# 2. Adjust eviction policy
# 3. Set TTLs on keys
```

---

## Key Takeaways

✅ Azure Managed Redis provides fully managed, highly available Redis  
✅ Choose tier based on requirements (Basic/Standard/Premium/Enterprise)  
✅ Use Private Endpoints for production security  
✅ Enable monitoring and alerts proactively  
✅ Regular key rotation and security reviews  
✅ Right-size instances for cost optimization  
✅ Use Bicep/ARM for repeatable deployments  

## Clean Up Resources

```bash
# Delete resource group (removes all resources)
az group delete \
  --name workshop-redis-rg \
  --yes \
  --no-wait
```

---

## Additional Resources

- [Azure Managed Redis Documentation](https://learn.microsoft.com/azure/azure-cache-for-redis/)
- [Azure Redis Pricing](https://azure.microsoft.com/pricing/details/cache/)
- [Redis on Azure Best Practices](https://learn.microsoft.com/azure/azure-cache-for-redis/cache-best-practices)
- [Azure Redis CLI Reference](https://learn.microsoft.com/cli/azure/redis)
- [RedisInsight Download](https://redis.com/redis-enterprise/redis-insight/)

## Next Steps

- Integrate Redis with your applications
- Explore Redis modules (RediSearch, RedisJSON) on Enterprise tier
- Implement caching strategies in production
- Set up geo-replication for disaster recovery
