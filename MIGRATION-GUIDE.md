# Workshop Builder: Migration to Single Source of Truth

## 🎯 Overview

The Workshop Builder has been refactored to use **README.md frontmatter as the single source of truth** for module metadata. This eliminates conflicts between workshop.yaml, module.yaml, and README.md.

## 📊 Architecture Changes

### Before (3 Sources of Truth ❌)
```
workshop.yaml/README frontmatter:
  modules:
    - name: "Performance Module"
      description: "..."
      duration: 60
      difficulty: "advanced"
      ❌ Could be out of sync

module.yaml:
  duration: 50  ❌ Different value!
  inheritance: {...}

module README.md:
  No frontmatter ❌
```

### After (Single Source of Truth ✅)
```
workshop.yaml/README frontmatter:
  modules:
    - order: 1
      moduleRef: "workshops/.../module-03"
      required: true
      ✅ Minimal reference only

module.yaml:
  inheritance:  ✅ Only inheritance tracking
    parentPath: "..."
    inheritedAt: "2025-11-20..."

module README.md:
  ---
  title: "Performance Module"
  description: "..."
  duration: "50 minutes"
  difficulty: "advanced"
  type: "hands-on"
  ---
  ✅ SINGLE SOURCE OF TRUTH
```

## 🔄 Migration Strategy

### Existing Workshops

**Good News:** Existing workshops will continue to work! The system has automatic fallback logic:

1. **When loading a workshop:**
   - System checks each module's README.md for frontmatter
   - If frontmatter exists → uses it (new format) ✅
   - If no frontmatter → falls back to workshop.yaml metadata (old format) ⚠️

2. **When saving a workshop:**
   - Workshop.yaml automatically converts to minimal format
   - Only stores: `{order, moduleRef, required}`
   - Full metadata stays in module README.md

3. **When editing a module:**
   - Updates the module's README.md frontmatter
   - Workshop.yaml stays minimal

### Manual Migration (Optional)

If you want to fully migrate an existing workshop to the new format:

1. **Open the workshop in Workshop Builder GUI**
2. **For each module:**
   - Click "Edit" on the module
   - Click "Save" (even without changes)
   - This will add frontmatter to the module's README.md
3. **Save the workshop**
   - This converts workshop.yaml to minimal format

### Automatic Migration (On Save)

When you save any workshop, the system automatically:
- Converts module list to minimal format: `{order, moduleRef, required}`
- Preserves all metadata in each module's README.md
- No data loss - everything is migrated correctly

## 📝 Data Flow

### Editing a Module

```
User edits module in GUI
    ↓
POST /api/modules/update-frontmatter
    ↓
Updates module's README.md frontmatter
    ↓
GUI updates in-memory workshop object
    ↓
Display refreshes with new metadata
```

### Saving a Workshop

```
User clicks "Save Workshop"
    ↓
PUT /api/workshops/:id
    ↓
updateWorkshop() converts modules to minimal format:
  {order, moduleRef, required}
    ↓
Enriches modules from README.md for table of contents
    ↓
Saves workshop.yaml with minimal module references
```

### Loading a Workshop

```
GET /api/workshops/:id
    ↓
getWorkshop() reads workshop.yaml
    ↓
enrichModulesWithMetadata() reads each module's README.md
    ↓
Returns full module data from README.md frontmatter
```

## 🧪 Testing the Migration

### Verify a Module Has Frontmatter

```bash
# Check if module has frontmatter
head -20 workshops/your-workshop/module-01-intro/README.md

# Should see:
---
title: "Introduction"
description: "..."
duration: "30 minutes"
difficulty: "beginner"
type: "hands-on"
---
```

### Verify Workshop is in Minimal Format

```bash
# Check workshop.yaml
head -30 workshops/your-workshop/README.md

# Should see:
modules:
  - order: 1
    moduleRef: "workshops/your-workshop/module-01-intro"
    required: true
  # ✅ No name, description, duration, etc.
```

### Test API

```bash
# Load workshop - should return full metadata
curl -s http://localhost:3000/api/workshops/your-workshop-id | jq '.workshop.modules[0]'

# Should return:
{
  "order": 1,
  "moduleRef": "workshops/...",
  "required": true,
  "name": "Introduction",  # ✅ From README.md
  "title": "Introduction", # ✅ From README.md
  "description": "...",    # ✅ From README.md
  "duration": "30 minutes" # ✅ From README.md
}
```

## ⚠️ Known Behaviors

### Existing Workshops Without Module Frontmatter

If a module doesn't have frontmatter yet:
- Workshop will still load correctly
- Metadata comes from workshop.yaml (fallback)
- **Action:** Edit and save the module to add frontmatter

### Divergence Detection

Module divergence detection now works correctly because:
- Parent metadata read from parent's README.md
- Child metadata read from child's README.md or module.yaml
- Comparison happens on actual module data, not stale workshop.yaml cache

### Performance Module Example

Before refactoring:
- Parent: duration = 60 (from README.md)
- Child: duration = 50 (from module.yaml, but API returned 60 ❌)

After refactoring:
- Parent: duration = 60 (from README.md frontmatter)
- Child: duration = 50 (from module.yaml, correctly prioritized ✅)
- Divergence correctly detected! ✅

## 🚀 Benefits

1. **Single Source of Truth** - No more conflicts between files
2. **Portable Modules** - Module metadata travels with the module
3. **Accurate Divergence Detection** - Compares actual module data
4. **Easier Maintenance** - Edit metadata in one place (module's README.md)
5. **Cleaner Workshop Files** - Workshop.yaml is now minimal and focused
6. **Backward Compatible** - Existing workshops continue to work

## 📚 For Developers

### Key Functions

- `updateModuleFrontmatter(modulePath, metadata)` - Update module README.md frontmatter
- `enrichModulesWithMetadata(moduleRefs)` - Load metadata from module README.md files  
- `migrateModulesToFrontmatter(workshopId, modules)` - Add frontmatter to modules (optional)

### API Endpoints

- `POST /api/modules/update-frontmatter` - Update a module's README.md frontmatter
- `GET /api/modules/exists` - Check if module directory exists
- `POST /api/modules/rename` - Rename module directory

### Files Modified

- `shared/tools/workshop-ops.js` - Core functions for module enrichment and migration
- `shared/tools/server.js` - API endpoints for frontmatter updates
- `shared/tools/workshop-builder-gui.html` - Frontend updated to call frontmatter API

## ✅ Checklist

- [x] Update module metadata → Updates README.md frontmatter
- [x] Save workshop → Converts to minimal format automatically
- [x] Load workshop → Enriches from README.md automatically  
- [x] Divergence detection → Uses actual module data
- [x] Backward compatibility → Old format still works
- [x] Migration path → Automatic on save, manual if desired

---

**Status:** ✅ Refactoring Complete - Ready for Production

**Date:** November 20, 2025
