---
title: Well-Architected Framework Overview
description: 'Introduce the Azure Well-Architected Framework and understand how its 5 pillars apply to Redis workloads.'
duration: 45 minutes
difficulty: intermediate
type: hands-on
---

<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->

| Previous | Home | Next |
|----------|:----:|------:|
| [⬅️ Previous: Azure Managed Redis Architecture](../module-02-azure-managed-redis-architecture/README.md) | [🏠 Workshop Home](../README.md) | [Next: Reliability & Security Deep Dive ➡️](../module-04-reliability-security-deep-dive/README.md) |

[🏠 Workshop Home](../README.md) > **Module 3 of 11**

### Deploy Redis for Developers - Azure Managed Redis

**Progress:** `██░░░░░░░░` 27%

---

<!-- ✏️ EDIT YOUR CONTENT BELOW THIS LINE ✏️ -->

# Module 3: Well-Architected Framework Overview
**Duration:** 45 minutes  
**Format:** Theory + Discussion  
**Level:** Intermediate

---

## Module Overview

**Objective:** Introduce the Azure Well-Architected Framework and understand how its 5 pillars apply to Redis workloads.

**Learning Outcomes:**
- Understand the purpose and structure of Azure WAF
- Learn the 5 pillars and their core principles
- Recognize trade-offs between pillars
- Apply WAF thinking to Redis architecture decisions

**Prerequisites:**
- Module 1 & 2 completed
- Basic understanding of cloud architecture
- Familiarity with production system requirements

---

## Timing Breakdown

| Section | Duration | Type |
|---------|----------|------|
| Introduction to WAF | 8 min | Theory |
| 5 Pillars Overview | 20 min | Theory |
| Trade-offs & Decision Making | 12 min | Discussion |
| WAF Assessment Process | 5 min | Process |
| **Total** | **45 min** | |

---

## Section 1: Introduction to WAF (8 minutes)

### 1.1 What is Azure Well-Architected Framework? (4 minutes)

**Definition:**
The Azure Well-Architected Framework is a set of guiding principles and best practices for designing and operating reliable, secure, efficient, and cost-effective cloud systems on Azure.

**Purpose:**
- Provide consistent architectural guidance
- Help make informed decisions with trade-offs understood
- Enable assessment and improvement of existing systems
- Reduce risk and technical debt

**Framework Structure:**
```
Azure Well-Architected Framework
├── 5 Core Pillars
│   ├── Reliability
│   ├── Security
│   ├── Cost Optimization
│   ├── Operational Excellence
│   └── Performance Efficiency
├── Design Principles (per pillar)
├── Assessment Tools
└── Best Practices
```

**Key Concept: No Perfect Architecture**
- Every decision involves trade-offs
- Different workloads prioritize different pillars
- Context matters: cost-sensitive vs mission-critical
- Framework helps make conscious, documented decisions

---

### 1.2 Why WAF Matters for Redis (4 minutes)

**Redis in Production Context:**
- Often critical path for application performance
- Cache failures can cascade to database overload
- Security breaches can expose sensitive session data
- Poor cost optimization can lead to overspending
- Operational issues affect entire application stack

**Real-World Impact Examples:**

**Example 1: E-commerce Cart**
- Redis stores shopping cart data
- Reliability failure → Lost carts, lost revenue
- Security breach → Payment info exposed
- Poor performance → Slow checkout, cart abandonment

**Example 2: API Rate Limiting**
- Redis tracks API quotas
- Reliability failure → API abuse, DDoS vulnerability
- Cost inefficiency → Overpaying for unused capacity
- Operational issues → Difficult to adjust limits

**WAF Benefits for Redis:**
- ✅ Systematic approach to architecture decisions
- ✅ Balance competing requirements
- ✅ Document rationale for choices
- ✅ Continuous improvement methodology
- ✅ Risk mitigation

---

## Section 2: The 5 Pillars (20 minutes)

