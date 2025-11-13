# Workshop Navigation System Design

## 🎯 Goal
Auto-generate navigation links in module README.md files based on the order defined in workshop.config.json, ensuring navigation updates automatically when modules are reordered.

---

## 📋 Current State

### Template Navigation (Manual)
```markdown
## 🧭 Navigation

<table>
<tr>
<td width="33%" align="left">

### [◀️ Previous](../../chapter-XX-name/README.md)
**Previous Chapter Title**

</td>
<td width="34%" align="center">

### [🏠 Home](../../README.md)
**Workshop Home**

</td>
<td width="33%" align="center">

### [Next ▶️](../../chapter-XX-name/README.md)
**Next Chapter Title**

</td>
</tr>
</table>
```

**Problems:**
- ❌ Hardcoded paths
- ❌ Must be manually updated when reordering
- ❌ Easy to get out of sync
- ❌ Doesn't work with module inheritance

---

## 🏗️ Proposed Solution

### Architecture

```
workshop.config.json
       ↓
   Build Process
       ↓
   Generate Navigation
       ↓
   Update Module READMEs
```

### Components

1. **Navigation Generator** - CLI tool that reads workshop.config.json
2. **Navigation Templates** - Frontmatter placeholders in module content
3. **Build Process** - Auto-generates navigation on build
4. **Update Command** - Update navigation without full build

---

## 📐 Design Patterns

### Pattern 1: Frontmatter Markers (Recommended)

Each module README has markers that get replaced:

```markdown
---
nav:
  auto: true
---

<!-- NAV:START -->
<!-- This section is auto-generated. Do not edit manually. -->
## 🧭 Navigation

[Navigation content will be inserted here]

<!-- NAV:END -->

# Module Content

Your actual content here...
```

**Benefits:**
- ✅ Clear boundaries for auto-generation
- ✅ Won't accidentally overwrite content
- ✅ Can regenerate anytime
- ✅ Works with version control (see diffs clearly)

### Pattern 2: Build-Time Generation (Alternative)

Navigation is generated only during build, not in source files:

```
Source: modules/redis-fundamentals/content/01-intro.md
        ↓
Build:  chapters/01-redis-fundamentals/01-intro.md (with navigation)
```

**Benefits:**
- ✅ Source files stay clean
- ✅ No risk of manual edits
- ✅ Always correct at build time

**Drawbacks:**
- ❌ Can't preview navigation in source
- ❌ More complex build process

---

## 🛠️ Implementation Design

### Data Structure

```python
# From workshop.config.json
{
  "modules": [
    {"order": 1, "moduleRef": "core.redis-fundamentals.v1"},
    {"order": 2, "moduleRef": "core.azure-redis-options.v1"},
    {"order": 3, "moduleRef": "workshop.hands-on-lab.v1"}
  ]
}

# Navigation map generated:
{
  "core.redis-fundamentals.v1": {
    "position": 1,
    "total": 3,
    "previous": None,
    "next": "core.azure-redis-options.v1",
    "home": "../../README.md"
  },
  "core.azure-redis-options.v1": {
    "position": 2,
    "total": 3,
    "previous": "core.redis-fundamentals.v1",
    "next": "workshop.hands-on-lab.v1",
    "home": "../../README.md"
  },
  "workshop.hands-on-lab.v1": {
    "position": 3,
    "total": 3,
    "previous": "core.azure-redis-options.v1",
    "next": None,
    "home": "../../README.md"
  }
}
```

### Navigation Template

```markdown
## 🧭 Navigation

<table>
<tr>
{% if previous %}
<td width="33%" align="left">

### [◀️ Previous](../{{ previous.folder }}/README.md)
**{{ previous.title }}**

</td>
{% else %}
<td width="33%" align="left">

### 🚫
**First Module**

</td>
{% endif %}

<td width="34%" align="center">

### [🏠 Home]({{ home }})
**Workshop Home**
Module {{ position }} of {{ total }}

</td>

{% if next %}
<td width="33%" align="right">

### [Next ▶️](../{{ next.folder }}/README.md)
**{{ next.title }}**

</td>
{% else %}
<td width="33%" align="right">

### 🎉
**Last Module**

</td>
{% endif %}
</tr>
</table>

---

### 📚 All Modules

{% for module in all_modules %}
{{ loop.index }}. {% if module.is_current %}**{{ module.title }}** ← *You are here*{% else %}[{{ module.title }}](../{{ module.folder }}/README.md){% endif %}
{% endfor %}

---
```

