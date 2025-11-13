# Module Inheritance System

This workshop framework implements a **copy-on-write module versioning system** with lineage tracking. This allows you to:

1. 🔍 **Discover** existing modules and their variants
2. 🔀 **Fork** modules to create customized versions
3. 📊 **Track** what's been customized vs. inherited
4. 🌳 **Visualize** the version tree for any module
5. 🔄 **Merge** improvements back to parent versions

## Quick Start

### Search for Modules

```bash
# Search all modules
./shared/tools/module-manager.py search

# Search for specific modules
./shared/tools/module-manager.py search redis
./shared/tools/module-manager.py search fundamentals
./shared/tools/module-manager.py search azure
```

**Output:**
```
============================================================
📦 CANONICAL MODULES
============================================================

🌟 Redis Fundamentals
   ID: core.redis-fundamentals.v1
   📁 shared/modules/redis-fundamentals
   ⏱️  60 minutes
   📝 Introduction to Redis core concepts...
   🏷️  Tags: fundamentals, core, generic, data-structures

============================================================
🔀 CUSTOMIZED VERSIONS (1 found)
============================================================

📦 Redis Fundamentals
   ID: deploy-redis-for-developers.redis-fundamentals.v1
   📁 workshops/deploy-redis-for-developers/modules/redis-fundamentals
   🔗 Parent: core.redis-fundamentals.v1
   📝 Azure-focused version with Azure Cache for Redis examples...
```

### View Version Tree

```bash
# Show all versions of a module
./shared/tools/module-manager.py tree redis
```

**Output:**
```
============================================================
🌳 MODULE VERSION TREE: Redis Fundamentals
============================================================

📦 core.redis-fundamentals.v1 (CANONICAL)
│  📁 shared/modules/redis-fundamentals
│  ⏱️  60 min
│  📅 Updated: 2025-11-01T15:30:00Z
│  ✏️  Introduction to Redis core concepts...
│└─➤ 📦 deploy-redis-for-developers.redis-fundamentals.v1
│     📁 workshops/deploy-redis-for-developers/modules/redis-fundamentals
│     ⏱️  60 min
│     ✏️  Azure-focused version with Azure Cache for Redis examples...
│     📊 Customized: 1 | Inherited: 2
   └─➤ 📦 enterprise-security.redis-fundamentals.v1
        📁 workshops/enterprise-redis/modules/redis-fundamentals
        ⏱️  75 min
        ✏️  Adds compliance and security requirements...
        📊 Customized: 2 | Inherited: 1
```

### Fork a Module

```bash
# Fork from canonical version
./shared/tools/module-manager.py fork \
  --from core.redis-fundamentals.v1 \
  --to workshops/my-workshop/modules/redis-fundamentals \
  --description "Custom version for financial services"

# Fork from another customized version
./shared/tools/module-manager.py fork \
  --from deploy-redis-for-developers.redis-fundamentals.v1 \
  --to workshops/advanced-azure/modules/redis-fundamentals \
  --description "Extends Azure version with Enterprise features"
```

**Output:**
```
✅ Module forked successfully!
   Source: core.redis-fundamentals.v1
   Destination: workshops/my-workshop/modules/redis-fundamentals
   New ID: my-workshop.redis-fundamentals.v1

📝 Next steps:
   1. Customize files in: workshops/my-workshop/modules/redis-fundamentals/content/
   2. Update .lineage file to mark customized files
   3. Build workshop to test changes
```

## How It Works

### Module Structure

Each module has three key files:

```
redis-fundamentals/
├── module.yaml           # Module metadata and configuration
├── .lineage             # Tracks parent-child relationships
└── content/             # Content files
    ├── 01-intro.md
    ├── 02-main.md
    └── exercises/
```

### module.yaml

Defines module metadata:

```yaml
id: "core.redis-fundamentals.v1"
name: "Redis Fundamentals"
description: "Introduction to Redis core concepts, data structures, and common use cases"

metadata:
  duration: 60
  difficulty: "beginner"
  tags: ["fundamentals", "core", "generic", "data-structures"]
  
sections:
  - id: "what-is-redis"
    title: "What is Redis?"
    file: "content/01-what-is-redis.md"
    duration: 15
    
  - id: "data-structures"
    title: "Redis Data Structures"
    file: "content/02-data-structures.md"
    duration: 25

lineage:
  is_canonical: true  # Or false for forked versions
  parent: null        # Or parent module ID
  children: []        # List of child module IDs
```