### 2.1 Reliability Pillar (4 minutes)

**Definition:** Ability of a system to recover from failures and continue to function.

**Core Principles:**
1. **Design for failure** - Assume components will fail
2. **High availability** - Minimize downtime
3. **Disaster recovery** - Plan for regional failures
4. **Data durability** - Protect against data loss

**Redis Context:**

**Availability Targets:**
- Zone redundancy: 99.99% SLA (52 min/year downtime)
- Active-Active geo-replication: 99.999% SLA (5 min/year)

**Key Decisions:**
```
Decision: Single-zone vs Zone-redundant?
├── Single-zone
│   ├── Pro: Lower cost
│   ├── Con: AZ failure = downtime
│   └── Use: Dev/test, non-critical cache
└── Zone-redundant
    ├── Pro: Automatic failover, 99.99% SLA
    ├── Con: Higher cost (~2x)
    └── Use: Production, critical path data
```

**Persistence Strategy:**
- RDB: Point-in-time snapshots (faster recovery)
- AOF: Write-ahead log (minimal data loss)
- Combined: Best of both (recommended)

**Disaster Recovery:**
- Active-Passive: Secondary region for DR
- Active-Active: Multi-region writes with CRDTs
- RPO (Recovery Point Objective): How much data loss tolerable?
- RTO (Recovery Time Objective): How long downtime tolerable?

**Key Questions:**
- What's acceptable downtime for your application?
- Can you tolerate losing last N seconds of data?
- Do you need multi-region failover?

---

### 2.2 Security Pillar (4 minutes)

**Definition:** Protect applications and data from threats.

**Core Principles:**
1. **Defense in depth** - Multiple layers of security
2. **Least privilege** - Minimum necessary access
3. **Identity-based access** - Strong authentication
4. **Encryption** - Protect data in transit and at rest

**Redis Context:**

**Network Security Layers:**
```
Layer 1: Network Isolation
├── Private Endpoint (recommended)
├── VNET Integration
└── Firewall rules (minimum)

Layer 2: Authentication
├── Entra ID with RBAC (recommended)
├── Access keys (legacy)
└── Certificate-based auth

Layer 3: Encryption
├── TLS 1.2 in transit (enforced)
└── Encryption at rest (automatic)

Layer 4: Monitoring
├── Diagnostic logs
├── Alert rules
└── Security Center integration
```

**RBAC Roles:**
- **Data Owner:** Full read/write/delete
- **Data Contributor:** Read/write (no delete)
- **Data Reader:** Read-only
- **Cache Contributor:** Manage cache settings

**Compliance:**
- HIPAA: Healthcare data
- PCI DSS: Payment card data
- GDPR: EU data privacy
- SOC 2: Security controls audit

**Key Questions:**
- What data sensitivity level? (public, internal, confidential)
- Which compliance frameworks apply?
- Who needs access and what permissions?

---

### 2.3 Cost Optimization Pillar (4 minutes)

**Definition:** Maximize value while minimizing waste.

**Core Principles:**
1. **Right-sizing** - Choose appropriate capacity
2. **Reserved capacity** - Commit for discounts
3. **Monitor and optimize** - Track spending trends
4. **Architect for efficiency** - Design cost-aware solutions

**Redis Context:**

**SKU Selection Formula:**
```
Required Memory = (Working Set × Safety Factor) / Cache Hit Rate
Safety Factor = 1.3-1.5 (30-50% headroom)

Example:
- Working set: 10 GB
- Safety factor: 1.4
- Cache hit rate: 90%
→ Required: (10 × 1.4) / 0.9 = 15.5 GB
→ Recommended: B20 (20 GB) or M20 (25 GB)
```

**Cost Optimization Strategies:**

**1. Reserved Capacity:**
- 1-year commitment: 24% savings
- 3-year commitment: 48% savings
- Best for: Stable, predictable workloads

