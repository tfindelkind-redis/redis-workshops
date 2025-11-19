# Module 2: Azure Managed Redis Overview & Architecture - Content Checklist

## 📋 Module Metadata

- **Module ID:** module-02-azure-managed-redis-overview
- **Title:** Azure Managed Redis Overview & Architecture
- **Duration:** 50 minutes
- **Type:** Theory + Architecture
- **Difficulty:** Intermediate
- **Prerequisites:** Module 1 (Redis Fundamentals) or basic Redis knowledge
- **Standalone:** Partial (better with Module 1)

---

## 🎯 Learning Objectives

By the end of this module, participants will be able to:

1. ✅ Understand Azure Managed Redis service and its capabilities
2. ✅ Select the appropriate SKU tier based on workload requirements
3. ✅ Design Redis architectures for different scenarios (single, clustered, geo-replicated)
4. ✅ Plan capacity requirements for Redis deployments
5. ✅ Choose appropriate authentication and networking options
6. ✅ Make informed architecture decisions using decision matrices

---

## 📚 Content Outline (50 minutes)

### Section 1: Azure Managed Redis Overview (10 minutes)

#### 1.1 What is Azure Managed Redis?
- [ ] **Service Overview**
  - Fully managed Redis service built on Redis Enterprise
  - Latest Redis versions (7.4)
  - Enterprise-grade features available across all tiers
  - Built-in clustering and high availability
  - Comprehensive security and compliance
  
- [ ] **Key Capabilities**
  ```
  Core Features:
  - ✅ Redis 7.4 with latest features
  - ✅ Built-in clustering across all tiers
  - ✅ Active geo-replication
  - ✅ Redis modules (RediSearch, RedisJSON, etc.)
  - ✅ Data persistence (AOF/RDB)
  - ✅ 99.99% SLA with multi-zone HA
  - ✅ Flexible scaling
  - ✅ Advanced security features
  ```

- [ ] **Use Cases**
  - High-performance caching layer
  - Session store
  - Real-time analytics
  - Message queuing
  - Leaderboards and counting
  - Geospatial applications
  - Full-text search (with RediSearch)
  - JSON document store (with RedisJSON)

#### 1.2 Azure Managed Redis Service Tiers
- [ ] **Four Tier Families Overview**
  - **Memory Optimized (M-series)** - High memory-to-core ratio
  - **Balanced (B-series)** - Balanced CPU-to-memory ratio
  - **Compute Optimized (X-series)** - High CPU-to-memory ratio
  - **Flash Optimized (A-series)** - Leverages NVMe storage alongside RAM
  
- [ ] **Memory Optimized (M-series)**
  ```
  Purpose: High memory-to-core ratio for large caches and in-memory analytics
  
  Memory Range: 12 GB - 1,920 GB
  SKUs Available: M10, M20, M50, M100, M150, M250, M350, M500, M700, M1000, M1500, M2000
  
  Key Characteristics:
  - ✅ High memory per vCPU
  - ✅ Great for medium to large caches
  - ✅ Ideal for dev-testing and analytics
  - ✅ Network: Moderate to Highest
  - ✅ Full Redis modules support (RediSearch, RedisJSON, RedisBloom, RedisTimeSeries)
  - ✅ Active-Active geo-replication
  
  Example SKUs:
  - M10: 12 GB, 2 vCPUs, Moderate network
  - M50: 60 GB, 8 vCPUs, Moderate network
  - M250: 240 GB, 32 vCPUs, High network
  - M1000: 960 GB, 128 vCPUs, Highest network
  - M2000: 1,920 GB, 256 vCPUs, Highest network
  ```

