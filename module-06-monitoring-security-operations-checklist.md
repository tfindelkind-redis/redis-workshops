# Module 6: Monitoring, Security & Operations - Content Checklist

## 📋 Module Metadata

- **Module ID:** module-06-monitoring-security-operations
- **Title:** Monitoring, Security & Operations
- **Duration:** 45 minutes
- **Type:** Theory + Demo + Hands-On
- **Difficulty:** Intermediate
- **Prerequisites:**
  - Module 2 (Architecture)
  - Module 4 (Provisioned Redis instance)
- **Standalone:** Partial

---

## 🎯 Learning Objectives

By the end of this module, participants will be able to:

1. ✅ Configure Azure Monitor for Redis metrics and logs
2. ✅ Set up alerts for critical Redis events
3. ✅ Implement security best practices (networking, authentication)
4. ✅ Configure backup and disaster recovery
5. ✅ Use Azure diagnostic settings effectively
6. ✅ Troubleshoot common Redis issues
7. ✅ Implement operational runbooks
8. ✅ Optimize costs and performance

---

## 📚 Content Outline (45 minutes)

### Section 1: Monitoring with Azure Monitor (12 minutes)

#### 1.1 Key Metrics to Monitor
- [ ] **Performance Metrics**
  ```markdown
  ### Critical Performance Metrics:
  
  **Server Load:**
  - Metric: `percentProcessorTime`
  - Target: < 80%
  - Alert: > 90%
  - Action: Scale up or add shards
  
  **Memory Usage:**
  - Metric: `usedMemoryPercentage`
  - Target: < 80%
  - Alert: > 90%
  - Action: Increase memory tier or implement eviction
  
  **Operations per Second:**
  - Metric: `operationsPerSecond`
  - Monitor: Baseline and trends
  - Alert: Sudden drops (possible issue)
  
  **Connected Clients:**
  - Metric: `connectedClients`
  - Monitor: Connection pool exhaustion
  - Alert: Near maximum (depends on SKU)
  
  **Cache Hit Rate:**
  - Metric: `cacheHitRate`
  - Target: > 80%
  - Alert: < 60%
  - Action: Review caching strategy
  ```

- [ ] **Availability Metrics**
  ```markdown
  **Server Status:**
  - Metric: `status`
  - Target: 1 (healthy)
  - Alert: 0 (unhealthy)
  
  **Errors:**
  - Metric: `errors`
  - Target: 0
  - Alert: > 0
  
  **Latency:**
  - Metric: `serverLatency`
  - Target: < 5ms
  - Alert: > 10ms consistently
  ```

#### 1.2 Configure Azure Monitor
- [ ] **Portal Configuration Demo**
  ```markdown
  ### Steps to Configure Monitoring:
  
  1. Navigate to Redis instance in Azure Portal
  2. Left menu → "Monitoring" → "Metrics"
  3. Click "+ New metric"
  4. Select metrics to monitor:
     - Server Load (percentProcessorTime)
     - Memory Usage (usedMemoryPercentage)
     - Operations/sec (operationsPerSecond)
     - Cache Hit Rate (cacheHitRate)
  5. Save to dashboard
  ```

- [ ] **Screenshot:** Azure Portal Metrics configuration

- [ ] **Azure CLI Configuration**
  ```bash
  # Get available metrics
  az monitor metrics list-definitions \
    --resource-group $RESOURCE_GROUP \
    --resource-type "Microsoft.Cache/redis" \
    --resource-name $REDIS_NAME
  
  # Query specific metric
  az monitor metrics list \
    --resource-group $RESOURCE_GROUP \
    --resource-type "Microsoft.Cache/redis" \
    --resource-name $REDIS_NAME \
    --metric "usedMemoryPercentage" \
    --start-time 2025-11-18T00:00:00Z \
    --end-time 2025-11-18T23:59:59Z \
    --interval PT1H
  ```

