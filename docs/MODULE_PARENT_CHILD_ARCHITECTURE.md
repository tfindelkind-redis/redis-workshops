# Module Reusability: Parent-Child Architecture

**Date:** November 16, 2025  
**Status:** ✅ APPROVED APPROACH  

## 🎯 Core Principles

### 1. **Modules Live in Workshops**
- ✅ Modules stay in `workshops/{workshop-id}/module-XX-{name}/`
- ✅ NO central module library
- ✅ Modules are owned by the workshop that created them

### 2. **Parent-Child Relationships**
- ✅ First created = parent (root)
- ✅ Reused instances = children (linked)
- ✅ Always track the parent

### 3. **Inheritance Tracking**
- ✅ Parent knows all children
- ✅ Child knows its parent
- ✅ Clear lineage always visible

## 📐 Architecture

### Structure:

```
workshops/
├── workshop-a/
│   ├── README.md
│   ├── module-01-intro/              # 🌳 ROOT MODULE (parent)
│   │   ├── module.yaml
│   │   │   └─→ inheritance.isRoot = true
│   │   │   └─→ inheritance.usedBy = ["workshop-b", "workshop-c"]
│   │   └── README.md
│   │
│   └── module-02-basics/             # 🔗 CHILD MODULE (linked)
│       ├── module.yaml
│       │   └─→ inheritance.isRoot = false
│       │   └─→ inheritance.parentPath = "workshops/workshop-b/module-01-basics"
│       └── README.md (optional, can reference parent)
│
├── workshop-b/
│   ├── README.md
│   ├── module-01-basics/             # 🌳 ROOT MODULE (parent)
│   │   ├── module.yaml
│   │   │   └─→ inheritance.isRoot = true
│   │   │   └─→ inheritance.usedBy = ["workshop-a"]
│   │   └── README.md
│   │
│   └── module-02-intro/              # 🔗 CHILD MODULE (linked)
│       ├── module.yaml
│       │   └─→ inheritance.parentPath = "workshops/workshop-a/module-01-intro"
│       └── README.md (optional)
│
└── workshop-c/
    ├── README.md
    └── module-01-intro/              # 🔗 CHILD MODULE (linked)
        ├── module.yaml
        │   └─→ inheritance.parentPath = "workshops/workshop-a/module-01-intro"
        └── README.md (optional)
```

## 📋 Module Types

### Type 1: Root Module (Parent)

**Characteristics:**
- ✅ Original/first instance
- ✅ Owns the content
- ✅ Can be reused by others
- ✅ Tracks all children

**module.yaml:**
```yaml
id: "workshop.workshop-a.intro.v1"
name: "Introduction to Redis"
version: "1.0.0"

inheritance:
  isRoot: true
  usedBy:
    - workshop: "workshop-b"
      modulePath: "workshops/workshop-b/module-02-intro"
      linkedAt: "2025-11-16T10:30:00Z"
    - workshop: "workshop-c"
      modulePath: "workshops/workshop-c/module-01-intro"
      linkedAt: "2025-11-16T11:00:00Z"

metadata:
  duration: 45
  difficulty: "beginner"
```

### Type 2: Child Module (Linked)

**Characteristics:**
- ✅ References a parent
- ✅ Can have customizations
- ✅ Inherits from parent
- ✅ Clearly tracks lineage

**module.yaml:**
```yaml
id: "workshop.workshop-b.intro.v1"
name: "Introduction to Redis"  # Same as parent
version: "1.0.0"

inheritance:
  isRoot: false
  parentModule: "workshop.workshop-a.intro.v1"
  parentPath: "workshops/workshop-a/module-01-intro"
  inheritedAt: "2025-11-16T10:30:00Z"
  customizations:
    - field: "duration"
      original: 45
      custom: 50
      reason: "Added extra exercise time"

metadata:
  duration: 50  # Overridden
  difficulty: "beginner"  # Inherited
```

### Type 3: Standalone Module (Unique)

**Characteristics:**
- ✅ Not reused anywhere
- ✅ Workshop-specific
- ✅ No inheritance info needed
- ✅ Can be promoted to root later