### .lineage File

Tracks customizations and inheritance:

```yaml
module_id: "deploy-redis-for-developers.redis-fundamentals.v1"
parent_module: "core.redis-fundamentals.v1"
parent_path: "shared/modules/redis-fundamentals"
created: "2025-11-12T17:24:33Z"
created_by: "thomas.findelkind"
description: "Azure-focused version with Azure Cache for Redis examples"

files:
  01-what-is-redis.md:
    status: customized
    source: "shared/modules/redis-fundamentals/content/01-what-is-redis.md"
    customization_date: "2025-11-12T17:26:00Z"
    changes:
      - "Added Azure Cache for Redis introduction"
      - "Added Azure-specific tiers and SLA information"
      - "Added VNet integration examples"
      
  02-data-structures.md:
    status: inherited
    source: "shared/modules/redis-fundamentals/content/02-data-structures.md"
    
  03-use-cases.md:
    status: inherited
    source: "shared/modules/redis-fundamentals/content/03-use-cases.md"
    
  04-azure-integration.md:
    status: new
    created: "2025-11-12T17:30:00Z"
    description: "New content showing Azure-specific integration patterns"
```

### File Status Types

- **`inherited`**: File is unchanged from parent
- **`customized`**: File was modified after forking
- **`new`**: File doesn't exist in parent (added in this version)

## Workflow Examples

### Example 1: Create Azure-Specific Workshop

```bash
# 1. Search for relevant modules
./shared/tools/module-manager.py search redis

# 2. View the version tree
./shared/tools/module-manager.py tree redis-fundamentals

# 3. Fork the canonical version
./shared/tools/module-manager.py fork \
  --from core.redis-fundamentals.v1 \
  --to workshops/azure-redis/modules/redis-fundamentals \
  --description "Azure Cache for Redis version"

# 4. Customize content files
cd workshops/azure-redis/modules/redis-fundamentals/content
# Edit files to add Azure-specific content

# 5. Update .lineage to track changes
# Mark which files were customized and what changed

# 6. Test the workshop
# Build and preview to ensure everything works
```

### Example 2: Create Enterprise Security Variant

```bash
# Start from the Azure version (not canonical)
./shared/tools/module-manager.py fork \
  --from deploy-redis-for-developers.redis-fundamentals.v1 \
  --to workshops/enterprise-redis/modules/redis-fundamentals \
  --description "Adds compliance and security requirements"

# Now you inherit:
# - All Azure-specific content from parent
# - All generic content from grandparent (canonical)
# 
# You only customize:
# - Security-specific sections
# - Compliance examples
```

### Example 3: Multi-Level Inheritance

```
core.redis-fundamentals.v1 (CANONICAL)
└─➤ azure-redis.redis-fundamentals.v1
    ├─➤ enterprise-security.redis-fundamentals.v1
    │   └─➤ financial-services.redis-fundamentals.v1
    └─➤ startup-quickstart.redis-fundamentals.v1
```

Each level inherits from its parent and customizes specific aspects:

- **Canonical**: Cloud-agnostic fundamentals
- **Azure**: Azure Cache for Redis specifics
- **Enterprise Security**: Adds VNet, Private Endpoints, RBAC
- **Financial Services**: Adds PCI-DSS compliance examples
- **Startup Quickstart**: Removes enterprise content, focuses on Basic tier

## Benefits

### 🎯 For Module Authors

- **Write once, reuse everywhere**: Create canonical modules that others can customize
- **Track adoption**: See who's using your modules via the version tree
- **Accept contributions**: Merge improvements from forks back to canonical

### 👥 For Workshop Creators

- **Start from best match**: Fork from closest existing version instead of starting from scratch
- **Minimize duplication**: Only customize what's different
- **Stay updated**: See when parent modules improve and merge changes

