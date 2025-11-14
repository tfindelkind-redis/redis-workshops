# GitHub Pages Migration Plan

## Analysis: Old Approach vs New Approach

### Old Approach (Current GitHub Pages)

**Terminology:**
- **Workshops** = Complete learning experiences (e.g., "Redis Fundamentals Workshop")
- **Chapters** = Reusable learning units (e.g., "Chapter 01: Getting Started")
- Chapters can be:
  - **Shared** (`shared/chapters/`) - Used across multiple workshops
  - **Workshop-specific** (`workshops/*/chapters/`) - Unique to one workshop

**Structure:**
```
workshops/redis-fundamentals/
  ├── chapters/
  │   └── building-the-chat-interface/
  └── README.md

shared/
  └── chapters/
      └── chapter-01-getting-started/
          └── README.md
```

**GitHub Pages Features:**
- Browse workshops by difficulty
- Search workshops
- View all chapters (shared + workshop-specific)
- "Create Workshop" guide

### New Approach (Module Inheritance System)

**Terminology:**
- **Modules** = Reusable 45-90 minute learning units (replaces "chapters")
- **Workshops** = Configured collections of modules
- **Canonical Modules** (`shared/modules/`) - Cloud-agnostic base versions
- **Customized Modules** (`workshops/*/modules/`) - Forked versions with customizations

**Structure:**
```
shared/
  └── modules/
      └── redis-fundamentals/
          ├── module.yaml
          └── content/
              ├── 01-what-is-redis.md
              ├── 02-data-structures.md
              └── 03-use-cases.md

workshops/deploy-redis-for-developers/
  └── modules/
      └── redis-fundamentals/
          ├── module.yaml
          ├── .lineage (tracks parent)
          └── content/
              └── 01-what-is-redis.md (customized)
```

**Module Inheritance Features:**
- Search modules (canonical + customized versions)
- View version trees (parent-child relationships)
- Fork modules (copy-on-write)
- Track customizations (file-level)

## Key Differences

| Aspect | Old (Chapters) | New (Modules) |
|--------|---------------|---------------|
| **Unit Name** | Chapter | Module |
| **Inheritance** | None - just copy | Explicit lineage tracking |
| **Versioning** | Version field in frontmatter | Version ID system (e.g., v1, v2) |
| **Customization** | Duplicate entire chapter | Fork + track changes |
| **Discovery** | Simple list | Version tree visualization |
| **File Structure** | Single README.md | Multiple content files |
| **Metadata** | YAML frontmatter | Separate module.yaml |
| **Lineage** | None | .lineage file with parent tracking |

## Migration Strategy

### Phase 1: Extend (Not Replace)
**Keep existing chapter system for backward compatibility**
- Existing workshops continue to work
- Gradual migration path

**Add module system alongside:**
- New "Modules" tab on GitHub Pages
- Module browser with version trees
- Fork/customize interface

### Phase 2: Update GitHub Pages

#### 2.1 Update Navigation
```html
<nav>
    <a href="#workshops">Workshops</a>
    <a href="#chapters">Chapters</a>     <!-- Keep for legacy -->
    <a href="#modules">Modules</a>        <!-- NEW -->
    <a href="#create">Create</a>
    <a href="https://github.com/...">GitHub</a>
</nav>
```

#### 2.2 Add Module Section
New section showing:
- Canonical modules
- Module version trees
- Search/filter by tags
- Fork button (links to CLI instructions)

#### 2.3 Update Create Workshop Page
Add new workflow:
1. **Old Way**: "Create from template" (keep for simple use cases)
2. **New Way**: "Build from modules" (recommended)
   - Browse module catalog
   - Select modules
   - Fork and customize as needed
   - Generate workshop configuration

#### 2.4 Generate Module Data
Create new script: `shared/tools/generate-module-data.js`
- Scans `shared/modules/` for canonical modules
- Scans `workshops/*/modules/` for customized versions
- Reads `module.yaml` and `.lineage` files
- Generates `docs/module-data.js` for GitHub Pages

### Phase 3: Enhanced Features

