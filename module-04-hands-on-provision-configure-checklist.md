# Module 4: Hands-On Lab - Provision & Configure Azure Managed Redis - Content Checklist

## 📋 Module Metadata

- **Module ID:** module-04-hands-on-provision-configure
- **Title:** Hands-On Lab - Provision & Configure Azure Managed Redis
- **Duration:** 40 minutes
- **Type:** Hands-On Lab
- **Difficulty:** Intermediate
- **Prerequisites:** 
  - Azure subscription with permissions
  - Module 2 (Architecture & Overview)
  - Azure CLI or Portal access
- **Standalone:** Partial (better with Module 2)

---

## 🎯 Learning Objectives

By the end of this lab, participants will be able to:

1. ✅ Provision an Azure Managed Redis instance using Azure Portal
2. ✅ Provision Azure Managed Redis using Azure CLI
3. ✅ Configure authentication (Access Keys and Entra ID)
4. ✅ Set up private endpoint for secure networking
5. ✅ Configure persistence and backup settings
6. ✅ Connect to Redis instance using Redis CLI
7. ✅ Verify connectivity from application code
8. ✅ Configure monitoring and diagnostics

---

## 🧪 Lab Structure (40 minutes)

### Pre-Lab Setup (5 minutes - Before Workshop)

#### Prerequisites Checklist
- [ ] **Azure Account Setup**
  ```markdown
  Participants must have:
  - Azure subscription (trial or paid)
  - Owner or Contributor role on resource group
  - Azure CLI installed (version 2.40+)
  - Redis CLI installed (redis-tools package)
  ```

- [ ] **Tool Installation Verification Script**
  ```bash
  #!/bin/bash
  # verify-tools.sh
  
  echo "🔍 Verifying prerequisites..."
  
  # Check Azure CLI
  if command -v az &> /dev/null; then
      echo "✅ Azure CLI: $(az version --query '\"azure-cli\"' -o tsv)"
  else
      echo "❌ Azure CLI not found. Install: https://aka.ms/install-azure-cli"
      exit 1
  fi
  
  # Check Redis CLI
  if command -v redis-cli &> /dev/null; then
      echo "✅ Redis CLI: $(redis-cli --version)"
  else
      echo "❌ Redis CLI not found. Install redis-tools package"
      exit 1
  fi
  
  # Check Azure login
  az account show &> /dev/null
  if [ $? -eq 0 ]; then
      echo "✅ Logged into Azure"
  else
      echo "⚠️  Please run: az login"
  fi
  
  echo "✅ All prerequisites verified!"
  ```

- [ ] **Sample Environment Variables File**
  ```bash
  # .env.template
  AZURE_SUBSCRIPTION_ID=
  AZURE_RESOURCE_GROUP=redis-workshop-rg
  AZURE_LOCATION=eastus
  AZURE_REDIS_NAME=myredis-${USER}
  AZURE_REDIS_SKU=Balanced_B1
  ```

---

### Lab Exercise 1: Provision Redis via Azure Portal (10 minutes)

#### Step 1.1: Access Azure Portal
- [ ] **Instructions**
  ```markdown
  1. Navigate to https://portal.azure.com
  2. Sign in with your Azure account
  3. Click "+ Create a resource"
  4. Search for "Azure Managed Redis"
  5. Click "Create"
  ```

- [ ] **Screenshot:** Azure Portal home page with "Create a resource" highlighted

#### Step 1.2: Configure Basic Settings
- [ ] **Instructions with Visual Guides**
  ```markdown
  ### Basics Tab
  
  **Subscription:**
  - Select your subscription
  
  **Resource Group:**
  - Create new: `redis-workshop-rg`
  - Or use existing
  
  **Name:**
  - Enter: `myredis-yourname` (must be globally unique)
  - Example: `myredis-john123`
  
  **Region:**
  - Select: `East US` (or closest to you)
  
  **Cache Type:**
  - Select: **Azure Managed Redis**
  - (Not Azure Cache for Redis)
  
  **Service Tier:**
  - Select: `Balanced B1`
  - Memory: 1.5 GB
  - Good for development/testing
  
  **Eviction Policy:**
  - Select: `allkeys-lru`
  - Evicts least recently used keys when memory full
  ```

- [ ] **Screenshot:** Basics tab filled with example values
- [ ] **Cost Callout:** Display estimated monthly cost (~$80-100/month for B1)

