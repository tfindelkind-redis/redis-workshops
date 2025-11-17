# Workshop Module Structure

## Overview

The Workshop Builder now supports **multi-page module structures** with automatic navigation. Each module gets its own directory with a README.md file containing protected navigation sections.

## Directory Structure

```
workshops/
  └── {workshop-id}/
      ├── README.md                           # Main workshop page with module links
      ├── module-01-introduction/
      │   └── README.md                       # Module with navigation
      ├── module-02-data-structures/
      │   └── README.md                       # Module with navigation
      └── module-03-advanced-topics/
          └── README.md                       # Module with navigation
```

## Module README Structure

Each module README.md has three sections:

### 1. Protected Navigation Header (AUTO-GENERATED)

```markdown
<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->

[🏠 Workshop Home](../README.md) > **Module 1 of 3**

### Workshop Title

**Progress:** `█████░░░░░` 50%

---

<!-- ✏️ EDIT YOUR CONTENT BELOW THIS LINE ✏️ -->
```

**Features:**
- Breadcrumb navigation back to workshop home
- Current module position (Module X of Y)
- Visual progress bar showing completion percentage
- Workshop title for context

**⚠️ DO NOT EDIT:** This section is automatically regenerated when modules are saved or reordered.

---

### 2. Editable Content Section (YOUR CONTENT)

```markdown
# Module Name

**Duration:** 45 minutes  
**Difficulty:** Intermediate  
**Type:** Hands-on Lab

## Overview

Your module description here...

## Learning Objectives

- Objective 1
- Objective 2
- Objective 3

## Content

Your module content goes here...

### Section 1

Content for section 1...

### Section 2

Content for section 2...

## Hands-On Exercise

Your exercises here...

## Summary

Key takeaways...
```

**✏️ EDIT HERE:** This is where you write your module content. Everything between the two protected sections is yours to edit.

---

### 3. Protected Navigation Footer (AUTO-GENERATED)

```markdown
<!-- ✏️ EDIT YOUR CONTENT ABOVE THIS LINE ✏️ -->

---

<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->

## Navigation

<table width="100%">
  <tr>
    <td align="left" width="33%">
      <a href="../module-01-basics/README.md">⬅️ Previous<br/>Introduction to Redis</a>
    </td>
    <td align="center" width="33%">
      <a href="../README.md">🏠 Workshop Home</a>
    </td>
    <td align="right" width="33%">
      <a href="../module-03-advanced/README.md">Next ➡️<br/>Advanced Topics</a>
    </td>
  </tr>
</table>

---

*Module 2 of 3*
```

**Features:**
- Previous module link (if not first module)
- Home link to main workshop page
- Next module link (if not last module)
- Current position indicator

**⚠️ DO NOT EDIT:** This section is automatically regenerated when modules are saved or reordered.

---

## How to Generate Module Structure

### Using the GUI

1. **Create or Load a Workshop**
   - Fill in workshop details (title, description, etc.)
   - Add modules to your workshop

2. **Navigate to Navigation Tab**
   - Click the "Navigation" tab in the workshop builder

3. **Generate Modules**
   - Click the "🗂️ Generate Module Directories" button
   - Confirm the action in the dialog

4. **Review Generated Files**
   - Each module will have its own directory
   - Each directory contains a README.md with navigation
   - Main workshop README.md updated with module links

5. **Commit Changes (Optional)**
   - You'll be prompted to commit the generated structure
   - Enter a commit message
   - Changes are committed to your Git branch

### File Naming Convention

Module directories follow this pattern:
```
module-{number}-{slug}/README.md
```

Examples:
- `module-01-introduction/README.md`
- `module-02-data-structures/README.md`
- `module-03-advanced-topics/README.md`

The number is zero-padded (01, 02, 03...) and the slug is generated from the module name (lowercase, hyphens for spaces).

---

## Protected Section Markers

The navigation sections are protected with HTML comments:

### Header Protection
```html
<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->
...navigation content...
<!-- ✏️ EDIT YOUR CONTENT BELOW THIS LINE ✏️ -->
```

### Footer Protection
```html
<!-- ✏️ EDIT YOUR CONTENT ABOVE THIS LINE ✏️ -->
...navigation content...
<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->
```

