# Module Editing Feature

## Overview

You can now **click on any module** to edit its settings directly in the Workshop Builder GUI. This makes it easy to adjust module properties like name, description, duration, difficulty, and type without having to remove and re-add modules.

## 🎯 What You Can Edit

When you click on a module card, you can modify:

- **Module Name** - The display name of the module
- **Description** - What learners will learn in this module
- **Duration** - Length in minutes (5-300)
- **Difficulty** - Beginner, Intermediate, or Advanced
- **Type** - Lecture, Hands-on, Demo, or Lab
- **Required** - Whether the module is mandatory or optional

**Note:** The Module Reference (path) is read-only to maintain data integrity.

---

## 🖱️ How to Edit a Module

### Method 1: Click the Module Card

1. **Find the module** you want to edit in the Modules list
2. **Click anywhere on the module card** (header or description area)
3. **Edit Module modal opens** with current settings pre-filled
4. **Make your changes** to any field
5. **Click "Save Changes"** to apply
6. **Save the workshop** to persist changes to disk

### Visual Indicators

Each module card shows a small hint:
```
Module Name ✏️ Click to edit
```

The cursor changes to a pointer when hovering over clickable areas.

---

## 📝 Edit Module Modal

### Fields

**Module Name*** (Required)
- The display name shown in the workshop
- Example: "Introduction to Redis"
- Must not be empty

**Description*** (Required)
- What students will learn
- Appears in module cards and generated README files
- Supports multiple lines

**Duration*** (Required)
- Time in minutes (5-300)
- Used to calculate total workshop duration
- Appears in module card meta

**Difficulty*** (Required)
- Beginner: Introductory level
- Intermediate: Some prior knowledge required
- Advanced: Expert-level content

**Type*** (Required)
- Lecture: Presentation-style content
- Hands-on: Interactive exercises
- Demo: Instructor demonstration
- Lab: Guided practice exercises

**Required Module** (Checkbox)
- Checked: Module is mandatory for completion
- Unchecked: Module is optional

**Module Reference** (Read-only)
- The path or ID of the module
- Cannot be changed to prevent breaking references
- Example: `modules/redis-basics` or `custom/advanced-patterns`

### Validation

The form validates inputs before saving:

- ✅ Name must not be empty
- ✅ Description must not be empty
- ✅ Duration must be between 5-300 minutes
- ✅ All other fields have valid defaults

---

## 🔄 Workflow Example

### Scenario: Adjust Module Duration

```
1. Workshop loads with 3 modules
   Module 1: Introduction (45 min)
   Module 2: Data Structures (60 min)
   Module 3: Advanced Topics (90 min)

2. Click on "Module 2: Data Structures"
   ↓
3. Edit Module modal opens
   Current duration: 60 minutes
   ↓
4. Change duration to 75 minutes
   ↓
5. Click "Save Changes"
   ↓
6. Module card updates immediately
   Total workshop duration recalculates
   ↓
7. Click "Save Workshop"
   ↓
8. Changes persisted to filesystem
```

### Scenario: Change Module Difficulty

```
1. Module shows as "Advanced"
   But content is actually intermediate level
   ↓
2. Click the module card
   ↓
3. Change difficulty: Advanced → Intermediate
   ↓
4. Click "Save Changes"
   ↓
5. Module badge updates from "advanced" to "intermediate"
   ↓
6. Save workshop to persist
```

### Scenario: Make Module Optional

```
1. Module is marked as required (default)
   ↓
2. Click module card to edit
   ↓
3. Uncheck "Required Module" checkbox
   ↓
4. Click "Save Changes"
   ↓
5. Module now marked as optional
   (Could be used for badge display in future)
   ↓
6. Save workshop
```

---

## 🎨 UI Updates

### Module Card Changes

**Before:**
```
┌─────────────────────────────────────┐
│ 1  Module Name         [type]       │
│    modules/path/to/module           │
│    Description text...              │
│    ⏱️ 45 min  [difficulty]          │
│    [↑] [↓] [🗑️ Remove]              │
└─────────────────────────────────────┘
```