- [ ] **Balanced (B-series)**
  ```
  Purpose: Balanced CPU-to-memory ratio for most standard workloads
  
  Memory Range: 0.5 GB - 960 GB
  SKUs Available: B0, B1, B3, B5, B10, B20, B50, B100, B150, B250, B350, B500, B700, B1000
  
  Key Characteristics:
  - ✅ Balanced resources for general purpose
  - ✅ Most cost-effective for standard workloads
  - ✅ Wide range from dev (B0/B1) to production (B1000)
  - ✅ Network: Moderate to Highest
  - ✅ Redis modules support (Note: B0, B1 may have limited features)
  - ✅ Active-Active geo-replication
  
  Example SKUs:
  - B0: 0.5 GB, 2 vCPUs, Moderate network (dev/test)
  - B1: 1 GB, 2 vCPUs, Moderate network (small workloads)
  - B10: 12 GB, 4 vCPUs, Moderate network
  - B100: 120 GB, 32 vCPUs, High network
  - B1000: 960 GB, 256 vCPUs, Highest network
  ```

- [ ] **Compute Optimized (X-series)**
  ```
  Purpose: High CPU-to-memory ratio for maximum throughput and mission-critical workloads
  
  Memory Range: 3 GB - 720 GB
  SKUs Available: X3, X5, X10, X20, X50, X100, X150, X250, X350, X500, X700
  
  Key Characteristics:
  - ✅ High compute power per GB memory
  - ✅ Best for maximum throughput performance
  - ✅ Mission-critical workloads and services
  - ✅ Network: High to Highest
  - ✅ Full Redis modules support
  - ✅ Active-Active geo-replication
  
  Example SKUs:
  - X3: 3 GB, 4 vCPUs, High network
  - X10: 12 GB, 8 vCPUs, High network
  - X100: 120 GB, 64 vCPUs, Highest network
  - X700: 720 GB, 320 vCPUs, Highest network
  ```

- [ ] **Flash Optimized (A-series)**
  ```
  Purpose: Leverage NVMe storage for cost-effective large datasets
  
  Memory Range: 250 GB - 4,500 GB
  SKUs Available: A250, A500, A700, A1000, A1500, A2000, A4500
  
  Key Characteristics:
  - ✅ Redis on Flash technology (data tier on NVMe)
  - ✅ Significantly lower cost per GB
  - ✅ Slightly reduced throughput vs RAM-only
  - ✅ Network: High to Highest
  - ⚠️  Limited Redis modules (RedisJSON only, no RediSearch/RedisBloom/RedisTimeSeries)
  - ❌ No Active-Active geo-replication (standard replication only)
  
  Example SKUs:
  - A250: 256 GB, 8 vCPUs, High network
  - A1000: 1,050 GB, 32 vCPUs, High network
  - A4500: 4,723 GB, 144 vCPUs, Highest network
  
  Best For: Large datasets where cost is primary concern and slightly lower
  performance is acceptable
  ```

- [ ] **SKU Feature Comparison Matrix**
  ```
  | Feature | Memory (M) | Balanced (B) | Compute (X) | Flash (A) |
  |---------|------------|--------------|-------------|-----------|
  | Memory Range | 12GB-1.9TB | 0.5GB-960GB | 3GB-720GB | 250GB-4.5TB |
  | Availability | Up to 99.999% | Up to 99.999% | Up to 99.999% | Up to 99.999% |
  | Geo-Replication | Active-Active | Active-Active | Active-Active | Standard only |
  | RediSearch | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
  | RedisJSON | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
  | RedisBloom | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
  | RedisTimeSeries | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
  | Redis on Flash | ❌ No | ❌ No | ❌ No | ✅ Yes |
  | Best For | Large caches, Analytics | General purpose | High throughput | Cost-effective large data |
  ```

- [ ] **SKU Selection Guidelines**
  ```
  Choose Memory Optimized (M) when:
  - Need large memory capacity (> 500 GB)
  - Memory-intensive operations
  - In-memory analytics workloads
  - Dev/test with realistic data volumes
  
  Choose Balanced (B) when:
  - Standard caching workloads
  - Session storage
  - General purpose applications
  - Cost-effectiveness is important
  - Starting small (B0/B1) and growing
  
  Choose Compute Optimized (X) when:
  - Need maximum throughput
  - High operations per second required
  - Complex computational workloads
  - Mission-critical applications
  - Low latency is crucial
  
  Choose Flash Optimized (A) when:
  - Very large datasets (> 1 TB)
  - Cost per GB is primary concern
  - Can tolerate slightly lower performance
  - Don't need RediSearch or RedisBloom
  - Don't need Active-Active geo-replication
  ```