**2. Right-sizing:**
- Monitor memory usage (target: 60-80%)
- Monitor connection count (target: <80% max)
- Scale down over-provisioned instances

**3. Flash Tier for Cold Data:**
- A250 vs M250: ~60% cost savings
- Hot data in RAM, cold data on NVMe
- Trade-off: Slightly higher latency for cold data

**4. Lifecycle Management:**
- TTL on all cache entries
- Eviction policies (allkeys-lru recommended)
- Regular cleanup of stale data

**Cost Comparison Example:**
```
Scenario: 250GB cache, production workload

Option 1: M250 Memory Optimized
- Cost: ~$4,000/month (pay-as-you-go)
- Reserved 3-year: ~$2,080/month (48% savings)

Option 2: A250 Flash Optimized
- Cost: ~$1,500/month (pay-as-you-go)
- Reserved 3-year: ~$780/month (48% savings)

Savings: Up to $3,220/month with Flash + Reserved
```

**Key Questions:**
- What's your actual working set size?
- Is workload stable enough for reserved capacity?
- Can some data tolerate slightly higher latency?

---

### 2.4 Operational Excellence Pillar (4 minutes)

**Definition:** Operations processes that keep a system running in production.

**Core Principles:**
1. **Infrastructure as Code** - Automate deployments
2. **Monitoring & alerting** - Observe system health
3. **Safe deployment practices** - Minimize risk of changes
4. **Continuous improvement** - Learn from incidents

**Redis Context:**

**IaC Approach:**
```
Infrastructure as Code (Bicep/Terraform)
├── Benefits
│   ├── Repeatable deployments
│   ├── Version controlled configuration
│   ├── Environment consistency
│   └── Disaster recovery capability
├── What to automate
│   ├── Redis instance creation
│   ├── Network configuration (VNET, Private Endpoint)
│   ├── Security settings (Entra ID, firewall)
│   ├── Diagnostic settings
│   └── Alert rules
└── CI/CD Pipeline
    ├── Dev → Test → Staging → Production
    ├── Automated validation
    └── Rollback capability
```

**Monitoring Strategy:**
```
Tier 1: Real-time Metrics
├── Memory usage (alert at 80%)
├── CPU usage (alert at 85%)
├── Connection count (alert at 80% of max)
├── Cache hit rate (alert if <90%)
└── Latency (alert if >5ms p99)

Tier 2: Diagnostic Logs
├── Connection events
├── Authentication failures
├── Configuration changes
└── Performance issues

Tier 3: Application Metrics
├── Cache miss rate by endpoint
├── TTL effectiveness
├── Popular keys analysis
└── Error rates
```

**Runbooks & Playbooks:**
- High memory usage → Scale up or evict keys
- Connection exhaustion → Check connection pooling
- Slow queries → Analyze SLOWLOG
- Failover event → Verify application retry logic

**Key Questions:**
- Can you recreate your infrastructure from code?
- What's your MTTR (Mean Time To Repair)?
- Do you have automated alerts for critical metrics?

---

### 2.5 Performance Efficiency Pillar (4 minutes)

**Definition:** Ability of a system to adapt to changes in load.

**Core Principles:**
1. **Select right resources** - Match workload to SKU
2. **Monitor performance** - Track key metrics
3. **Optimize data access** - Design efficient patterns
4. **Scale appropriately** - Vertical or horizontal

**Redis Context:**

**Performance Dimensions:**
```
Latency
├── Target: <1ms p50, <5ms p99
├── Factors: Network, SKU, data size
└── Optimization: Connection pooling, pipelining

Throughput
├── Target: Match application QPS
├── Factors: SKU vCPUs, clustering
└── Optimization: Sharding, read replicas

Memory Efficiency
├── Target: 60-80% utilization
├── Factors: Data structures, TTLs
└── Optimization: Right data structures, compression
```

