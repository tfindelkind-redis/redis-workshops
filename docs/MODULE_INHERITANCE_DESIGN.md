# Module Inheritance Design

## Problem
When adding existing modules to a new workshop, we need two approaches:

1. **➕ Add (Reference)** - Use the parent module as source of truth
2. **✏️ Customize** - Create an independent copy that can be edited

## Solution: Module Inheritance Pattern

### Option 1: Add as Reference (Lightweight)
When clicking **"➕ Add"**:

```
workshops/new-workshop/
  ├── module-01-redis-fundamentals/
  │   ├── module.yaml          ← Contains inheritance reference
  │   └── README.md             ← Minimal README explaining it's inherited
  └── README.md
```

**module.yaml:**
```yaml
id: redis-fundamentals
title: "Redis Fundamentals"
description: "Inherited from deploy-redis-for-developers-amr"
duration: 60
inheritance:
  parentPath: "workshops/deploy-redis-for-developers-amr/module-01-redis-fundamentals"
  inheritedAt: "2025-11-20T21:30:00Z"
  mode: "reference"  # or "inherited"
```

**README.md (minimal):**
```markdown
# Redis Fundamentals

**This module inherits content from:**  
[📦 Parent Module](../../deploy-redis-for-developers-amr/module-01-redis-fundamentals/README.md)

**Parent:** `workshops/deploy-redis-for-developers-amr/module-01-redis-fundamentals`

---

This is a reference module. All content (notebooks, exercises, etc.) 
should be accessed from the parent module location.

To customize this module, use the **"Customize"** option in the Workshop Builder.
```

**Benefits:**
- ✅ Lightweight (only metadata files)
- ✅ Parent is source of truth
- ✅ Changes to parent auto-propagate
- ✅ Easy to see module relationships
- ✅ No duplication

**Drawbacks:**
- ⚠️ Users need to navigate to parent for notebooks
- ⚠️ Can't edit content directly

### Option 2: Customize (Full Copy)
When clicking **"✏️ Customize"**:

```
workshops/new-workshop/
  ├── module-01-redis-fundamentals/
  │   ├── module.yaml                      ← No inheritance (or optional reference)
  │   ├── README.md                         ← Full copy
  │   ├── redis-fundamentals-lab.ipynb     ← Full copy
  │   ├── notebook-styles.css              ← Full copy
  │   └── (all other files copied)
  └── README.md
```

**module.yaml:**
```yaml
id: redis-fundamentals-custom
title: "Redis Fundamentals"
description: "Customized version for this workshop"
duration: 60
customization:
  basedOn: "workshops/deploy-redis-for-developers-amr/module-01-redis-fundamentals"
  customizedAt: "2025-11-20T21:30:00Z"
  isCustomized: true
```

**Benefits:**
- ✅ Full independence - can edit anything
- ✅ All files in one place
- ✅ No parent dependencies
- ✅ Can diverge from parent

**Drawbacks:**
- ⚠️ File duplication
- ⚠️ Parent updates don't propagate
- ⚠️ More disk space

## Recommended Implementation

### Phase 1: Reference Mode (Add button)
1. User clicks **"➕ Add"** on existing module
2. Create module directory with:
   - `module.yaml` with `inheritance.parentPath`
   - Minimal `README.md` explaining it's inherited
   - Link to parent in README
3. Workshop Builder displays inherited modules differently:
   - 🔗 Icon for inherited modules
   - "View Parent" button
   - Note: "This module references content from..."

### Phase 2: Customize Mode (Customize button)
1. User clicks **"✏️ Customize"** on existing module
2. Copy ALL files from parent module
3. Create `module.yaml` with `customization.basedOn`
4. User can now edit all files independently
5. Workshop Builder shows:
   - ✏️ Icon for customized modules
   - "Based on: ..." note

### Phase 3: Runtime Resolution
When building/running workshop:
- **Inherited modules:** Follow parentPath to find notebooks/content
- **Customized modules:** Use local files directly

## Files to Update

1. **workshop-ops.js** - `createModuleDirectory()`
   - Check if `moduleData.moduleRef` exists
   - If exists and mode="reference" → Create minimal module with inheritance
   - If exists and mode="customize" → Copy all files

2. **workshop-builder-gui.html** - Display logic
   - Show 🔗 icon for inherited modules
   - Show ✏️ icon for customized modules
   - Add "View Parent" / "Customize" actions

3. **test-notebooks script**
   - Follow inheritance chain when finding notebooks
   - Look in parentPath if local notebook doesn't exist

## Example Workflows

### Workflow 1: Create Workshop with References
```
1. Create "Redis Workshop - 2 Hour"
2. Click ➕ Add on "Redis Fundamentals"
3. Click ➕ Add on "Caching Patterns"
4. Save workshop
Result: 2 lightweight modules with inheritance
```

### Workflow 2: Customize One Module
```
1. Create "Redis Workshop - Custom"
2. Click ➕ Add on "Redis Fundamentals" (inherited)
3. Click ✏️ Customize on "Caching Patterns" (full copy)
4. Edit the customized module's notebook
5. Save workshop
Result: 1 inherited + 1 customized module
```

## User Experience

### For Workshop Instructors
- **Creating a standard workshop?** → Use ➕ Add (references)
- **Need to modify specific modules?** → Use ✏️ Customize on those modules
- **Want to share workshop?** → Inherited modules are lightweight, easy to distribute

### For Workshop Participants
- **Working through workshop:** Navigate to module folders
- **For inherited modules:** README points to parent location
- **For customized modules:** Everything is self-contained

## Migration Path

Existing workshops continue to work as-is. New workshops can choose:
- **Reference mode** (default for "Add")
- **Customize mode** (explicit action)
