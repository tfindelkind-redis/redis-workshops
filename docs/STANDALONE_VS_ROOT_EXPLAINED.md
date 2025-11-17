# Standalone vs Root Modules - Explained

**Date:** November 17, 2025  
**Audience:** Workshop Authors  
**Complexity:** 🟢 Simple

---

## 🎯 Quick Summary

| Term | What It Is | When Created | Can Be Reused? |
|------|-----------|--------------|----------------|
| **Standalone** | A unique module used in only ONE workshop | When you create a workshop-specific module | Not yet, but can be promoted |
| **Root** | The original/parent module that CAN be reused | When you mark a module as reusable OR when another workshop links to it | YES - other workshops can link to it |
| **Child** | A module that links to (inherits from) a Root module | When you reuse an existing module in another workshop | It IS the reused version |

---

## 📚 The Three Types of Modules

### Type 1: 🎯 Standalone Module
**Status:** Independent, Unique, Not Shared

```
workshops/
└── workshop-a/
    └── module-01-capstone/          ← STANDALONE MODULE
        ├── README.md                 (Full content here)
        └── module.yaml
            └─→ NO inheritance section
```

**module.yaml:**
```yaml
id: "workshop.workshop-a.capstone.v1"
name: "Workshop Capstone Project"
version: "1.0.0"

# Notice: NO inheritance section at all!

metadata:
  duration: 120
  difficulty: "advanced"
```

**Use Case:**
- Workshop-specific content
- Unique exercises
- Custom demonstrations
- Content not meant to be reused

**Real World Example:**
- A capstone project specific to your company's use case
- A custom demo using your proprietary data
- An exercise that only makes sense in this workshop's context

---

### Type 2: 🌳 Root Module (Parent)
**Status:** Original, Reusable, Can Have Children

```
workshops/
└── workshop-a/
    └── module-01-intro/             ← ROOT MODULE (PARENT)
        ├── README.md                 (Full content - MASTER COPY)
        └── module.yaml
            └─→ inheritance.isRoot = true
            └─→ inheritance.usedBy = [list of children]
```

**module.yaml:**
```yaml
id: "workshop.workshop-a.intro.v1"
name: "Introduction to Redis"
version: "1.0.0"

inheritance:
  isRoot: true                       ← This marks it as ROOT!
  usedBy:                           ← Tracks who is using this
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

**Use Case:**
- General-purpose content
- Reusable across workshops
- Standardized material
- Content you want to maintain in one place

**Real World Example:**
- "Introduction to Redis" - used in multiple workshops
- "Redis Data Structures" - fundamental content
- "Security Best Practices" - shared across all workshops

---

### Type 3: 🔗 Child Module (Linked)
**Status:** Reused, References Parent, Inherits Content

```
workshops/
└── workshop-b/
    └── module-02-intro/             ← CHILD MODULE (LINKED)
        ├── README.md (OPTIONAL)      (Can customize, or reference parent)
        └── module.yaml
            └─→ inheritance.isRoot = false
            └─→ inheritance.parentPath = "workshops/workshop-a/module-01-intro"
```

**module.yaml:**
```yaml
id: "workshop.workshop-b.intro.v1"
name: "Introduction to Redis"        ← Same name as parent
version: "1.0.0"

inheritance:
  isRoot: false                      ← This marks it as CHILD!
  parentModule: "workshop.workshop-a.intro.v1"
  parentPath: "workshops/workshop-a/module-01-intro"  ← Points to parent
  inheritedAt: "2025-11-16T10:30:00Z"
  customizations:                    ← Optional: track any changes
    - field: "duration"
      original: 45
      custom: 50
      reason: "Added extra exercise time"

metadata:
  duration: 50                       ← Can override parent values
  difficulty: "beginner"             ← Or keep same
```

**Use Case:**
- Reusing content from another workshop
- Inheriting standard material
- Making minor customizations
- Maintaining consistency across workshops

**Real World Example:**
- Workshop B reuses "Introduction to Redis" from Workshop A
- Workshop C also reuses the same intro, with longer duration
- All three stay synchronized when parent is updated

---

## 🔄 Module Lifecycle: From Standalone → Root

### Scenario: Evolution of a Module

#### Stage 1: Birth as Standalone
```
You create "Introduction to Redis" in workshop-a
    ↓
It's created as STANDALONE (no inheritance info)
    ↓
Used only in workshop-a
```

**module.yaml (Standalone):**
```yaml
id: "workshop.workshop-a.intro.v1"
name: "Introduction to Redis"
# NO inheritance section - it's standalone
```

#### Stage 2: Promotion to Root
```
You decide this content is valuable and want to reuse it
    ↓
You "promote" it to ROOT
    ↓
Now it's marked as reusable
```

**module.yaml (Root):**
```yaml
id: "workshop.workshop-a.intro.v1"
name: "Introduction to Redis"

inheritance:
  isRoot: true          ← NOW it's a ROOT!
  usedBy: []           ← Empty list, waiting for children
```

#### Stage 3: Getting Children
```
Workshop B wants to use this module
    ↓