**Important:** While you *can* manually edit these sections, they will be **overwritten** the next time the module structure is regenerated.

---

## When Modules Are Regenerated

Module navigation is automatically regenerated when:

1. **Manual Regeneration**
   - Click "Generate Module Directories" in the GUI
   - Existing files are updated with new navigation

2. **Module Order Changes**
   - Move modules up or down in the list
   - Previous/Next links are automatically updated

3. **Module Addition/Removal**
   - Add new modules to the workshop
   - Remove modules from the workshop
   - Navigation links are recalculated

**Content Preservation:** When regenerating, the system preserves all content between the protected section markers.

---

## API Endpoints

### Generate Module Structure
```
POST /api/workshops/:id/generate-modules
```

**Response:**
```json
{
  "success": true,
  "message": "Generated 3 module directories",
  "modules": [
    {
      "folderName": "module-01-introduction",
      "path": "/repo/workshops/redis-fundamentals/module-01-introduction"
    },
    {
      "folderName": "module-02-data-structures",
      "path": "/repo/workshops/redis-fundamentals/module-02-data-structures"
    },
    {
      "folderName": "module-03-advanced-topics",
      "path": "/repo/workshops/redis-fundamentals/module-03-advanced-topics"
    }
  ]
}
```

---

## Best Practices

### ✅ DO

- **Write all your content** between the edit markers
- **Use proper Markdown formatting** in your content section
- **Include code examples** and hands-on exercises
- **Add images** to your module directories as needed
- **Regenerate modules** when you reorder or change module structure

### ❌ DON'T

- **Don't edit navigation headers** - they will be overwritten
- **Don't edit navigation footers** - they will be overwritten
- **Don't manually create module links** - use the generator
- **Don't delete the protection markers** - they help preserve your content
- **Don't change folder names manually** - let the system manage them

---

## Example Workflow

1. **Create Workshop**
   ```
   Workshop ID: redis-fundamentals
   Title: Redis Fundamentals
   ```

2. **Add Modules**
   ```
   Module 1: Introduction to Redis
   Module 2: Data Structures
   Module 3: Advanced Topics
   ```

3. **Generate Structure**
   - Click "Generate Module Directories"
   - 3 directories created with navigation

4. **Edit Content**
   - Open `module-01-introduction/README.md`
   - Edit content between markers
   - Save changes

5. **Commit Changes**
   - Commit entire structure to Git
   - Push to remote repository

6. **Learners Navigate**
   - Start at main workshop README.md
   - Click module links
   - Use Previous/Next navigation
   - Track progress with visual indicators

---

## Troubleshooting

### Modules Not Generated
- **Check:** Workshop has modules added
- **Check:** Workshop is saved
- **Check:** Docker container is running
- **Check:** File permissions (rw mount)

### Navigation Not Updating
- **Solution:** Regenerate module structure
- **Solution:** Check protection markers are intact
- **Solution:** Verify module order in workshop

### Content Lost After Regeneration
- **Cause:** Protection markers were removed
- **Solution:** Always keep markers in place
- **Prevention:** Use GUI to edit modules

### Links Not Working
- **Check:** Relative paths are correct (../folder/README.md)
- **Check:** Module directories exist
- **Check:** README.md files exist in each directory

---

## Future Enhancements

Potential improvements for the module structure system:

- [ ] **Smart Content Preservation:** Automatically extract and preserve content when regenerating
- [ ] **Module Templates:** Pre-built templates for different module types
- [ ] **Asset Management:** Upload and manage images/files per module
- [ ] **Progress Tracking:** Save learner progress through modules
- [ ] **Module Dependencies:** Require completing previous modules
- [ ] **Interactive Elements:** Embedded quizzes and exercises
- [ ] **Version History:** Track changes to module content over time

---

## Summary

The multi-page module structure provides:

✅ **Automatic Navigation:** Headers and footers generated automatically  
✅ **Protected Sections:** Clear markers prevent accidental edits  
✅ **Progress Tracking:** Visual progress bars show completion  
✅ **Easy Navigation:** Previous/Home/Next links in every module  
✅ **Content Focus:** Authors focus on content, not navigation  
✅ **Git Integration:** Commit and version control built-in  

This structure creates a professional, easy-to-navigate workshop experience while protecting critical navigation elements from accidental modification.
