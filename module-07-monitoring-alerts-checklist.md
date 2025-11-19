# Module 7: Monitoring & Alerts Lab

**Duration:** 45 minutes  
**Format:** Hands-On Lab  
**Level:** Intermediate

## Overview

In this hands-on lab, you'll learn how to effectively monitor Azure Cache for Redis using Azure Monitor, Log Analytics, and Azure alerts. You'll set up comprehensive monitoring, create custom dashboards, write KQL queries, and configure intelligent alerting.

## Learning Objectives

By the end of this module, you will be able to:

- Configure diagnostic settings for Azure Cache for Redis
- Use Azure Monitor metrics and insights
- Write KQL queries to analyze Redis logs
- Create custom monitoring dashboards
- Set up proactive alerts for critical metrics
- Implement automated responses to alerts

## Prerequisites

- Active Azure subscription
- Azure Cache for Redis instance (Basic, Standard, or Premium tier)
- Azure CLI installed and configured
- Basic understanding of Redis operations

## Lab Environment Setup

### 1. Enable Diagnostic Settings

First, configure your Redis instance to send logs and metrics to Log Analytics.

```bash
# Create a Log Analytics workspace
az monitor log-analytics workspace create \
  --resource-group rg-redis-workshop \
  --workspace-name law-redis-monitoring \
  --location eastus

# Get the workspace ID
WORKSPACE_ID=$(az monitor log-analytics workspace show \
  --resource-group rg-redis-workshop \
  --workspace-name law-redis-monitoring \
  --query id -o tsv)

# Get your Redis cache resource ID
REDIS_ID=$(az redis show \
  --name my-redis-cache \
  --resource-group rg-redis-workshop \
  --query id -o tsv)

# Enable diagnostic settings
az monitor diagnostic-settings create \
  --name redis-diagnostics \
  --resource $REDIS_ID \
  --workspace $WORKSPACE_ID \
  --logs '[{"category":"ConnectedClientList","enabled":true},{"category":"OperationLogs","enabled":true}]' \
  --metrics '[{"category":"AllMetrics","enabled":true}]'
```

### 2. Verify Diagnostic Settings

```bash
# Check diagnostic settings
az monitor diagnostic-settings show \
  --name redis-diagnostics \
  --resource $REDIS_ID
```

## Key Metrics to Monitor

### Performance Metrics

1. **Server Load** - Percentage of cycles in which Redis server is busy processing
   - Target: < 80%
   - Critical: > 90%

2. **Cache Hit Rate** - Percentage of successful key lookups
   - Target: > 80%
   - Warning: < 70%

3. **Used Memory** - Amount of cache memory used
   - Target: < 80% of max memory
   - Critical: > 95%

4. **Connections** - Number of client connections
   - Monitor for connection spikes
   - Watch for connection limit approaching

5. **Operations Per Second** - Total operations performed
   - Baseline normal operations
   - Alert on unusual spikes/drops

### Latency Metrics

1. **Get Latency** - Time to retrieve keys
2. **Set Latency** - Time to write keys
3. **Network Latency** - Client-to-Redis network time

## Azure Monitor Integration

### View Metrics in Azure Portal

1. Navigate to your Redis cache in Azure Portal
2. Select **Metrics** from the left menu
3. Add metrics to monitor:

```
Metric: Server Load
Aggregation: Average
Time range: Last 24 hours
```

### Create a Metrics Chart

```bash
# Example: Create a chart showing server load and cache hits
# This would be done in the Azure Portal UI
```

## Writing KQL Queries

### Access Log Analytics

1. Navigate to your Log Analytics workspace
2. Select **Logs** from the left menu
3. Start writing KQL queries

### Essential KQL Queries

#### 1. Connection Events

```kql
AzureDiagnostics
| where ResourceType == "REDIS"
| where Category == "ConnectedClientList"
| project TimeGenerated, OperationName, clientIp_s, clientPort_s
| order by TimeGenerated desc
| take 100
```

#### 2. High Server Load Analysis