**module.yaml:**
```yaml
id: "workshop.workshop-a.capstone.v1"
name: "Workshop Capstone Project"
version: "1.0.0"

# No inheritance section (standalone)

metadata:
  duration: 120
  difficulty: "advanced"
```

## 🔄 Workflows

### Workflow 1: Creating a New Module

```
User creates module in workshop-a:
    │
    ├─→ Check: Does similar module exist?
    │       │
    │       ├─→ NO: Create as ROOT
    │       │   └─→ Set inheritance.isRoot = true
    │       │
    │       └─→ YES: Give user options:
    │           ├─→ Option A: Create new ROOT (if different enough)
    │           ├─→ Option B: Link as CHILD (reuse existing)
    │           └─→ Option C: Create standalone (unique)
    │
    └─→ Module created!
```

### Workflow 2: Reusing an Existing Module

```
User wants to add module to workshop-b:
    │
    ├─→ Browse all modules
    │   └─→ Workshop Builder shows all ROOT modules
    │
    ├─→ Select module to reuse
    │   └─→ Example: "Introduction to Redis" from workshop-a
    │
    ├─→ Choose reuse method:
    │   ├─→ Option A: Link as child (recommended)
    │   │   └─→ Creates module-XX with reference to parent
    │   │   └─→ Updates parent's usedBy list
    │   │
    │   └─→ Option B: Duplicate as new root
    │       └─→ Creates full copy
    │       └─→ New independent root
    │
    └─→ Module added to workshop!
```

### Workflow 3: Finding and Linking Duplicates

```
Workshop Builder scans all workshops:
    │
    ├─→ Finds duplicate modules
    │   └─→ Example: "Introduction to Redis" in 3 workshops
    │
    ├─→ Suggests creating parent-child relationships
    │   └─→ Shows which one should be parent
    │
    ├─→ User chooses parent (or accepts suggestion)
    │   └─→ Rule 1: Oldest
    │   └─→ Rule 2: Most complete
    │   └─→ Rule 3: Manual choice
    │
    ├─→ Workshop Builder links all others as children
    │   └─→ Updates all module.yaml files
    │   └─→ Tracks relationships
    │
    └─→ Duplicates now linked! 🎉
```

## 🎨 Workshop Builder Features

### Feature 1: Module Browser

```
📚 Browse All Modules

Filters:
- [ ] Show only ROOT modules
- [ ] Show only CHILD modules
- [ ] Show standalone modules

Modules:
┌─────────────────────────────────────────┐
│ Introduction to Redis                    │
│ Workshop: workshop-a                     │
│ Type: 🌳 ROOT                           │
│ Used by: 2 workshops                     │
│ [View Details] [Reuse This]             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Introduction to Redis                    │
│ Workshop: workshop-b                     │
│ Type: 🔗 CHILD                          │
│ Parent: workshop-a/module-01-intro       │
│ [View Details] [View Parent]            │
└─────────────────────────────────────────┘
```

### Feature 2: Duplicate Finder

```
🔍 Find Duplicate Modules

Potential duplicates found: 2 groups

Group 1: "Introduction to Redis" (3 instances)
┌─────────────────────────────────────────┐
│ ✅ workshop-a/module-01-intro (ROOT)    │
│    Created: 2025-10-31                   │
│    Duration: 45 min                      │
│    [Make this parent]                    │
├─────────────────────────────────────────┤
│ ⚠️  workshop-b/module-02-intro (DUPE)   │
│    Created: 2025-11-05                   │
│    Duration: 45 min                      │
│    [Link to workshop-a]                  │
├─────────────────────────────────────────┤
│ ⚠️  workshop-c/module-01-intro (DUPE)   │
│    Created: 2025-11-10                   │
│    Duration: 50 min                      │
│    [Link to workshop-a]                  │
└─────────────────────────────────────────┘

[Link All to Workshop-A]
```

### Feature 3: Inheritance View