---

### Section 2: Architecture Patterns (15 minutes)

#### 2.1 Single Instance Architecture
- [ ] **Diagram: Single Instance Setup**
  ```
  ┌─────────────┐
  │ Application │
  └──────┬──────┘
         │
         │ Redis Protocol
         │
    ┌────▼─────┐
    │  Azure   │
    │ Managed  │
    │  Redis   │
    │(Single)  │
    └──────────┘
  ```

- [ ] **Characteristics**
  - Single endpoint
  - No automatic failover (depends on tier)
  - Simplest setup
  - Lower cost
  
- [ ] **When to Use**
  - Development and testing
  - Non-critical caching
  - Small-scale applications
  - Cost-sensitive scenarios
  
- [ ] **Limitations**
  - Single point of failure (unless HA enabled)
  - Limited scalability
  - No geo-redundancy

#### 2.2 Clustered Architecture
- [ ] **Diagram: Redis Cluster**
  ```
  ┌─────────────┐
  │ Application │
  └──────┬──────┘
         │
         │ Cluster-aware client
         │
    ┌────▼─────────────┐
    │ Redis Cluster    │
    │                  │
    │ ┌──────┬──────┐  │
    │ │Shard1│Shard2│  │
    │ │Master│Master│  │
    │ └───┬──┴───┬──┘  │
    │     │      │     │
    │ ┌───▼──┬───▼──┐  │
    │ │Repl 1│Repl 2│  │
    │ └──────┴──────┘  │
    └──────────────────┘
  ```

- [ ] **Characteristics**
  - Horizontal scaling via sharding
  - Data distributed across shards
  - Each shard has replicas
  - Automatic failover per shard
  
- [ ] **When to Use**
  - Large datasets (>100GB)
  - High throughput requirements
  - Need horizontal scalability
  - Production applications
  
- [ ] **Implementation Details**
  - Number of shards
  - Sharding strategy (hash slots)
  - Client configuration requirements
  - Resharding operations

#### 2.3 High Availability (Multi-Zone)
- [ ] **Diagram: Zone-Redundant Setup**
  ```
  ┌────────────────────────────────────┐
  │        Azure Region                │
  │                                    │
  │  ┌──────────┐      ┌──────────┐   │
  │  │  Zone 1  │      │  Zone 2  │   │
  │  │          │      │          │   │
  │  │ ┌──────┐ │      │ ┌──────┐ │   │
  │  │ │Primary│◄──────┼─┤Replica│ │   │
  │  │ │ Node │ │      │ │ Node │ │   │
  │  │ └──────┘ │      │ └──────┘ │   │
  │  │          │      │          │   │
  │  └──────────┘      └──────────┘   │
  │                                    │
  └────────────────────────────────────┘
  ```

- [ ] **Characteristics**
  - Primary and replicas in different zones
  - Automatic failover on zone failure
  - Higher availability SLA (99.99%)
  - Same-region replication
  
- [ ] **When to Use**
  - Production workloads
  - Mission-critical applications
  - Need high availability SLA
  - Can tolerate single-region deployment

#### 2.4 Active Geo-Replication
- [ ] **Diagram: Geo-Replicated Setup**
  ```
  ┌──────────────────┐         ┌──────────────────┐
  │  Region 1 (West) │         │ Region 2 (East)  │
  │                  │         │                  │
  │  ┌────────────┐  │         │  ┌────────────┐  │
  │  │   Active   │  │         │  │   Active   │  │
  │  │  Instance  │◄─┼─────────┼─►│  Instance  │  │
  │  │            │  │         │  │            │  │
  │  │ Write/Read │  │  Sync   │  │ Write/Read │  │
  │  └────────────┘  │         │  └────────────┘  │
  │                  │         │                  │
  └──────────────────┘         └──────────────────┘
  ```

- [ ] **Characteristics**
  - Multi-region active-active setup
  - Writes accepted in both regions
  - Conflict-free replicated data types (CRDTs)
  - Automatic conflict resolution
  
- [ ] **When to Use**
  - Global applications
  - Disaster recovery needs
  - Low-latency worldwide access
  - Business continuity requirements
  