**After (with editing):**
```
┌─────────────────────────────────────┐
│ 1  Module Name ✏️ Click to edit     │  ← Clickable
│    modules/path/to/module           │
│    Description text...              │  ← Clickable
│    ⏱️ 45 min  [difficulty]          │
│    [↑] [↓] [🗑️ Remove]              │  ← Buttons prevent click
└─────────────────────────────────────┘
      ↑ Hover shows pointer cursor
```

### Action Button Behavior

**Important:** The action buttons (↑, ↓, 🗑️ Remove) prevent click events from propagating, so:

- ✅ Clicking module card → Opens edit modal
- ✅ Clicking buttons → Performs button action only
- ✅ No accidental edits when using buttons

This is achieved with `event.stopPropagation()` on button clicks.

---

## 💡 Use Cases

### 1. Fine-tune Durations
After estimating, adjust actual time needed:
- Pilot workshop reveals module takes longer
- Adjust duration to match reality
- Total workshop time updates automatically

### 2. Regrade Difficulty
Content changes or audience feedback:
- Module is too easy/hard for target audience
- Change difficulty level to match
- Helps learners set expectations

### 3. Update Descriptions
Improve clarity or add details:
- Initial description was brief
- Expand with specific learning objectives
- Better preview for learners

### 4. Change Module Types
Reclassify content delivery:
- Was marked as "Lecture" but includes exercises
- Change to "Hands-on" for accuracy
- Helps with workshop planning

### 5. Mark Optional Modules
Flexible learning paths:
- Core modules remain required
- Advanced topics become optional
- Learners can choose their path

---

## 🔧 Technical Details

### State Management

```javascript
// Current module index being edited
let editingModuleIndex = -1;

// When opening editor
function editModule(index) {
    editingModuleIndex = index;
    // Populate form from workshop.modules[index]
    // Show modal
}

// When saving
function saveModuleEdits() {
    // Update workshop.modules[editingModuleIndex]
    // Re-render UI
    // Show success notification
}
```

### Data Flow

```
User clicks module card
  ↓
editModule(index) called
  ↓
editingModuleIndex = index
  ↓
Form populated with current values
  ↓
Modal displayed
  ↓
User edits fields
  ↓
User clicks "Save Changes"
  ↓
saveModuleEdits() validates input
  ↓
workshop.modules[index] updated
  ↓
updateSummary() recalculates totals
  ↓
renderModules() refreshes display
  ↓
renderNavigation() updates nav preview
  ↓
Success notification shown
  ↓
Modal closes
```

### Auto-Regeneration

If **auto-generate module directories** is enabled:

```
Edit module
  ↓
Save changes
  ↓
Save workshop
  ↓
Module directories auto-regenerate
  ↓
Updated module info in navigation headers
  ↓
Changes committed to Git
```

This ensures generated README files stay in sync with module settings.

---

## 🎓 Best Practices

### 1. Edit Before Generating
**Recommended workflow:**
```
1. Add all modules
2. Edit each module's details
3. Save workshop (generates directories)
4. Edit module content in README files
```

**Why?** Editing metadata before generation means the generated files have correct information from the start.

### 2. Consistent Naming
**Use clear, descriptive names:**
- ✅ "Introduction to Redis Data Structures"
- ✅ "Hands-on: Building a Cache Layer"
- ❌ "Module 1"
- ❌ "Redis Stuff"

### 3. Accurate Durations
**Be realistic with time:**
- Include time for questions
- Add buffer for exercises
- Consider learner's level
- Update after pilot sessions

### 4. Appropriate Difficulty Levels
**Match to target audience:**
- **Beginner:** No prior knowledge needed
- **Intermediate:** Some experience with topic
- **Advanced:** Deep expertise required

