---
title: Provision & Connect Lab
description: 'Deploy Azure Managed Redis and establish secure connectivity using Infrastructure as Code.'
duration: 60 minutes
difficulty: intermediate
type: hands-on
---

<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->

| Previous | Home | Next |
|----------|:----:|------:|
| [⬅️ Previous: Performance Efficiency & Data Modeling](../module-06-performance-efficiency--data-modeling/README.md) | [🏠 Workshop Home](../README.md) | [Next: Implement Caching Lab ➡️](../module-08-implement-caching-lab/README.md) |

[🏠 Workshop Home](../README.md) > **Module 7 of 11**

### Deploy Redis for Developers - Azure Managed Redis

**Progress:** `██████░░░░` 64%

---

<!-- ✏️ EDIT YOUR CONTENT BELOW THIS LINE ✏️ -->

# Module 5: Provision & Connect Lab
**Duration:** 60 minutes  
**Format:** Hands-On Lab  
**Level:** Intermediate

---

## Lab Overview

**Objective:** Deploy Azure Managed Redis and establish secure connectivity using Infrastructure as Code.

**What You'll Build:**
- Azure Managed Redis (Enterprise tier with zone redundancy)
- Virtual Network with subnet configuration
- Private Endpoint for secure connectivity
- Entra ID authentication setup
- Python application with connection script
- Monitoring with Log Analytics

**Learning Outcomes:**
- Deploy Redis using Bicep or Terraform (IaC)
- Configure Private Endpoint for network isolation
- Set up Entra ID authentication (no access keys)
- Write Python code to connect with Azure Identity
- Troubleshoot common connectivity issues

**Prerequisites:**
- Azure subscription with appropriate permissions
- Azure CLI installed (`az --version`)
- Python 3.8+ installed
- VS Code or preferred IDE
- Basic understanding of IaC (Bicep or Terraform)

---

## Lab Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ Azure Region: East US                                        │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Resource Group: rg-redis-workshop                        │ │
│ │                                                            │ │
│ │ ┌────────────────────────────────────────┐               │ │
│ │ │ Virtual Network (10.0.0.0/16)          │               │ │
│ │ │                                        │               │ │
│ │ │  ┌─────────────────────────────────┐   │               │ │
│ │ │  │ Subnet: dataSubnet             │   │               │ │
│ │ │  │ (10.0.2.0/24)                  │   │               │ │
│ │ │  │                                 │   │               │ │
│ │ │  │  ┌───────────────────────┐     │   │               │ │
│ │ │  │  │ Private Endpoint      │     │   │               │ │
│ │ │  │  │ (10.0.2.4)            │     │   │               │ │
│ │ │  │  └───────────┬───────────┘     │   │               │ │
│ │ │  │              │                  │   │               │ │
│ │ │  └──────────────┼──────────────────┘   │               │ │
│ │ │                 │                       │               │ │
│ │ └─────────────────┼───────────────────────┘               │ │
│ │                   │                                       │ │
│ │                   │ Private Link                          │ │
│ │                   ▼                                       │ │
│ │ ┌───────────────────────────────────────────┐             │ │
│ │ │ Azure Managed Redis (Enterprise E10)      │             │ │
│ │ │ - Zone Redundant (Zones 1,2,3)           │             │ │
│ │ │ - Private Access Only                    │             │ │
│ │ │ - Entra ID Authentication                │             │ │
│ │ │ - 12 GB Memory                           │             │ │
│ │ └───────────────────────────────────────────┘             │ │
│ │                                                           │ │
│ │ ┌───────────────────────────────────────────┐             │ │
│ │ │ Log Analytics Workspace                  │             │ │
│ │ │ - Diagnostic logs & metrics              │             │ │
│ │ └───────────────────────────────────────────┘             │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