- [ ] **Implementation Considerations**
  - Conflict resolution strategies
  - Network latency between regions
  - Cost implications
  - Data consistency models

---

### Section 3: Capacity Planning & Sizing (12 minutes)

#### 3.1 Capacity Planning Framework
- [ ] **Assessment Questions**
  - What is your expected dataset size?
  - What is your expected throughput (ops/sec)?
  - What is your expected connection count?
  - What is your latency requirement?
  - What is your availability SLA?
  - Do you need clustering?
  - Do you need geo-replication?

- [ ] **Memory Sizing**
  - Calculate total dataset size
  - Add 20-30% overhead for Redis metadata
  - Consider memory fragmentation (10-15%)
  - Account for replication memory
  - Plan for growth (50-100% buffer)
  
  ```
  Example Calculation:
  - Raw data: 80 GB
  - Redis overhead (25%): 20 GB
  - Fragmentation buffer (15%): 15 GB
  - Growth buffer (50%): 57.5 GB
  - Total needed: ~170 GB
  - Recommended SKU: E50 (192 GB) or higher
  ```

#### 3.2 Performance Sizing
- [ ] **Throughput Calculation**
  - Estimate operations per second
  - Consider read/write ratio
  - Factor in peak vs average load
  - Account for command complexity
  
  ```
  Throughput Guidelines by SKU:
  - E5: ~100K ops/sec
  - E10: ~200K ops/sec
  - E20: ~400K ops/sec
  - E50: ~1M ops/sec
  - E100: ~2M+ ops/sec
  ```

- [ ] **Connection Limits**
  - Connections per SKU tier
  - Connection pooling considerations
  - Idle connection cleanup
  
#### 3.3 Cost Optimization
- [ ] **Pricing Factors**
  - SKU tier base cost
  - Network egress costs
  - Geo-replication costs
  - Reserved capacity discounts
  - Hybrid use benefit (if applicable)