#### 3.1 Module Browser
Interactive interface to:
- Search modules by name, tags, description
- Filter by duration, difficulty
- View version trees
- Compare versions (diff viewer)

#### 3.2 Workshop Builder
Visual workshop creation tool:
1. Select duration (2h, 4h, 8h, 2-day)
2. Recommended modules auto-populate
3. Drag-and-drop to reorder
4. Click module to fork/customize
5. Generate `workshop.config.json`

#### 3.3 Module Analytics
Show for each module:
- Number of workshops using it
- Number of forks/customizations
- Popular customization patterns
- Usage across difficulty levels

## Implementation Plan

### Step 1: Create Module Data Generator
```javascript
// shared/tools/generate-module-data.js
// Scans file system and generates module-data.js
```

### Step 2: Add Module Section to index.html
```html
<!-- New section between chapters and getting-started -->
<section id="modules" class="modules-section">
    <h2>🧩 Module Library</h2>
    <div class="module-tabs">
        <button class="tab active" data-tab="canonical">Canonical</button>
        <button class="tab" data-tab="customized">Customized</button>
        <button class="tab" data-tab="tree">Version Trees</button>
    </div>
    <div id="module-grid"></div>
</section>
```

### Step 3: Create module-browser.js
Handle module rendering, search, filtering, tree visualization

### Step 4: Update create-workshop.html
Add new "Build from Modules" workflow with:
- Module selection interface
- Fork instructions
- CLI command generator

### Step 5: Create Module Cards
Visual cards showing:
- Module name & description
- Duration & difficulty
- Tags
- Inheritance info (canonical vs forked)
- Quick actions (View, Fork, Compare)

## Benefits of This Approach

### ✅ Backward Compatible
- Existing workshops still work
- Chapters remain accessible
- No breaking changes

### ✅ Progressive Enhancement
- Users can choose old or new approach
- Learn module system gradually
- Existing content isn't deprecated

### ✅ Better Discovery
- Version trees show all variants
- Clear lineage tracking
- Easy to find Azure vs AWS vs generic versions

### ✅ Easier Customization
- Fork from closest match
- Track what's different
- See upstream changes

### ✅ Analytics & Insights
- See which modules are popular
- Identify common customization patterns
- Guide future module creation

## Next Steps

1. **Create module data generator script**
2. **Update docs/data.js to include module data**
3. **Add "Modules" section to index.html**
4. **Create module browser UI**
5. **Update create-workshop.html with module workflow**
6. **Add version tree visualization**
7. **Create fork/customize instructions**

## File Changes Required

```
docs/
├── index.html                    # Add modules section
├── create-workshop.html          # Add module workflow
├── styles.css                    # Add module card styles
├── data.js                       # Add modulesData array
├── app.js                        # Add module rendering
└── module-browser.js             # NEW: Module-specific logic

shared/tools/
└── generate-module-data.js       # NEW: Generate module-data.js
```

## Example Module Data Structure

```javascript
const modulesData = [
    {
        id: "core.redis-fundamentals.v1",
        name: "Redis Fundamentals",
        description: "Introduction to Redis core concepts...",
        type: "canonical",
        path: "shared/modules/redis-fundamentals",
        duration: 60,
        difficulty: "beginner",
        tags: ["fundamentals", "core", "generic"],
        sections: 4,
        exercises: 1,
        lastUpdated: "2025-11-12",
        children: [
            "deploy-redis-for-developers.redis-fundamentals.v1",
            "aws-specific.redis-fundamentals.v1"
        ]
    },
    {
        id: "deploy-redis-for-developers.redis-fundamentals.v1",
        name: "Redis Fundamentals",
        description: "Azure-focused version with Azure Cache examples",
        type: "customized",
        path: "workshops/deploy-redis-for-developers/modules/redis-fundamentals",
        parent: "core.redis-fundamentals.v1",
        duration: 60,
        difficulty: "beginner",
        tags: ["fundamentals", "azure", "cache"],
        customizations: {
            files_customized: 1,
            files_inherited: 2,
            files_new: 0
        },
        lastUpdated: "2025-11-12"
    }
];
```

---

**This migration plan maintains backward compatibility while introducing the powerful new module inheritance system.**