Application Server (Your Machine)
┌────────────────────────────────┐
│ Python Application             │
│ - azure-identity               │
│ - redis-py                     │
│ - DefaultAzureCredential       │
└────────────────────────────────┘
```

---

## Timing Breakdown

| Task | Duration | Type |
|------|----------|------|
| Setup Environment | 5 min | Configuration |
| Deploy Infrastructure (Bicep) | 15 min | IaC Deployment |
| Configure Authentication | 10 min | RBAC Setup |
| Write Python Connection Code | 15 min | Coding |
| Test Connectivity | 10 min | Testing |
| Troubleshooting Practice | 5 min | Debug |
| **Total** | **60 min** | |

---

## Part 1: Environment Setup (5 minutes)

### Task 1.1: Verify Prerequisites

**Check Azure CLI:**
```bash
# Verify Azure CLI installed
az --version
# Should show version 2.50.0 or higher

# Login to Azure
az login

# Set default subscription
az account set --subscription "YOUR_SUBSCRIPTION_NAME_OR_ID"

# Verify
az account show --output table
```

**Check Python:**
```bash
# Verify Python installed
python3 --version
# Should show Python 3.8 or higher

# Create virtual environment
python3 -m venv redis-lab-venv

# Activate (macOS/Linux)
source redis-lab-venv/bin/activate

# Activate (Windows)
# redis-lab-venv\Scripts\activate

# Install required packages
pip install redis azure-identity python-dotenv
```

---

### Task 1.2: Create Project Structure

```bash
# Create project directory
mkdir redis-workshop-lab
cd redis-workshop-lab

# Create folder structure
mkdir -p infrastructure/bicep
mkdir -p src
mkdir -p config

# Create files
touch infrastructure/bicep/main.bicep
touch infrastructure/bicep/parameters.json
touch src/connect.py
touch config/.env
touch README.md
```

---

## Part 2: Deploy Infrastructure with Bicep (15 minutes)

### Task 2.1: Create Bicep Template

**File: `infrastructure/bicep/main.bicep`**

```bicep
// Parameters
@description('Location for all resources')
param location string = resourceGroup().location

@description('Name prefix for resources')
param namePrefix string = 'redis-workshop'

@description('Redis SKU name')
@allowed(['Enterprise', 'EnterpriseFlash'])
param redisSku string = 'Enterprise'

@description('Redis capacity (E10 = 12GB)')
param redisCapacity int = 10

@description('Enable zone redundancy')
param enableZoneRedundancy bool = true

@description('Your Azure AD object ID (for RBAC)')
param adminObjectId string

// Variables
var redisName = '${namePrefix}-${uniqueString(resourceGroup().id)}'
var vnetName = '${namePrefix}-vnet'
var subnetName = 'dataSubnet'
var privateEndpointName = '${redisName}-pe'
var privateDnsZoneName = 'privatelink.redis.cache.windows.net'
var logWorkspaceName = '${namePrefix}-logs'

// Virtual Network
resource vnet 'Microsoft.Network/virtualNetworks@2023-04-01' = {
  name: vnetName
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: ['10.0.0.0/16']
    }
    subnets: [
      {
        name: subnetName
        properties: {
          addressPrefix: '10.0.2.0/24'
          privateEndpointNetworkPolicies: 'Disabled'
        }
      }
    ]
  }
}

// Log Analytics Workspace
resource logWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logWorkspaceName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// Redis Cache (Enterprise)
resource redis 'Microsoft.Cache/redis@2023-08-01' = {
  name: redisName
  location: location
  zones: enableZoneRedundancy ? ['1', '2', '3'] : []
  properties: {
    sku: {
      name: redisSku
      family: 'E'
      capacity: redisCapacity
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
    publicNetworkAccess: 'Disabled'
    redisConfiguration: {
      'aad-enabled': 'true'  // Enable Entra ID
      'maxmemory-policy': 'allkeys-lru'
    }
    replicasPerPrimary: 2
  }
}

// Private Endpoint
resource privateEndpoint 'Microsoft.Network/privateEndpoints@2023-04-01' = {
  name: privateEndpointName
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
  name: privateDnsZoneName
  location: 'global'
}

// Link DNS Zone to VNet
resource dnsZoneLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = {
  parent: privateDnsZone
  name: '${vnetName}-link'
  location: 'global'
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: vnet.id
    }
  }
}