### 🔍 For Learners

- **Find the right version**: Search shows all variants (generic, Azure, AWS, enterprise, etc.)
- **Understand differences**: Lineage tracking shows exactly what's customized
- **Choose your path**: Pick the version that matches your needs

## Module Sizing Guidelines

Modules should be **45-90 minutes** (sweet spot: **60 minutes**):

- ✅ Small enough to be reusable
- ✅ Large enough to cover a cohesive topic
- ✅ Fits typical attention span
- ✅ Easy to combine into different workshop lengths

### Example Module Breakdown

**Redis Fundamentals (60 min)**
- 15 min: What is Redis?
- 25 min: Data Structures
- 15 min: Common Use Cases
- 5 min: Live Demo

**Azure Redis Options (60 min)**
- 20 min: Cache Tiers Overview
- 20 min: Choosing the Right Tier
- 15 min: Cost Optimization
- 5 min: Decision Tree Exercise

## Workshop Configurations

Combine modules to create different workshop lengths:

### 2-Hour Quickstart
- Module 1: Redis Fundamentals (60 min)
- Module 7: Hands-On Provisioning (60 min)

### 4-Hour Developer Workshop
- Module 1: Redis Fundamentals (60 min)
- Module 2: Azure Redis Options (60 min)
- Module 7: Hands-On Provisioning (60 min)
- Module 8: Hands-On Caching (60 min)

### 8-Hour Full Day
- All 9 core modules
- 4 hands-on labs
- Breaks and Q&A

### 2-Day Deep Dive
- All 9 core modules
- 6 hands-on labs
- Troubleshooting scenarios
- Advanced features
- Migration workshop

## Directory Structure

```
redis-workshops/
├── shared/
│   ├── modules/                    # Canonical modules
│   │   ├── redis-fundamentals/
│   │   ├── azure-redis-options/
│   │   └── ...
│   └── tools/
│       └── module-manager.py       # CLI tool
│
├── workshops/
│   ├── deploy-redis-for-developers/
│   │   ├── modules/               # Customized versions
│   │   │   ├── redis-fundamentals/
│   │   │   │   ├── module.yaml
│   │   │   │   ├── .lineage
│   │   │   │   └── content/
│   │   │   └── ...
│   │   ├── workshop.config.json
│   │   └── README.md
│   │
│   ├── enterprise-redis/
│   └── ...
│
└── .workshop-index.yaml           # Global module index (optional)
```

## Best Practices

### For Canonical Modules

1. **Stay cloud-agnostic**: No AWS/Azure/GCP specifics
2. **Focus on fundamentals**: Core concepts that don't change
3. **Use clear examples**: Generic code samples work everywhere
4. **Document well**: Others will fork your module

### For Customized Versions

1. **Fork from closest match**: Don't fork canonical if Azure version exists
2. **Customize minimally**: Only change what's necessary
3. **Track changes**: Update .lineage with clear descriptions
4. **Test thoroughly**: Ensure inherited + customized content works together

### For Lineage Tracking

1. **Be specific**: List exact changes made to each file
2. **Update dates**: Track when customizations were made
3. **Mark new files**: Clearly indicate files that don't exist in parent
4. **Document rationale**: Explain why customization was needed

## Future Enhancements

### Phase 2: Smart Discovery
- Semantic search across module content
- Recommendation engine ("You might like...")
- Dependency visualization

### Phase 3: Automated Merging
- Detect parent updates
- Propose merge strategies
- Handle conflicts gracefully
- Contribute improvements back to parent

### Phase 4: Build System
- Generate flat workshop structure
- Resolve all inheritance
- Create standalone deployable packages
- Validate all dependencies

## Contributing

To contribute a new canonical module:

1. Create module in `shared/modules/`
2. Follow the module template structure
3. Set `is_canonical: true` in module.yaml
4. Submit PR with comprehensive documentation

To improve an existing module:

1. Fork the module (or use existing fork)
2. Make your improvements
3. Update .lineage to track changes
4. Submit PR to parent module (if improvements are generally useful)

---

**Questions?** Check the examples or run:
```bash
./shared/tools/module-manager.py --help
```
