# Module Deletion Scenarios & Inheritance Chain Management

## Overview
When deleting a module, we must carefully handle the inheritance chain to maintain data integrity and prevent orphaned modules.

## Deletion Scenarios

### Scenario 1: Delete Standalone Module (No Parent, No Children)
**State:** Original module with no inheritance
```
Module A (standalone)
```

**Action:** Delete Module A

**Result:** 
- ✅ Simple deletion - remove module directory completely
- No inheritance chain to manage

---

### Scenario 2: Delete Parent Module (Has Children, No Parent)
**State:** Original module with child references
```
Module A (parent) ← Original
    ↓
Module B (child)
    ↓
Module C (grandchild)
```

**Action:** Delete Module A

**Result:** 
- Module B becomes **Original** (standalone) - loses parent reference
- Module C keeps Module B as parent (chain preserved)
- If Module B was "Synced", it becomes **Modified** (has local changes, lost sync source)
- If Module B was "Customized", it becomes **Modified** (already had changes)

```
Module B (now Original/Modified)
    ↓
Module C (child)
```

---

### Scenario 3: Delete Middle Module (Has Parent and Children)
**State:** Module in middle of chain
```
Module A (grandparent)
    ↓
Module B (parent) ← DELETE THIS
    ↓
Module C (child)
```

**Action:** Delete Module B

**Result:**
- Module C's parent is updated to Module A (skips deleted middle module)
- Inheritance chain preserved by connecting child to grandparent

```
Module A (grandparent)
    ↓
Module C (child, re-parented)
```

**Implementation:**
- Update Module C's `module.yaml` to point to Module A
- Preserve Module C's customization state

---

### Scenario 4: Delete Child Module (Has Parent, No Children)
**State:** Leaf node in chain
```
Module A (parent)
    ↓
Module B (child) ← DELETE THIS
```

**Action:** Delete Module B

**Result:**
- ✅ Simple deletion - remove module directory
- Module A unaffected (no children to update)

```
Module A (parent, no children)
```

---

### Scenario 5: Delete Module with Multiple Children
**State:** Parent with multiple children
```
Module A (parent) ← DELETE THIS
    ↓
    ├─ Module B (child 1)
    ├─ Module C (child 2)
    └─ Module D (child 3)
```

**Action:** Delete Module A

**Result:**
- All children become **Original** or **Modified** (depending on customization state)
- Each child loses parent reference

```
Module B (now Original/Modified)
Module C (now Original/Modified)
Module D (now Original/Modified)
```

---

### Scenario 6: Delete Module in Long Chain
**State:** Deep inheritance chain
```
Module A (great-grandparent)
    ↓
Module B (grandparent)
    ↓
Module C (parent) ← DELETE THIS
    ↓
Module D (child)
    ↓
Module E (grandchild)
```

**Action:** Delete Module C

**Result:**
- Module D's parent updated to Module B (re-parent to grandparent)
- Module E keeps Module D as parent (chain below preserved)

```
Module A (great-grandparent)
    ↓
Module B (grandparent)
    ↓
Module D (child, re-parented to B)
    ↓
Module E (grandchild)
```

---

## Deletion Algorithm

### Step 1: Analyze Module Being Deleted
```javascript
const moduleToDelete = {
    path: 'workshops/xyz/module-01',
    hasParent: true/false,
    parentPath: 'workshops/abc/module-01' or null,
    hasChildren: true/false,
    children: ['workshops/def/module-01', ...] or []
}
```

### Step 2: Determine Action Based on State

#### Case A: No Parent, No Children (Standalone)
```javascript
action: 'delete_simple'
steps: [
    'Remove module directory'
]
```

#### Case B: No Parent, Has Children (Original with children)
```javascript
action: 'delete_parent_make_children_original'
steps: [
    'For each child:',
    '  - Remove inheritance.parentPath',
    '  - Set inheritance = null (becomes Original)',
    '  - If child had customizations: mark as Modified',
    'Remove module directory'
]
```

#### Case C: Has Parent, Has Children (Middle of chain)
```javascript
action: 'delete_middle_relink_chain'
steps: [
    'For each child:',
    '  - Update inheritance.parentPath to point to grandparent',
    '  - Preserve customization state',
    'Remove module directory'
]
```

#### Case D: Has Parent, No Children (Leaf node)
```javascript
action: 'delete_simple'
steps: [
    'Remove module directory'
]
```

