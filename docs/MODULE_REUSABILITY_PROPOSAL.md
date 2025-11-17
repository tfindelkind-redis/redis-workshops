# Module Reusability Architecture - PROPOSAL

**Date:** November 16, 2025  
**Status:** 🔄 PROPOSAL  
**Purpose:** Make ALL modules reusable across workshops while maintaining inheritance tracking

## 🎯 Problem Statement

**Current Issues:**
1. ❌ Modules are inside workshop directories (not reusable)
2. ❌ `shared/modules/` exists but unclear purpose
3. ❌ No way to reuse modules across workshops
4. ❌ No inheritance tracking when modules are copied
5. ❌ Duplicate content across workshops

## 💡 Proposed Solution: Module Library with Inheritance

### New Architecture:

```
redis-workshops/
├── modules/                          # ✨ NEW: Global module library
│   ├── getting-started/
│   │   ├── module.yaml              # Module metadata + inheritance info
│   │   └── README.md                # Module content
│   ├── redis-data-structures/
│   ├── azure-managed-redis/
│   └── redis-json/
│
├── workshops/
│   ├── workshop-1/
│   │   ├── README.md                # Workshop references modules
│   │   └── .modules                 # ✨ NEW: Module instances with inheritance
│   │       ├── module-01.yaml       # Points to: modules/getting-started
│   │       └── module-02.yaml       # Points to: modules/redis-json
│   └── workshop-2/
│       ├── README.md
│       └── .modules
│           ├── module-01.yaml       # Points to: modules/getting-started (same!)
│           └── module-02.yaml       # Points to: modules/azure-managed-redis
│
└── shared/                          # ❌ DELETE: Replaced by modules/
    ├── modules/                     # ❌ DELETE: Moving to root /modules
    └── templates/                   # ✅ KEEP: Still needed for scaffolding
```

## 📋 Module Library Structure

### 1. Global Module (`modules/getting-started/module.yaml`)

```yaml
# Module identity
id: "core.getting-started.v1"
name: "Getting Started with Redis"
version: "1.0.0"
type: "core"  # core | custom | workshop-specific

# Metadata
metadata:
  duration: 45
  difficulty: "beginner"
  prerequisites: []
  tags:
    - redis
    - basics

# Inheritance tracking
inheritance:
  isTemplate: true          # This is a reusable template
  usedBy:                   # Auto-tracked by Workshop Builder
    - workshop: "deploy-redis-for-developers-amr"
      moduleOrder: 2
      lastUsed: "2025-11-15T10:30:00Z"
    - workshop: "redis-basics"
      moduleOrder: 1
      lastUsed: "2025-11-10T14:20:00Z"

# Versioning
changelog:
  - version: "1.0.0"
    date: "2025-10-31"
    changes: "Initial version"
    
# Content
description: |
  Introduction to Redis...

learning_objectives:
  - Understand what Redis is
  - Install Redis locally
  - Basic operations
```

### 2. Workshop Module Instance (`.modules/module-01.yaml`)

```yaml
# Instance metadata
instanceId: "ws-deploy-redis-amr-module-01"
order: 1

# Inheritance reference
moduleRef: "core.getting-started.v1"  # ✨ Points to global module
modulePath: "modules/getting-started"  # Physical path

# Inheritance tracking
inheritance:
  parentModule: "core.getting-started.v1"
  parentVersion: "1.0.0"
  inheritedAt: "2025-11-15T10:30:00Z"
  lastSyncedAt: "2025-11-15T10:30:00Z"
  customizations: []  # Track local changes

# Workshop-specific overrides (optional)
overrides:
  name: "Getting Started with Redis (Azure Edition)"  # Optional rename
  duration: 50  # Override duration if needed
  
# Module state
status: "active"
required: true
```

## 🔄 How It Works

### Module Reuse Workflow:

```
1. Creator browses module library
   └─→ GET /api/modules/library
   
2. Creator adds module to workshop
   └─→ POST /api/workshops/{id}/modules
   └─→ Creates .modules/module-XX.yaml
   └─→ Records inheritance in parent module
   
3. Workshop Builder serves content
   └─→ Reads .modules/module-XX.yaml
   └─→ Resolves moduleRef to modules/getting-started
   └─→ Merges overrides if any
   └─→ Returns combined module data

4. Parent module tracking
   └─→ Updates modules/getting-started/module.yaml
   └─→ Adds workshop to usedBy list
```

### Benefits:

1. ✅ **True Reusability:** Same module used in multiple workshops
2. ✅ **No Duplication:** Single source of truth for content
3. ✅ **Inheritance Tracking:** Always know parent module
4. ✅ **Version Control:** Track module versions used
5. ✅ **Customization:** Workshop-specific overrides possible
6. ✅ **Auto-Sync:** Option to update when parent changes

## 🗂️ Module Types

### Type 1: Core Modules (Reusable)
**Location:** `modules/core-*`  
**Purpose:** Standard Redis topics used everywhere  
**Examples:**
- `modules/getting-started/`
- `modules/redis-data-structures/`
- `modules/redis-json/`

**Characteristics:**
- Marked as `type: "core"`
- Always reusable
- Versioned carefully
- No workshop-specific content

### Type 2: Custom Modules (Reusable)
**Location:** `modules/custom-*`  
**Purpose:** Specialized topics that can be reused  
**Examples:**
- `modules/azure-managed-redis/`
- `modules/aws-elasticache/`
- `modules/kubernetes-redis/`

**Characteristics:**
- Marked as `type: "custom"`
- Reusable across similar workshops
- May have prerequisites
- Platform/tech-specific

