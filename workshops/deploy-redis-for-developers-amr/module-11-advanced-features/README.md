<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->

| Previous | Home | Next |
|----------|:----:|------:|
| [⬅️ Previous: Troubleshooting & Migration](../module-10-troubleshooting--migration/README.md) | [🏠 Workshop Home](../README.md) |  |

[🏠 Workshop Home](../README.md) > **Module 11 of 11**

### Deploy Redis for Developers - Azure Managed Redis

**Progress:** `██████████` 100%

---

<!-- ✏️ EDIT YOUR CONTENT BELOW THIS LINE ✏️ -->

# Module 9: Advanced Features

**Duration:** 60 minutes  
**Format:** Deep Dive + Lab  
**Level:** Advanced

## Overview

This advanced module explores Redis Stack capabilities beyond traditional caching, including JSON documents, full-text search, vector similarity search, time-series data, probabilistic data structures, and Redis Streams. You'll learn when and how to leverage these features for modern application architectures.

## Learning Objectives

By the end of this module, you will be able to:

- Store and query JSON documents with RedisJSON
- Implement full-text and vector search with RediSearch
- Handle time-series data with RedisTimeSeries
- Use probabilistic data structures (Bloom filters, HyperLogLog)
- Implement event streaming with Redis Streams
- Build real-time analytics pipelines
- Choose the right Redis data structure for your use case

## Prerequisites

- Completion of previous modules
- Azure Cache for Redis Enterprise tier (for Redis Stack features)
- Redis CLI with Stack support
- Python or Node.js environment
- Understanding of JSON and search concepts

## Redis Stack Overview

### What is Redis Stack?

Redis Stack extends Redis with modules that provide:

- **RedisJSON** - Native JSON document storage
- **RediSearch** - Full-text search, secondary indexing, vector search
- **RedisTimeSeries** - Time-series data structures
- **RedisBloom** - Probabilistic data structures
- **RedisGraph** - Graph database (deprecated, use Neo4j)

### Availability in Azure

```bash
# Redis Stack is available in Azure Cache for Redis Enterprise
az redis create \
  --name my-redis-enterprise \
  --resource-group rg-redis-workshop \
  --location eastus \
  --sku Enterprise_E10 \
  --capacity 2 \
  --zones 1 2
```

## Part 1: RedisJSON - Native JSON Documents

### Why RedisJSON?

Traditional Redis requires serialization/deserialization of JSON:

```python
# Traditional approach
import json
import redis

r = redis.Redis()

# Store (requires serialization)
user = {"id": 1, "name": "Alice", "email": "alice@example.com"}
r.set("user:1", json.dumps(user))

# Retrieve (requires deserialization)
user_str = r.get("user:1")
user = json.loads(user_str)

# Update requires full object replacement
user["email"] = "alice.new@example.com"
r.set("user:1", json.dumps(user))
```

RedisJSON provides native JSON operations:

```python
# RedisJSON approach
from redis import Redis
from redis.commands.json.path import Path

r = Redis(decode_responses=True)

# Store JSON directly
user = {"id": 1, "name": "Alice", "email": "alice@example.com"}
r.json().set("user:1", Path.root_path(), user)

# Update specific field without deserializing
r.json().set("user:1", "$.email", "alice.new@example.com")

# Get specific field
email = r.json().get("user:1", "$.email")
```

### Basic Operations

#### Installation

```bash
pip install redis[json]
# or
npm install redis @redis/json
```

#### Creating JSON Documents

```python
from redis import Redis
from redis.commands.json.path import Path
import redis.commands.json as json

r = Redis(
    host='my-redis-enterprise.region.redisenterprise.cache.azure.net',
    port=10000,
    password='your-access-key',
    ssl=True,
    decode_responses=True
)

# Simple document
r.json().set("product:1", Path.root_path(), {
    "id": 1,
    "name": "Laptop",
    "price": 999.99,
    "in_stock": True,
    "tags": ["electronics", "computers"]
})

# Complex nested document
r.json().set("order:1001", Path.root_path(), {
    "order_id": "1001",
    "customer": {
        "id": "C123",
        "name": "Bob Smith",
        "email": "bob@example.com"
    },
    "items": [
        {"product_id": 1, "quantity": 2, "price": 999.99},
        {"product_id": 2, "quantity": 1, "price": 49.99}
    ],
    "total": 2049.97,
    "status": "pending",
    "created_at": "2025-11-19T10:00:00Z"
})
```