**Caching Strategy Decision Tree:**
```
Choose Caching Pattern
├── Read-heavy workload?
│   └── Yes → Cache-aside (lazy loading)
│       ├── Cache miss: Fetch from DB, populate cache
│       ├── Cache hit: Return from Redis
│       └── Best for: Read-heavy, tolerance for cold start
├── Write-heavy with read consistency?
│   └── Yes → Write-through
│       ├── Write: Update DB + cache atomically
│       ├── Read: Always from cache
│       └── Best for: Strong consistency needed
├── Write-heavy with async ok?
│   └── Yes → Write-behind
│       ├── Write: Update cache, queue DB write
│       ├── Read: Always from cache
│       └── Best for: High write throughput
└── Predictable access?
    └── Yes → Refresh-ahead
        ├── Pre-populate before expiration
        └── Best for: Known popular items
```

**Data Modeling Best Practices:**
```
Use Right Data Structure
├── Simple values → String
├── Objects/records → Hash
├── Collections → Set or List
├── Rankings → Sorted Set
└── Time series → Sorted Set (score=timestamp)

Key Naming Convention
├── Use namespace: "app:entity:id"
├── Example: "ecommerce:user:1000:cart"
├── Enable pattern matching for cleanup
└── Support for clustering (hash tags)
```

**Key Questions:**
- What are your latency requirements?
- What's your expected throughput (ops/sec)?
- Are you using the optimal data structures?

---

## Section 3: Trade-offs & Decision Making (12 minutes)

### 3.1 Common Trade-off Scenarios (8 minutes)

**Scenario 1: SKU Selection**

**Situation:** Choosing between B50 and M50
```
B50 (Balanced):
├── Cost: ~$500/month
├── Memory: 51 GB
├── vCPUs: 8
└── Best for: General-purpose

M50 (Memory Optimized):
├── Cost: ~$750/month
├── Memory: 50 GB
├── vCPUs: 4
└── Best for: Memory-heavy

Trade-off Analysis:
├── Cost Optimization ← B50 wins (33% cheaper)
├── Performance ← Depends on workload
│   ├── CPU-bound? → B50 (more vCPUs)
│   └── Memory-bound? → Similar
├── Reliability ← Similar (both support HA)
└── Recommendation: Start with B50, monitor CPU
```

---

**Scenario 2: Persistence Configuration**

**Situation:** RDB vs AOF vs Both
```
RDB Only:
├── Pros: Faster restarts, lower I/O
├── Cons: Data loss up to snapshot interval
├── Cost: Lower (less disk I/O)
├── Reliability: Medium (potential data loss)
└── Use case: Cache where data loss tolerable

AOF Only:
├── Pros: Minimal data loss (1 second)
├── Cons: Slower restarts, higher I/O
├── Cost: Higher (more disk I/O)
├── Reliability: High (near zero data loss)
└── Use case: Session store, critical data

Both (Combined):
├── Pros: Best reliability + fast recovery
├── Cons: Highest cost
├── Cost: Highest (both mechanisms)
├── Reliability: Highest
└── Use case: Production, business-critical

Trade-off Decision:
├── Session data (user login) → Both
├── Page cache → RDB only
├── Shopping cart → Both
└── Temporary calculations → None
```

---

**Scenario 3: High Availability**

**Situation:** Single-zone vs Zone-redundant vs Active-Active
```
Single-zone:
├── Cost: $X/month
├── SLA: None (best effort)
├── Downtime: Hours if AZ fails
└── Use: Dev/test environments

Zone-redundant:
├── Cost: ~$2X/month (2x single-zone)
├── SLA: 99.99% (52 min/year)
├── Downtime: <2 minutes on failover
└── Use: Production, single-region

Active-Active Geo:
├── Cost: ~$4X/month (2 regions × 2x each)
├── SLA: 99.999% (5 min/year)
├── Downtime: Nearly zero (local writes)
└── Use: Global, mission-critical

Trade-off Matrix:
                Cost    Reliability    Complexity
Single-zone      ✅        ⚠️            ✅
Zone-redundant   ⚠️        ✅            ✅
Active-Active    ❌        ✅✅          ⚠️

Recommendation by Use Case:
├── E-commerce checkout → Active-Active
├── Content delivery → Zone-redundant
├── Background jobs → Single-zone
└── Development → Single-zone
```