// DNS Zone Group (automatic DNS registration)
resource dnsZoneGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2023-04-01' = {
  parent: privateEndpoint
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'config1'
        properties: {
          privateDnsZoneId: privateDnsZone.id
        }
      }
    ]
  }
}

// Diagnostic Settings
resource diagnosticSettings 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: '${redisName}-diagnostics'
  scope: redis
  properties: {
    workspaceId: logWorkspace.id
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
        retentionPolicy: {
          enabled: false
          days: 0
        }
      }
    ]
  }
}

// RBAC: Assign Redis Data Owner to admin
resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(redis.id, adminObjectId, 'RedisDataOwner')
  scope: redis
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '783a8f20-5e1e-40d5-a66d-5a88aa9cd95b')  // Redis Data Owner
    principalId: adminObjectId
    principalType: 'User'
  }
}

// Outputs
output redisName string = redis.name
output redisHostName string = redis.properties.hostName
output redisPort int = redis.properties.port
output redisSslPort int = redis.properties.sslPort
output redisId string = redis.id
output vnetId string = vnet.id
output privateEndpointIp string = privateEndpoint.properties.customDnsConfigs[0].ipAddresses[0]
output logWorkspaceId string = logWorkspace.id
```

---

### Task 2.2: Create Parameters File

**File: `infrastructure/bicep/parameters.json`**

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "namePrefix": {
      "value": "redis-workshop"
    },
    "location": {
      "value": "eastus"
    },
    "redisSku": {
      "value": "Enterprise"
    },
    "redisCapacity": {
      "value": 10
    },
    "enableZoneRedundancy": {
      "value": true
    },
    "adminObjectId": {
      "value": "YOUR_OBJECT_ID_HERE"
    }
  }
}
```

**Get your Object ID:**
```bash
# Get your Azure AD user object ID
az ad signed-in-user show --query id -o tsv

# Update parameters.json with your object ID
# Replace YOUR_OBJECT_ID_HERE with the output
```

---

### Task 2.3: Deploy Infrastructure

```bash
# Create resource group
az group create \
  --name rg-redis-workshop \
  --location eastus

# Validate Bicep template
az deployment group validate \
  --resource-group rg-redis-workshop \
  --template-file infrastructure/bicep/main.bicep \
  --parameters @infrastructure/bicep/parameters.json

# Deploy (takes 10-15 minutes)
az deployment group create \
  --resource-group rg-redis-workshop \
  --template-file infrastructure/bicep/main.bicep \
  --parameters @infrastructure/bicep/parameters.json \
  --name redis-deployment-$(date +%Y%m%d-%H%M%S)

# Capture outputs
az deployment group show \
  --resource-group rg-redis-workshop \
  --name redis-deployment-YYYYMMDD-HHMMSS \
  --query properties.outputs
```

**Expected Output:**
```json
{
  "redisHostName": {
    "type": "String",
    "value": "redis-workshop-abc123.redis.cache.windows.net"
  },
  "redisPort": {
    "type": "Int",
    "value": 10000
  },
  "redisSslPort": {
    "type": "Int",
    "value": 10001
  }
}
```

---

## Part 3: Configure Authentication (10 minutes)

### Task 3.1: Verify Entra ID Configuration

```bash
# Get Redis resource ID
REDIS_ID=$(az redis show \
  --name $(az redis list --resource-group rg-redis-workshop --query [0].name -o tsv) \
  --resource-group rg-redis-workshop \
  --query id -o tsv)

# Verify RBAC role assignment
az role assignment list \
  --scope $REDIS_ID \
  --query "[?roleDefinitionName=='Redis Data Owner'].{User:principalName, Role:roleDefinitionName}" \
  --output table

# Should show your user with "Redis Data Owner" role
```