#### 1.3 Create Monitoring Dashboard
- [ ] **Custom Dashboard Template**
  ```markdown
  ### Redis Monitoring Dashboard Layout:
  
  **Row 1: Health Overview**
  - [Server Status] [Error Count] [Connected Clients]
  
  **Row 2: Performance**
  - [CPU Usage] [Memory Usage] [Operations/sec]
  
  **Row 3: Cache Effectiveness**
  - [Cache Hit Rate] [Cache Miss Rate] [Evicted Keys]
  
  **Row 4: Network**
  - [Bandwidth In] [Bandwidth Out] [Latency]
  ```

- [ ] **Dashboard JSON Export/Import**
  - Provide pre-built dashboard template
  - Instructions for importing

---

### Section 2: Alerting & Notifications (8 minutes)

#### 2.1 Configure Alert Rules
- [ ] **High CPU Alert**
  ```bash
  # Create action group for notifications
  az monitor action-group create \
    --resource-group $RESOURCE_GROUP \
    --name "redis-ops-team" \
    --short-name "RedisOps" \
    --email-receiver "ops-email" "ops@company.com" \
    --sms-receiver "ops-sms" "+1" "1234567890"
  
  # Create alert rule for high CPU
  az monitor metrics alert create \
    --resource-group $RESOURCE_GROUP \
    --name "redis-high-cpu" \
    --description "Alert when CPU > 90%" \
    --scopes "/subscriptions/.../Microsoft.Cache/redis/$REDIS_NAME" \
    --condition "avg percentProcessorTime > 90" \
    --window-size 5m \
    --evaluation-frequency 1m \
    --action "redis-ops-team" \
    --severity 2
  ```

- [ ] **Alert Rule Templates**
  ```markdown
  ### Recommended Alert Rules:
  
  | Alert | Metric | Threshold | Severity | Action |
  |-------|--------|-----------|----------|--------|
  | High CPU | percentProcessorTime | > 90% for 5 min | Critical | Scale up |
  | High Memory | usedMemoryPercentage | > 90% for 5 min | Critical | Increase tier |
  | Low Cache Hit | cacheHitRate | < 60% for 10 min | Warning | Review strategy |
  | Connection Limit | connectedClients | > 80% of max | Warning | Check leaks |
  | Server Errors | errors | > 0 | Critical | Investigate immediately |
  | High Latency | serverLatency | > 10ms for 5 min | Warning | Check network |
  ```

#### 2.2 Notification Channels
- [ ] **Action Groups Configuration**
  ```markdown
  ### Action Group Options:
  
  **Email:**
  - Operations team distribution list
  - On-call rotation
  
  **SMS:**
  - Critical alerts only
  - Primary on-call engineer
  
  **Webhook:**
  - PagerDuty integration
  - Slack/Teams notifications
  - ITSM ticketing system
  
  **Azure Function:**
  - Auto-remediation scripts
  - Custom escalation logic
  
  **Logic App:**
  - Complex notification workflows
  - Multi-stage escalation
  ```

- [ ] **Sample Webhook Integration (Slack)**
  ```python
  # Azure Function to send to Slack
  import json
  import requests
  
  def main(req):
      alert_data = req.get_json()
      
      # Parse alert
      metric = alert_data['data']['essentials']['metricName']
      value = alert_data['data']['essentials']['monitoredValue']
      severity = alert_data['data']['essentials']['severity']
      
      # Send to Slack
      slack_webhook = "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
      message = {
          "text": f"🚨 Redis Alert: {metric}",
          "attachments": [{
              "color": "danger" if severity == "Critical" else "warning",
              "fields": [
                  {"title": "Metric", "value": metric, "short": True},
                  {"title": "Value", "value": value, "short": True},
                  {"title": "Severity", "value": severity, "short": True}
              ]
          }]
      }
      
      requests.post(slack_webhook, json=message)
  ```

---

### Section 3: Diagnostic Logging (8 minutes)