### Generated Example

```markdown
## 🧭 Navigation

<table>
<tr>
<td width="33%" align="left">

### [◀️ Previous](../01-redis-fundamentals/README.md)
**Redis Fundamentals**

</td>
<td width="34%" align="center">

### [🏠 Home](../../README.md)
**Workshop Home**
Module 2 of 3

</td>
<td width="33%" align="right">

### [Next ▶️](../03-hands-on-lab/README.md)
**Hands-On Lab**

</td>
</tr>
</table>

---

### 📚 All Modules

1. [Redis Fundamentals](../01-redis-fundamentals/README.md)
2. **Azure Redis Options** ← *You are here*
3. [Hands-On Lab](../03-hands-on-lab/README.md)

---
```

---

## 🔧 CLI Commands

### New Command: update-navigation

```bash
# Update navigation for all modules in workshop
./shared/tools/workshop-builder.py update-navigation \
  --workshop my-workshop

🔄 Updating navigation for my-workshop...

Step 1: Reading workshop.config.json
  ✅ Found 3 modules

Step 2: Resolving module paths
  ✅ core.redis-fundamentals.v1 → shared/modules/redis-fundamentals
  ✅ core.azure-redis-options.v1 → shared/modules/azure-redis-options
  ✅ my-workshop.hands-on-lab.v1 → workshops/my-workshop/modules/hands-on-lab

Step 3: Generating navigation maps
  ✅ Created navigation context for each module

Step 4: Updating module READMEs
  ✅ Updated: workshops/my-workshop/chapters/01-redis-fundamentals/README.md
  ✅ Updated: workshops/my-workshop/chapters/02-azure-redis-options/README.md
  ✅ Updated: workshops/my-workshop/chapters/03-hands-on-lab/README.md

✅ Navigation updated for 3 modules!

💡 Tip: Navigation will be auto-regenerated on next build
```

### Integration with Existing Commands

```bash
# Auto-update navigation after reordering
./shared/tools/workshop-builder.py swap \
  --workshop my-workshop \
  --positions 1,2

✅ Swapped modules at positions 1 ↔ 2
🔄 Updating navigation...
✅ Navigation updated!

# Auto-update navigation after adding module
./shared/tools/workshop-builder.py add \
  --workshop my-workshop \
  --module core.troubleshooting.v1

✅ Added canonical module: core.troubleshooting.v1
🔄 Updating navigation...
✅ Navigation updated!
```

---

## 📝 Module Content Structure

### For Canonical Modules (Source)

```
shared/modules/redis-fundamentals/
├── module.yaml
├── README.md                    # Module overview (no navigation)
└── content/
    ├── 01-what-is-redis.md     # Content file (no navigation)
    ├── 02-data-structures.md   # Content file (no navigation)
    └── 03-use-cases.md         # Content file (no navigation)
```

**Note:** Canonical modules don't have navigation because they're reusable across workshops.

### For Built Workshop (Generated)

```
workshops/my-workshop/
├── workshop.config.json
├── README.md                                # Workshop home
└── chapters/                                # Generated during build
    ├── 01-redis-fundamentals/
    │   ├── README.md                       # Module overview + navigation ✅
    │   └── content/
    │       ├── 01-what-is-redis.md        # Content + navigation ✅
    │       ├── 02-data-structures.md      # Content + navigation ✅
    │       └── 03-use-cases.md            # Content + navigation ✅
    ├── 02-azure-redis-options/
    │   ├── README.md                       # Module overview + navigation ✅
    │   └── content/
    │       └── ...
    └── 03-hands-on-lab/
        └── ...
```

---

## 🎨 Navigation Variants

### 1. Simple Navigation (Minimal)