---

### Task 3.2: Test Authentication with Azure CLI

```bash
# Get Redis hostname
REDIS_HOST=$(az redis show \
  --name $(az redis list --resource-group rg-redis-workshop --query [0].name -o tsv) \
  --resource-group rg-redis-workshop \
  --query hostName -o tsv)

# Get access token
TOKEN=$(az account get-access-token \
  --resource https://redis.azure.com \
  --query accessToken -o tsv)

echo "Redis Host: $REDIS_HOST"
echo "Token (first 50 chars): ${TOKEN:0:50}..."

# Test with redis-cli (if installed)
# redis-cli -h $REDIS_HOST -p 10001 --tls --user $TOKEN --pass ""
```

---

## Part 4: Python Connection Code (15 minutes)

### Task 4.1: Create Configuration File

**File: `config/.env`**

```bash
# Redis Configuration
REDIS_HOST=redis-workshop-abc123.redis.cache.windows.net
REDIS_PORT=10001
REDIS_SSL=true

# Azure Configuration
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret

# Or use DefaultAzureCredential (recommended for local dev)
USE_DEFAULT_CREDENTIAL=true
```

**Note:** For local development, we'll use `DefaultAzureCredential` which uses your `az login` session.

---

### Task 4.2: Create Connection Script

**File: `src/connect.py`**

```python
"""
Redis Workshop - Connection Script with Entra ID Authentication
"""

import os
import redis
from azure.identity import DefaultAzureCredential
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv('config/.env')

class RedisConnection:
    """Manages Redis connection with Entra ID authentication"""
    
    def __init__(self):
        self.host = os.getenv('REDIS_HOST')
        self.port = int(os.getenv('REDIS_PORT', 10001))
        self.credential = DefaultAzureCredential()
        self.redis_client = None
        self.token_expiry = 0
    
    def get_access_token(self):
        """Get Entra ID access token for Redis"""
        print("🔐 Acquiring access token from Entra ID...")
        
        token = self.credential.get_token("https://redis.azure.com/.default")
        
        # Store expiry time (with 5-minute buffer)
        self.token_expiry = token.expires_on - 300
        
        print(f"✅ Token acquired (expires in {(token.expires_on - time.time()) / 60:.1f} minutes)")
        return token.token
    
    def connect(self):
        """Establish connection to Redis"""
        print(f"\n🔗 Connecting to Redis: {self.host}:{self.port}")
        
        try:
            # Get access token
            access_token = self.get_access_token()
            
            # Create Redis client
            self.redis_client = redis.Redis(
                host=self.host,
                port=self.port,
                username=access_token,  # Entra ID token as username
                password="",            # Empty password
                ssl=True,
                ssl_cert_reqs='required',
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            
            # Test connection
            self.redis_client.ping()
            print(f"✅ Connected successfully to {self.host}")
            
            return self.redis_client
            
        except redis.ConnectionError as e:
            print(f"❌ Connection failed: {e}")
            raise
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            raise
    
    def refresh_token_if_needed(self):
        """Refresh token if close to expiry"""
        if time.time() > self.token_expiry:
            print("🔄 Token expired, refreshing...")
            access_token = self.get_access_token()
            
            # Reconnect with new token
            self.redis_client = redis.Redis(
                host=self.host,
                port=self.port,
                username=access_token,
                password="",
                ssl=True,
                ssl_cert_reqs='required',
                decode_responses=True
            )
            print("✅ Token refreshed and reconnected")

def test_redis_operations(redis_client):
    """Test basic Redis operations"""
    print("\n📝 Testing Redis operations...")
    
    try:
        # String operations
        redis_client.set('workshop:test:key', 'Hello Redis!')
        value = redis_client.get('workshop:test:key')
        print(f"✅ SET/GET: {value}")
        
        # Counter
        redis_client.set('workshop:counter', 0)
        count = redis_client.incr('workshop:counter')
        print(f"✅ INCR: Counter = {count}")
        
        # Hash
        redis_client.hset('workshop:user:1', mapping={
            'name': 'Alice',
            'email': 'alice@example.com',
            'role': 'admin'
        })
        user = redis_client.hgetall('workshop:user:1')
        print(f"✅ HASH: {user}")
        
        # List
        redis_client.lpush('workshop:queue', 'task1', 'task2', 'task3')
        tasks = redis_client.lrange('workshop:queue', 0, -1)
        print(f"✅ LIST: {tasks}")
        
        # Set
        redis_client.sadd('workshop:tags', 'python', 'redis', 'azure')
        tags = redis_client.smembers('workshop:tags')
        print(f"✅ SET: {tags}")
        
        # Sorted Set
        redis_client.zadd('workshop:leaderboard', {
            'player1': 100,
            'player2': 250,
            'player3': 180
        })
        top = redis_client.zrevrange('workshop:leaderboard', 0, 2, withscores=True)
        print(f"✅ SORTED SET: {top}")
        
        # Check memory usage
        info = redis_client.info('memory')
        used_memory_mb = info['used_memory'] / 1024 / 1024
        print(f"\n📊 Memory used: {used_memory_mb:.2f} MB")
        
        print("\n✅ All operations successful!")
        return True
        
    except Exception as e:
        print(f"❌ Operation failed: {e}")
        return False

def cleanup(redis_client):
    """Clean up test keys"""
    print("\n🧹 Cleaning up test keys...")
    
    patterns = ['workshop:test:*', 'workshop:counter', 'workshop:user:*', 
                'workshop:queue', 'workshop:tags', 'workshop:leaderboard']
    
    for pattern in patterns:
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)
            print(f"✅ Deleted {len(keys)} keys matching '{pattern}'")

def main():
    """Main function"""
    print("=" * 60)
    print("Redis Workshop - Connection Test")
    print("=" * 60)
    
    try:
        # Create connection
        conn = RedisConnection()
        redis_client = conn.connect()
        
        # Test operations
        success = test_redis_operations(redis_client)
        
        if success:
            # Cleanup
            cleanup(redis_client)
            print("\n✅ Lab completed successfully!")
        else:
            print("\n❌ Some operations failed")
        
    except Exception as e:
        print(f"\n❌ Lab failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
```

