# Module Reusability - Quick Start Guide

Welcome to the **Module Reusability System**! This guide will help you get started with discovering, linking, and managing modules across workshops.

## 🚀 Quick Start

### 1. Open Workshop Builder

```bash
# Make sure the server is running
docker ps --filter "name=workshop-builder-server"

# If not running, start it
./start-workshop-builder.sh

# Open in browser
open http://localhost:3000
```

### 2. Navigate to Module Manager

1. Open Workshop Builder at http://localhost:3000
2. Click the **"🔗 Module Manager"** tab at the top
3. The system will automatically load all modules

## 📚 Features Overview

### 📚 All Modules Tab

**Browse and manage all modules across all workshops**

Features:
- Real-time search and filter
- Statistics dashboard (total, root, child, standalone)
- Visual indicators:
  - 🌳 **Root** (green) - Parent modules that can be reused
  - 🔗 **Child** (blue) - Modules linked to a parent
  - ⭐ **Standalone** (gray) - Independent modules
- Quick actions:
  - "🌳 Make Root" - Promote standalone to root
  - "⭐ Make Independent" - Unlink child from parent

### 🌳 Root Modules Tab

**View parent modules and their children**

Features:
- Shows only root (parent) modules
- Lists all child modules for each root
- Complete inheritance tree view
- Workshop and module paths

### 🔍 Find Duplicates Tab

**Automatically discover similar modules**

Features:
- Scans all workshops for similar names
- Groups duplicates together
- Suggests which module should be parent
- One-click linking: "🔗 Link to X"
- Visual warnings for unlinked duplicates

### 🔗 Link Modules Tab

**Manually create parent-child relationships**

Features:
- Select child module from dropdown
- Select parent module from dropdown
- Real-time validation
- Success/error feedback
- Auto-refresh after linking

## 🎯 Common Use Cases

### Use Case 1: Find and Link Duplicate Modules

**Scenario:** You have 3 workshops with similar "Introduction" modules

**Steps:**
1. Click **"🔗 Module Manager"** tab
2. Click **"🔍 Find Duplicates"** sub-tab
3. Click **"🔍 Scan for Duplicates"** button
4. Review the duplicate groups
5. Click **"🔗 Link to X"** on each duplicate
6. Confirm the linking
7. ✅ Done! Modules are now linked

**Result:**
- First module becomes the root (parent)
- Other modules become children (linked to parent)
- Inheritance tracked in `module.yaml` files

### Use Case 2: Promote Module to Root

**Scenario:** You want to make a module reusable

**Steps:**
1. Click **"🔗 Module Manager"** tab
2. Stay on **"📚 All Modules"** sub-tab
3. Find your standalone module (⭐ icon)
4. Click **"🌳 Make Root"** button
5. Confirm promotion
6. ✅ Done! Module is now a root

**Result:**
- Module marked as `isRoot: true`
- Can now be used as parent for other modules
- Will track children in `usedBy` array

### Use Case 3: Make Child Independent

**Scenario:** A child module has diverged from parent

**Steps:**
1. Click **"🔗 Module Manager"** tab
2. Stay on **"📚 All Modules"** sub-tab
3. Find your child module (🔗 icon)
4. Click **"⭐ Make Independent"** button
5. Confirm promotion
6. ✅ Done! Module is now independent

**Result:**
- Removed from parent's `usedBy` list
- Becomes a root module itself
- No longer references original parent

### Use Case 4: Manual Module Linking

**Scenario:** You know exactly which modules to link

**Steps:**
1. Click **"🔗 Module Manager"** tab
2. Click **"🔗 Link Modules"** sub-tab
3. Select **Child Module** from dropdown
4. Select **Parent Module** from dropdown
5. Click **"🔗 Link Modules"** button
6. ✅ Done! Modules are linked

**Result:**
- Child module references parent
- Parent module tracks child in `usedBy`
- Inheritance tracked with timestamp

## 📖 Understanding Module Types

### 🌳 Root Module (Parent)

**What it is:**
- A module that can be reused in other workshops
- Marked as `inheritance.isRoot: true`
- Tracks all child modules in `inheritance.usedBy`

**When to use:**
- Module is complete and well-tested
- Content should be consistent across workshops
- You want to maintain a single source of truth

**Example:**
```yaml
# workshops/workshop-a/module-01-intro/module.yaml
inheritance:
  isRoot: true
  usedBy:
    - workshop: workshop-b
      modulePath: workshops/workshop-b/module-01-intro
```