#### Retrieving Data

```python
# Get entire document
order = r.json().get("order:1001")

# Get specific field
customer_name = r.json().get("order:1001", "$.customer.name")

# Get multiple fields
fields = r.json().get("order:1001", "$.order_id", "$.total", "$.status")

# Get array elements
first_item = r.json().get("order:1001", "$.items[0]")
```

#### Updating Data

```python
# Update single field
r.json().set("order:1001", "$.status", "processing")

# Update nested field
r.json().set("order:1001", "$.customer.email", "bob.smith@newdomain.com")

# Append to array
r.json().arrappend("order:1001", "$.items", {
    "product_id": 3,
    "quantity": 1,
    "price": 29.99
})

# Increment numeric value
r.json().numincrby("order:1001", "$.total", 29.99)
```

#### Array Operations

```python
# Array length
length = r.json().arrlen("product:1", "$.tags")

# Array insert
r.json().arrinsert("product:1", "$.tags", 0, "featured")

# Array pop
r.json().arrpop("product:1", "$.tags", -1)

# Array trim
r.json().arrtrim("product:1", "$.tags", 0, 4)
```

#### Deleting Data

```python
# Delete specific field
r.json().delete("order:1001", "$.customer.email")

# Delete array element
r.json().arrpop("order:1001", "$.items", 0)

# Delete entire document
r.json().delete("order:1001")
```

### Real-World Example: Product Catalog

```python
class ProductCatalog:
    def __init__(self, redis_client):
        self.r = redis_client
    
    def add_product(self, product_id, product_data):
        """Add a new product"""
        key = f"product:{product_id}"
        product_data['created_at'] = datetime.now().isoformat()
        product_data['updated_at'] = datetime.now().isoformat()
        return self.r.json().set(key, Path.root_path(), product_data)
    
    def update_price(self, product_id, new_price):
        """Update product price"""
        key = f"product:{product_id}"
        self.r.json().set(key, "$.price", new_price)
        self.r.json().set(key, "$.updated_at", datetime.now().isoformat())
    
    def add_review(self, product_id, review):
        """Add a customer review"""
        key = f"product:{product_id}"
        review['timestamp'] = datetime.now().isoformat()
        self.r.json().arrappend(key, "$.reviews", review)
        
        # Update average rating
        reviews = self.r.json().get(key, "$.reviews")
        avg_rating = sum(r['rating'] for r in reviews) / len(reviews)
        self.r.json().set(key, "$.avg_rating", round(avg_rating, 2))
    
    def get_product(self, product_id):
        """Get full product details"""
        key = f"product:{product_id}"
        return self.r.json().get(key)
    
    def update_inventory(self, product_id, quantity_change):
        """Update inventory count"""
        key = f"product:{product_id}"
        self.r.json().numincrby(key, "$.inventory", quantity_change)

# Usage
catalog = ProductCatalog(r)

# Add product
catalog.add_product("P001", {
    "id": "P001",
    "name": "Wireless Mouse",
    "price": 29.99,
    "inventory": 100,
    "category": "Electronics",
    "tags": ["wireless", "computer", "accessories"],
    "reviews": [],
    "avg_rating": 0.0
})

# Add review
catalog.add_review("P001", {
    "user": "Alice",
    "rating": 5,
    "comment": "Great mouse!"
})

# Update inventory after sale
catalog.update_inventory("P001", -1)
```

## Part 2: RediSearch - Indexing and Search

### Creating Search Indexes

```python
from redis.commands.search.field import TextField, NumericField, TagField
from redis.commands.search.indexDefinition import IndexDefinition, IndexType
from redis.commands.search.query import Query

# Create index on JSON documents
index_definition = IndexDefinition(
    prefix=["product:"],
    index_type=IndexType.JSON
)

schema = (
    TextField("$.name", as_name="name"),
    TextField("$.description", as_name="description"),
    NumericField("$.price", as_name="price"),
    NumericField("$.inventory", as_name="inventory"),
    TagField("$.category", as_name="category"),
    TagField("$.tags[*]", as_name="tags"),
    NumericField("$.avg_rating", as_name="rating")
)

try:
    r.ft("product_idx").create_index(
        schema,
        definition=index_definition
    )
except Exception as e:
    print(f"Index might already exist: {e}")
```