### 5. Descriptive Content
**Write helpful descriptions:**
- State learning objectives
- Mention key topics covered
- Set clear expectations
- 2-3 sentences ideal

---

## ⚠️ Important Notes

### What's Editable

✅ **Can Edit:**
- Module name
- Description
- Duration
- Difficulty level
- Type
- Required status

❌ **Cannot Edit:**
- Module reference (path/ID)
- Module order (use ↑↓ buttons)

### Read-only Module Reference

The module reference is **read-only** because:

1. **File system integrity:** Changing the ref could break existing module directories
2. **Link consistency:** Navigation links depend on the ref
3. **Data relationships:** Other systems may reference the module by this ID

To change the reference, you must remove and re-add the module.

### Changes Require Saving

**Remember:**
- Editing a module updates in-memory state only
- Must click "Save Workshop" to persist
- Until saved, changes are temporary
- Closing browser loses unsaved changes

### Auto-generation Impact

If auto-generate is enabled:
- Saving workshop regenerates module directories
- Updated metadata appears in navigation
- Module content is preserved
- Only navigation headers/footers update

---

## 🐛 Troubleshooting

### Modal Won't Open
**Symptoms:** Clicking module does nothing

**Possible Causes:**
1. JavaScript error in console
2. Modal HTML not loaded
3. Event handler not attached

**Solutions:**
1. Check browser console for errors
2. Refresh page
3. Ensure page fully loaded before clicking

### Changes Not Saving
**Symptoms:** Edit modal shows changes, but they don't persist

**Possible Causes:**
1. Validation failed (check alerts)
2. Didn't click "Save Changes" in modal
3. Didn't click "Save Workshop" after modal

**Solutions:**
1. Check all required fields are filled
2. Ensure you clicked "Save Changes" button
3. Click "Save Workshop" to persist to disk

### Button Clicks Open Editor
**Symptoms:** Clicking ↑↓ or Remove opens edit modal

**This shouldn't happen!** If it does:
1. Report as bug
2. Workaround: Edit from different part of card
3. Should be fixed with `event.stopPropagation()`

### Duration Not Updating
**Symptoms:** Changed duration, but total doesn't update

**Solutions:**
1. Ensure you clicked "Save Changes"
2. Check if value is valid (5-300)
3. Total recalculates automatically after save

---

## 📊 Feature Comparison

### Before Module Editing

To change a module property:
```
1. Note down all current module settings
2. Click "Remove" on module
3. Click "Add Module"
4. Re-enter all settings manually
5. Manually reorder if needed
6. Save workshop
```

**Steps:** 6 | **Time:** ~2 minutes | **Risk:** Losing data

### After Module Editing

To change a module property:
```
1. Click module card
2. Change desired field
3. Click "Save Changes"
4. Save workshop
```

**Steps:** 4 | **Time:** ~30 seconds | **Risk:** Minimal

**Time saved:** ~75% per module edit! 🎉

---

## 🚀 Future Enhancements

Potential improvements to module editing:

- [ ] **Bulk edit:** Edit multiple modules at once
- [ ] **Duplicate module:** Clone with slight modifications
- [ ] **Module templates:** Save common module patterns
- [ ] **Undo/Redo:** Revert changes before saving
- [ ] **Drag-and-drop reorder:** Alternative to ↑↓ buttons
- [ ] **Preview mode:** See module as learner would
- [ ] **Validation warnings:** Suggest improvements
- [ ] **Auto-save drafts:** Prevent data loss

---

## ✨ Summary

The module editing feature provides:

✅ **Quick edits** - Click to edit any module property  
✅ **In-place updates** - No need to remove and re-add  
✅ **Visual feedback** - Clear "Click to edit" indicators  
✅ **Validation** - Ensures data quality  
✅ **Auto-recalculation** - Totals update immediately  
✅ **Safe operations** - Buttons don't trigger edit  
✅ **Immediate preview** - See changes right away  

This makes workshop building **faster, easier, and more intuitive**! 🎓