### Step 3: Update Workshop References
```javascript
// Remove module from workshop's modules array
workshop.modules = workshop.modules.filter(m => m.moduleRef !== deletedModulePath)

// Update order numbers for remaining modules
workshop.modules.forEach((m, index) => m.order = index + 1)
```

### Step 4: Find and Update All Child Modules
```javascript
async function findChildModules(parentPath) {
    // Search all modules in repository
    const allModules = await getAllModules();
    
    return allModules.filter(module => {
        if (!module.inheritance) return false;
        return module.inheritance.parentPath === parentPath;
    });
}
```

---

## State Transitions on Deletion

| Child's Current State | Parent Deleted (No Grandparent) | Parent Deleted (Has Grandparent) |
|-----------------------|----------------------------------|----------------------------------|
| **Synced** (no changes) | → **Modified** (lost sync source) | → **Synced** (re-parent to grandparent) |
| **Customized** (has changes) | → **Modified** (lost sync source) | → **Customized** (re-parent to grandparent) |
| **Modified** (diverged) | → **Modified** (already diverged) | → **Modified** (re-parent to grandparent) |
| **Original** (no parent) | N/A | N/A |

---

## Implementation Functions Needed

### 1. `findChildrenOfModule(modulePath)`
Search all modules to find those with `inheritance.parentPath === modulePath`

### 2. `orphanChildren(children)`
Convert children to Original/Modified state when parent deleted with no grandparent

### 3. `reparentChildren(children, newParentPath)`
Update children to point to grandparent when middle module deleted

### 4. `deleteModuleFromWorkshop(workshopId, modulePath)`
Remove module reference from workshop and renumber remaining modules

### 5. `validateModuleDeletion(modulePath)`
Check if deletion is safe (e.g., not breaking critical dependencies)

---

## Safety Checks

Before deleting a module:

1. ✅ **Workshop Check**: Ensure module is not marked as `required: true` in workshop
2. ✅ **Child Count**: Warn user if module has children (confirm cascade)
3. ✅ **Content Check**: Warn if module has customized content
4. ⚠️ **Cross-Workshop Check**: Check if module is referenced by other workshops

---

## API Response Format

```json
{
  "success": true,
  "deleted": {
    "modulePath": "workshops/xyz/module-01",
    "hadParent": true,
    "hadChildren": true,
    "childrenCount": 3
  },
  "affected": {
    "orphanedModules": [
      {
        "path": "workshops/abc/module-01",
        "oldState": "Synced",
        "newState": "Modified",
        "reason": "Parent deleted with no grandparent"
      }
    ],
    "reparentedModules": [
      {
        "path": "workshops/def/module-01",
        "oldParent": "workshops/xyz/module-01",
        "newParent": "workshops/ghi/module-01",
        "reason": "Re-parented to grandparent"
      }
    ],
    "workshopsUpdated": ["workshop-a", "workshop-b"]
  },
  "message": "Module deleted successfully. 3 child modules affected."
}
```

---

## User Warnings

### Before Deletion Confirmation:
```
⚠️ Delete Module: "Redis Fundamentals"

This module has:
- 3 child modules in other workshops
- Customized content (will be lost)
- Marked as required in workshop

Impact:
✓ 2 child modules will be re-parented to the original source
✗ 1 child module will become standalone (no parent available)

Are you sure you want to delete this module?
[Cancel] [Delete Module]
```

---

## Edge Cases

### Edge Case 1: Circular References (Should Never Happen)
**Prevention:** Validate no circular inheritance when creating/updating modules

### Edge Case 2: Deleting from Multiple Workshops Simultaneously
**Prevention:** Lock module during deletion operation

### Edge Case 3: Module Referenced but Directory Missing
**Handling:** Clean up orphaned references in workshop YAML

---

## Testing Scenarios

1. ✅ Delete standalone module
2. ✅ Delete parent with 1 child (no grandparent)
3. ✅ Delete parent with multiple children (no grandparent)
4. ✅ Delete middle module (re-parent to grandparent)
5. ✅ Delete leaf module (has parent, no children)
6. ✅ Delete from chain of 5+ levels deep
7. ✅ Delete module referenced by multiple workshops
8. ✅ Delete required module (should warn/block)
9. ✅ Delete module with customized content (should warn)
10. ✅ Delete module currently being edited (should warn/lock)
