# Workshop Navigation System

## Overview

The Workshop Builder automatically generates a comprehensive **two-level navigation system** for your workshops:

1. **Workshop-level navigation** - Module directory in the main README
2. **Module-level navigation** - Breadcrumbs and progress bars in each module

## 🏠 Workshop-Level Navigation

### Location

At the bottom of the workshop's main `README.md` file:

```
workshops/your-workshop/README.md
└── 📚 Workshop Modules section (auto-generated)
```

### Structure

```markdown
## 📚 Workshop Modules

### [Module 1: Redis Basics](module-01-redis-basics/README.md)

**Duration:** 60 minutes | **Difficulty:** beginner | **Type:** hands-on

Introduction to Redis fundamentals and core concepts

### [Module 2: Advanced Patterns](module-02-advanced-patterns/README.md)

**Duration:** 90 minutes | **Difficulty:** intermediate | **Type:** hands-on

Deep dive into advanced Redis patterns and use cases
```

### When It's Generated

The module directory is created/updated when:

1. ✅ You click "Save Workshop" with auto-generate enabled
2. ✅ Module directories are generated
3. ✅ Any time modules are added, removed, or reordered

### Content Includes

For each module, the directory shows:

- Module number and name (as a clickable link)
- Duration in minutes
- Difficulty level (beginner/intermediate/advanced)
- Type (hands-on/lecture/canonical)
- Module description

## 📍 Module-Level Navigation

Module navigation appears in **two locations** for convenience:

1. **Top of module** - Quick navigation bar + context
2. **Bottom of module** - Detailed navigation footer

### Location

At the top of each module's `README.md` file:

```
workshops/your-workshop/module-XX-name/README.md
├── Auto-generated navigation header (lines 1-20)
└── Module content (starts after line 21)
```

### Structure

```markdown
<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->

<table width="100%">
  <tr>
    <td align="left" width="33%">
      <a href="../module-01-redis-basics/README.md">⬅️ Previous<br/><small>Redis Basics</small></a>
    </td>
    <td align="center" width="33%">
      <a href="../README.md">🏠 Workshop Home</a>
    </td>
    <td align="right" width="33%">
      <a href="../module-03-advanced-features/README.md">Next ➡️<br/><small>Advanced Features</small></a>
    </td>
  </tr>
</table>

[🏠 Workshop Home](../README.md) > **Module 2 of 5**

### Deploy Redis for Developers - Azure Managed Redis

**Progress:** `████░░░░░░` 40%

---

<!-- ✏️ EDIT YOUR CONTENT BELOW THIS LINE ✏️ -->
```

### Components

#### 0. Quick Navigation Bar

```markdown
<table width="100%">
  <tr>
    <td align="left">⬅️ Previous<br/>Module Name</td>
    <td align="center">🏠 Workshop Home</td>
    <td align="right">Next ➡️<br/>Module Name</td>
  </tr>
</table>
```

- Quick access to previous and next modules
- Always shows Home button in the center
- Previous button hidden on first module
- Next button hidden on last module
- Module names shown for context

#### 1. Breadcrumb Trail

```markdown
[🏠 Workshop Home](../README.md) > **Module 2 of 5**
```

- 🏠 Home icon links back to workshop README
- Shows current module position (e.g., "Module 2 of 5")

#### 2. Workshop Title

```markdown
### Deploy Redis for Developers - Azure Managed Redis
```

- Displays the workshop title as context
- Helps users know which workshop they're in

#### 3. Progress Bar

```markdown
**Progress:** `████░░░░░░` 40%
```

- Visual progress indicator
- Shows percentage completion
- Each block represents 10% (10 blocks total)

#### 4. Protected Section Markers

```markdown
<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->
...
<!-- ✏️ EDIT YOUR CONTENT BELOW THIS LINE ✏️ -->
```

- Clearly marks the auto-generated section
- Warns users not to manually edit navigation
- Shows where custom content should start

## 🧭 Module Footer Navigation

### Location

At the bottom of each module's `README.md`:

```markdown
---

<table width="100%">
  <tr>
    <td width="33%" align="left">
      <a href="../module-01-redis-basics/README.md">⬅️ Previous<br/>Redis Basics</a>
    </td>
    <td width="34%" align="center">
      <a href="../README.md">🏠 Workshop Home</a>
    </td>
    <td width="33%" align="right">
      <a href="../module-03-advanced-features/README.md">Next ➡️<br/>Advanced Features</a>
    </td>
  </tr>
</table>

---
```

### Navigation Buttons

- **⬅️ Previous**: Links to the previous module (hidden on first module)
- **🏠 Workshop Home**: Always links back to main workshop README
- **Next ➡️**: Links to the next module (hidden on last module)

## 🔄 Auto-Generation Process