### Full-Text Search

```python
# Simple text search
results = r.ft("product_idx").search("mouse")

# Search with filters
query = Query("wireless").add_filter(
    NumericFilter("price", 0, 50)
).add_filter(
    NumericFilter("rating", 4, 5)
)
results = r.ft("product_idx").search(query)

# Complex search
query = (
    Query("@name:laptop @category:{Electronics}")
    .add_filter(NumericFilter("price", 500, 1500))
    .sort_by("price", asc=True)
    .paging(0, 10)
)
results = r.ft("product_idx").search(query)

# Process results
for doc in results.docs:
    print(f"Product: {doc.name}, Price: ${doc.price}")
```

### Aggregations

```python
from redis.commands.search.aggregation import AggregateRequest, Asc, Desc

# Group products by category with average price
request = AggregateRequest("*") \
    .group_by("@category", 
        reducers.avg("@price").alias("avg_price"),
        reducers.count().alias("count")
    ) \
    .sort_by(Desc("@avg_price"))

results = r.ft("product_idx").aggregate(request)

for row in results.rows:
    print(f"Category: {row[1]}, Avg Price: ${row[3]:.2f}, Count: {row[5]}")
```

### Vector Search for Recommendations

Vector search enables semantic similarity and recommendations:

```python
from redis.commands.search.field import VectorField
from redis.commands.search.query import Query
import numpy as np

# Add vector field to index
schema = (
    TextField("$.name", as_name="name"),
    VectorField(
        "$.embedding",
        "HNSW",
        {
            "TYPE": "FLOAT32",
            "DIM": 384,
            "DISTANCE_METRIC": "COSINE"
        },
        as_name="embedding"
    )
)

# Store product with embedding
product_embedding = generate_embedding("Wireless Gaming Mouse")  # Your embedding function
r.json().set("product:P001", Path.root_path(), {
    "id": "P001",
    "name": "Wireless Gaming Mouse",
    "embedding": product_embedding.tolist()
})

# Vector similarity search
query_embedding = generate_embedding("gaming mouse")
query = (
    Query("*=>[KNN 5 @embedding $vec AS score]")
    .sort_by("score")
    .return_fields("name", "score")
    .dialect(2)
)

results = r.ft("product_idx").search(
    query,
    query_params={"vec": query_embedding.tobytes()}
)

for doc in results.docs:
    print(f"{doc.name} (similarity: {doc.score})")
```

### Autocomplete with Search

```python
# Create suggestion dictionary
r.ft("product_autocomplete").sugadd("Laptop")
r.ft("product_autocomplete").sugadd("Laptop Stand")
r.ft("product_autocomplete").sugadd("Laptop Bag")
r.ft("product_autocomplete").sugadd("Mouse")
r.ft("product_autocomplete").sugadd("Mouse Pad")

# Get suggestions
suggestions = r.ft("product_autocomplete").sugget("lap", fuzzy=True)
print(suggestions)  # ['Laptop', 'Laptop Stand', 'Laptop Bag']
```

## Part 3: RedisTimeSeries - Time-Series Data

### Creating Time Series

```python
from redis.commands.timeseries import TimeSeries

# Create time series for metrics
r.ts().create(
    "sensor:temp:room1",
    retention_msecs=7*24*60*60*1000,  # 7 days
    labels={"sensor_type": "temperature", "location": "room1", "unit": "celsius"}
)

r.ts().create(
    "sensor:humidity:room1",
    retention_msecs=7*24*60*60*1000,
    labels={"sensor_type": "humidity", "location": "room1", "unit": "percent"}
)
```

### Adding Data Points

```python
import time

# Add single value
r.ts().add("sensor:temp:room1", "*", 22.5)  # "*" = current timestamp

# Add multiple values
timestamp = int(time.time() * 1000)
r.ts().add("sensor:temp:room1", timestamp, 23.1)
r.ts().add("sensor:temp:room1", timestamp + 60000, 23.5)
r.ts().add("sensor:temp:room1", timestamp + 120000, 24.0)

# Add to multiple series
r.ts().madd([
    ("sensor:temp:room1", "*", 25.0),
    ("sensor:humidity:room1", "*", 65.0)
])
```

### Querying Time Series