### 🔗 Child Module (Linked)

**What it is:**
- A module that references a parent module
- Marked as `inheritance.isRoot: false`
- Contains `inheritance.parentPath` pointing to parent

**When to use:**
- Content is identical to another module
- You want consistency with the parent
- Changes should come from parent

**Example:**
```yaml
# workshops/workshop-b/module-01-intro/module.yaml
inheritance:
  isRoot: false
  parentPath: workshops/workshop-a/module-01-intro
  inheritedAt: "2025-11-16T10:30:00Z"
  customizations: []
```

### ⭐ Standalone Module

**What it is:**
- An independent module with no parent or children
- No `inheritance` field or not marked as root/child
- Completely independent

**When to use:**
- Module is unique to this workshop
- Content differs from other similar modules
- No need for reusability (yet)

## 🎨 Visual Indicators

| Icon | Color | Type       | Meaning                                    |
|------|-------|------------|--------------------------------------------|
| 🌳   | Green | Root       | Parent module, can be reused              |
| 🔗   | Blue  | Child      | Linked to parent, references another      |
| ⭐   | Gray  | Standalone | Independent, no parent or children        |

## 💡 Best Practices

### When to Link Modules ✅

- ✅ Content is identical or nearly identical
- ✅ Modules serve the same purpose
- ✅ You want consistency across workshops
- ✅ Changes should apply to multiple places

### When NOT to Link ❌

- ❌ Modules are similar but have workshop-specific content
- ❌ You need flexibility to customize independently
- ❌ Modules teach different concepts despite similar names
- ❌ Content will diverge over time

### Choosing the Parent Module

When you have duplicates, choose the parent based on:

1. **Oldest module** - First created, most mature
2. **Most complete** - Best content, most comprehensive
3. **Most used** - Already referenced in multiple places
4. **Best quality** - Your judgment on which is best

The system suggests the first module found, but you can choose any module as the parent.

## 🔧 Technical Details

### Module Structure

```
workshops/
└── {workshop-id}/
    └── module-XX-{name}/
        ├── README.md           # Module content
        └── module.yaml         # Inheritance metadata
```

### Inheritance Tracking

**Root Module:**
```yaml
inheritance:
  isRoot: true
  usedBy:
    - workshop: "workshop-b"
      modulePath: "workshops/workshop-b/module-01-intro"
```

**Child Module:**
```yaml
inheritance:
  isRoot: false
  parentPath: "workshops/workshop-a/module-01-intro"
  inheritedAt: "2025-11-16T10:30:00Z"
  customizations: []
```

## 🆘 Troubleshooting

### No Modules Showing Up

**Problem:** The "All Modules" list is empty

**Solutions:**
1. Click the "🔄 Refresh Modules" button
2. Check that workshops exist in the `workshops/` directory
3. Verify the server is running: `docker ps`
4. Check server logs: `docker logs workshop-builder-server`

### Can't Link Modules

**Problem:** Link button is disabled

**Solutions:**
1. Ensure both child and parent are selected
2. Verify you're not trying to link a module to itself
3. Check that child module isn't already linked
4. Refresh the module list

### Duplicate Scan Finds Nothing

**Problem:** No duplicates found but you know they exist

**Solutions:**
1. Check module naming - must have similar base names
2. Verify modules are in proper directories (`module-XX-*`)
3. Ensure modules have README.md files
4. Try searching in "All Modules" tab instead

## 📚 Documentation

For more details, see:

- **Architecture:** `docs/MODULE_PARENT_CHILD_ARCHITECTURE.md`
- **Implementation:** `docs/IMPLEMENTATION_PLAN_MODULE_REUSABILITY.md`
- **Phase 2 (Backend):** `docs/PHASE_2_IMPLEMENTATION_COMPLETE.md`
- **Phase 3 (GUI):** `docs/PHASE_3_IMPLEMENTATION_COMPLETE.md`
- **Progress:** `docs/MODULE_REUSABILITY_PROGRESS.md`

## 🎉 Get Started!

Ready to try it out?

1. Open http://localhost:3000
2. Click **"🔗 Module Manager"**
3. Explore your modules!

Have fun creating reusable workshop modules! 🚀

---

**Questions?** The GUI is self-explanatory with tooltips and help text. Just explore and click around!

**Need Help?** Check the documentation or look at the examples above.

**Found a Bug?** Check the server logs: `docker logs workshop-builder-server`