- [ ] **Cost Optimization Strategies**
  - Right-size SKU (don't over-provision)
  - Use reserved capacity for predictable workloads
  - Implement proper TTLs to minimize memory
  - Monitor and adjust based on usage
  - Consider flash tier for cold data
  - Clean up unused instances

---

### Section 4: Authentication & Networking (13 minutes)

#### 4.1 Authentication Options
- [ ] **Access Keys (Default)**
  - Primary and secondary keys
  - Key rotation process
  - Storage in Key Vault
  - Pros and cons
  
- [ ] **Microsoft Entra ID (Recommended)**
  - Integration with Azure AD
  - RBAC-based access control
  - No key management needed
  - Managed identity support
  - Configuration steps
  
- [ ] **Access Policies**
  - Redis ACL support
  - User and permission management
  - Role-based access within Redis
  - Named users vs application identities

#### 4.2 Network Security Options
- [ ] **Public Endpoint**
  - Public IP access
  - Firewall rules
  - TLS/SSL enforcement
  - When to use
  - Security considerations
  
- [ ] **Private Endpoint (Recommended)**
  - Azure Private Link integration
  - Private IP in VNet
  - No internet exposure
  - Configuration requirements
  - DNS considerations
  
- [ ] **VNet Injection (If Available)**
  - Redis instance in customer VNet
  - Full network control
  - NSG and route table support
  - More complex setup

#### 4.3 Network Architecture Diagram
```
┌─────────────────────────────────────────────┐
│           Azure Virtual Network             │
│                                             │
│  ┌──────────────┐      ┌────────────────┐  │
│  │  App Subnet  │      │  Redis Subnet  │  │
│  │              │      │                │  │
│  │ ┌──────────┐ │      │ ┌────────────┐ │  │
│  │ │   App    │ │      │ │   Azure    │ │  │
│  │ │  Server  │◄┼──────┼►│  Managed   │ │  │
│  │ │          │ │      │ │   Redis    │ │  │
│  │ └──────────┘ │      │ └────────────┘ │  │
│  │              │      │  (Private EP)  │  │
│  └──────────────┘      └────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
           │
           │ VNet Peering or VPN
           │
      ┌────▼──────┐
      │ On-Premise│
      │  Network  │
      └───────────┘
```

---

## 📊 Deliverables Checklist

### 1. SKU Selection Decision Matrix
- [ ] **Create Interactive Decision Tree**
  ```
  Start
   ├─> Dataset < 10 GB → B1 or B3
   ├─> Dataset 10-50 GB → E5 or E10
   ├─> Dataset 50-100 GB → E20
   ├─> Dataset 100-500 GB → E50
   └─> Dataset > 500 GB → E100 or Clustered
  
  High Throughput Needed?
   ├─> Yes → C-series
   └─> No → E-series or B-series
  
  Need Geo-Replication?
   ├─> Yes → Premium tier + Geo-Replication
   └─> No → Standard tier sufficient
  ```

- [ ] **SKU Comparison Table Template** (Excel/CSV)
  - Columns: SKU, Memory, vCPUs, Throughput, Connections, Cost, Use Case
  - Populated with current Azure pricing

### 2. Architecture Decision Checklist
- [ ] **Architecture Selection Questionnaire**
  ```markdown
  ## Application Requirements
  - [ ] Dataset size: ______ GB
  - [ ] Expected throughput: ______ ops/sec
  - [ ] Expected connections: ______
  - [ ] Read/Write ratio: ______ / ______
  - [ ] Latency requirement: < ______ ms
  - [ ] Availability SLA: ______ %
  
  ## Architecture Needs
  - [ ] Single instance sufficient?
  - [ ] Need horizontal scaling?
  - [ ] Need multi-zone HA?
  - [ ] Need geo-replication?
  - [ ] Need active-active?
  
  ## Recommendation: __________
  ```

- [ ] **Architecture Pattern Templates**
  - Diagram templates for each pattern
  - Configuration snippets
  - Pros/Cons for each pattern

### 3. Capacity Planning Worksheet
- [ ] **Excel/Google Sheets Template**
  - Sections:
    - Dataset size calculation
    - Memory overhead calculator
    - Throughput estimation
    - Connection count planner
    - Cost estimation
    - Growth projection
  
- [ ] **Capacity Planning Guide Document**
  - Step-by-step worksheet
  - Example calculations
  - Common pitfalls
  - Validation checklist

---

## 🎨 Visual Assets Needed

### Diagrams to Create
- [ ] **Azure Redis Offerings Comparison** (infographic)
- [ ] **SKU Tier Visual Comparison** (chart)
- [ ] **Single Instance Architecture** (diagram)
- [ ] **Clustered Architecture with Sharding** (diagram)
- [ ] **Multi-Zone HA Setup** (diagram)
- [ ] **Active Geo-Replication** (diagram)
- [ ] **Network Architecture Options** (diagram)
- [ ] **Authentication Flow Diagrams** (3 types)
- [ ] **Decision Tree Flowchart** (SKU selection)

### Tables to Create
- [ ] **SKU Capabilities Matrix** (detailed specs for E, B, C series)
- [ ] **Throughput Benchmarks by SKU** (performance table)
- [ ] **Connection Limits by SKU** (reference table)
- [ ] **Pricing Comparison** (cost matrix across tiers)
- [ ] **Feature Availability by Tier** (comprehensive feature matrix)

---

## 💻 Code Examples & Snippets

### Azure CLI Commands
- [ ] **List Available SKUs**
  ```bash
  az redis list-skus --location eastus
  ```

- [ ] **Get SKU Details**
  ```bash
  az redis show-sku --sku E10 --location eastus
  ```

### Capacity Calculation Script
- [ ] **Python Script for Capacity Planning**
  ```python
  def calculate_redis_capacity(dataset_gb, overhead_pct=25, 
                               fragmentation_pct=15, growth_pct=50):
      """
      Calculate recommended Redis capacity
      """
      overhead = dataset_gb * (overhead_pct / 100)
      fragmentation = dataset_gb * (fragmentation_pct / 100)
      growth = (dataset_gb + overhead + fragmentation) * (growth_pct / 100)
      total = dataset_gb + overhead + fragmentation + growth
      return round(total, 2)
  
  # Example usage
  recommended_capacity = calculate_redis_capacity(80)
  print(f"Recommended capacity: {recommended_capacity} GB")
  ```

---

## 📖 Reference Materials to Include

### External Links
- [ ] [Azure Managed Redis Official Documentation](https://learn.microsoft.com/azure/azure-cache-for-redis/)
- [ ] [Azure Redis SKU Pricing Page](https://azure.microsoft.com/pricing/details/cache/)
- [ ] [Redis Enterprise Features Overview](https://redis.io/docs/latest/operate/rs/)
- [ ] [Azure Well-Architected Framework - Caching](https://learn.microsoft.com/azure/well-architected/)
- [ ] [Redis Cluster Specification](https://redis.io/docs/reference/cluster-spec/)

### Internal Workshop Links
- [ ] Module 1: Redis Fundamentals (prerequisite)
- [ ] Module 4: Hands-On Provisioning (next step)
- [ ] Module 6: Monitoring & Operations (related)

---

## 🎯 Learning Validation (Quiz Questions)

### Knowledge Check Questions
- [ ] **Question 1:** What are the three SKU series in Azure Managed Redis and when would you use each?
  - **Answer:** Memory Optimized (E-series) for large datasets, Balanced (B-series) for general purpose, Compute Optimized (C-series) for high throughput

- [ ] **Question 2:** What are the key enterprise features available in Azure Managed Redis?
  - **Answer:** Built-in clustering, active geo-replication across all tiers, Redis modules (RediSearch, RedisJSON), data persistence, 99.99% SLA with multi-zone HA

- [ ] **Question 3:** When should you use Active Geo-Replication?
  - **Answer:** For global applications needing low-latency access worldwide, disaster recovery, and business continuity

- [ ] **Question 4:** How do you calculate recommended Redis capacity?
  - **Answer:** Dataset size + overhead (25%) + fragmentation (15%) + growth buffer (50%)

- [ ] **Question 5:** What are the three authentication options for Azure Managed Redis?
  - **Answer:** Access Keys, Microsoft Entra ID, Access Policies (Redis ACL)

---

## ⏱️ Time Allocation (50 minutes)

| Section | Duration | Activity Type |
|---------|----------|---------------|
| Azure Redis Offerings | 10 min | Lecture + Slides |
| Architecture Patterns | 15 min | Lecture + Diagrams |
| Capacity Planning | 12 min | Interactive + Calculator |
| Authentication & Networking | 13 min | Lecture + Diagrams |

---

## 🎬 Presentation Flow

### Opening (2 minutes)
- Module objectives review
- Connection to Module 1
- Preview of hands-on labs to come

### Main Content (45 minutes)
- Structured lecture with visuals
- Interactive decision trees
- Live capacity calculation example
- Architecture pattern walkthroughs

### Closing (3 minutes)
- Key takeaways summary
- Deliverables review
- Transition to Module 3
- Q&A

---

## ✅ Content Creation Checklist

### Documentation
- [ ] Create main module content markdown file
- [ ] Write detailed section narratives
- [ ] Prepare speaker notes
- [ ] Create student handout

### Visual Assets
- [ ] Design all diagrams (9 total)
- [ ] Create all comparison tables (5 total)
- [ ] Build interactive decision tree
- [ ] Design infographics

### Deliverables
- [ ] Build SKU selection decision matrix
- [ ] Create architecture decision checklist
- [ ] Develop capacity planning worksheet
- [ ] Template all decision tools

### Code & Scripts
- [ ] Write capacity calculation script
- [ ] Prepare Azure CLI command examples
- [ ] Create validation scripts

### Presentation
- [ ] Build PowerPoint/slides
- [ ] Record demo video (optional)
- [ ] Prepare live demo script
- [ ] Test all examples

### Quality Assurance
- [ ] Technical review by Redis expert
- [ ] Peer review of content
- [ ] Test all code examples
- [ ] Validate all external links
- [ ] Proofread all text
- [ ] Time the delivery (target: 50 min)

---

**Status:** ✅ Checklist Complete - Ready for Content Development  
**Version:** 1.0  
**Last Updated:** November 18, 2025