```python
# Get range
now = int(time.time() * 1000)
one_hour_ago = now - (60 * 60 * 1000)

data = r.ts().range(
    "sensor:temp:room1",
    from_time=one_hour_ago,
    to_time=now
)

for timestamp, value in data:
    dt = datetime.fromtimestamp(timestamp / 1000)
    print(f"{dt}: {value}°C")

# Aggregation
hourly_avg = r.ts().range(
    "sensor:temp:room1",
    from_time=one_hour_ago,
    to_time=now,
    aggregation_type="avg",
    bucket_size_msec=60*60*1000  # 1 hour buckets
)

# Multi-query with filters
results = r.ts().mrange(
    from_time=one_hour_ago,
    to_time=now,
    filters=["sensor_type=temperature"],
    aggregation_type="avg",
    bucket_size_msec=5*60*1000  # 5 minute buckets
)

for key, labels, data in results:
    print(f"Sensor: {key}")
    for timestamp, value in data:
        print(f"  {datetime.fromtimestamp(timestamp/1000)}: {value:.2f}")
```

### Downsampling and Rules

```python
# Create aggregated series
r.ts().create(
    "sensor:temp:room1:hourly",
    labels={"sensor_type": "temperature", "location": "room1", "aggregation": "hourly"}
)

# Create compaction rule
r.ts().createrule(
    source_key="sensor:temp:room1",
    dest_key="sensor:temp:room1:hourly",
    aggregation_type="avg",
    bucket_size_msec=60*60*1000  # 1 hour
)

# Now data automatically aggregates
r.ts().add("sensor:temp:room1", "*", 25.0)
# Automatically aggregated into sensor:temp:room1:hourly
```

### Real-World Example: IoT Monitoring

```python
class IoTMonitor:
    def __init__(self, redis_client):
        self.r = redis_client
    
    def setup_device(self, device_id, metrics):
        """Initialize time series for a device"""
        for metric in metrics:
            key = f"device:{device_id}:{metric}"
            self.r.ts().create(
                key,
                retention_msecs=30*24*60*60*1000,  # 30 days
                labels={
                    "device_id": device_id,
                    "metric": metric,
                    "type": "raw"
                }
            )
            
            # Create hourly aggregation
            hourly_key = f"{key}:hourly"
            self.r.ts().create(
                hourly_key,
                retention_msecs=365*24*60*60*1000,  # 1 year
                labels={
                    "device_id": device_id,
                    "metric": metric,
                    "type": "hourly"
                }
            )
            
            self.r.ts().createrule(key, hourly_key, "avg", 60*60*1000)
    
    def record_reading(self, device_id, readings):
        """Record sensor readings"""
        points = []
        timestamp = int(time.time() * 1000)
        
        for metric, value in readings.items():
            key = f"device:{device_id}:{metric}"
            points.append((key, timestamp, value))
        
        self.r.ts().madd(points)
    
    def get_recent_data(self, device_id, metric, hours=24):
        """Get recent data for a metric"""
        key = f"device:{device_id}:{metric}"
        now = int(time.time() * 1000)
        start = now - (hours * 60 * 60 * 1000)
        
        return self.r.ts().range(key, start, now)
    
    def get_statistics(self, device_id, metric, hours=24):
        """Get statistics for a metric"""
        data = self.get_recent_data(device_id, metric, hours)
        values = [v for _, v in data]
        
        return {
            "count": len(values),
            "min": min(values) if values else None,
            "max": max(values) if values else None,
            "avg": sum(values) / len(values) if values else None
        }

# Usage
monitor = IoTMonitor(r)

# Setup device
monitor.setup_device("device_001", ["temperature", "humidity", "pressure"])

# Record readings
monitor.record_reading("device_001", {
    "temperature": 25.5,
    "humidity": 60.0,
    "pressure": 1013.25
})

# Get stats
stats = monitor.get_statistics("device_001", "temperature", hours=24)
print(f"Temperature stats (24h): {stats}")
```

## Part 4: Redis Streams - Event Streaming

### Creating and Writing to Streams

```python
# Add events to stream
event_id = r.xadd(
    "events:orders",
    {
        "order_id": "ORD-001",
        "customer_id": "C123",
        "total": "299.99",
        "status": "created"
    }
)

# Add with explicit ID (timestamp-sequence)
r.xadd(
    "events:orders",
    {
        "order_id": "ORD-002",
        "customer_id": "C456",
        "total": "499.99",
        "status": "created"
    },
    id="*"  # Auto-generate ID
)

# Add with max length (circular buffer)
r.xadd(
    "events:orders",
    {"order_id": "ORD-003", "status": "shipped"},
    maxlen=10000,  # Keep only last 10000 entries
    approximate=True  # Allow approximate trimming for performance
)
```