```
🌳 Module Lineage

ROOT: Introduction to Redis
└─→ workshops/workshop-a/module-01-intro/

Children (2):
├─→ workshops/workshop-b/module-02-intro/
│   └─→ Linked: 2025-11-16
│   └─→ Customizations: duration (45 → 50)
│
└─→ workshops/workshop-c/module-01-intro/
    └─→ Linked: 2025-11-16
    └─→ Customizations: none
```

## 📊 Benefits

### 1. **Simple Structure**
```
✅ No central library to maintain
✅ Modules live where they're used
✅ Clear ownership (workshop owns it)
✅ Easy to understand
```

### 2. **True Reusability**
```
✅ Link modules across workshops
✅ Track all relationships
✅ Update parent, children benefit
✅ No content duplication
```

### 3. **Clear Lineage**
```
✅ Always know the parent
✅ Always know the children
✅ Track customizations
✅ Version control friendly
```

### 4. **Flexibility**
```
✅ Can customize child modules
✅ Can promote child to parent
✅ Can break relationship if needed
✅ Can have standalone modules
```

## 🚀 Migration Example

### Before (Duplicates):

```
workshops/
├── workshop-a/
│   └── module-01-intro/
│       ├── module.yaml (45 min)
│       └── README.md (full content)
│
├── workshop-b/
│   └── module-02-intro/       # ❌ DUPLICATE!
│       ├── module.yaml (45 min)
│       └── README.md (same content!)
│
└── workshop-c/
    └── module-01-intro/       # ❌ DUPLICATE!
        ├── module.yaml (50 min)
        └── README.md (same content!)
```

### After (Linked):

```
workshops/
├── workshop-a/
│   └── module-01-intro/       # 🌳 ROOT
│       ├── module.yaml
│       │   └─→ inheritance.isRoot = true
│       │   └─→ inheritance.usedBy = [workshop-b, workshop-c]
│       └── README.md (full content)
│
├── workshop-b/
│   └── module-02-intro/       # 🔗 CHILD
│       └── module.yaml
│           └─→ inheritance.parentPath = workshop-a/module-01-intro
│           └─→ (README.md not needed, references parent)
│
└── workshop-c/
    └── module-01-intro/       # 🔗 CHILD
        └── module.yaml
            └─→ inheritance.parentPath = workshop-a/module-01-intro
            └─→ inheritance.customizations = [duration: 50]
            └─→ (README.md not needed, references parent)
```

**Benefits:**
- ✅ Content stored once (workshop-a)
- ✅ Clear relationships
- ✅ Easy to update (update parent, children get it)
- ✅ Track customizations (workshop-c has longer duration)

## 🎯 Decision Rules

### When to Create ROOT Module:

```
✅ First time creating this type of content
✅ Significantly different from existing modules
✅ Will be reused by other workshops
✅ Want to own and maintain the content
```

### When to Create CHILD Module:

```
✅ Similar content already exists
✅ Want to reuse without duplication
✅ Minor customizations needed
✅ Want to benefit from parent updates
```

### When to Create STANDALONE Module:

```
✅ Unique to this workshop only
✅ Won't be reused elsewhere
✅ Workshop-specific capstone/project
✅ May promote to ROOT later if needed
```

## ✅ Summary

**New Module Architecture:**

1. 🏠 **Modules live in workshops** - No central library
2. 🌳 **Parent-child relationships** - Clear inheritance
3. 🔗 **Link, don't duplicate** - Reuse with tracking
4. 📊 **Workshop Builder helps** - Find and link duplicates
5. 🎯 **Simple and flexible** - Easy to understand and use

**Key Benefits:**
- ✅ No more duplicate content
- ✅ Clear module ownership
- ✅ Easy reusability
- ✅ Full inheritance tracking
- ✅ Simpler structure

**Next Steps:**
1. Delete unused scripts ✅
2. Delete shared/modules/ ✅
3. Update Workshop Builder (code changes)
4. Add duplicate finder
5. Add linking features

---

**Status:** ✅ **APPROVED ARCHITECTURE**  
**Implementation:** See `IMPLEMENTATION_PLAN_MODULE_REUSABILITY.md`