```kql
AzureMetrics
| where ResourceId contains "REDIS"
| where MetricName == "serverLoad"
| where Average > 80
| summarize 
    AvgLoad = avg(Average),
    MaxLoad = max(Maximum),
    Count = count()
    by bin(TimeGenerated, 5m)
| order by TimeGenerated desc
```

#### 3. Cache Hit Rate Monitoring

```kql
AzureMetrics
| where ResourceId contains "REDIS"
| where MetricName in ("cachehits", "cachemisses")
| summarize 
    Hits = sumif(Total, MetricName == "cachehits"),
    Misses = sumif(Total, MetricName == "cachemisses")
    by bin(TimeGenerated, 1h)
| extend HitRate = (Hits * 100.0) / (Hits + Misses)
| project TimeGenerated, HitRate, Hits, Misses
| order by TimeGenerated desc
```

#### 4. Memory Usage Trends

```kql
AzureMetrics
| where ResourceId contains "REDIS"
| where MetricName == "usedmemory"
| summarize 
    AvgMemory = avg(Average),
    MaxMemory = max(Maximum)
    by bin(TimeGenerated, 1h)
| order by TimeGenerated desc
```

#### 5. Connection Spikes Detection

```kql
AzureMetrics
| where ResourceId contains "REDIS"
| where MetricName == "connectedclients"
| summarize 
    AvgConnections = avg(Average),
    MaxConnections = max(Maximum)
    by bin(TimeGenerated, 5m)
| extend ConnectionSpike = iff(MaxConnections > (AvgConnections * 2), true, false)
| where ConnectionSpike == true
| order by TimeGenerated desc
```

#### 6. Operations Per Second

```kql
AzureMetrics
| where ResourceId contains "REDIS"
| where MetricName == "operationsPerSecond"
| summarize 
    TotalOps = sum(Total),
    AvgOps = avg(Average)
    by bin(TimeGenerated, 5m)
| order by TimeGenerated desc
```

#### 7. Error Analysis

```kql
AzureDiagnostics
| where ResourceType == "REDIS"
| where Category == "OperationLogs"
| where Level == "Error"
| summarize ErrorCount = count() by OperationName, bin(TimeGenerated, 1h)
| order by ErrorCount desc
```

#### 8. Latency Analysis

```kql
AzureMetrics
| where ResourceId contains "REDIS"
| where MetricName in ("usedmemorypercentage", "serverLoad")
| summarize 
    MemoryPct = avgif(Average, MetricName == "usedmemorypercentage"),
    ServerLoad = avgif(Average, MetricName == "serverLoad")
    by bin(TimeGenerated, 5m)
| where MemoryPct > 80 or ServerLoad > 80
| order by TimeGenerated desc
```

## Creating Custom Dashboards

### Dashboard Components

1. **Server Load Chart** - Line chart showing server load over time
2. **Memory Usage Gauge** - Current memory utilization percentage
3. **Cache Hit Rate** - Trend chart of cache effectiveness
4. **Active Connections** - Current number of connected clients
5. **Operations/Second** - Real-time operations throughput
6. **Error Log Table** - Recent errors from operation logs

### Create Dashboard via Azure CLI

```bash
# Create a dashboard JSON configuration
cat > redis-dashboard.json << 'EOF'
{
  "lenses": {
    "0": {
      "order": 0,
      "parts": {
        "0": {
          "position": {"x": 0, "y": 0, "colSpan": 6, "rowSpan": 4},
          "metadata": {
            "type": "Extension/HubsExtension/PartType/MonitorChartPart",
            "settings": {
              "content": {
                "options": {
                  "chart": {
                    "metrics": [
                      {
                        "resourceMetadata": {"id": "$REDIS_ID"},
                        "name": "serverLoad",
                        "aggregationType": 4
                      }
                    ],
                    "title": "Server Load",
                    "timespan": {"relative": {"duration": 3600000}}
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
EOF
```

## Configuring Alerts

### Alert Types