```markdown
## 🧭 Navigation

[◀️ Previous](../01-redis-fundamentals/README.md) | [🏠 Home](../../README.md) | [Next ▶️](../03-hands-on-lab/README.md)

**Module 2 of 3**: Azure Redis Options
```

### 2. Card Navigation (Rich - Recommended)

```markdown
## 🧭 Navigation

<table>
<tr>
<td width="33%" align="left">

### [◀️ Previous](../01-redis-fundamentals/README.md)
**Redis Fundamentals**
⏱️ 60 min

</td>
<td width="34%" align="center">

### [🏠 Home](../../README.md)
**Workshop Home**
📍 Module 2 of 3
⏱️ 180 min total

</td>
<td width="33%" align="right">

### [Next ▶️](../03-hands-on-lab/README.md)
**Hands-On Lab**
⏱️ 60 min

</td>
</tr>
</table>
```

### 3. Progress Bar Navigation (Visual)

```markdown
## 🧭 Navigation

Progress: ▓▓▓▓▓▓▓▓░░░░░░░░ 50% (2 of 3 modules)

[◀️ Previous](../01-redis-fundamentals/README.md) | [🏠 Home](../../README.md) | [Next ▶️](../03-hands-on-lab/README.md)

1. [✅ Redis Fundamentals](../01-redis-fundamentals/README.md)
2. **📍 Azure Redis Options** ← *You are here*
3. [⬜ Hands-On Lab](../03-hands-on-lab/README.md)
```

### 4. Breadcrumb Navigation (Hierarchical)

```markdown
## 🧭 Navigation

[Workshop Home](../../README.md) / **Module 2: Azure Redis Options**

---

<table>
<tr>
<td width="50%" align="left">
[◀️ Previous: Redis Fundamentals](../01-redis-fundamentals/README.md)
</td>
<td width="50%" align="right">
[Next: Hands-On Lab ▶️](../03-hands-on-lab/README.md)
</td>
</tr>
</table>
```

---

## 🔀 Handling Module Types

### Canonical Module (Source)
```markdown
# Redis Fundamentals

## Overview
Introduction to Redis core concepts...

## Content Files
- [What is Redis?](content/01-what-is-redis.md)
- [Data Structures](content/02-data-structures.md)
- [Use Cases](content/03-use-cases.md)
```

**No navigation** - Canonical modules are reusable

### Workshop Module (Built)
```markdown
<!-- NAV:START -->
## 🧭 Navigation

[Navigation generated here based on workshop.config.json]

<!-- NAV:END -->

# Redis Fundamentals

## Overview
Introduction to Redis core concepts...

## Content Files
- [What is Redis?](content/01-what-is-redis.md)
- [Data Structures](content/02-data-structures.md)
- [Use Cases](content/03-use-cases.md)
```

**Navigation added** - Specific to this workshop's order

---

## 🚀 Implementation Plan

### Phase 1: Navigation Generator
```python
# Add to workshop-builder.py

def generate_navigation(self, workshop: str):
    """Generate navigation for all modules in workshop"""
    config = self.load_workshop_config(workshop)
    modules = config.get('modules', [])
    
    # Build navigation map
    nav_map = {}
    for i, module in enumerate(modules):
        module_id = module.get('moduleRef')
        nav_map[module_id] = {
            'position': i + 1,
            'total': len(modules),
            'previous': modules[i-1].get('moduleRef') if i > 0 else None,
            'next': modules[i+1].get('moduleRef') if i < len(modules)-1 else None
        }
    
    # Update each module's README
    for module_id, nav_info in nav_map.items():
        self._update_module_navigation(workshop, module_id, nav_info)
```

### Phase 2: Template System
```python
def _update_module_navigation(self, workshop, module_id, nav_info):
    """Update navigation in module README"""
    # Find module README in built chapters/
    readme_path = self._get_built_readme_path(workshop, module_id)
    
    if not readme_path.exists():
        return
    
    # Read content
    content = readme_path.read_text()
    
    # Generate navigation HTML
    nav_html = self._render_navigation_template(nav_info)
    
    # Replace between markers
    pattern = r'<!-- NAV:START -->.*?<!-- NAV:END -->'
    replacement = f'<!-- NAV:START -->\n{nav_html}\n<!-- NAV:END -->'
    updated_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    # Write back
    readme_path.write_text(updated_content)
```