#### Step 1.3: Configure Networking
- [ ] **Instructions**
  ```markdown
  ### Networking Tab
  
  **Network Connectivity:**
  - For this lab: Select `Public endpoint`
  - Production: Use `Private endpoint` (covered later)
  
  **Firewall:**
  - Click "+ Add your client IP address"
  - This allows your machine to connect
  
  **TLS Version:**
  - Select: `1.2` (recommended minimum)
  ```

- [ ] **Screenshot:** Networking tab with public endpoint selected
- [ ] **Security Note:** Emphasize private endpoints for production

#### Step 1.4: Configure Authentication
- [ ] **Instructions**
  ```markdown
  ### Authentication Tab
  
  **Authentication Method:**
  - Enable: ☑️ Access Keys
  - Enable: ☑️ Microsoft Entra ID (Azure AD)
  
  **Microsoft Entra ID Access:**
  - Add your user account as Admin
  - Click "+ Add" and search for your email
  
  **Disable Non-SSL Port:**
  - Leave: ☑️ Disabled (only allow SSL)
  ```

- [ ] **Screenshot:** Authentication tab configuration

#### Step 1.5: Review and Create
- [ ] **Instructions**
  ```markdown
  ### Review + Create
  
  1. Review all settings
  2. Check estimated cost
  3. Click "Create"
  4. Wait 5-10 minutes for deployment
  
  **During Deployment:**
  - Monitor deployment progress
  - Review deployment details
  ```

- [ ] **Screenshot:** Deployment in progress screen
- [ ] **Timing Note:** Highlight this takes ~8 minutes, use time for CLI setup

---

### Lab Exercise 2: Provision Redis via Azure CLI (10 minutes)

#### Step 2.1: Prepare CLI Environment
- [ ] **Instructions**
  ```bash
  # Login to Azure
  az login
  
  # Set subscription (if you have multiple)
  az account set --subscription "Your Subscription Name"
  
  # Set variables
  RESOURCE_GROUP="redis-workshop-rg"
  LOCATION="eastus"
  REDIS_NAME="myredis-cli-$RANDOM"
  ```

- [ ] **Note:** Explain $RANDOM for unique names

#### Step 2.2: Create Resource Group (if needed)
- [ ] **Command**
  ```bash
  # Create resource group
  az group create \
    --name $RESOURCE_GROUP \
    --location $LOCATION
  
  # Verify creation
  az group show --name $RESOURCE_GROUP --output table
  ```

- [ ] **Expected Output**
  ```
  Name                  Location    Status
  --------------------  ----------  ---------
  redis-workshop-rg     eastus      Succeeded
  ```

#### Step 2.3: Provision Azure Managed Redis
- [ ] **Full Command with Explanation**
  ```bash
  # Provision Azure Managed Redis instance
  az redisenterprise create \
    --resource-group $RESOURCE_GROUP \
    --name $REDIS_NAME \
    --location $LOCATION \
    --sku "Balanced_B1" \
    --capacity 2 \
    --tags "Environment=Workshop" "Owner=YourName" \
    --zones 1 2 \
    --no-wait
  
  # Parameter Explanation:
  # --sku: Service tier (Balanced_B1 = 1.5GB memory)
  # --capacity: Number of shards (2 for this lab)
  # --zones: Availability zones for HA
  # --no-wait: Don't wait for completion (async)
  ```

- [ ] **Command Variations Table**
  ```markdown
  | Scenario | SKU | Capacity | Zones |
  |----------|-----|----------|-------|
  | Development | Balanced_B1 | 2 | 1 |
  | Production (Small) | Balanced_B10 | 2 | 1 2 |
  | Production (HA) | Memory_Optimized_E20 | 4 | 1 2 3 |
  ```

#### Step 2.4: Monitor Provisioning
- [ ] **Commands**
  ```bash
  # Check provisioning status
  az redisenterprise show \
    --resource-group $RESOURCE_GROUP \
    --name $REDIS_NAME \
    --query "provisioningState" \
    --output tsv
  
  # Wait for completion (if needed)
  az redisenterprise wait \
    --resource-group $RESOURCE_GROUP \
    --name $REDIS_NAME \
    --created \
    --timeout 600
  
  # Get full details
  az redisenterprise show \
    --resource-group $RESOURCE_GROUP \
    --name $REDIS_NAME \
    --output json
  ```