---

**Scenario 4: Network Security**

**Situation:** Public endpoint vs Private endpoint
```
Public Endpoint + Firewall:
├── Cost: No additional cost
├── Security: Medium (TLS + IP filtering)
├── Complexity: Low
├── Performance: Good
└── Use case: Small teams, simple deployments

Private Endpoint:
├── Cost: +$7/month per endpoint
├── Security: High (VNET isolation)
├── Complexity: Medium (DNS, networking)
├── Performance: Excellent (private network)
└── Use case: Enterprise, compliance requirements

Trade-off Analysis:
Security Pillar → Private Endpoint wins
Cost Pillar → Public wins
Operational Excellence → Public wins (simpler)
Compliance Required? → Must use Private

Decision Framework:
├── PCI DSS / HIPAA required? → Private Endpoint
├── Public internet access acceptable? → Public + Firewall
├── Multi-tier app in VNET? → Private Endpoint
└── Simple standalone app? → Public + Firewall
```

---

### 3.2 Decision Framework (4 minutes)

**Step-by-Step Approach:**

**1. Identify Requirements**
```
Gather Information:
├── Performance: Latency, throughput targets
├── Reliability: SLA, RTO/RPO targets
├── Security: Compliance, data sensitivity
├── Cost: Budget constraints
└── Scale: Current + growth projections
```

**2. Map to Pillars**
```
Prioritize Pillars (1-5 ranking):
Example for E-commerce:
├── 1. Reliability (downtime = lost revenue)
├── 2. Performance (user experience critical)
├── 3. Security (payment data protection)
├── 4. Cost Optimization (margins matter)
└── 5. Operational Excellence (team capacity)
```

**3. Evaluate Options**
```
For each decision point:
├── List alternatives
├── Score against priority pillars
├── Calculate weighted score
└── Identify deal-breakers (compliance, budget)
```

**4. Document Decision**
```
Architecture Decision Record (ADR):
├── Context: Why decision needed
├── Options considered: 2-3 alternatives
├── Decision: What was chosen
├── Rationale: Why (with trade-offs)
└── Consequences: Expected outcomes
```

**Example ADR:**
```markdown
# ADR-001: Redis SKU Selection for Production

## Context
Need to select Redis SKU for production e-commerce platform.
Expected: 30GB working set, 50K concurrent users, <2ms p99 latency.

## Options Considered
1. B50 (51GB, 8 vCPUs) - $500/month
2. M50 (50GB, 4 vCPUs) - $750/month
3. X20 (24GB, 32 vCPUs) - $650/month + clustering

## Decision
Selected: B50 with zone redundancy

## Rationale
- Sufficient memory (30GB working set × 1.5 safety = 45GB)
- 8 vCPUs adequate for expected load
- 33% cheaper than M50
- Performance monitoring will determine if upgrade needed

## Trade-offs
- Cost Optimization: ✅ Best value
- Performance: ✅ Meets requirements  
- Reliability: ✅ Zone redundancy enabled
- Risk: ⚠️ May need to upgrade if CPU-bound

## Next Review
- Monitor CPU/memory for 30 days
- Re-evaluate if CPU >70% or memory >80%
```

---

## Section 4: WAF Assessment Process (5 minutes)

### 4.1 How to Assess Your Redis Deployment

**Microsoft WAF Assessment Tool:**
- Online questionnaire: https://aka.ms/waf/assess
- Covers all 5 pillars
- Generates score and recommendations
- Free tool

**Self-Assessment Checklist:**

**Reliability (✅/⚠️/❌):**
- [ ] Zone redundancy enabled for production?
- [ ] Persistence configured (RDB + AOF)?
- [ ] Disaster recovery plan documented?
- [ ] Automated failover tested?