1. **Metric Alerts** - Based on metric thresholds
2. **Log Alerts** - Based on KQL query results
3. **Activity Log Alerts** - Based on control plane events

### Create Metric Alerts

#### High Server Load Alert

```bash
# Create action group for notifications
az monitor action-group create \
  --name ag-redis-alerts \
  --resource-group rg-redis-workshop \
  --short-name RedisAlert \
  --email-receiver name="Admin" email-address="admin@example.com"

# Create high server load alert
az monitor metrics alert create \
  --name alert-high-server-load \
  --resource-group rg-redis-workshop \
  --scopes $REDIS_ID \
  --condition "avg serverLoad > 85" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action ag-redis-alerts \
  --description "Alert when server load exceeds 85% for 5 minutes"
```

#### High Memory Usage Alert

```bash
az monitor metrics alert create \
  --name alert-high-memory \
  --resource-group rg-redis-workshop \
  --scopes $REDIS_ID \
  --condition "avg usedmemorypercentage > 90" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action ag-redis-alerts \
  --description "Alert when memory usage exceeds 90%"
```

#### Low Cache Hit Rate Alert

```bash
az monitor metrics alert create \
  --name alert-low-cache-hitrate \
  --resource-group rg-redis-workshop \
  --scopes $REDIS_ID \
  --condition "avg cachehitrate < 0.70" \
  --window-size 15m \
  --evaluation-frequency 5m \
  --action ag-redis-alerts \
  --description "Alert when cache hit rate drops below 70%"
```

#### Connection Limit Alert

```bash
az monitor metrics alert create \
  --name alert-high-connections \
  --resource-group rg-redis-workshop \
  --scopes $REDIS_ID \
  --condition "avg connectedclients > 9000" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action ag-redis-alerts \
  --description "Alert when connected clients exceed 9000"
```

### Create Log Query Alerts

#### Repeated Connection Failures Alert

```bash
# Create a log alert for connection errors
az monitor scheduled-query create \
  --name alert-connection-failures \
  --resource-group rg-redis-workshop \
  --scopes $WORKSPACE_ID \
  --condition "count 'Heartbeat' > 10" \
  --condition-query "AzureDiagnostics | where ResourceType == 'REDIS' | where Level == 'Error' | summarize AggregatedValue = count() by bin(TimeGenerated, 5m)" \
  --window-size 15m \
  --evaluation-frequency 5m \
  --action-groups $ACTION_GROUP_ID \
  --description "Alert on repeated connection failures"
```

## Advanced Monitoring Scenarios

### 1. Multi-Dimensional Alerts

Create alerts that combine multiple metrics:

```bash
# Alert when both server load AND memory are high
az monitor metrics alert create \
  --name alert-combined-pressure \
  --resource-group rg-redis-workshop \
  --scopes $REDIS_ID \
  --condition "avg serverLoad > 80" \
  --condition "avg usedmemorypercentage > 80" \
  --condition-type Multiple \
  --window-size 10m \
  --evaluation-frequency 5m \
  --action ag-redis-alerts
```

### 2. Dynamic Thresholds

Use machine learning to detect anomalies:

```bash
az monitor metrics alert create \
  --name alert-anomaly-ops \
  --resource-group rg-redis-workshop \
  --scopes $REDIS_ID \
  --condition "avg operationsPerSecond > dynamic" \
  --window-size 15m \
  --evaluation-frequency 5m \
  --action ag-redis-alerts \
  --description "Alert on unusual operations patterns"
```

### 3. Composite Alerts

Create alerts based on multiple signals:

```kql
// KQL for composite alert
let HighLoad = AzureMetrics
| where MetricName == "serverLoad"
| where Average > 85;
let HighMemory = AzureMetrics
| where MetricName == "usedmemorypercentage"
| where Average > 85;
HighLoad
| join kind=inner HighMemory on TimeGenerated
| project TimeGenerated, ServerLoad=Average, MemoryPct=Average1
```

## Automation with Azure Functions

### Auto-Response to Alerts

