# Azure Managed Redis Workshop - 4 Hour Developer-Focused Plan

## 🎯 Workshop Overview

**Target Audience:** Backend developers and application architects  
**Focus:** Azure Managed Redis (AMR) deployment and application integration  
**Duration:** 4 hours (240 minutes total content)  
**Difficulty:** Intermediate  
**Format:** Mix of theory, demos, and hands-on labs

### Key Constraints
- ✅ **Azure Managed Redis ONLY** (not Azure Cache for Redis, except for migration module)
- ✅ **Redis Fundamentals** will be created by someone else - we include it but don't develop it
- ✅ **All other modules** need detailed content development
- ✅ **4-hour total duration** including breaks

---

## 📚 Workshop Modules Structure

### Module 1: Redis Fundamentals (45 minutes)
**Status:** ⚠️ To be developed by another team  
**Purpose:** Foundation for developers new to Redis  
**Type:** Theory + Demo  
**Prerequisites:** None

**Topics Covered:**
- What is Redis and when to use it
- Core data structures (Strings, Lists, Sets, Hashes, Sorted Sets)
- Basic commands and operations
- Common use cases overview
- Tools: redis-cli and RedisInsight basics

**Note:** We include this in the workshop flow but do NOT develop the content.

---

### Module 2: Azure Managed Redis Overview & Architecture (50 minutes)
**Status:** ✅ To be developed by us  
**Purpose:** Understanding AMR offerings and architecture decisions  
**Type:** Theory + Architecture  
**Prerequisites:** Module 1 or basic Redis knowledge

**Topics Covered:**
- Azure Managed Redis vs Azure Cache for Redis
- SKU tiers and capabilities (Balanced, Memory Optimized, Compute Optimized)
- Enterprise features (active geo-replication, Redis modules, clustering)
- Architecture patterns (single instance, clustered, geo-replicated)
- Capacity planning and sizing
- Authentication options (Access Keys, Entra ID, Access Policies)
- Networking (Public endpoint, Private endpoint, VNet injection)

**Deliverables:**
- SKU selection decision matrix
- Architecture design checklist
- Capacity planning worksheet

**Content File:** `module-02-azure-managed-redis-overview-checklist.md`

---

☕ **BREAK (10 minutes)**

---

### Module 3: Performance, Caching Patterns & Data Modeling (50 minutes)
**Status:** ✅ To be developed by us  
**Purpose:** Best practices for using Redis in applications  
**Type:** Theory + Patterns + Code Examples  
**Prerequisites:** Module 1

**Topics Covered:**
- Caching strategies (cache-aside, write-through, write-behind, refresh-ahead)
- When to use each caching pattern
- Data modeling best practices for Redis
- Key naming conventions and strategies
- TTL management and expiration policies
- Connection pooling and client configuration
- Performance optimization techniques
- Common anti-patterns to avoid