### Reading from Streams

```python
# Read from beginning
messages = r.xrange("events:orders", "-", "+", count=10)

for msg_id, data in messages:
    print(f"ID: {msg_id}, Data: {data}")

# Read recent messages
messages = r.xrevrange("events:orders", "+", "-", count=5)

# Read from specific ID
last_id = "1700000000000-0"
messages = r.xrange("events:orders", min=last_id, max="+", count=100)

# Read with blocking (wait for new messages)
messages = r.xread(
    {"events:orders": "$"},  # $ = new messages only
    block=5000,  # Wait up to 5 seconds
    count=10
)
```

### Consumer Groups

```python
# Create consumer group
try:
    r.xgroup_create(
        "events:orders",
        "order-processors",
        id="0",  # Start from beginning
        mkstream=True
    )
except Exception as e:
    print(f"Group might already exist: {e}")

# Read as consumer in group
while True:
    messages = r.xreadgroup(
        "order-processors",  # Group name
        "worker-1",          # Consumer name
        {"events:orders": ">"},  # > = undelivered messages
        block=1000,
        count=10
    )
    
    for stream, stream_messages in messages:
        for msg_id, data in stream_messages:
            try:
                # Process message
                process_order(data)
                
                # Acknowledge
                r.xack("events:orders", "order-processors", msg_id)
            except Exception as e:
                print(f"Error processing {msg_id}: {e}")
                # Message will be redelivered

# Check pending messages
pending = r.xpending("events:orders", "order-processors")
print(f"Pending messages: {pending}")

# Claim abandoned messages (if worker died)
abandoned = r.xpending_range(
    "events:orders",
    "order-processors",
    min="-",
    max="+",
    count=100,
    consumername="worker-1"
)

for msg in abandoned:
    if msg['time_since_delivered'] > 60000:  # 1 minute
        r.xclaim(
            "events:orders",
            "order-processors",
            "worker-2",
            min_idle_time=60000,
            message_ids=[msg['message_id']]
        )
```

### Real-World Example: Order Processing Pipeline

```python
class OrderProcessor:
    def __init__(self, redis_client, group_name, consumer_name):
        self.r = redis_client
        self.group_name = group_name
        self.consumer_name = consumer_name
        self.stream = "events:orders"
        
        # Ensure consumer group exists
        try:
            self.r.xgroup_create(self.stream, self.group_name, id="0", mkstream=True)
        except:
            pass
    
    def publish_event(self, order_id, event_type, data):
        """Publish order event"""
        event = {
            "order_id": order_id,
            "event_type": event_type,
            "timestamp": datetime.now().isoformat(),
            **data
        }
        return self.r.xadd(self.stream, event)
    
    def process_events(self, batch_size=10):
        """Process order events"""
        while True:
            messages = self.r.xreadgroup(
                self.group_name,
                self.consumer_name,
                {self.stream: ">"},
                block=1000,
                count=batch_size
            )
            
            if not messages:
                continue
            
            for stream, stream_messages in messages:
                for msg_id, data in stream_messages:
                    try:
                        self.handle_event(msg_id, data)
                        self.r.xack(self.stream, self.group_name, msg_id)
                    except Exception as e:
                        print(f"Error: {e}")
                        # Will be retried
    
    def handle_event(self, msg_id, data):
        """Handle individual event"""
        event_type = data.get(b'event_type', b'').decode()
        order_id = data.get(b'order_id', b'').decode()
        
        print(f"Processing {event_type} for order {order_id}")
        
        if event_type == 'created':
            self.process_new_order(order_id, data)
        elif event_type == 'payment_received':
            self.process_payment(order_id, data)
        elif event_type == 'shipped':
            self.notify_customer(order_id, data)
    
    def process_new_order(self, order_id, data):
        # Business logic
        print(f"Processing new order: {order_id}")
        time.sleep(0.1)  # Simulate work
    
    def process_payment(self, order_id, data):
        print(f"Processing payment for: {order_id}")
        time.sleep(0.1)
    
    def notify_customer(self, order_id, data):
        print(f"Notifying customer about: {order_id}")
        time.sleep(0.1)

# Usage
processor = OrderProcessor(r, "order-processors", "worker-1")

# Publish events
processor.publish_event("ORD-001", "created", {"total": "299.99"})
processor.publish_event("ORD-001", "payment_received", {"amount": "299.99"})
processor.publish_event("ORD-001", "shipped", {"tracking": "TRACK123"})

# Process in background
import threading
thread = threading.Thread(target=processor.process_events)
thread.start()
```