Create an Azure Function that responds to alerts:

```javascript
// function.js - Auto-scaling response
module.exports = async function (context, req) {
    const alert = req.body;
    
    if (alert.data.context.condition.allOf[0].metricName === 'serverLoad' 
        && alert.data.context.condition.allOf[0].metricValue > 90) {
        
        // Trigger scale-up operation
        await scaleRedisCache(alert.data.context.resourceId, 'up');
        
        context.res = {
            status: 200,
            body: "Auto-scale triggered"
        };
    }
};

async function scaleRedisCache(resourceId, direction) {
    // Implementation to scale Redis cache
    // Using Azure SDK or Management API
}
```

## Best Practices

### Monitoring Strategy

1. **Baseline Normal Behavior**
   - Monitor for 1-2 weeks to establish baseline
   - Identify daily/weekly patterns
   - Set thresholds based on baseline + margin

2. **Layered Alerting**
   - Warning level: 70-80% thresholds
   - Critical level: 90%+ thresholds
   - Use escalating notification strategies

3. **Alert Fatigue Prevention**
   - Group related alerts
   - Use appropriate evaluation windows
   - Implement alert suppression during maintenance

4. **Regular Review**
   - Review alerts weekly
   - Adjust thresholds based on false positives
   - Archive resolved alerts for future reference

### Query Optimization

1. Use time range filters to limit data scanned
2. Apply resource filters early in queries
3. Use summarize instead of raw data when possible
4. Save frequently used queries as functions

### Dashboard Design

1. **Executive Dashboard** - High-level KPIs
2. **Operations Dashboard** - Real-time metrics
3. **Troubleshooting Dashboard** - Detailed diagnostics
4. **Capacity Planning Dashboard** - Trends and forecasts

## Hands-On Exercises

### Exercise 1: Set Up Complete Monitoring

1. Enable diagnostic settings
2. Create 5 essential metric alerts
3. Build a custom dashboard with 6 widgets
4. Test alerts by generating load

### Exercise 2: Write KQL Queries

1. Find top 10 operations by count
2. Calculate average cache hit rate per hour
3. Identify connection patterns by IP
4. Detect memory usage spikes

### Exercise 3: Implement Alert Response

1. Create an action group with webhook
2. Build a simple webhook receiver
3. Test alert delivery
4. Implement automated response

## Troubleshooting Common Issues

### Issue: No Data in Log Analytics

**Solution:**
- Verify diagnostic settings are enabled
- Check that workspace is in same region
- Wait 5-10 minutes for initial data ingestion
- Verify workspace permissions

### Issue: Alert Not Firing

**Solution:**
- Check alert condition syntax
- Verify evaluation frequency and window size
- Ensure action group is configured correctly
- Review alert history in Azure Portal

### Issue: High Query Costs

**Solution:**
- Optimize KQL queries
- Reduce dashboard refresh frequency
- Use sampling for high-volume logs
- Implement data retention policies

## Summary

In this lab, you've learned to:

- ✅ Configure comprehensive monitoring for Azure Cache for Redis
- ✅ Write effective KQL queries for log analysis
- ✅ Create custom dashboards for different audiences
- ✅ Set up intelligent alerts with appropriate thresholds
- ✅ Implement automated responses to alerts
- ✅ Follow best practices for production monitoring

## Additional Resources

- [Azure Monitor documentation](https://docs.microsoft.com/azure/azure-monitor/)
- [KQL quick reference](https://docs.microsoft.com/azure/data-explorer/kql-quick-reference)
- [Azure Cache for Redis metrics](https://docs.microsoft.com/azure/azure-cache-for-redis/cache-how-to-monitor)
- [Alert best practices](https://docs.microsoft.com/azure/azure-monitor/alerts/alerts-best-practices)

## Next Steps

Continue to **Module 8: Troubleshooting & Migration** to learn advanced diagnostic techniques and migration strategies.

---

**Lab Status:** ✅ Complete  
**Last Updated:** November 2025  
**Version:** 2.0