### Phase 3: Auto-Update Hooks
```python
# Hook into existing commands

def add_module(self, workshop, module_id, position=None):
    # ... existing add logic ...
    self.generate_navigation(workshop)  # Auto-update

def remove_module(self, workshop, module_id):
    # ... existing remove logic ...
    self.generate_navigation(workshop)  # Auto-update

def move_module(self, workshop, module_id, to_position):
    # ... existing move logic ...
    self.generate_navigation(workshop)  # Auto-update
```

---

## 📊 File Structure After Build

```
workshops/my-workshop/
├── workshop.config.json
│   {
│     "modules": [
│       {"order": 1, "moduleRef": "core.redis-fundamentals.v1"},
│       {"order": 2, "moduleRef": "core.azure-redis-options.v1"}
│     ]
│   }
│
├── README.md
│   # Workshop Home
│   - Links to all chapters in order
│   - Generated from workshop.config.json
│
└── chapters/                           # Generated during build
    ├── 01-redis-fundamentals/
    │   ├── README.md                   # Module overview
    │   │   - Navigation: [none] | Home | Next →
    │   │   - Links to content files
    │   │
    │   └── content/
    │       ├── 01-what-is-redis.md
    │       │   - Navigation: ← Previous | Home | Next →
    │       │   - Content
    │       │
    │       ├── 02-data-structures.md
    │       │   - Navigation: ← Previous | Home | Next →
    │       │   - Content
    │       │
    │       └── 03-use-cases.md
    │           - Navigation: ← Previous | Home | Next →
    │           - Content
    │
    └── 02-azure-redis-options/
        ├── README.md
        │   - Navigation: ← Previous | Home | Next →
        │
        └── content/
            └── ...
```

---

## 🎯 Best Practices

### 1. Top and Bottom Navigation
```markdown
<!-- Top Navigation -->
<!-- NAV:START -->
[Auto-generated navigation]
<!-- NAV:END -->

# Module Content

Your content here...

<!-- Bottom Navigation (same) -->
<!-- NAV:START -->
[Auto-generated navigation]
<!-- NAV:END -->
```

### 2. In-Module Content Navigation
```markdown
## Module Contents

1. [What is Redis?](content/01-what-is-redis.md)
2. [Data Structures](content/02-data-structures.md)
3. [Use Cases](content/03-use-cases.md)
```

### 3. Workshop Home Navigation
```markdown
# My Redis Workshop

## Workshop Modules

1. [✅ Redis Fundamentals](chapters/01-redis-fundamentals/README.md) - 60 min
2. [⬜ Azure Redis Options](chapters/02-azure-redis-options/README.md) - 60 min
3. [⬜ Hands-On Lab](chapters/03-hands-on-lab/README.md) - 60 min

Total Duration: 180 minutes (3 hours)
```

---

## ✅ Benefits

1. **Automatic** - Generated from workshop.config.json
2. **Always Correct** - Updates when modules are reordered
3. **Consistent** - Same format across all modules
4. **No Manual Work** - No need to edit navigation links
5. **Safe** - Clear markers prevent accidental overwrites
6. **Flexible** - Multiple navigation styles supported
7. **Module Agnostic** - Works with canonical, customized, and new modules

---

## 🚀 Recommended Implementation

**Approach:** Frontmatter Markers + Auto-Update on Build

**Workflow:**
1. Workshop creator adds/removes/reorders modules
2. Build process generates chapters/ directory
3. Navigation is injected into each README.md
4. Students see proper navigation in workshop

**Commands:**
```bash
# Build workshop (includes navigation generation)
./shared/tools/workshop-builder.py build --workshop my-workshop

# Update navigation only (without full build)
./shared/tools/workshop-builder.py update-navigation --workshop my-workshop

# Auto-update after reordering
./shared/tools/workshop-builder.py move --workshop my-workshop --module core.waf.v1 --to-position 3
# Navigation automatically updated!
```

---

**This design ensures navigation is always correct and requires zero manual maintenance!** ✅