- [ ] **Expected States:** Creating → Running → Succeeded

#### Step 2.5: Create Database
- [ ] **Command**
  ```bash
  # Create Redis database on the cluster
  az redisenterprise database create \
    --resource-group $RESOURCE_GROUP \
    --cluster-name $REDIS_NAME \
    --name default \
    --eviction-policy "AllKeysLRU" \
    --persistence AOF \
    --aof-frequency "1s" \
    --clustering-policy "OSSCluster"
  
  # Parameter Explanation:
  # --name: Database name (default is standard)
  # --eviction-policy: What to do when memory full
  # --persistence: AOF (Append Only File) for durability
  # --aof-frequency: How often to sync (1s or always)
  # --clustering-policy: OSSCluster for standard Redis cluster
  ```

---

### Lab Exercise 3: Configure Authentication & Access (8 minutes)

#### Step 3.1: Retrieve Access Keys
- [ ] **Azure Portal Method**
  ```markdown
  1. Navigate to your Redis instance
  2. Left menu: Select "Access keys"
  3. Copy "Primary connection string"
  4. Copy "Primary access key"
  ```

- [ ] **Azure CLI Method**
  ```bash
  # Get connection string
  az redisenterprise database list-keys \
    --resource-group $RESOURCE_GROUP \
    --cluster-name $REDIS_NAME \
    --name default \
    --query "primaryKey" \
    --output tsv
  
  # Get full connection details
  az redisenterprise database show \
    --resource-group $RESOURCE_GROUP \
    --cluster-name $REDIS_NAME \
    --name default
  ```

- [ ] **Store Securely**
  ```bash
  # Save to environment variable
  export REDIS_PASSWORD="<your-primary-key>"
  export REDIS_HOST="<your-redis-name>.eastus.redisenterprise.cache.azure.net"
  export REDIS_PORT=10000
  
  # Or save to .env file (don't commit to git!)
  echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> .env
  echo "REDIS_HOST=$REDIS_HOST" >> .env
  echo "REDIS_PORT=$REDIS_PORT" >> .env
  ```

#### Step 3.2: Configure Entra ID Authentication
- [ ] **Enable Entra ID**
  ```bash
  # Assign yourself as Redis Contributor
  REDIS_ID=$(az redisenterprise show \
    --resource-group $RESOURCE_GROUP \
    --name $REDIS_NAME \
    --query "id" \
    --output tsv)
  
  MY_USER_ID=$(az ad signed-in-user show --query "id" -o tsv)
  
  az role assignment create \
    --assignee $MY_USER_ID \
    --role "Redis Cache Contributor" \
    --scope $REDIS_ID
  ```

- [ ] **Create Service Principal for Applications**
  ```bash
  # Create service principal
  az ad sp create-for-rbac \
    --name "redis-workshop-app" \
    --role "Redis Cache Contributor" \
    --scopes $REDIS_ID
  
  # Save output - you'll need:
  # - appId (client ID)
  # - password (client secret)
  # - tenant (tenant ID)
  ```

#### Step 3.3: Configure Firewall Rules
- [ ] **Add IP Address Rules**
  ```bash
  # Get your public IP
  MY_IP=$(curl -s ifconfig.me)
  echo "Your public IP: $MY_IP"
  
  # Add firewall rule (for public endpoint)
  # Note: Azure Managed Redis uses VNet integration
  # This is for access control list
  
  # Allow specific IP range
  az redisenterprise database update \
    --resource-group $RESOURCE_GROUP \
    --cluster-name $REDIS_NAME \
    --name default \
    --client-protocol "Encrypted"
  ```

---

### Lab Exercise 4: Test Connectivity (7 minutes)

#### Step 4.1: Connect with Redis CLI
- [ ] **Basic Connection**
  ```bash
  # Connect using access key
  redis-cli \
    -h $REDIS_HOST \
    -p $REDIS_PORT \
    -a $REDIS_PASSWORD \
    --tls \
    --cacert /path/to/ca-cert.pem
  
  # For Azure Managed Redis, TLS is required
  ```

- [ ] **Test Commands**
  ```redis
  # Test connection
  PING
  # Expected: PONG
  
  # Set a value
  SET workshop:test "Hello from Azure Managed Redis"
  
  # Get the value
  GET workshop:test
  
  # Check server info
  INFO server
  
  # List all keys
  KEYS *
  
  # Exit
  QUIT
  ```