#### 3.1 Configure Diagnostic Settings
- [ ] **Portal Configuration**
  ```markdown
  ### Enable Diagnostic Logging:
  
  1. Navigate to Redis instance
  2. Left menu → "Monitoring" → "Diagnostic settings"
  3. Click "+ Add diagnostic setting"
  4. Name: "redis-diagnostics"
  5. Select log categories:
     - ☑️ ConnectedClientList
     - ☑️ AllMetrics
  6. Destination:
     - ☑️ Send to Log Analytics workspace
     - ☑️ Archive to storage account
  7. Save
  ```

- [ ] **Azure CLI Configuration**
  ```bash
  # Create Log Analytics workspace
  az monitor log-analytics workspace create \
    --resource-group $RESOURCE_GROUP \
    --workspace-name "redis-logs-workspace"
  
  # Get workspace ID
  WORKSPACE_ID=$(az monitor log-analytics workspace show \
    --resource-group $RESOURCE_GROUP \
    --workspace-name "redis-logs-workspace" \
    --query "id" -o tsv)
  
  # Enable diagnostic settings
  az monitor diagnostic-settings create \
    --resource $REDIS_ID \
    --name "redis-diagnostics" \
    --workspace $WORKSPACE_ID \
    --logs '[
      {
        "category": "ConnectedClientList",
        "enabled": true,
        "retentionPolicy": {"days": 30, "enabled": true}
      }
    ]' \
    --metrics '[
      {
        "category": "AllMetrics",
        "enabled": true,
        "retentionPolicy": {"days": 30, "enabled": true}
      }
    ]'
  ```

#### 3.2 Query Logs with Kusto (KQL)
- [ ] **Common Log Queries**
  ```kql
  // Get all Redis operations in last hour
  AzureDiagnostics
  | where ResourceProvider == "MICROSOFT.CACHE"
  | where TimeGenerated > ago(1h)
  | project TimeGenerated, OperationName, ResultType, Resource
  | order by TimeGenerated desc
  
  // Find slow operations
  AzureDiagnostics
  | where ResourceProvider == "MICROSOFT.CACHE"
  | where DurationMs > 1000
  | project TimeGenerated, OperationName, DurationMs, CallerIpAddress
  | order by DurationMs desc
  
  // Monitor connection counts
  AzureDiagnostics
  | where Category == "ConnectedClientList"
  | summarize MaxConnections = max(connectedClients_d) by bin(TimeGenerated, 5m)
  | render timechart
  
  // Error analysis
  AzureDiagnostics
  | where ResourceProvider == "MICROSOFT.CACHE"
  | where ResultType != "Success"
  | summarize ErrorCount = count() by OperationName, ResultType
  | order by ErrorCount desc
  
  // Cache hit rate over time
  AzureMetrics
  | where ResourceProvider == "MICROSOFT.CACHE"
  | where MetricName == "CacheHitRate"
  | summarize AvgHitRate = avg(Average) by bin(TimeGenerated, 5m)
  | render timechart
  ```

- [ ] **Save Common Queries**
  - Create query pack for team
  - Share queries across organization

---

### Section 4: Security Best Practices (12 minutes)

#### 4.1 Network Security
- [ ] **Private Endpoint Configuration (Demo)**
  ```bash
  # Create VNet and subnet
  az network vnet create \
    --resource-group $RESOURCE_GROUP \
    --name "redis-vnet" \
    --address-prefix 10.0.0.0/16 \
    --subnet-name "redis-subnet" \
    --subnet-prefix 10.0.1.0/24
  
  # Disable private endpoint network policies
  az network vnet subnet update \
    --resource-group $RESOURCE_GROUP \
    --vnet-name "redis-vnet" \
    --name "redis-subnet" \
    --disable-private-endpoint-network-policies true
  
  # Create private endpoint
  az network private-endpoint create \
    --resource-group $RESOURCE_GROUP \
    --name "redis-private-endpoint" \
    --vnet-name "redis-vnet" \
    --subnet "redis-subnet" \
    --private-connection-resource-id $REDIS_ID \
    --group-id "redisCache" \
    --connection-name "redis-connection"
  
  # Create private DNS zone
  az network private-dns zone create \
    --resource-group $RESOURCE_GROUP \
    --name "privatelink.redis.cache.windows.net"
  
  # Link DNS zone to VNet
  az network private-dns link vnet create \
    --resource-group $RESOURCE_GROUP \
    --zone-name "privatelink.redis.cache.windows.net" \
    --name "redis-dns-link" \
    --virtual-network "redis-vnet" \
    --registration-enabled false
  ```

