# Memory Optimization

## Understanding Redis Memory Usage

Redis stores all data in RAM, making memory optimization crucial for cost and performance.

## Memory Optimization Techniques

### 1. Choose Efficient Data Structures

- Use **Hashes** for objects instead of multiple strings
- Use **Sorted Sets** efficiently with score ranges
- Consider **HyperLogLog** for counting unique items

### 2. Set Expiration Times

Always set TTLs on temporary data:

```bash
SET session:12345 "{data}" EX 3600
```

### 3. Use Compression

- Enable compression for large values
- Consider using msgpack or similar formats
- Redis compression algorithms: LZF, Snappy

### 4. Monitor Memory Usage

```bash
INFO memory
MEMORY USAGE key
```

### 5. Implement Eviction Policies

Configure appropriate eviction policy:
- `allkeys-lru`: Good for caches
- `volatile-lru`: Only evict keys with TTL
- `noeviction`: Fail writes when full

## Memory Configuration

```conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

## Exercise

1. Check current memory usage
2. Create test data with different structures
3. Compare memory footprint
4. Implement compression strategy

## Best Practices

- **Monitor regularly** with INFO memory
- **Set realistic maxmemory** limits
- **Use appropriate eviction** policies
- **Implement TTLs** on temporary data
- **Consider sharding** for large datasets
