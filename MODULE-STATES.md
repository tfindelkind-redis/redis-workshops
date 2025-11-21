# Module States and Inheritance System

This document explains how modules are tracked in the workshop system, including their relationship to parent modules and their customization state.

## Module States

The system now recognizes **four distinct states** for modules:

### 1. 📄 **Original Module** (No badge)
- **Definition**: A standalone module not inherited from any parent
- **Characteristics**:
  - No `module.yaml` file, OR
  - `module.yaml` exists but has no `inheritance` block
- **Use case**: Original, template modules that others can copy from
- **Example**: `workshops/deploy-redis-for-developers-amr/module-01-redis-fundamentals`

### 2. ✅ **Synced Module** (Green badge)
- **Definition**: An inherited module that remains identical to its parent
- **Characteristics**:
  - Has `module.yaml` with `inheritance.parentPath`
  - `inheritance.customized` is NOT set to `true`
  - All files match the parent (except `module.yaml`)
  - README.md editable content is identical to parent
- **Visual indicator**: 
  - Green checkmark: `✓ Synced`
  - Shows parent path: `🔗 Synced with: workshops/.../parent-module`
- **Actions available**: 
  - Can be reset to parent (re-copies all files)
  - Automatically stays in sync with parent updates

### 3. 🎨 **Customized Module** (Purple badge)
- **Definition**: A module copied from a parent with intentionally modified metadata
- **Characteristics**:
  - Has `module.yaml` with `inheritance.parentPath`
  - `inheritance.customized` is set to `true`
  - Metadata (duration, description, etc.) differs from parent
  - Content files are still from the original copy
- **Visual indicator**:
  - Purple badge: `🎨 Customized`
  - Purple border on the left
  - Shows parent path: `📋 From: workshops/.../parent-module`
  - Shows customization reason: e.g., "Duration adjusted for 4h workshop format"
- **Use case**: Workshop-specific variations (e.g., 50-minute version of 60-minute module)
- **Important**: Once customized, the module is **independent** - it does NOT sync with parent updates

### 4. ⚠️ **Modified Module** (Orange warning)
- **Definition**: An inherited module where content files have diverged from parent
- **Characteristics**:
  - Has `module.yaml` with `inheritance.parentPath`
  - `inheritance.customized` is NOT true
  - Files have been edited, added, or removed
  - Different file count or file sizes vs parent
- **Visual indicator**:
  - Orange warning: `⚠️ Modified`
  - Orange border on the left
  - Shows reason: e.g., "File modified: lab-guide.md"
- **Actions available**:
  - `🔄 Reset` button - reverts to parent state
- **Use case**: Usually unintentional divergence that should be reset

## module.yaml Structure

### Original Module
```yaml
# No module.yaml file, or empty file
```

### Synced Module
```yaml
inheritance:
  parentPath: workshops/deploy-redis-for-developers-amr/module-01-redis-fundamentals
  inheritedAt: '2025-11-20T22:04:29.960Z'
```

### Customized Module
```yaml
inheritance:
  parentPath: workshops/deploy-redis-for-developers-amr/module-06-performance-efficiency--data-modeling
  inheritedAt: '2025-11-20T22:04:29.960Z'
  customized: true
  customizationReason: 'Duration adjusted for 4h workshop format (50 min vs 60 min)'
  customizedAt: '2025-11-20T23:15:42.123Z'
```

### Modified Module (Unintentional Divergence)
```yaml
inheritance:
  parentPath: workshops/deploy-redis-for-developers-amr/module-02-azure-architecture
  inheritedAt: '2025-11-20T22:04:29.960Z'
  # No customized flag - this means files have been edited accidentally
```

## Automatic Customization Marking

The system automatically sets `customized: true` in these scenarios:

### 1. When Creating a Module with Custom Metadata
When you copy a module using `copyModule()` and provide custom metadata:
```javascript
copyModule(
  'workshops/parent/module-01',
  'my-workshop',
  'module-01-custom',
  {
    duration: '50 minutes',  // Different from parent's 60 minutes
    description: 'Shorter version for workshop'
  }
)
```
→ Module.yaml will automatically include `customized: true`

### 2. When Updating Module Metadata via GUI
When you edit a module's metadata in the Workshop Builder and save changes:
- System checks if module has inheritance
- Compares new metadata with existing metadata
- If changed, sets `customized: true` in module.yaml
- Also sets `customizationReason: 'Metadata customized via Workshop Builder'`

## Workflow Examples

### Creating a Customized Workshop

1. **Start with original workshop** (e.g., "Deploy Redis for Developers - Full Day")
2. **Copy modules to new workshop** (e.g., "Deploy Redis for Developers - 4h")
3. **Customize duration** for time constraints:
   - Module 1: Keep at 60 minutes
   - Module 2: Keep at 60 minutes  
   - Module 3: Reduce to 50 minutes (from 60)
4. **Result**:
   - Modules 1 & 2: Synced (no customization needed)
   - Module 3: Customized (duration changed)
5. **Benefits**:
   - Clear visual indication of what's customized
   - Parent path visible for reference
   - Module 3 won't be affected by parent updates

### Resetting an Accidentally Modified Module

1. **Scenario**: User edited lab-guide.md in a synced module
2. **System detects**: ⚠️ Modified - "File modified: lab-guide.md"
3. **User clicks**: `🔄 Reset` button
4. **System**:
   - Deletes all files except module.yaml
   - Copies fresh files from parent
   - Updates `inheritedAt` timestamp
5. **Result**: Module returns to ✓ Synced state

## API Endpoints

### Check Module Divergence
```bash
POST /api/modules/check-divergence
Body: { workshopId: "my-workshop" }

Response:
{
  "modules": [
    {
      "moduleName": "Module 1",
      "hasDiverged": false,
      "hasParent": true,
      "isCustomized": true,
      "customizationReason": "Duration adjusted",
      "parentPath": "workshops/parent/module-01"
    }
  ]
}
```

### Update Module Metadata (Auto-customization)
```bash
POST /api/modules/update-frontmatter
Body: {
  "modulePath": "workshops/my-workshop/module-01",
  "metadata": {
    "title": "New Title",
    "duration": "50 minutes"
  }
}

Response:
{
  "success": true,
  "modulePath": "workshops/my-workshop/module-01",
  "updatedMetadata": { ... },
  "markedAsCustomized": true  // ← Automatically set
}
```

### Reset Module to Parent
```bash
POST /api/modules/reset-to-parent
Body: { "modulePath": "workshops/my-workshop/module-01" }

Response:
{
  "success": true,
  "message": "Module reset to parent state",
  "resetAt": "2025-11-20T23:30:00.000Z"
}
```

## Benefits of This System

1. **Clear Visual Feedback**: Users instantly see the state of each module
2. **Intentional Customization**: Distinguishes planned variations from accidental edits
3. **Traceability**: Always know which parent a module came from
4. **Safety**: Easy to reset accidentally modified modules
5. **Independence**: Customized modules won't break when parent is updated
6. **Documentation**: Customization reasons provide context for future maintainers
