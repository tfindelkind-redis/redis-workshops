# Monitoring and Alerting

## Why Monitor Redis?

Proactive monitoring helps you:
- Detect performance issues early
- Plan capacity upgrades
- Troubleshoot problems quickly
- Ensure high availability

## Key Metrics to Monitor

### 1. Memory Metrics
- `used_memory`: Current memory usage
- `used_memory_peak`: Peak memory usage
- `mem_fragmentation_ratio`: Memory fragmentation

### 2. Performance Metrics
- `instantaneous_ops_per_sec`: Operations per second
- `keyspace_hits` / `keyspace_misses`: Hit rate
- `connected_clients`: Number of connections

### 3. Persistence Metrics
- `rdb_last_save_time`: Last RDB save
- `aof_current_rewrite_time_sec`: AOF rewrite duration
- `aof_last_write_status`: AOF write status

### 4. Replication Metrics
- `connected_slaves`: Number of replicas
- `master_repl_offset`: Replication offset
- `repl_backlog_size`: Replication backlog

## Monitoring Tools

### Built-in Commands

```bash
INFO
INFO stats
INFO memory
INFO replication
SLOWLOG GET 10
CLIENT LIST
```

### External Tools

1. **Redis Insights** - Official GUI tool
2. **Prometheus + Grafana** - Time-series monitoring
3. **Datadog / New Relic** - APM solutions
4. **RedisInsight** - Real-time monitoring

## Setting Up Alerts

### Critical Alerts
- Memory usage > 80%
- Hit rate < 95%
- Replication lag > 10 seconds
- Client connections > 80% of max

### Warning Alerts
- Memory usage > 70%
- Slow queries detected
- High fragmentation ratio
- AOF rewrite taking too long

## Exercise

1. Check current metrics with INFO
2. Set up basic monitoring
3. Simulate load and observe metrics
4. Configure alerts for key metrics

## Best Practices

- **Monitor continuously**, not just during issues
- **Set meaningful alerts** that require action
- **Track trends** over time
- **Document baselines** for normal operation
- **Test alerting** regularly