- [ ] **Network Architecture Diagram**
  ```
  ┌────────────────────────────────────────┐
  │  Azure VNet (10.0.0.0/16)              │
  │                                        │
  │  ┌──────────────────────────────────┐ │
  │  │  App Subnet (10.0.0.0/24)        │ │
  │  │  ┌────────────┐                  │ │
  │  │  │  App VMs   │                  │ │
  │  │  └──────┬─────┘                  │ │
  │  └─────────┼──────────────────────── │
  │            │                          │
  │  ┌─────────▼──────────────────────┐  │
  │  │  Redis Subnet (10.0.1.0/24)    │  │
  │  │  ┌───────────────────┐         │  │
  │  │  │ Private Endpoint  │         │  │
  │  │  └─────────┬─────────┘         │  │
  │  └────────────┼───────────────────┘  │
  └───────────────┼──────────────────────┘
                  │ Private Link
                  ▼
       ┌──────────────────────┐
       │ Azure Managed Redis  │
       │ (Private Access)     │
       └──────────────────────┘
  ```

#### 4.2 Authentication & Authorization
- [ ] **Entra ID Best Practices**
  ```markdown
  ### Authentication Hierarchy:
  
  **Recommended (Most Secure):**
  1. Entra ID with Managed Identity
  2. Entra ID with Service Principal
  3. Access Keys (rotated regularly)
  
  **Not Recommended:**
  - Hardcoded passwords
  - Shared keys across environments
  - Never-rotated keys
  ```

- [ ] **Managed Identity Configuration**
  ```bash
  # Enable managed identity on App Service
  az webapp identity assign \
    --resource-group $RESOURCE_GROUP \
    --name $APP_SERVICE_NAME
  
  # Get managed identity principal ID
  PRINCIPAL_ID=$(az webapp identity show \
    --resource-group $RESOURCE_GROUP \
    --name $APP_SERVICE_NAME \
    --query "principalId" -o tsv)
  
  # Assign Redis Cache Contributor role
  az role assignment create \
    --assignee $PRINCIPAL_ID \
    --role "Redis Cache Contributor" \
    --scope $REDIS_ID
  ```

- [ ] **Application Code with Managed Identity (Python)**
  ```python
  from azure.identity import DefaultAzureCredential
  from azure.core.credentials import AccessToken
  import redis
  
  # Get token using managed identity
  credential = DefaultAzureCredential()
  token = credential.get_token(
      "https://redis.azure.com/.default"
  )
  
  # Connect to Redis with token
  r = redis.Redis(
      host=os.getenv('REDIS_HOST'),
      port=10000,
      ssl=True,
      password=token.token,  # Use token instead of key
      ssl_cert_reqs='required'
  )
  
  # Refresh token before expiry
  def get_redis_client():
      token = credential.get_token(
          "https://redis.azure.com/.default"
      )
      return redis.Redis(
          host=os.getenv('REDIS_HOST'),
          port=10000,
          ssl=True,
          password=token.token,
          ssl_cert_reqs='required'
      )
  ```

#### 4.3 Data Encryption
- [ ] **Encryption at Rest**
  ```markdown
  ### Azure Managed Redis Encryption:
  
  **Automatic Encryption at Rest:**
  - ✅ Enabled by default
  - ✅ Uses Azure Storage Service Encryption (SSE)
  - ✅ 256-bit AES encryption
  - ✅ Microsoft-managed keys (default)
  - ⚙️ Customer-managed keys (optional)
  
  **Customer-Managed Keys (CMK):**
  - Requires Azure Key Vault
  - Provides additional control
  - Supports key rotation
  ```