### Type 3: Workshop-Specific Modules (Non-reusable)
**Location:** `modules/workshop-{id}-*`  
**Purpose:** Unique to one workshop  
**Examples:**
- `modules/workshop-amr-capstone/`
- `modules/workshop-custom-exercise/`

**Characteristics:**
- Marked as `type: "workshop-specific"`
- Only used in one workshop
- Still tracked in module library
- Can be promoted to reusable later

## 📊 Database Schema

### Module Library Index (`modules/index.json`)

```json
{
  "modules": [
    {
      "id": "core.getting-started.v1",
      "path": "modules/getting-started",
      "name": "Getting Started with Redis",
      "version": "1.0.0",
      "type": "core",
      "metadata": {
        "duration": 45,
        "difficulty": "beginner",
        "tags": ["redis", "basics"]
      },
      "usage": {
        "workshopCount": 3,
        "totalInstances": 3,
        "lastUsed": "2025-11-15T10:30:00Z"
      }
    }
  ],
  "lastUpdated": "2025-11-16T00:00:00Z"
}
```

## 🔧 Implementation Plan

### Phase 1: Module Library Setup ✅
1. ✅ Create `modules/` directory at root
2. ✅ Move `shared/modules/*` to `modules/`
3. ✅ Add inheritance tracking to module.yaml
4. ✅ Create module index

### Phase 2: Workshop Integration 🔄
1. 🔄 Update workshops to use `.modules/` directory
2. 🔄 Create module instance files
3. 🔄 Update Workshop Builder API
4. 🔄 Update module resolution logic

### Phase 3: Workshop Builder Updates 🔄
1. 🔄 Add "Module Library" browser
2. 🔄 Add module reuse UI
3. 🔄 Show inheritance info in UI
4. 🔄 Add "Update from parent" feature

### Phase 4: Cleanup ✅
1. ✅ Delete unused scripts
2. ✅ Update documentation
3. ✅ Migration guide

## 🗑️ Scripts to Delete

### Delete These (Replaced by Workshop Builder):

```bash
# Module management
shared/tools/create-module.sh              # ❌ DELETE
shared/tools/module-manager.py             # ❌ DELETE

# Workshop management  
shared/tools/create-workshop.sh            # ❌ DELETE (optional keep for CLI users)

# Data generation (keep for website)
shared/tools/generate-module-data.js       # ✅ KEEP (website)
shared/tools/generate-module-data.py       # ❌ DELETE (duplicate)
shared/tools/generate-workshop-data.py     # ✅ KEEP (website)
shared/tools/generate-website-data.sh      # ✅ KEEP (website)

# Validation (keep for CI/CD)
shared/tools/validate-workshop.sh          # ✅ KEEP (CI/CD)

# Builders (replaced)
shared/tools/workshop-builder.py           # ❌ DELETE (replaced by Node.js)
```

## 📝 Migration Steps

### Step 1: Move Modules
```bash
# Create new structure
mkdir -p modules

# Move shared modules
mv shared/modules/* modules/

# Delete old location
rmdir shared/modules
```

### Step 2: Update Module Metadata
```bash
# Add inheritance tracking to each module.yaml
# Workshop Builder will handle this automatically
```

### Step 3: Update Workshops
```bash
# For each workshop:
# 1. Create .modules/ directory
# 2. Create module instance files
# 3. Update module references in README.md
```

### Step 4: Delete Scripts
```bash
rm shared/tools/create-module.sh
rm shared/tools/module-manager.py
rm shared/tools/generate-module-data.py
rm shared/tools/workshop-builder.py
```

## 🎯 Expected Outcomes

### Before:
```
workshops/deploy-redis-for-developers-amr/
├── module-01-redis-data-structures/
│   ├── module.yaml
│   └── README.md
└── module-02-introduction/
    ├── module.yaml
    └── README.md

workshops/redis-basics/
├── module-01-introduction/           # ❌ DUPLICATE!
│   ├── module.yaml                   # ❌ DUPLICATE!
│   └── README.md                     # ❌ DUPLICATE!
```

### After:
```
modules/
├── redis-data-structures/
│   ├── module.yaml                   # ✅ Single source
│   └── README.md
└── introduction/
    ├── module.yaml                   # ✅ Single source
    └── README.md

workshops/deploy-redis-for-developers-amr/
├── README.md
└── .modules/
    ├── module-01.yaml                # → modules/redis-data-structures
    └── module-02.yaml                # → modules/introduction

workshops/redis-basics/
├── README.md
└── .modules/
    └── module-01.yaml                # → modules/introduction ✅ REUSED!
```

## ✅ Benefits Summary

1. **🎯 True Reusability:** Modules used across all workshops
2. **📊 Inheritance Tracking:** Always know the parent
3. **🔄 Easy Updates:** Update module once, all workshops benefit
4. **📝 Version Control:** Track which version each workshop uses
5. **🎨 Customization:** Workshop-specific overrides when needed
6. **🗂️ Organization:** Clear separation of library vs instances
7. **🚀 Scalability:** Easy to add new modules to library
8. **🧹 Less Duplication:** Single source of truth

---

**Status:** 🔄 **AWAITING APPROVAL**  
**Next Steps:** 
1. Review and approve architecture
2. Implement Phase 1 (module library)
3. Update Workshop Builder
4. Migrate existing workshops
5. Delete unused scripts

**Questions?**
- Should we keep `create-workshop.sh` for CLI users?
- Should all existing modules become "core" modules?
- Migration timeline?