- [ ] **Expected Output Screenshot**

#### Step 4.2: Connect from Python
- [ ] **Install Client Library**
  ```bash
  pip install redis
  ```

- [ ] **Test Script (test_connection.py)**
  ```python
  import redis
  import os
  from redis.connection import SSLConnection
  
  # Load from environment
  redis_host = os.getenv('REDIS_HOST')
  redis_password = os.getenv('REDIS_PASSWORD')
  redis_port = int(os.getenv('REDIS_PORT', 10000))
  
  print(f"Connecting to {redis_host}:{redis_port}...")
  
  # Create Redis client with SSL
  r = redis.Redis(
      host=redis_host,
      port=redis_port,
      password=redis_password,
      ssl=True,
      ssl_cert_reqs='required',
      decode_responses=True
  )
  
  try:
      # Test connection
      response = r.ping()
      print(f"✅ Connection successful: PING returned {response}")
      
      # Set a value
      r.set('workshop:python', 'Connected from Python!')
      print("✅ SET command successful")
      
      # Get the value
      value = r.get('workshop:python')
      print(f"✅ GET command successful: {value}")
      
      # Get server info
      info = r.info('server')
      print(f"✅ Redis version: {info['redis_version']}")
      
      print("\n🎉 All tests passed!")
      
  except redis.ConnectionError as e:
      print(f"❌ Connection failed: {e}")
  except Exception as e:
      print(f"❌ Error: {e}")
  finally:
      r.close()
  ```

- [ ] **Run Test**
  ```bash
  python test_connection.py
  ```

#### Step 4.3: Connect from C#
- [ ] **Install NuGet Package**
  ```bash
  dotnet add package StackExchange.Redis
  ```

- [ ] **Test Code (Program.cs)**
  ```csharp
  using StackExchange.Redis;
  using System;
  
  class Program
  {
      static void Main(string[] args)
      {
          string redisHost = Environment.GetEnvironmentVariable("REDIS_HOST");
          string redisPassword = Environment.GetEnvironmentVariable("REDIS_PASSWORD");
          int redisPort = int.Parse(Environment.GetEnvironmentVariable("REDIS_PORT") ?? "10000");
          
          Console.WriteLine($"Connecting to {redisHost}:{redisPort}...");
          
          var config = new ConfigurationOptions
          {
              EndPoints = { $"{redisHost}:{redisPort}" },
              Password = redisPassword,
              Ssl = true,
              AbortOnConnectFail = false,
              ConnectTimeout = 5000
          };
          
          try
          {
              using var redis = ConnectionMultiplexer.Connect(config);
              var db = redis.GetDatabase();
              
              // Test connection
              var pong = db.Ping();
              Console.WriteLine($"✅ Connection successful: PING took {pong.TotalMilliseconds}ms");
              
              // Set a value
              db.StringSet("workshop:csharp", "Connected from C#!");
              Console.WriteLine("✅ SET command successful");
              
              // Get the value
              string value = db.StringGet("workshop:csharp");
              Console.WriteLine($"✅ GET command successful: {value}");
              
              // Get server info
              var server = redis.GetServer($"{redisHost}:{redisPort}");
              var info = server.Info("server");
              Console.WriteLine($"✅ Redis version: {info[0]["redis_version"]}");
              
              Console.WriteLine("\n🎉 All tests passed!");
          }
          catch (Exception ex)
          {
              Console.WriteLine($"❌ Error: {ex.Message}");
          }
      }
  }
  ```

---

## 📊 Deliverables Checklist

### 1. Lab Instructions Document
- [ ] **Step-by-step guide with screenshots**
  - Complete walkthrough for Portal provisioning
  - Complete walkthrough for CLI provisioning
  - Authentication configuration steps
  - Connectivity testing procedures

### 2. Quick Start Scripts
- [ ] **Provision Script (provision-redis.sh)**
  ```bash
  #!/bin/bash
  # Complete automated provisioning script
  # with error handling and validation
  ```

- [ ] **Cleanup Script (cleanup-redis.sh)**
  ```bash
  #!/bin/bash
  # Delete resources to avoid costs
  az group delete --name redis-workshop-rg --yes --no-wait
  ```

- [ ] **Test Connection Script (test-all.sh)**
  ```bash
  #!/bin/bash
  # Tests connection from CLI, Python, and C#
  ```