## Part 5: Probabilistic Data Structures

### Bloom Filters - Membership Testing

```python
# Create Bloom filter
r.bf().create("users:active", error_rate=0.01, capacity=100000)

# Add items
r.bf().add("users:active", "user123")
r.bf().madd("users:active", "user456", "user789")

# Check existence
exists = r.bf().exists("users:active", "user123")  # True
exists = r.bf().exists("users:active", "user999")  # False (probably)

# Use case: Check if email exists before querying database
def is_user_active(user_id):
    # Fast check with Bloom filter
    if not r.bf().exists("users:active", user_id):
        return False  # Definitely doesn't exist
    
    # Might exist, check database
    return database.check_user(user_id)
```

### Cuckoo Filters - Deletable Membership

```python
# Create cuckoo filter
r.cf().create("recent_visitors", capacity=10000)

# Add and remove
r.cf().add("recent_visitors", "visitor_123")
r.cf().addnx("recent_visitors", "visitor_456")  # Add if not exists

# Check and delete
if r.cf().exists("recent_visitors", "visitor_123"):
    r.cf().delete("recent_visitors", "visitor_123")
```

### HyperLogLog - Cardinality Estimation

```python
# Count unique visitors
r.pfadd("visitors:2025-11-19", "user1", "user2", "user3")
r.pfadd("visitors:2025-11-19", "user1")  # Duplicate, won't increase count

# Get approximate count
unique_count = r.pfcount("visitors:2025-11-19")
print(f"Unique visitors: {unique_count}")

# Merge multiple HyperLogLogs
r.pfadd("visitors:2025-11-18", "user1", "user4", "user5")
r.pfmerge("visitors:total", "visitors:2025-11-18", "visitors:2025-11-19")
total_unique = r.pfcount("visitors:total")
```

### Count-Min Sketch - Frequency Estimation

```python
# Create Count-Min Sketch
r.cms().initbydim("page_views", 2000, 5)

# Increment counters
r.cms().incrby("page_views", "/home", 1)
r.cms().incrby("page_views", "/products", 5)
r.cms().incrby("page_views", "/home", 3)

# Query frequency
home_views = r.cms().query("page_views", "/home")  # ~4
print(f"Home page views: {home_views}")
```

### Top-K - Most Frequent Items

```python
# Track top 10 products
r.topk().reserve("top_products", k=10, width=50, depth=5, decay=0.9)

# Add product views
r.topk().add("top_products", "product_1", "product_2", "product_1", "product_3")

# Get top k
top_products = r.topk().list("top_products")
print(f"Top products: {top_products}")

# Check if item is in top k
is_top = r.topk().query("top_products", "product_1")
```

## Part 6: Practical Use Cases

### Use Case 1: E-commerce Product Search

```python
class ProductSearch:
    def __init__(self, redis_client):
        self.r = redis_client
        self.setup_index()
    
    def setup_index(self):
        try:
            schema = (
                TextField("$.name", as_name="name", weight=2.0),
                TextField("$.description", as_name="description"),
                TextField("$.brand", as_name="brand"),
                NumericField("$.price", as_name="price"),
                NumericField("$.rating", as_name="rating"),
                TagField("$.category", as_name="category"),
                TagField("$.tags[*]", as_name="tags"),
                NumericField("$.stock", as_name="stock")
            )
            
            self.r.ft("products").create_index(
                schema,
                definition=IndexDefinition(
                    prefix=["product:"],
                    index_type=IndexType.JSON
                )
            )
        except:
            pass
    
    def search(self, query_text, filters=None, sort_by="rating", page=1, page_size=20):
        """Advanced product search"""
        q = Query(query_text)
        
        # Apply filters
        if filters:
            if 'min_price' in filters:
                q.add_filter(NumericFilter("price", filters['min_price'], filters.get('max_price', '+inf')))
            if 'category' in filters:
                q.add_filter(TagFilter("category", filters['category']))
            if 'min_rating' in filters:
                q.add_filter(NumericFilter("rating", filters['min_rating'], 5))
        
        # Only in-stock
        q.add_filter(NumericFilter("stock", 1, '+inf'))
        
        # Sorting
        q.sort_by(sort_by, asc=False)
        
        # Pagination
        q.paging((page - 1) * page_size, page_size)
        
        return self.r.ft("products").search(q)
```