**Deliverables:**
- Caching pattern decision tree
- Data modeling guide with examples
- Code snippets for each pattern (Python, C#, Node.js)
- Performance tuning checklist

**Content File:** `module-03-performance-caching-patterns-checklist.md`

---

### Module 4: Hands-On Lab - Provision & Configure AMR (40 minutes)
**Status:** ✅ To be developed by us  
**Purpose:** Deploy and configure Azure Managed Redis  
**Type:** Hands-On Lab  
**Prerequisites:** Module 2

**Topics Covered:**
- Provision AMR using Azure Portal
- Provision AMR using Azure CLI
- Provision AMR using Infrastructure as Code (Bicep)
- Configure networking (Private endpoint)
- Set up authentication (Entra ID)
- Configure access policies
- Connect using redis-cli
- Connect using RedisInsight
- Verify deployment and connectivity
- Basic configuration (persistence, maxmemory-policy)

**Deliverables:**
- Working AMR instance (Memory Optimized tier)
- Private endpoint configured
- Entra ID authentication set up
- IaC code in repository (Bicep template)
- Connection validation script

**Content File:** `module-04-hands-on-provision-configure-checklist.md`

---

☕ **BREAK (10 minutes)**

---

### Module 5: Hands-On Lab - Implement Caching in Application (50 minutes)
**Status:** ✅ To be developed by us  
**Purpose:** Build a real application with Redis caching  
**Type:** Hands-On Lab  
**Prerequisites:** Module 3, Module 4

**Topics Covered:**
- Set up sample application (e.g., Python Flask or C# ASP.NET Core)
- Implement cache-aside pattern
- Configure Redis client with connection pooling
- Add error handling and retry logic
- Implement key naming strategy
- Set appropriate TTLs
- Test cache hit/miss scenarios
- Monitor cache effectiveness
- Load testing basics

**Deliverables:**
- Working application with Redis caching
- Cache hit rate metrics
- Performance comparison (with/without cache)
- Code repository with best practices

**Content File:** `module-05-hands-on-implement-caching-checklist.md`

---

### Module 6: Monitoring, Security & Operations (45 minutes)
**Status:** ✅ To be developed by us  
**Purpose:** Production-ready operations and monitoring  
**Type:** Theory + Demo + Hands-On  
**Prerequisites:** Module 4

**Topics Covered:**
- Azure Monitor integration
- Key metrics to monitor (CPU, memory, connections, operations/sec)
- Diagnostic logs and query examples
- Setting up alerts (connection failures, high CPU, memory pressure)
- Security best practices
  - Network isolation with Private Link
  - Entra ID authentication
  - Access policies and RBAC
  - TLS/SSL configuration
  - Key rotation strategies
- Backup and restore (if available for AMR)
- Scaling operations (vertical and horizontal)
- Common operational tasks

**Deliverables:**
- Monitoring dashboard in Azure Portal
- Alert rules configured
- Security checklist completed
- Operational runbook template

**Content File:** `module-06-monitoring-security-operations-checklist.md`

---

### Module 7: Azure Cache for Redis to AMR Migration 101 (30 minutes)
**Status:** ✅ To be developed by us  
**Purpose:** Migration path from Azure Cache for Redis to Azure Managed Redis  
**Type:** Theory + Strategy  
**Prerequisites:** Module 2

**Topics Covered:**
- Key differences between Azure Cache for Redis and Azure Managed Redis
- Migration planning checklist
- Migration strategies:
  - Offline migration (RDB export/import)
  - Online migration (dual-write pattern)
  - Active-passive failover
- Data migration tools and techniques
- Testing and validation
- Rollback plan
- Common gotchas and troubleshooting

**Deliverables:**
- Migration decision matrix
- Migration plan template
- Pre-migration checklist
- Post-migration validation script

**Content File:** `module-07-migration-azure-cache-to-amr-checklist.md`

---

## ⏱️ Workshop Timeline

| Time | Module | Duration | Type |
|------|--------|----------|------|
| 0:00 - 0:45 | Module 1: Redis Fundamentals | 45 min | Theory/Demo |
| 0:45 - 1:35 | Module 2: Azure Managed Redis Overview | 50 min | Theory/Architecture |
| 1:35 - 1:45 | ☕ Break | 10 min | Break |
| 1:45 - 2:35 | Module 3: Performance & Caching Patterns | 50 min | Theory/Patterns |
| 2:35 - 3:15 | Module 4: Hands-On - Provision & Configure | 40 min | Hands-On Lab |
| 3:15 - 3:25 | ☕ Break | 10 min | Break |
| 3:25 - 4:15 | Module 5: Hands-On - Implement Caching | 50 min | Hands-On Lab |
| 4:15 - 5:00 | Module 6: Monitoring, Security & Operations | 45 min | Theory/Demo/Hands-On |
| 5:00 - 5:30 | Module 7: Migration 101 | 30 min | Theory/Strategy |

**Total:** 5 hours 30 minutes (includes 20 minutes of breaks)  
**Content:** 4 hours 50 minutes (290 minutes)

**Note:** We can condense Module 6 to 35 minutes and Module 7 to 25 minutes if needed to fit exactly 4 hours of content.

---

## 🎯 Learning Objectives

By the end of this workshop, participants will be able to:

1. ✅ Understand Azure Managed Redis capabilities and SKU selection
2. ✅ Design appropriate Redis architectures for different scenarios
3. ✅ Provision and configure AMR using multiple methods (Portal, CLI, IaC)
4. ✅ Implement effective caching patterns in applications
5. ✅ Model data appropriately for Redis
6. ✅ Configure monitoring, alerts, and security
7. ✅ Plan and execute migrations from Azure Cache for Redis to AMR
8. ✅ Apply production-ready best practices

---

## 📋 Prerequisites

**Required:**
- Basic understanding of Redis concepts (covered in Module 1)
- Azure account with active subscription
- Familiarity with Azure Portal or Azure CLI
- Programming knowledge (Python, C#, or Node.js)
- Basic networking concepts

**Recommended:**
- Experience with cloud services
- Understanding of application architecture patterns
- Familiarity with Infrastructure as Code

---

## 🛠️ Required Tools & Setup

**Azure Resources:**
- Azure subscription with permissions to create:
  - Azure Managed Redis instances
  - Virtual Networks
  - Private Endpoints
  - Azure Monitor workspaces

**Local Development Environment:**
- Azure CLI (version 2.50+)
- Redis CLI (redis-tools package) or RedisInsight
- Code editor (VS Code recommended)
- Git client
- Programming language SDK:
  - Python 3.9+ with redis-py library
  - OR .NET 8+ with StackExchange.Redis
  - OR Node.js 18+ with ioredis

**Optional:**
- Docker Desktop (for local testing)
- Postman or similar API client
- JMeter or k6 (for load testing)

---

## 💰 Estimated Azure Costs

**For Workshop Duration (5-6 hours):**
- Azure Managed Redis (Memory Optimized - E10): ~$0.75/hour = $4.50
- Virtual Network: Free
- Private Endpoint: ~$0.01/hour = $0.06
- Azure Monitor: Free tier sufficient

**Total estimated cost per participant:** ~$5-6 USD

**Cost Saving Tips:**
- Delete resources immediately after workshop
- Use cheapest SKU that demonstrates features (E10 or E5)
- Share resources among small groups if possible
- Consider Azure free credits for new accounts

---

## 📁 Content Development Plan

### Module Files to Create

1. ✅ **Module 2 Content Checklist** - `module-02-azure-managed-redis-overview-checklist.md`
2. ✅ **Module 3 Content Checklist** - `module-03-performance-caching-patterns-checklist.md`
3. ✅ **Module 4 Content Checklist** - `module-04-hands-on-provision-configure-checklist.md`
4. ✅ **Module 5 Content Checklist** - `module-05-hands-on-implement-caching-checklist.md`
5. ✅ **Module 6 Content Checklist** - `module-06-monitoring-security-operations-checklist.md`
6. ✅ **Module 7 Content Checklist** - `module-07-migration-azure-cache-to-amr-checklist.md`

### Supporting Materials to Create

- **IaC Templates:**
  - Bicep template for AMR with Private Endpoint
  - Terraform alternative (optional)
  - ARM template for backward compatibility

- **Sample Applications:**
  - Python Flask app with Redis caching
  - C# ASP.NET Core app with Redis caching
  - Node.js Express app with Redis caching (optional)

- **Scripts and Tools:**
  - Provisioning automation scripts
  - Connection validation scripts
  - Load testing scenarios
  - Migration data generation scripts

- **Documentation:**
  - Lab instructions for each hands-on module
  - Troubleshooting guide
  - Best practices quick reference
  - Cheat sheet for common Redis commands

---

## 🔄 Workshop Flow and Pedagogy

### Learning Progression

1. **Foundation (Module 1)**: Build Redis knowledge
2. **Azure Context (Module 2)**: Understand AMR specifics
3. **Application Patterns (Module 3)**: Learn how to use Redis effectively
4. **Hands-On Practice (Modules 4-5)**: Deploy and implement
5. **Production Readiness (Module 6)**: Monitor and secure
6. **Migration Path (Module 7)**: Understand upgrade path

### Teaching Approach

- **Theory First, Then Practice**: Each hands-on module builds on theory
- **Progressive Complexity**: Start simple, add complexity gradually
- **Real-World Focus**: Use realistic scenarios and applications
- **Best Practices Throughout**: Emphasize production-ready patterns
- **Troubleshooting Mindset**: Include common issues and solutions

---

## ✅ Success Criteria

Participants successfully complete the workshop when they can:

- [ ] Explain Azure Managed Redis capabilities and tier differences
- [ ] Design an appropriate AMR architecture for a given scenario
- [ ] Provision AMR using IaC (Bicep)
- [ ] Configure Private Endpoint and Entra ID authentication
- [ ] Implement cache-aside pattern in a sample application
- [ ] Set up monitoring dashboard and alerts
- [ ] Explain migration strategies from Azure Cache for Redis
- [ ] Apply security best practices

---

## 📝 Next Steps After Workshop

1. **Build a Real Project**: Apply learnings to actual application
2. **Explore Advanced Features**: Redis modules, geo-replication
3. **Optimize Further**: Advanced performance tuning
4. **Certification**: Consider Azure certifications
5. **Community**: Join Redis and Azure communities

---

## 🔗 Additional Resources

- [Azure Managed Redis Documentation](https://learn.microsoft.com/azure/azure-cache-for-redis/)
- [Redis Documentation](https://redis.io/docs/)
- [Azure Architecture Center - Redis Patterns](https://learn.microsoft.com/azure/architecture/)
- [Redis University (Free Courses)](https://university.redis.com/)
- [Azure Well-Architected Framework](https://learn.microsoft.com/azure/well-architected/)

---

**Created:** November 18, 2025  
**Version:** 1.0  
**Status:** Ready for Content Development