### When Modules Are Generated

```
User clicks "Save Workshop" with auto-generate ON
    ↓
System generates module directories
    ↓
For each module:
    ├── Create module folder
    ├── Generate README with navigation header
    └── Add footer with prev/next links
    ↓
Update workshop README with module directory
    ↓
Done! ✓
```

### Navigation Updates

```
Modules:  [Module 1] → [Module 2] → [Module 3]

Module 1:
  Header: "Module 1 of 3" | Progress: 33%
  Footer: [Home] [Next → Module 2]

Module 2:
  Header: "Module 2 of 3" | Progress: 67%
  Footer: [← Module 1] [Home] [Next → Module 3]

Module 3:
  Header: "Module 3 of 3" | Progress: 100%
  Footer: [← Module 2] [Home]
```

## 📐 Progress Bar Calculation

### Formula

```javascript
moduleNumber / totalModules * 100 = progress percentage
fillBlocks = Math.floor(progress / 10)
```

### Examples

```
Module 1 of 5:  1/5 = 20%  → `██░░░░░░░░` (2 blocks)
Module 2 of 5:  2/5 = 40%  → `████░░░░░░` (4 blocks)
Module 3 of 5:  3/5 = 60%  → `██████░░░░` (6 blocks)
Module 4 of 5:  4/5 = 80%  → `████████░░` (8 blocks)
Module 5 of 5:  5/5 = 100% → `██████████` (10 blocks)
```

## 🎨 Visual Example

### Complete Module Navigation

```markdown
┌────────────────────────────────────────────────────────┐
│ <!-- AUTO-GENERATED NAVIGATION - DO NOT EDIT -->       │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ ⬅️ Previous     │  🏠 Workshop   │   Next ➡️   │   │
│ │ Redis Basics    │     Home       │   Advanced   │   │
│ │                 │                 │   Features   │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ [🏠 Workshop Home](../README.md) > **Module 2 of 5**  │
│                                                         │
│ ### Deploy Redis for Developers - Azure Managed Redis  │
│                                                         │
│ **Progress:** `████░░░░░░` 40%                         │
│                                                         │
│ ---                                                     │
│                                                         │
│ <!-- EDIT YOUR CONTENT BELOW THIS LINE -->             │
├────────────────────────────────────────────────────────┤
│                                                         │
│ # Introduction to Redis                                │
│                                                         │
│ **Duration:** 45 minutes                               │
│ **Difficulty:** beginner                               │
│ **Type:** lecture                                      │
│                                                         │
│ [Your module content here...]                          │
│                                                         │
├────────────────────────────────────────────────────────┤
│ ---                                                     │
│                                                         │
│ <table width="100%">                                   │
│   <tr>                                                  │
│     <td align="left">                                   │
│       ⬅️ Previous                                      │
│       Redis Basics                                     │
│     </td>                                               │
│     <td align="center">                                 │
│       🏠 Workshop Home                                 │
│     </td>                                               │
│     <td align="right">                                  │
│       Next ➡️                                          │
│       Advanced Patterns                                │
│     </td>                                               │
│   </tr>                                                 │
│ </table>                                                │
└────────────────────────────────────────────────────────┘
```

## 📝 Editing Guidelines

### What You CAN Edit

✅ **Module content** - Everything below the edit marker:

```markdown
<!-- ✏️ EDIT YOUR CONTENT BELOW THIS LINE ✏️ -->

# Your Module Title

Your content here...
```

✅ **Workshop README content** - Everything above the module directory:

```markdown
---
workshopId: my-workshop
title: My Workshop
---

# My Workshop

Your workshop description and setup instructions...

<!-- Module directory will be appended below -->
```

### What You SHOULD NOT Edit

❌ **Module navigation headers** - Between the warning comments:

```markdown
<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->
[Content here will be regenerated]
<!-- ✏️ EDIT YOUR CONTENT BELOW THIS LINE ✏️ -->
```

❌ **Module navigation footers** - The HTML table at the bottom

❌ **Workshop module directory** - The "📚 Workshop Modules" section

### What Happens If You Edit Protected Sections

```
You manually edit the navigation
    ↓
You save the workshop and regenerate modules
    ↓
Your manual edits are OVERWRITTEN
    ↓
Navigation is regenerated from workshop data
```

## ✨ Improved Navigation Experience

### Before: Footer-Only Navigation

Previously, you had to scroll to the bottom to navigate between modules:

```
User reads module content
    ↓
Scrolls all the way to bottom
    ↓
Clicks "Next" button
    ↓
New module loads
    ↓
Repeat...
```

**Problem:** Extra scrolling on every module!

### After: Top + Bottom Navigation

Now you can navigate immediately:

