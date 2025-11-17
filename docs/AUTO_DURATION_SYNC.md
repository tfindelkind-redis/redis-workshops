# Auto-Duration Synchronization

## Overview

The Workshop Builder now **automatically calculates and syncs** the total workshop duration based on module durations. You no longer need to manually update the workshop duration field!

## 🎯 How It Works

### Automatic Calculation

The workshop duration is automatically calculated from all module durations:

```
Workshop Duration = Sum of all module durations
```

### When Duration Updates

The duration field updates automatically when:

1. ✅ **Adding a module** - Duration increases by the new module's duration
2. ✅ **Removing a module** - Duration decreases by the removed module's duration
3. ✅ **Editing a module** - Duration adjusts based on the change
4. ✅ **Saving the workshop** - Duration is recalculated before saving

### Real-Time Display

The summary panel shows the calculated total:

```
Workshop Summary
├── Modules: 5
├── Total Duration: 285 min    ← Auto-calculated
├── Canonical: 1
└── Customized: 4
```

## 📝 User Experience

### Before (Manual)

```yaml
# User had to manually calculate and update
estimatedTime: 240  # ← Outdated! Actually 285 minutes now

# Problems:
❌ Forgot to update after adding modules
❌ Math errors in manual calculation
❌ Duration field out of sync with modules
```

### After (Automatic)

```yaml
# System automatically syncs
estimatedTime: 285  # ← Always correct!

# Benefits:
✅ Always accurate
✅ No manual calculation needed
✅ Updates in real-time
✅ Saves before every workshop save
```

## 🔄 Workflow Examples

### Example 1: Adding Modules

```
Initial state:
- Modules: []
- Duration: 0 min

Add "Redis Basics" (60 min)
→ Duration: 60 min ✓

Add "Advanced Patterns" (90 min)
→ Duration: 150 min ✓

Add "Deployment" (45 min)
→ Duration: 195 min ✓
```

### Example 2: Editing Module Duration

```
Current state:
- Module 1: Redis Basics (60 min)
- Module 2: Advanced Patterns (90 min)
- Total: 150 min

Edit Module 1: Change 60 → 75 min
→ Total updates to: 165 min ✓
```

### Example 3: Removing a Module

```
Current state:
- Module 1: Intro (30 min)
- Module 2: Basics (60 min)
- Module 3: Advanced (90 min)
- Total: 180 min

Remove Module 2 (60 min)
→ Total updates to: 120 min ✓
```

## 🎨 Visual Indicators

### Duration Field

The workshop duration field shows the auto-calculated value:

```
Workshop Duration (minutes) *
┌──────────────────────────┐
│ 285                      │  ← Auto-calculated from modules
└──────────────────────────┘
   ℹ️ Automatically calculated from module durations
```

### Summary Panel

```
┌─────────────────────────────────┐
│ Workshop Summary                │
├─────────────────────────────────┤
│ 📚 Modules: 5                   │
│ ⏱️ Total Duration: 285 min      │ ← Real-time calculation
│ 📘 Canonical: 1                 │
│ ✏️ Customized: 4                │
└─────────────────────────────────┘
```

## 💾 Saving Behavior

### On Save

When you click "Save Workshop", the system:

1. Calculates total duration from all modules
2. Updates the `workshop.duration` property
3. Updates the duration field in the UI
4. Saves to the workshop README frontmatter

### Frontmatter Result

```yaml
---
workshopId: my-workshop
title: Redis Fundamentals
estimatedTime: 285           # ← Auto-synced
modules:
  - name: Module 1
    duration: 75             # ← Source
  - name: Module 2
    duration: 60             # ← Source
  - name: Module 3
    duration: 90             # ← Source
  - name: Module 4
    duration: 60             # ← Source
---
```

## 🔍 Technical Details

### Implementation

The auto-sync happens in two places:

#### 1. `updateSummary()` Function

Called whenever modules change (add, remove, edit):