### Use Case 2: Real-Time Analytics Dashboard

```python
class AnalyticsDashboard:
    def __init__(self, redis_client):
        self.r = redis_client
    
    def track_page_view(self, page, user_id, session_id):
        """Track page view event"""
        timestamp = int(time.time() * 1000)
        
        # Time series for page views
        self.r.ts().add(f"pageviews:{page}", timestamp, 1)
        
        # Unique visitors (HyperLogLog)
        self.r.pfadd(f"unique_visitors:{page}", user_id)
        
        # Stream for real-time processing
        self.r.xadd("analytics:events", {
            "type": "page_view",
            "page": page,
            "user_id": user_id,
            "session_id": session_id,
            "timestamp": timestamp
        })
        
        # Top pages (Top-K)
        self.r.topk().add("top_pages", page)
    
    def get_dashboard_data(self, hours=24):
        """Get analytics dashboard data"""
        now = int(time.time() * 1000)
        start = now - (hours * 60 * 60 * 1000)
        
        return {
            "page_views": self.get_page_views(start, now),
            "unique_visitors": self.get_unique_visitors(),
            "top_pages": self.r.topk().list("top_pages"),
            "recent_events": self.get_recent_events(100)
        }
    
    def get_page_views(self, start, end):
        """Get aggregated page views"""
        results = self.r.ts().mrange(
            start, end,
            filters=["__name__=pageviews:*"],
            aggregation_type="sum",
            bucket_size_msec=60*60*1000  # Hourly
        )
        
        return {
            key: [(ts, val) for ts, val in data]
            for key, labels, data in results
        }
    
    def get_unique_visitors(self):
        """Get unique visitor counts"""
        keys = self.r.keys("unique_visitors:*")
        return {
            key.decode(): self.r.pfcount(key)
            for key in keys
        }
    
    def get_recent_events(self, count=100):
        """Get recent analytics events"""
        events = self.r.xrevrange("analytics:events", "+", "-", count=count)
        return [(event_id, data) for event_id, data in events]
```

### Use Case 3: Recommendation Engine

```python
class RecommendationEngine:
    def __init__(self, redis_client):
        self.r = redis_client
    
    def track_interaction(self, user_id, item_id, interaction_type, score=1.0):
        """Track user-item interaction"""
        # Store in sorted set for collaborative filtering
        self.r.zadd(f"user:{user_id}:items", {item_id: score})
        self.r.zadd(f"item:{item_id}:users", {user_id: score})
        
        # Track in time series for trending
        self.r.ts().incrby(f"item:{item_id}:interactions", 1, timestamp="*")
        
        # Log interaction event
        self.r.xadd("interactions", {
            "user_id": user_id,
            "item_id": item_id,
            "type": interaction_type,
            "score": score,
            "timestamp": time.time()
        })
    
    def get_similar_users(self, user_id, limit=10):
        """Find users with similar preferences"""
        user_items = self.r.zrange(f"user:{user_id}:items", 0, -1)
        
        similar_users = {}
        for item in user_items:
            users = self.r.zrange(f"item:{item}:users", 0, -1, withscores=True)
            for other_user, score in users:
                if other_user != user_id:
                    similar_users[other_user] = similar_users.get(other_user, 0) + score
        
        # Sort by similarity score
        sorted_users = sorted(similar_users.items(), key=lambda x: x[1], reverse=True)
        return [user for user, score in sorted_users[:limit]]
    
    def recommend_items(self, user_id, limit=10):
        """Recommend items based on similar users"""
        # Get similar users
        similar_users = self.get_similar_users(user_id, limit=20)
        
        # Get their items
        recommended_items = {}
        user_items = set(self.r.zrange(f"user:{user_id}:items", 0, -1))
        
        for similar_user in similar_users:
            items = self.r.zrange(f"user:{similar_user}:items", 0, -1, withscores=True)
            for item, score in items:
                if item not in user_items:
                    recommended_items[item] = recommended_items.get(item, 0) + score
        
        # Sort by score
        sorted_items = sorted(recommended_items.items(), key=lambda x: x[1], reverse=True)
        return [item for item, score in sorted_items[:limit]]
    
    def get_trending_items(self, hours=24, limit=10):
        """Get trending items"""
        now = int(time.time() * 1000)
        start = now - (hours * 60 * 60 * 1000)
        
        # Query all item interaction time series
        results = self.r.ts().mrange(
            start, now,
            filters=["__name__=item:*:interactions"],
            aggregation_type="sum",
            bucket_size_msec=hours*60*60*1000
        )
        
        trending = []
        for key, labels, data in results:
            item_id = key.split(':')[1]
            total_interactions = sum(val for ts, val in data)
            trending.append((item_id, total_interactions))
        
        trending.sort(key=lambda x: x[1], reverse=True)
        return [item_id for item_id, score in trending[:limit]]
```