```
User opens module
    ↓
See navigation bar at top ← Quick access!
    ↓
Clicks "Next" immediately
    ↓
New module loads
    ↓
Or scrolls down and uses footer navigation
```

**Benefit:** Navigate from top OR bottom!

### Navigation Consistency

Both top and bottom navigation show:
- ✅ Previous module (with name)
- ✅ Home button
- ✅ Next module (with name)

Top navigation: Compact for quick access
Bottom navigation: Detailed with context

## 🔧 Customization Options

### Disable Auto-Generation

If you want to manage navigation manually:

```
1. Uncheck "Auto-generate module directories" checkbox
2. Save workshop - only updates README frontmatter
3. Manually create and edit module files
```

### Manual Navigation Updates

If auto-generation is disabled, update manually:

```bash
# Edit workshop README
vim workshops/my-workshop/README.md
# Add module directory manually

# Edit each module README
vim workshops/my-workshop/module-01-intro/README.md
# Add navigation header and footer manually
```

## 🎯 Best Practices

### 1. Let the System Handle Navigation

```
✅ GOOD: Use auto-generate feature
✅ GOOD: Edit module content only
❌ BAD: Manually edit navigation sections
```

### 2. Review After Generation

```
After generating modules:
1. ✓ Check workshop README for module directory
2. ✓ Open each module and verify navigation
3. ✓ Test that all links work
4. ✓ Verify progress bars are correct
```

### 3. Keep Module Order Logical

```
Good Order:
1. Introduction/Prerequisites
2. Basic Concepts
3. Advanced Topics
4. Hands-On Labs
5. Summary/Next Steps

Progress naturally flows: 20% → 40% → 60% → 80% → 100%
```

### 4. Use Descriptive Module Names

```
❌ BAD:  Module 1, Module 2, Module 3
✅ GOOD: Redis Basics, Data Structures, Advanced Patterns

Navigation shows:
"[🏠 Workshop Home] > Module 2 of 5"
"Redis Data Structures" ← Clear context!
```

## 🐛 Troubleshooting

### Issue: Navigation missing from modules

**Cause:** Modules created manually or auto-generate was disabled

**Solution:**
```
1. Enable "Auto-generate module directories"
2. Save the workshop again
3. Navigation will be regenerated
```

### Issue: Progress bar shows wrong percentage

**Cause:** Modules were added/removed but not regenerated

**Solution:**
```
1. Save workshop with auto-generate enabled
2. System will recalculate module positions
3. Progress bars will update accordingly
```

### Issue: Previous/Next links are broken

**Cause:** Module folders were renamed manually

**Solution:**
```
1. Don't manually rename module folders
2. Edit module name in workshop builder
3. Regenerate modules - folders and links will sync
```

### Issue: Workshop module directory is missing

**Cause:** Auto-generate was disabled when saving

**Solution:**
```
1. Enable auto-generate checkbox
2. Save workshop again
3. Module directory will be appended to README
```

## 📊 Navigation Types Comparison

| Feature | Workshop-Level | Module Header | Module Footer |
|---------|---------------|---------------|---------------|
| **Location** | Workshop README bottom | Module README top | Module README bottom |
| **Purpose** | Module overview | Context & progress | Module-to-module nav |
| **Content** | All module links | Breadcrumb, progress | Prev/Next buttons |
| **Generated** | On module creation | On module creation | On module creation |
| **Editable** | No (auto-generated) | No (protected) | No (protected) |
| **Update Trigger** | Save + auto-gen | Save + auto-gen | Save + auto-gen |

## ✅ Summary

### Navigation System Benefits

1. ✅ **Automatic** - No manual HTML/markdown needed
2. ✅ **Consistent** - Same format across all modules
3. ✅ **Accurate** - Always reflects current module order
4. ✅ **User-Friendly** - Clear progress and easy navigation
5. ✅ **Maintainable** - Updates automatically when modules change

### What You Need to Know

1. Navigation is auto-generated when you save with auto-generate ON
2. Don't edit protected sections (they'll be overwritten)
3. Edit your module content below the edit marker
4. The system keeps everything in sync automatically

### Quick Reference

```
Workshop README
└── 📚 Workshop Modules (auto-generated)
    └── Links to all modules

Module README
├── Navigation Header (auto-generated)
│   ├── Breadcrumb
│   ├── Workshop title
│   └── Progress bar
├── Module Content (you edit this)
│   ├── Title
│   ├── Metadata
│   └── Your content
└── Navigation Footer (auto-generated)
    ├── Previous button
    ├── Home button
    └── Next button
```

---

**Related Documentation:**
- [Module Structure Guide](./MODULE_STRUCTURE.md)
- [Streamlined Workflow](./STREAMLINED_WORKFLOW.md)
- [Auto-Duration Sync](./AUTO_DURATION_SYNC.md)