Workshop B creates a CHILD that links to workshop-a's ROOT
    ↓
The ROOT tracks this child
```

**Parent (workshop-a) module.yaml:**
```yaml
id: "workshop.workshop-a.intro.v1"
name: "Introduction to Redis"

inheritance:
  isRoot: true
  usedBy:
    - workshop: "workshop-b"          ← NOW it has children!
      modulePath: "workshops/workshop-b/module-02-intro"
      linkedAt: "2025-11-16T10:30:00Z"
```

**Child (workshop-b) module.yaml:**
```yaml
id: "workshop.workshop-b.intro.v1"
name: "Introduction to Redis"

inheritance:
  isRoot: false                       ← This is a CHILD
  parentPath: "workshops/workshop-a/module-01-intro"  ← Points to parent
```

---

## 🤔 Common Questions

### Q: When should I make a module Standalone vs Root?

**Make it Standalone if:**
- ✅ It's workshop-specific (e.g., "Acme Corp Case Study")
- ✅ It's unique to this context
- ✅ You don't plan to reuse it
- ✅ You're not sure yet

**Make it Root if:**
- ✅ It's general-purpose content
- ✅ Multiple workshops could use it
- ✅ You want to maintain it in one place
- ✅ It's standardized material

### Q: Can I change a Standalone module to a Root?

**Yes!** This is called "promoting" a module.

```bash
# Using Workshop Builder GUI:
1. Go to Module Manager → All Modules
2. Find your standalone module
3. Click "Promote to Root"
4. ✅ Done! Now others can link to it
```

### Q: What's the difference between Root and Parent?

**No difference!** These terms are used interchangeably:
- **Root** = Technical term (used in code: `isRoot: true`)
- **Parent** = User-friendly term (easier to understand relationships)

They both mean: "The original module that others can inherit from"

### Q: Do I have to create a README.md in Child modules?

**No, it's optional:**

**Option A: No README (simple reuse)**
```
workshops/workshop-b/module-02-intro/
└── module.yaml                      ← Just the metadata, points to parent
```

**Option B: Minimal README (with reference)**
```
workshops/workshop-b/module-02-intro/
├── module.yaml
└── README.md                        ← Says "See parent module for content"
```

**Option C: Full README (with customizations)**
```
workshops/workshop-b/module-02-intro/
├── module.yaml
└── README.md                        ← Full content with modifications
```

### Q: If I update a Root module, do Children inherit the changes?

**It depends on your implementation:**

**Current System:**
- Children have `module.yaml` pointing to parent
- You can read from parent or maintain separate content
- Customizations are tracked but not automatically applied

**Best Practice:**
- Update the Root (parent) module
- Review all children to see if updates apply
- Manually sync or note differences in `customizations` field

---

## 🎨 Visual Summary

### The Family Tree Analogy

```
Standalone Module
    🎯
    └─→ Lives alone, independent, unique

Root Module (Parent)
    🌳
    ├─→ Child 1 (workshop-b)  🔗
    ├─→ Child 2 (workshop-c)  🔗
    └─→ Child 3 (workshop-d)  🔗

Where:
• 🎯 Standalone = No family, independent
• 🌳 Root/Parent = Original, has children
• 🔗 Child = Linked to parent, inherits
```

### State Transitions

```
┌─────────────┐
│ Standalone  │ ──────────────┐
│    🎯       │               │
└─────────────┘               │
                              │
                              ▼ Promote to Root
                        ┌─────────────┐
                        │    Root     │
                        │    🌳       │
                        └─────────────┘
                              │
                              ▼ When another workshop links to it
                        ┌─────────────┐
                        │Root (Parent)│
                        │ with Children│
                        │    🌳       │
                        │   / | \     │
                        │  🔗 🔗 🔗   │
                        └─────────────┘
```

---

## 💡 Key Takeaways

1. **Standalone** = "This module is just for this workshop"
   - No `inheritance` section in module.yaml
   - Content lives only here
   - Can be promoted later

2. **Root** = "This module can be reused by others"
   - Has `inheritance.isRoot = true` in module.yaml
   - Tracks who uses it (children)
   - The "master copy"

3. **Child** = "This module inherits from a Root"
   - Has `inheritance.isRoot = false` in module.yaml
   - Points to parent with `parentPath`
   - Can customize inherited content

4. **Relationship:**
   ```
   Standalone → (promote) → Root → (reuse) → Child(ren)
   ```

5. **Root and Parent are the same thing** - just different words for the same concept!

---

## 📖 Further Reading

- **[MODULE_PARENT_CHILD_ARCHITECTURE.md](./MODULE_PARENT_CHILD_ARCHITECTURE.md)** - Full technical details
- **[MODULE_MANAGER_QUICK_START.md](./MODULE_MANAGER_QUICK_START.md)** - How to use the GUI
- **[IMPLEMENTATION_PLAN_MODULE_REUSABILITY.md](./IMPLEMENTATION_PLAN_MODULE_REUSABILITY.md)** - Complete implementation plan

---

**Questions?** Open the Workshop Builder at http://localhost:3000 and explore the Module Manager tab! 🚀