### 3. Configuration Templates
- [ ] **Bicep Template (redis-managed.bicep)**
  ```bicep
  // Infrastructure as Code template
  // For automated deployments
  ```

- [ ] **ARM Template (redis-managed.json)**
  ```json
  // Alternative to Bicep
  ```

- [ ] **Terraform Configuration (main.tf)**
  ```hcl
  // For organizations using Terraform
  ```

### 4. Troubleshooting Guide
- [ ] **Common Issues and Solutions**
  ```markdown
  ## Common Issues
  
  ### Issue 1: "Name already exists"
  **Solution:** Choose different name (must be globally unique)
  
  ### Issue 2: "Cannot connect" from Redis CLI
  **Solution:** 
  - Check firewall rules
  - Verify TLS configuration
  - Confirm correct credentials
  
  ### Issue 3: "Insufficient permissions"
  **Solution:** 
  - Verify Azure RBAC role
  - Check Entra ID configuration
  - Ensure correct subscription
  ```

---

## 🎨 Visual Assets Needed

### Screenshots to Capture
- [ ] Azure Portal - Create Resource page
- [ ] Azure Portal - Azure Managed Redis basics tab (filled)
- [ ] Azure Portal - Networking configuration
- [ ] Azure Portal - Authentication settings
- [ ] Azure Portal - Review + Create summary
- [ ] Azure Portal - Deployment in progress
- [ ] Azure Portal - Redis instance overview (deployed)
- [ ] Azure Portal - Access keys page
- [ ] Redis CLI - Successful connection
- [ ] Python script - Successful output
- [ ] C# program - Successful output

### Diagrams to Create
- [ ] **Lab Architecture Diagram**
  ```
  ┌─────────────┐
  │ Your Local  │
  │  Machine    │
  └──────┬──────┘
         │
         │ (TLS/SSL)
         │
    ┌────▼─────┐
    │ Firewall │
    └────┬─────┘
         │
    ┌────▼────────────────────┐
    │  Azure Managed Redis    │
    │  ┌──────────────────┐   │
    │  │  Database        │   │
    │  │  (default)       │   │
    │  └──────────────────┘   │
    └─────────────────────────┘
  ```

- [ ] **Authentication Flow Diagram**
  ```
  Access Key Auth          Entra ID Auth
  ──────────────          ─────────────
  App → Redis             App → Entra ID → Token
    (password)            Token → Redis
  ```

---

## 💻 Code Examples & Lab Files

### Complete Lab Repository Structure
```
module-04-lab/
├── README.md                    # Lab overview
├── prerequisites/
│   ├── verify-tools.sh         # Tool verification
│   └── .env.template           # Environment template
├── portal-setup/
│   ├── instructions.md         # Portal walkthrough
│   └── screenshots/            # Step-by-step images
├── cli-setup/
│   ├── provision-redis.sh      # Automated provisioning
│   ├── configure-auth.sh       # Authentication setup
│   ├── configure-networking.sh # Network configuration
│   └── cleanup.sh              # Resource cleanup
├── iac/
│   ├── bicep/
│   │   ├── main.bicep          # Bicep template
│   │   └── parameters.json     # Parameters
│   ├── arm/
│   │   └── template.json       # ARM template
│   └── terraform/
│       ├── main.tf             # Terraform config
│       └── variables.tf        # Variables
├── test-connection/
│   ├── python/
│   │   ├── requirements.txt
│   │   └── test_connection.py
│   ├── csharp/
│   │   ├── TestConnection.csproj
│   │   └── Program.cs
│   └── nodejs/
│       ├── package.json
│       └── test-connection.js
└── troubleshooting/
    └── common-issues.md
```

---

## 📖 Reference Materials

