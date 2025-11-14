# Performance Basics

## Introduction

Redis is known for its exceptional performance, but understanding the factors that influence performance is crucial for optimal results.

## Key Performance Factors

### 1. Data Structures

Different data structures have different performance characteristics:
- **Strings**: O(1) for GET/SET
- **Lists**: O(1) for LPUSH/RPUSH, O(N) for LRANGE
- **Sets**: O(1) for SADD/SREM, O(N) for SMEMBERS
- **Sorted Sets**: O(log N) for ZADD
- **Hashes**: O(1) for HGET/HSET

### 2. Network Latency

Network round trips are often the biggest performance bottleneck:
- Each command requires a round trip
- Use pipelining to batch commands
- Consider connection pooling

### 3. Persistence

Persistence options impact performance:
- **RDB**: Periodic snapshots, minimal impact
- **AOF**: Every write logged, higher overhead
- **Hybrid**: Best of both worlds

## Performance Tips

1. **Use the right data structure** for your use case
2. **Batch operations** with pipelining
3. **Avoid KEYS** command in production
4. **Monitor memory usage** regularly
5. **Use connection pooling**

## Benchmarking

Use `redis-benchmark` to test performance:

```bash
redis-benchmark -q -n 100000
```

## Exercise

Try running the benchmark tool with different configurations and observe the results.

## Additional Resources

- [Redis Performance Tuning](https://redis.io/docs/management/optimization/)
- [Latency Monitoring](https://redis.io/docs/management/optimization/latency/)