---

### Task 4.3: Update .env File

```bash
# Get Redis hostname from deployment
az deployment group show \
  --resource-group rg-redis-workshop \
  --name redis-deployment-YYYYMMDD-HHMMSS \
  --query properties.outputs.redisHostName.value -o tsv

# Update config/.env with the hostname
# REDIS_HOST=redis-workshop-abc123.redis.cache.windows.net
```

---

## Part 5: Test Connectivity (10 minutes)

### Task 5.1: Run Connection Test

```bash
# Ensure you're logged in with Azure CLI
az account show

# Run the connection script
python src/connect.py
```

**Expected Output:**
```
============================================================
Redis Workshop - Connection Test
============================================================

🔐 Acquiring access token from Entra ID...
✅ Token acquired (expires in 59.5 minutes)

🔗 Connecting to Redis: redis-workshop-abc123.redis.cache.windows.net:10001
✅ Connected successfully to redis-workshop-abc123.redis.cache.windows.net

📝 Testing Redis operations...
✅ SET/GET: Hello Redis!
✅ INCR: Counter = 1
✅ HASH: {'name': 'Alice', 'email': 'alice@example.com', 'role': 'admin'}
✅ LIST: ['task3', 'task2', 'task1']
✅ SET: {'azure', 'redis', 'python'}
✅ SORTED SET: [('player2', 250.0), ('player3', 180.0), ('player1', 100.0)]

📊 Memory used: 1.25 MB

✅ All operations successful!

🧹 Cleaning up test keys...
✅ Deleted 1 keys matching 'workshop:test:*'
✅ Deleted 1 keys matching 'workshop:counter'
✅ Deleted 1 keys matching 'workshop:user:*'
✅ Deleted 1 keys matching 'workshop:queue'
✅ Deleted 1 keys matching 'workshop:tags'
✅ Deleted 1 keys matching 'workshop:leaderboard'

✅ Lab completed successfully!
```