### Azure Documentation Links
- [ ] [Azure Managed Redis Documentation](https://learn.microsoft.com/azure/azure-cache-for-redis/)
- [ ] [Azure CLI Redis Enterprise Commands](https://learn.microsoft.com/cli/azure/redisenterprise)
- [ ] [Quickstart: Create Azure Managed Redis](https://learn.microsoft.com/azure/azure-cache-for-redis/quickstart-create-redis-enterprise)
- [ ] [Configure Entra ID Authentication](https://learn.microsoft.com/azure/azure-cache-for-redis/cache-azure-active-directory-for-authentication)

### Client Library Documentation
- [ ] [redis-py Documentation](https://redis-py.readthedocs.io/)
- [ ] [StackExchange.Redis Documentation](https://stackexchange.github.io/StackExchange.Redis/)
- [ ] [node-redis Documentation](https://github.com/redis/node-redis)

---

## 🎯 Success Criteria

### Participants Should Be Able To:
- [ ] Provision Redis instance independently (Portal OR CLI)
- [ ] Configure authentication correctly
- [ ] Successfully connect from Redis CLI
- [ ] Successfully connect from application code (Python OR C#)
- [ ] Understand security considerations
- [ ] Navigate Azure Portal for Redis management
- [ ] Use Azure CLI for Redis operations

### Lab Completion Checklist for Participants:
```markdown
## My Lab Completion Checklist

- [ ] Created Resource Group
- [ ] Provisioned Azure Managed Redis instance
- [ ] Retrieved access keys
- [ ] Configured Entra ID (optional)
- [ ] Connected with Redis CLI
- [ ] Ran Python test script successfully
- [ ] (Optional) Ran C# test script successfully
- [ ] Verified data persistence
- [ ] Reviewed monitoring dashboard
- [ ] Understand how to clean up resources
```

---

## ⏱️ Time Allocation (40 minutes)

| Activity | Duration | Type |
|----------|----------|------|
| Pre-Lab Setup & Tools | 5 min | Preparation |
| Exercise 1: Portal Provisioning | 10 min | Hands-On |
| Exercise 2: CLI Provisioning | 10 min | Hands-On |
| Exercise 3: Authentication & Access | 8 min | Configuration |
| Exercise 4: Test Connectivity | 7 min | Validation |

**Note:** Exercises 1 and 2 can run in parallel (split class) to save time

---

## 🎬 Instructor Guide

### Before the Lab
- [ ] Verify all participants have Azure subscriptions
- [ ] Send prerequisites email 24 hours in advance
- [ ] Test all scripts and code examples
- [ ] Prepare troubleshooting resources
- [ ] Set up screen sharing for demonstrations

### During the Lab
- [ ] Start with quick demo (5 min)
- [ ] Monitor chat for common issues
- [ ] Have TAs available for 1-on-1 help
- [ ] Share common fixes proactively
- [ ] Keep track of timing

### Common Student Blockers
- [ ] **Issue:** "Name is not available"
  - **Fix:** Add suffix (timestamp, initials, random number)

- [ ] **Issue:** "Deployment failed - quota exceeded"
  - **Fix:** Use different region, contact support, or use Portal

- [ ] **Issue:** "Cannot connect - connection timeout"
  - **Fix:** Check firewall, verify TLS settings, confirm public endpoint

- [ ] **Issue:** "Authentication failed"
  - **Fix:** Regenerate keys, check for typos, verify connection string format

### Timing Tips
- [ ] Start Portal provisioning first (takes 8 min)
- [ ] Teach CLI commands while Portal deploys
- [ ] Have backup pre-provisioned instances if time is critical
- [ ] Skip C# example if running behind (Python is sufficient)

---

## ✅ Content Creation Checklist

### Lab Instructions
- [ ] Write detailed step-by-step guide
- [ ] Capture all screenshots
- [ ] Create video walkthrough (optional)
- [ ] Write instructor notes
- [ ] Create participant handout

### Scripts and Code
- [ ] Write provisioning script (Bash)
- [ ] Write cleanup script
- [ ] Write Python test code
- [ ] Write C# test code
- [ ] Write Node.js test code (optional)
- [ ] Test all scripts in clean environment

### Infrastructure as Code
- [ ] Create Bicep template
- [ ] Create ARM template
- [ ] Create Terraform configuration
- [ ] Test all IaC deployments
- [ ] Document parameters

### Support Materials
- [ ] Create troubleshooting guide
- [ ] Write FAQ document
- [ ] Prepare common error solutions
- [ ] Create backup instructions
- [ ] Prepare cost estimation guide

### Quality Assurance
- [ ] Run through complete lab as participant
- [ ] Time each exercise
- [ ] Test on Windows, macOS, Linux
- [ ] Verify all links work
- [ ] Proofread all content
- [ ] Technical review
- [ ] Pilot test with 2-3 users

---

**Status:** ✅ Checklist Complete - Ready for Content Development  
**Version:** 1.0  
**Last Updated:** November 18, 2025