- [ ] **Encryption in Transit**
  ```markdown
  ### TLS/SSL Configuration:
  
  **Required Settings:**
  - ☑️ Minimum TLS version: 1.2
  - ☑️ Non-SSL port: Disabled
  - ☑️ SSL certificate validation: Required
  
  **Client Configuration:**
  ```python
  r = redis.Redis(
      host=redis_host,
      port=10000,  # SSL port
      ssl=True,
      ssl_cert_reqs='required',
      ssl_ca_certs='/path/to/ca-bundle.crt'
  )
  ```

#### 4.4 Access Control Lists (ACLs)
- [ ] **Redis ACL Configuration**
  ```bash
  # Create user with limited permissions
  redis-cli ACL SETUSER developer \
    on \
    >strong_password \
    ~cache:* \
    +@read +@write -@dangerous
  
  # Read-only user
  redis-cli ACL SETUSER readonly \
    on \
    >readonly_password \
    ~* \
    +@read -@write -@admin
  
  # List users
  redis-cli ACL LIST
  
  # Show user permissions
  redis-cli ACL GETUSER developer
  ```

- [ ] **ACL Best Practices Table**
  ```markdown
  | User Type | Commands | Key Pattern | Use Case |
  |-----------|----------|-------------|----------|
  | Application | @read @write | app:* | Normal app operations |
  | Read-Only | @read | * | Reporting, analytics |
  | Admin | @all | * | Operations, debugging |
  | Developer | @read @write -@dangerous | dev:* | Development environment |
  ```

---

### Section 5: Backup & Disaster Recovery (5 minutes)

#### 5.1 Configure Data Persistence
- [ ] **Persistence Options**
  ```markdown
  ### Azure Managed Redis Persistence:
  
  **AOF (Append-Only File):**
  - Logs every write operation
  - Frequency: 1 second or always
  - Better durability
  - Slightly higher overhead
  - **Recommended for production**
  
  **RDB (Snapshot):**
  - Point-in-time snapshots
  - Less frequent (every 15min, 1h, 6h, 12h)
  - Lower overhead
  - Potential data loss window
  - Good for backups
  
  **Both:**
  - Highest durability
  - Combines benefits
  - Slightly more overhead
  ```

- [ ] **Enable Persistence via CLI**
  ```bash
  # Enable AOF persistence
  az redisenterprise database update \
    --resource-group $RESOURCE_GROUP \
    --cluster-name $REDIS_NAME \
    --name default \
    --persistence AOF \
    --aof-frequency "1s"
  ```

#### 5.2 Backup Strategy
- [ ] **Export Data**
  ```bash
  # Export to blob storage (RDB)
  az redisenterprise database export \
    --resource-group $RESOURCE_GROUP \
    --cluster-name $REDIS_NAME \
    --name default \
    --sas-uri "https://storage.blob.core.windows.net/backups/redis-backup.rdb?<SAS-TOKEN>"
  ```

- [ ] **Backup Schedule Recommendations**
  ```markdown
  ### Backup Frequency:
  
  **Production (Critical):**
  - Daily full backups
  - AOF persistence enabled (1s frequency)
  - Retain 30 days
  
  **Production (Standard):**
  - Daily full backups
  - AOF persistence enabled
  - Retain 7 days
  
  **Development:**
  - Weekly backups
  - RDB snapshots
  - Retain 7 days
  ```

#### 5.3 Disaster Recovery Plan
- [ ] **DR Strategy Template**
  ```markdown
  ## Redis Disaster Recovery Plan
  
  ### RTO & RPO Targets:
  - **RTO:** < 1 hour (time to recover)
  - **RPO:** < 5 minutes (acceptable data loss)
  
  ### DR Scenarios:
  
  **Scenario 1: Single Instance Failure**
  - Impact: Service unavailable
  - Recovery: Azure auto-failover (if HA enabled)
  - Time: < 5 minutes
  
  **Scenario 2: Regional Outage**
  - Impact: Primary region unavailable
  - Recovery: Failover to geo-replica
  - Time: < 30 minutes
  
  **Scenario 3: Data Corruption**
  - Impact: Invalid data in cache
  - Recovery: Restore from backup
  - Time: < 1 hour
  
  ### Recovery Steps:
  1. Assess situation
  2. Notify stakeholders
  3. Execute recovery procedure
  4. Verify data integrity
  5. Resume normal operations
  6. Post-incident review
  ```

---

## 📊 Deliverables Checklist

### 1. Monitoring Dashboard Template
- [ ] **Azure Dashboard JSON**
  - Pre-configured metrics
  - Optimal layout
  - Import instructions

### 2. Alert Rules Template
- [ ] **Bicep/ARM Template**
  - All recommended alerts
  - Action groups
  - Severity levels
  - Deployment instructions

### 3. Security Checklist
- [ ] **Security Configuration Guide**
  ```markdown
  ## Security Checklist
  
  ### Network Security
  - [ ] Private endpoint configured
  - [ ] Public access disabled (or restricted)
  - [ ] Firewall rules configured
  - [ ] VNet integration enabled
  
  ### Authentication
  - [ ] Entra ID enabled
  - [ ] Managed identity configured
  - [ ] Access keys rotated regularly
  - [ ] ACLs configured
  
  ### Encryption
  - [ ] TLS 1.2 minimum
  - [ ] Non-SSL port disabled
  - [ ] Encryption at rest verified
  - [ ] Customer-managed keys (if required)
  
  ### Logging & Monitoring
  - [ ] Diagnostic settings enabled
  - [ ] Log Analytics configured
  - [ ] Alerts configured
  - [ ] Dashboard created
  
  ### Compliance
  - [ ] Data residency requirements met
  - [ ] Compliance tags applied
  - [ ] Audit logs enabled
  - [ ] Security scan completed
  ```

### 4. Operational Runbooks
- [ ] **Runbook Collection**
  - Scale up/down procedure
  - Backup and restore procedure
  - Incident response procedure
  - Maintenance window procedure
  - Key rotation procedure

### 5. KQL Query Library
- [ ] **Saved Queries**
  - Performance analysis
  - Error investigation
  - Usage patterns
  - Capacity planning

---

## 🎨 Visual Assets Needed

### Diagrams
- [ ] Network architecture with private endpoint
- [ ] Authentication flow (Entra ID)
- [ ] Backup and restore flow
- [ ] DR failover architecture
- [ ] Monitoring data flow

### Screenshots
- [ ] Azure Monitor metrics configuration
- [ ] Alert rule creation
- [ ] Diagnostic settings
- [ ] Private endpoint configuration
- [ ] Log Analytics query results

### Tables
- [ ] Alert rules recommendations
- [ ] Security configuration checklist
- [ ] Backup frequency matrix
- [ ] ACL permissions matrix

---

## ⏱️ Time Allocation (45 minutes)

| Section | Duration | Type |
|---------|----------|------|
| Section 1: Monitoring | 12 min | Theory + Demo |
| Section 2: Alerting | 8 min | Demo + Hands-On |
| Section 3: Logging | 8 min | Demo |
| Section 4: Security | 12 min | Theory + Demo |
| Section 5: Backup & DR | 5 min | Theory |

---

## ✅ Content Creation Checklist

### Documentation
- [ ] Write detailed content for each section
- [ ] Create monitoring setup guide
- [ ] Write security best practices guide
- [ ] Create operational runbooks
- [ ] Write troubleshooting guide

### Templates & Scripts
- [ ] Create dashboard template
- [ ] Create alert rules template (Bicep)
- [ ] Write monitoring scripts
- [ ] Create backup scripts
- [ ] Write health check scripts

### Visual Assets
- [ ] Create all diagrams
- [ ] Capture all screenshots
- [ ] Design tables and matrices

### Hands-On Components
- [ ] Create alert configuration exercise
- [ ] Write KQL query challenges
- [ ] Create security audit exercise

### Quality Assurance
- [ ] Technical review
- [ ] Test all scripts
- [ ] Validate all CLI commands
- [ ] Proofread content
- [ ] Time the delivery

---

**Status:** ✅ Checklist Complete - Ready for Content Development  
**Version:** 1.0  
**Last Updated:** November 18, 2025