**Security:**
- [ ] Using Entra ID authentication?
- [ ] Private Endpoint configured?
- [ ] TLS 1.2 enforced?
- [ ] Diagnostic logging enabled?
- [ ] RBAC roles properly assigned?

**Cost Optimization:**
- [ ] Right-sized (60-80% memory utilization)?
- [ ] Reserved capacity for stable workloads?
- [ ] TTLs on all cache entries?
- [ ] Cost monitoring/alerts configured?

**Operational Excellence:**
- [ ] Infrastructure as Code (Bicep/Terraform)?
- [ ] Monitoring dashboards created?
- [ ] Alert rules configured?
- [ ] Runbooks documented?
- [ ] CI/CD pipeline for deployments?

**Performance Efficiency:**
- [ ] Appropriate SKU for workload?
- [ ] Connection pooling implemented?
- [ ] Optimal data structures used?
- [ ] Cache hit rate >90%?
- [ ] Latency <5ms p99?

---

### 4.2 Continuous Improvement

**Monthly Review:**
- Check monitoring metrics vs targets
- Review cost trends
- Assess incident response times
- Update documentation

**Quarterly Review:**
- Re-run WAF assessment
- Evaluate new Azure features
- Review and update RTO/RPO targets
- Cost optimization opportunities

**After Incidents:**
- Conduct blameless postmortem
- Update runbooks
- Implement preventive measures
- Share learnings with team

---

## Key Takeaways

### ✅ Must Remember:

1. **5 Pillars of WAF:**
   - Reliability, Security, Cost Optimization, Operational Excellence, Performance Efficiency

2. **No Perfect Architecture:**
   - Every decision involves trade-offs
   - Context matters (workload, compliance, budget)
   - Document your rationale

3. **Balance is Key:**
   - Over-engineering wastes money
   - Under-engineering causes incidents
   - Continuous assessment and improvement

4. **Decision Framework:**
   - Identify requirements
   - Map to pillars
   - Evaluate options
   - Document decisions

### 🎯 Skills Acquired:

- ✅ Understand WAF structure and purpose
- ✅ Apply 5 pillars to Redis decisions
- ✅ Analyze trade-offs systematically
- ✅ Use decision framework
- ✅ Conduct WAF assessment

---

## Next Module Preview

**Module 4A: Reliability & Security Deep Dive (60 minutes)**

In the next module, we'll dive deep into:
- High availability patterns and configuration
- Persistence strategies (RDB + AOF)
- Disaster recovery planning
- Network security implementation
- Entra ID authentication setup
- Compliance requirements

**Transition:** "Now that we understand the WAF framework and how to make trade-off decisions, let's dive deep into the first two pillars: Reliability and Security. These are often the highest priority for production Redis deployments."

---

## Additional Resources

**Azure Well-Architected Framework:**
- Overview: https://learn.microsoft.com/azure/well-architected/
- Assessment tool: https://aka.ms/waf/assess
- Redis-specific guidance: https://learn.microsoft.com/azure/well-architected/service-guides/azure-cache-redis

**Related Tools:**
- Azure Advisor: Automated recommendations
- Azure Cost Management: Cost tracking
- Azure Monitor: Observability platform

---

**Module Status:** ✅ Complete  
**Last Updated:** November 2025  
**Version:** 2.0

<!-- ✏️ EDIT YOUR CONTENT ABOVE THIS LINE ✏️ -->

---

<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->

## Navigation

| Previous | Home | Next |
|----------|:----:|------:|
| [⬅️ Previous: Azure Managed Redis Architecture](../module-02-azure-managed-redis-architecture/README.md) | [🏠 Workshop Home](../README.md) | [Next: Reliability & Security Deep Dive ➡️](../module-04-reliability-security-deep-dive/README.md) |

---

*Module 3 of 11*