```javascript
function updateSummary() {
    // Calculate total from modules
    const totalDuration = workshop.modules.reduce(
        (sum, m) => sum + (m.duration || 0), 0
    );
    
    // Update display
    document.getElementById('total-duration').textContent = totalDuration;
    
    // Update form field
    const durationField = document.getElementById('workshop-duration');
    if (durationField && totalDuration > 0) {
        durationField.value = totalDuration;
        workshop.duration = totalDuration;
    }
}
```

#### 2. `saveWorkshop()` Function

Recalculates before saving to ensure accuracy:

```javascript
async function saveWorkshop() {
    // ... get other fields ...
    
    // Calculate duration from modules (auto-sync)
    const totalDuration = workshop.modules.reduce(
        (sum, m) => sum + (m.duration || 0), 0
    );
    workshop.duration = totalDuration;
    document.getElementById('workshop-duration').value = totalDuration;
    
    // ... save workshop ...
}
```

### When It Runs

```
User Action              → Trigger       → Result
─────────────────────────────────────────────────────
Add Module               → updateSummary() → Duration +X
Remove Module            → updateSummary() → Duration -X
Edit Module Duration     → updateSummary() → Duration recalc
Move Module Up/Down      → updateSummary() → Duration same
Save Workshop            → saveWorkshop()  → Duration synced
```

## ✅ Best Practices

### 1. Trust the Calculation

Don't manually edit the duration field - it will be overwritten!

```
❌ BAD: Manually editing duration field
✅ GOOD: Edit individual module durations
```

### 2. Set Module Durations Accurately

The total is only as accurate as the module durations:

```
Module 1: 60 min  ← Be realistic
Module 2: 90 min  ← Include exercises
Module 3: 45 min  ← Add buffer time
```

### 3. Review Before Saving

Check the summary panel before saving:

```
Total Duration: 285 min
├── Does this look right?
├── Are all modules included?
└── Any missing time for breaks?
```

## 🐛 Troubleshooting

### Issue: Duration shows 0

**Cause:** No modules added yet or all modules have 0 duration

**Solution:**
```
1. Add modules with valid durations (5-300 min)
2. Or edit existing modules to set durations
```

### Issue: Duration seems wrong

**Cause:** Module duration was edited but UI not refreshed

**Solution:**
```
1. Click "Refresh" or reload the page
2. Or edit any module to trigger recalculation
3. The save operation will recalculate anyway
```

### Issue: Duration field is editable

**Behavior:** You CAN edit it, but it will be overwritten

**Explanation:**
```
The field is left editable for manual override if needed,
but it will be recalculated and synced on save.
```

## 📊 Examples

### Workshop: Redis Fundamentals

```yaml
Modules:
  1. Introduction to Redis      - 45 min
  2. Data Structures            - 75 min
  3. Commands and Operations    - 60 min
  4. Persistence and Replication- 90 min
  5. Best Practices             - 30 min

Total Duration: 300 min (5 hours) ✓
```

### Workshop: Redis for Developers

```yaml
Modules:
  1. Quick Start                - 30 min
  2. Core Concepts              - 60 min
  3. Advanced Features          - 120 min
  4. Production Tips            - 45 min

Total Duration: 255 min (4.25 hours) ✓
```

## 🎓 Summary

### Key Benefits

1. ✅ **Always Accurate** - No manual calculation errors
2. ✅ **Time Saving** - No need to update duration manually
3. ✅ **Real-Time** - Updates as you work
4. ✅ **Reliable** - Synced before every save

### What You Need to Do

1. Set accurate module durations
2. The system handles the rest automatically!

### What Changed

```
Before:
1. Add/edit modules
2. Calculate total duration manually
3. Update workshop duration field
4. Save workshop

After:
1. Add/edit modules
2. Save workshop ← Duration synced automatically!
```

---

**Related Documentation:**
- [Module Editing Guide](./MODULE_EDITING.md)
- [Streamlined Workflow](./STREAMLINED_WORKFLOW.md)
- [Workshop Configuration](./README-FRONTMATTER.md)
