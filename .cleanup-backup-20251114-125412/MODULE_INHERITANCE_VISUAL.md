# Module Inheritance System - Visual Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     WORKSHOP FRAMEWORK                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │         Canonical Modules (shared/modules/)           │    │
│  │                                                       │    │
│  │  📦 core.redis-fundamentals.v1                       │    │
│  │  📦 core.azure-redis-options.v1                      │    │
│  │  📦 core.waf-overview.v1                             │    │
│  │  📦 core.reliability-security.v1                     │    │
│  │  ...                                                  │    │
│  │                                                       │    │
│  │  ✓ Cloud-agnostic                                    │    │
│  │  ✓ Generic examples                                  │    │
│  │  ✓ Foundational content                              │    │
│  └───────────────────────────────────────────────────────┘    │
│                          │                                      │
│                          │ Fork & Customize                     │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────────┐    │
│  │    Workshop-Specific Modules (workshops/*/modules/)   │    │
│  │                                                       │    │
│  │  📦 deploy-redis.redis-fundamentals.v1               │    │
│  │     ├─ 01-intro.md (CUSTOMIZED - Azure focus)        │    │
│  │     ├─ 02-data-structures.md (INHERITED)             │    │
│  │     └─ 03-use-cases.md (INHERITED)                   │    │
│  │                                                       │    │
│  │  📦 enterprise.redis-fundamentals.v1                 │    │
│  │     ├─ 01-intro.md (CUSTOMIZED - Security focus)     │    │
│  │     ├─ 02-data-structures.md (INHERITED)             │    │
│  │     ├─ 03-use-cases.md (CUSTOMIZED - Enterprise)     │    │
│  │     └─ 04-compliance.md (NEW)                        │    │
│  └───────────────────────────────────────────────────────┘    │
│                          │                                      │
│                          │ Build & Flatten                      │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────────┐    │
│  │         Deployed Workshop (standalone)                │    │
│  │                                                       │    │
│  │  All inheritance resolved                             │    │
│  │  All files standalone                                 │    │
│  │  Ready for GitHub Pages                               │    │
│  │  No references or symlinks                            │    │
│  └───────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Version Tree Example

```
🌳 Redis Fundamentals Family Tree

core.redis-fundamentals.v1 (CANONICAL)
│  📁 shared/modules/redis-fundamentals
│  ⏱️  60 min | 👤 Cloud-agnostic
│  📝 Generic Redis concepts, no cloud specifics
│
├─➤ azure-waf.redis-fundamentals.v1
│   │  📁 workshops/deploy-redis-for-developers/modules/
│   │  ⏱️  60 min | 👤 Azure-focused
│   │  📝 Azure Cache for Redis examples
│   │  📊 Customized: 1 | Inherited: 2
│   │
│   ├─➤ enterprise-security.redis-fundamentals.v1
│   │   │  📁 workshops/enterprise-azure/modules/
│   │   │  ⏱️  75 min | 👤 Enterprise + Security
│   │   │  📝 Adds VNet, Private Endpoints, RBAC
│   │   │  📊 Customized: 2 | Inherited: 1 | New: 1
│   │   │
│   │   └─➤ financial-services.redis-fundamentals.v1
│   │       │  📁 workshops/finserv-compliance/modules/
│   │       │  ⏱️  90 min | 👤 FinServ + Compliance
│   │       │  📝 Adds PCI-DSS, audit trails
│   │       │  📊 Customized: 3 | Inherited: 0 | New: 2
│   │
│   └─➤ developer-quickstart.redis-fundamentals.v1
│       │  📁 workshops/2hr-quickstart/modules/
│       │  ⏱️  30 min | 👤 Simplified
│       │  📝 Condensed version for time-limited workshops
│       │  📊 Customized: 2 | Inherited: 1
│
└─➤ aws-specific.redis-fundamentals.v1
    │  📁 workshops/aws-elasticache/modules/
    │  ⏱️  60 min | 👤 AWS-focused
    │  📝 ElastiCache for Redis examples
    │  📊 Customized: 1 | Inherited: 2
    │
    └─➤ aws-enterprise.redis-fundamentals.v1
        │  📁 workshops/aws-enterprise/modules/
        │  ⏱️  75 min | 👤 AWS + Enterprise
        │  📝 Adds AWS PrivateLink, CloudWatch
        │  📊 Customized: 2 | Inherited: 1 | New: 1
```

## Workflow Visualization

### 1. Discovery Phase

```
┌─────────────────────────────────────────┐
│  $ module-manager.py search redis       │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  📦 CANONICAL MODULES                   │
│  ────────────────────────────────       │
│  🌟 Redis Fundamentals                  │
│     core.redis-fundamentals.v1          │
│     ⏱️ 60 min | Generic                 │
│                                         │
│  📦 CUSTOMIZED VERSIONS (3 found)       │
│  ────────────────────────────────       │
│  📦 Azure version                       │
│  📦 AWS version                         │
│  📦 Enterprise version                  │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Decision: Which one is closest         │
│  to my needs?                           │
└─────────────────────────────────────────┘
```

### 2. Forking Phase

```
┌─────────────────────────────────────────┐
│  $ module-manager.py fork               │
│    --from azure-waf.redis-fund.v1       │
│    --to my-workshop/modules/redis       │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Creates:                               │
│  ✓ New module directory                 │
│  ✓ module.yaml (updated ID)             │
│  ✓ .lineage file (tracks parent)        │
│  ✓ content/ directory                   │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Initial state:                         │
│  📄 01-intro.md → INHERITED              │
│  📄 02-data-structures.md → INHERITED    │
│  📄 03-use-cases.md → INHERITED          │
└─────────────────────────────────────────┘
```

### 3. Customization Phase

```
┌─────────────────────────────────────────┐
│  Edit content files:                    │
│  ─────────────────                      │
│  📝 01-intro.md                          │
│     Add my-specific content             │
│                                         │
│  📝 04-my-section.md                     │
│     New file, doesn't exist in parent   │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Update .lineage:                       │
│  ────────────────                       │
│  files:                                 │
│    01-intro.md:                         │
│      status: customized                 │
│      changes:                           │
│        - "Added finserv examples"       │
│    02-data-structures.md:               │
│      status: inherited                  │
│    04-my-section.md:                    │
│      status: new                        │
└─────────────────────────────────────────┘
```

### 4. Build Phase (Future)

```
┌─────────────────────────────────────────┐
│  $ build-workshop.py my-workshop        │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Build System:                          │
│  ─────────────                          │
│  1. Read module.yaml                    │
│  2. Read .lineage file                  │
│  3. For each INHERITED file:            │
│     Copy from parent                    │
│  4. For each CUSTOMIZED file:           │
│     Use local version                   │
│  5. For each NEW file:                  │
│     Include as-is                       │
│  6. Flatten into standalone module      │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Output: my-workshop/build/             │
│  ─────────────────────────              │
│  modules/redis-fundamentals/            │
│    ├─ 01-intro.md (customized)          │
│    ├─ 02-data-structures.md (inherited) │
│    ├─ 03-use-cases.md (inherited)       │
│    └─ 04-my-section.md (new)            │
│                                         │
│  ✓ No references                        │
│  ✓ All files standalone                 │
│  ✓ Ready for deployment                 │
└─────────────────────────────────────────┘
```

## File Status Flow

```
┌──────────────┐
│  CANONICAL   │  (Parent module)
│    FILE      │
└──────┬───────┘
       │
       │ Fork
       ▼
┌──────────────┐
│  INHERITED   │  (Exact copy, tracked in .lineage)
└──────┬───────┘
       │
       │ Edit
       ▼
┌──────────────┐
│  CUSTOMIZED  │  (Modified, changes documented)
└──────────────┘

       OR

┌──────────────┐
│   (none)     │  (Doesn't exist in parent)
└──────┬───────┘
       │
       │ Create
       ▼
┌──────────────┐
│     NEW      │  (Added in this version)
└──────────────┘
```

## Lineage Tracking Structure

```yaml
# .lineage file structure

module_id: "my-workshop.redis-fundamentals.v1"
parent_module: "azure-waf.redis-fundamentals.v1"
parent_path: "workshops/deploy-redis/modules/redis-fundamentals"

created: "2025-11-12T18:00:00Z"
created_by: "developer-name"
description: "Customized for financial services compliance"

files:
  # INHERITED - No changes
  02-data-structures.md:
    status: inherited
    source: "workshops/deploy-redis/modules/redis-fundamentals/content/02-data-structures.md"
  
  # CUSTOMIZED - Modified from parent
  01-what-is-redis.md:
    status: customized
    source: "workshops/deploy-redis/modules/redis-fundamentals/content/01-what-is-redis.md"
    customization_date: "2025-11-12T18:15:00Z"
    changes:
      - "Added PCI-DSS compliance section"
      - "Added audit trail examples"
      - "Removed basic tier information (not compliant)"
  
  03-use-cases.md:
    status: customized
    source: "workshops/deploy-redis/modules/redis-fundamentals/content/03-use-cases.md"
    customization_date: "2025-11-12T18:30:00Z"
    changes:
      - "Added financial services examples"
      - "Added tokenization use case"
  
  # NEW - Doesn't exist in parent
  04-compliance.md:
    status: new
    created: "2025-11-12T18:45:00Z"
    description: "New section covering PCI-DSS requirements"
  
  05-audit-trails.md:
    status: new
    created: "2025-11-12T19:00:00Z"
    description: "New section on audit trail implementation"
```

## Workshop Configuration Examples

### 2-Hour Quickstart
```yaml
# workshop.config.json
{
  "name": "Redis Quickstart",
  "duration": 120,
  "modules": [
    {
      "id": "quickstart.redis-fundamentals.v1",
      "path": "modules/redis-fundamentals"
    },
    {
      "id": "quickstart.hands-on-provision.v1",
      "path": "modules/hands-on-provision"
    }
  ]
}
```

### 8-Hour Full Day
```yaml
# workshop.config.json
{
  "name": "Redis for Developers - Full Day",
  "duration": 480,
  "modules": [
    "deploy-redis.redis-fundamentals.v1",
    "deploy-redis.azure-redis-options.v1",
    "deploy-redis.waf-overview.v1",
    "deploy-redis.reliability-security.v1",
    "deploy-redis.cost-operations.v1",
    "deploy-redis.performance-data.v1",
    "deploy-redis.hands-on-provision.v1",
    "deploy-redis.hands-on-caching.v1",
    "deploy-redis.hands-on-monitoring.v1"
  ]
}
```

## Benefits Summary

```
┌─────────────────────────────────────────────────────────┐
│                    FOR AUTHORS                          │
├─────────────────────────────────────────────────────────┤
│  ✓ Write once, reuse everywhere                        │
│  ✓ Track who's using your modules                      │
│  ✓ Accept improvements from forks                      │
│  ✓ Clear attribution and lineage                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│               FOR WORKSHOP CREATORS                     │
├─────────────────────────────────────────────────────────┤
│  ✓ Start from closest match                            │
│  ✓ Only customize differences                          │
│  ✓ Stay updated with parent                            │
│  ✓ Build multiple workshops from same modules          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   FOR LEARNERS                          │
├─────────────────────────────────────────────────────────┤
│  ✓ Find the right version (Azure/AWS/Generic)          │
│  ✓ Understand what's different                         │
│  ✓ Choose appropriate difficulty level                 │
│  ✓ Follow consistent structure across workshops        │
└─────────────────────────────────────────────────────────┘
```

## CLI Commands Visual Guide

```bash
# ┌─────────────────────────────────────┐
# │  Search for modules                 │
# └─────────────────────────────────────┘

$ module-manager.py search redis
→ Shows canonical + all customized versions
→ Displays tags, duration, descriptions
→ Shows parent relationships

# ┌─────────────────────────────────────┐
# │  View version tree                  │
# └─────────────────────────────────────┘

$ module-manager.py tree redis-fundamentals
→ Tree visualization with hierarchy
→ Shows customization stats (2 custom, 3 inherited)
→ Displays all generations (grandparent → parent → child)

# ┌─────────────────────────────────────┐
# │  Fork a module                      │
# └─────────────────────────────────────┘

$ module-manager.py fork \
    --from core.redis-fundamentals.v1 \
    --to my-workshop/modules/redis \
    --description "My custom version"
→ Creates new module directory
→ Generates .lineage file
→ Copies module.yaml with new ID
→ Ready for customization

# ┌─────────────────────────────────────┐
# │  Get module info                    │
# └─────────────────────────────────────┘

$ module-manager.py info deploy-redis.redis-fundamentals.v1
→ Shows complete module metadata
→ Displays lineage information
→ Lists all files and their status
```

## Future Enhancements

```
Phase 2: Smart Discovery
├─ Semantic search across content
├─ Recommendation engine
├─ Dependency visualization
└─ Interactive tree browser

Phase 3: Build System
├─ Resolve inheritance chains
├─ Flatten module structure
├─ Validate dependencies
└─ Generate deployment package

Phase 4: Automated Merging
├─ Detect parent updates
├─ Propose merge strategies
├─ Handle conflicts
└─ Contribute back to parent

Phase 5: Analytics
├─ Module usage tracking
├─ Popular customizations
├─ Common patterns
└─ Quality metrics
```

---

**This visual guide shows the complete module inheritance system architecture, workflows, and benefits.**