---

### Task 5.2: Verify in Azure Portal

1. Open Azure Portal → Resource Groups → `rg-redis-workshop`
2. Click on Redis cache resource
3. Go to **Metrics** blade
4. Check:
   - Connected Clients (should show 1)
   - Operations Per Second
   - Cache Hits/Misses

---

## Part 6: Troubleshooting Practice (5 minutes)

### Common Issues and Solutions

**Issue 1: Connection Timeout**
```
❌ Connection failed: Error connecting to redis-workshop-abc123.redis.cache.windows.net:10001. Timeout
```

**Solution:**
```bash
# Check if Private Endpoint is correctly configured
az network private-endpoint show \
  --resource-group rg-redis-workshop \
  --name redis-workshop-XXXX-pe \
  --query connectionState

# Check DNS resolution
nslookup redis-workshop-abc123.redis.cache.windows.net

# If not resolving to private IP (10.0.2.X), check DNS zone link
az network private-dns link vnet list \
  --resource-group rg-redis-workshop \
  --zone-name privatelink.redis.cache.windows.net
```

**Issue 2: Authentication Failed**
```
❌ WRONGPASS invalid username-password pair
```

**Solution:**
```bash
# Verify RBAC role assignment
az role assignment list \
  --scope $(az redis show --name REDIS_NAME --resource-group rg-redis-workshop --query id -o tsv) \
  --assignee $(az ad signed-in-user show --query id -o tsv)

# Re-login to Azure CLI
az logout
az login

# Verify token scope
az account get-access-token --resource https://redis.azure.com
```

**Issue 3: SSL/TLS Error**
```
❌ SSL: CERTIFICATE_VERIFY_FAILED
```

**Solution:**
```python
# Update Redis client with proper SSL config
redis_client = redis.Redis(
    host=host,
    port=port,
    ssl=True,
    ssl_cert_reqs='required',  # Enforce certificate verification
    ssl_ca_certs='/path/to/ca-bundle.crt'  # If needed
)
```

---

## Cleanup (Optional)

**Delete all resources:**
```bash
# Delete resource group (deletes all resources)
az group delete \
  --name rg-redis-workshop \
  --yes \
  --no-wait
```

---

## Key Takeaways

### ✅ What You Learned:
1. Deploy Redis with Bicep (IaC)
2. Configure Private Endpoint for secure connectivity
3. Set up Entra ID authentication (no access keys!)
4. Write Python code with `azure-identity` and `redis-py`
5. Troubleshoot common connection issues

### ✅ Best Practices Applied:
- **No public access**: Private Endpoint only
- **No access keys**: Entra ID authentication
- **Zone redundancy**: 99.99% SLA
- **Monitoring**: Diagnostic settings enabled
- **IaC**: Infrastructure as Code (reproducible)

### 🎯 Skills Acquired:
- ✅ Deploy Azure infrastructure with Bicep
- ✅ Configure network security (Private Endpoint)
- ✅ Implement Entra ID authentication
- ✅ Write production-ready connection code
- ✅ Debug connectivity issues

---

## Next Module Preview

**Module 6: Implement Caching Lab (60 minutes)**

Preview:
- Build Flask API with PostgreSQL backend
- Implement cache-aside pattern
- Add cache invalidation logic
- Measure performance improvements
- Load test with Locust

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
| [⬅️ Previous: Performance Efficiency & Data Modeling](../module-06-performance-efficiency--data-modeling/README.md) | [🏠 Workshop Home](../README.md) | [Next: Implement Caching Lab ➡️](../module-08-implement-caching-lab/README.md) |

---

*Module 7 of 11*