## Best Practices

### 1. Choose the Right Data Structure

- **Caching**: String, Hash
- **Full-text search**: RediSearch
- **Documents**: RedisJSON
- **Time-series**: RedisTimeSeries
- **Event streams**: Redis Streams
- **Approximate counting**: HyperLogLog, Count-Min Sketch
- **Membership testing**: Bloom Filter, Cuckoo Filter

### 2. Memory Optimization

```python
# Use appropriate data types
# Hashes for objects (more memory efficient than JSON for simple objects)
r.hset("user:1", mapping={"name": "Alice", "email": "alice@example.com"})

# Use TTL to expire old data
r.setex("session:abc123", 3600, session_data)

# Configure maxmemory policy
r.config_set("maxmemory-policy", "allkeys-lru")
```

### 3. Indexing Strategy

```python
# Only index fields you'll search/filter on
# Add weights to important fields
schema = (
    TextField("$.title", as_name="title", weight=5.0),
    TextField("$.content", as_name="content", weight=1.0),
    TagField("$.category", as_name="category"),
    NumericField("$.created_at", as_name="created_at", sortable=True)
)
```

### 4. Stream Processing

```python
# Use consumer groups for scalability
# Set appropriate max length for streams
# Implement graceful error handling
# Monitor pending messages
```

## Hands-On Exercises

### Exercise 1: Build Product Catalog

1. Create RedisJSON product documents
2. Set up RediSearch index
3. Implement full-text search
4. Add filtering and sorting
5. Implement autocomplete

### Exercise 2: IoT Data Pipeline

1. Create time series for sensor data
2. Implement data ingestion
3. Set up downsampling rules
4. Create aggregation queries
5. Build monitoring dashboard

### Exercise 3: Event Processing System

1. Create Redis Stream for events
2. Set up consumer group
3. Implement event processor
4. Handle failures and retries
5. Monitor processing lag

### Exercise 4: Analytics Dashboard

1. Implement page view tracking
2. Use HyperLogLog for unique counts
3. Use Top-K for trending pages
4. Create real-time dashboard
5. Visualize time-series data

## Summary

In this module, you've explored:

- ✅ RedisJSON for native JSON document storage
- ✅ RediSearch for full-text and vector search
- ✅ RedisTimeSeries for time-series data
- ✅ Probabilistic data structures (Bloom, HyperLogLog, Top-K)
- ✅ Redis Streams for event-driven architecture
- ✅ Real-world use cases and patterns
- ✅ Best practices for Redis Stack features

## Additional Resources

- [Redis Stack Documentation](https://redis.io/docs/stack/)
- [RedisJSON Commands](https://redis.io/docs/stack/json/)
- [RediSearch Reference](https://redis.io/docs/stack/search/)
- [Redis Streams Guide](https://redis.io/docs/data-types/streams/)
- [Redis University Courses](https://university.redis.com/)

## Congratulations!

You've completed the advanced Redis workshop. You now have the knowledge to:

- Build sophisticated applications with Redis Stack
- Implement search and analytics at scale
- Process real-time event streams
- Design efficient data models
- Optimize for performance and cost

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
| [⬅️ Previous: Troubleshooting & Migration](../module-10-troubleshooting--migration/README.md) | [🏠 Workshop Home](../README.md) | ✅ **Workshop Complete!** |

---

*Module 11 of 11*
