# Workshop Creator User Guide

> **Goal**: Make creating workshops as easy as ordering from a menu. Pick modules, customize if needed, arrange order, and build.

## 🎯 Overview

Creating a workshop involves:
1. **Browse** available modules (canonical library)
2. **Add** modules to your workshop (use as-is or fork)
3. **Customize** forked modules (if needed)
4. **Arrange** module order
5. **Build** final workshop package

---

## 📖 Core User Stories

### Story 1: Browse Available Modules

**As a workshop creator, I want to see all available modules so I can choose what to include.**

#### Current Experience
```bash
# Search for modules
./shared/tools/module-manager.py search "redis"

# View module details
./shared/tools/module-manager.py info core.redis-fundamentals.v1

# Browse in GitHub Pages
# Visit: https://tfindelkind-redis.github.io/redis-workshops/
# Click: Learning Modules → Canonical filter
```

#### What You See
```
🔍 Found 9 canonical modules:
  1. core.redis-fundamentals.v1 (60 min) [Beginner]
     Introduction to Redis core concepts
  
  2. core.azure-redis-options.v1 (60 min) [Beginner]
     Overview of Azure Cache for Redis offerings
  
  3. core.waf-overview.v1 (45 min) [Intermediate]
     Azure Well-Architected Framework for Redis
  
  ... (6 more modules)
```

---

### Story 2: Use Existing Module Without Changes

**As a workshop creator, I want to use a canonical module as-is without making a copy.**

#### Simple Approach: Reference in workshop.config.json

```json
{
  "workshopId": "my-workshop",
  "title": "My Redis Workshop",
  "modules": [
    {
      "order": 1,
      "moduleRef": "core.redis-fundamentals.v1",
      "type": "canonical",
      "required": true
    }
  ]
}
```

#### CLI Helper (Recommended)
```bash
# Add canonical module to your workshop
./shared/tools/workshop-builder.py add-module \
  --workshop my-workshop \
  --module core.redis-fundamentals.v1 \
  --position 1

✅ Added canonical module: core.redis-fundamentals.v1
📝 Updated: workshops/my-workshop/workshop.config.json
```

**Benefits:**
- ✅ No duplication
- ✅ Automatic updates when canonical improves
- ✅ Consistent across all workshops
- ✅ Zero maintenance

---

### Story 3: Use Existing Module WITH Changes

**As a workshop creator, I want to customize a module for my specific audience (e.g., add Azure examples).**

#### Step 1: Fork the Module
```bash
./shared/tools/module-manager.py fork \
  --parent core.redis-fundamentals.v1 \
  --workshop my-azure-workshop \
  --reason "Add Azure-specific examples"

🍴 Forking module...
📋 Copying 3 content files...
📝 Creating module.yaml...
🔗 Creating .lineage file...
✅ Created: workshops/my-azure-workshop/modules/redis-fundamentals/

Module ID: my-azure-workshop.redis-fundamentals.v1
Parent: core.redis-fundamentals.v1
Status: 0 customized | 3 inherited | 0 new
```

#### Step 2: Customize Content
```bash
# Edit the file you want to change
code workshops/my-azure-workshop/modules/redis-fundamentals/content/01-what-is-redis.md

# (Make your Azure-specific changes)
```

#### Step 3: Update Lineage
```bash
./shared/tools/module-manager.py update-lineage \
  --module my-azure-workshop.redis-fundamentals.v1 \
  --file content/01-what-is-redis.md \
  --status customized

✅ Updated .lineage:
   - 01-what-is-redis.md: inherited → customized
   
Status: 1 customized | 2 inherited | 0 new
```

#### Automatic Approach (Coming Soon)
```bash
# Auto-detect changes
./shared/tools/module-manager.py sync \
  --module my-azure-workshop.redis-fundamentals.v1

🔍 Scanning for changes...
✅ Detected: 01-what-is-redis.md was modified
📝 Updated .lineage automatically
```

---

### Story 4: Create a Brand New Module

**As a workshop creator, I want to create a completely new module that doesn't exist yet.**

#### Option A: Create Canonical (Reusable by Everyone)
```bash
./shared/tools/module-manager.py create \
  --type canonical \
  --name "advanced-redis-patterns" \
  --scope core \
  --duration 90 \
  --difficulty intermediate

📁 Creating canonical module structure...
✅ Created: shared/modules/advanced-redis-patterns/
   ├── module.yaml (pre-filled)
   ├── content/ (empty, ready for files)
   └── exercises/ (empty, ready for files)

Next steps:
1. Add content files: content/01-intro.md, 02-patterns.md, etc.
2. Add exercises: exercises/01-exercise.md
3. Update module.yaml with complete metadata
4. Commit to share with everyone!
```

#### Option B: Create Workshop-Specific Module
```bash
./shared/tools/module-manager.py create \
  --type workshop \
  --name "company-specific-setup" \
  --workshop my-workshop \
  --duration 30 \
  --difficulty beginner

📁 Creating workshop-specific module...
✅ Created: workshops/my-workshop/modules/company-specific-setup/
   ├── module.yaml
   └── content/

This module is private to "my-workshop"
```

---

### Story 5: Add Module to Workshop

**As a workshop creator, I want to add a module (canonical, forked, or new) to my workshop.**

```bash
# Add canonical module
./shared/tools/workshop-builder.py add \
  --workshop my-workshop \
  --module core.redis-fundamentals.v1

# Add your customized fork
./shared/tools/workshop-builder.py add \
  --workshop my-workshop \
  --module my-workshop.advanced-patterns.v1

# Add with specific position
./shared/tools/workshop-builder.py add \
  --workshop my-workshop \
  --module core.waf-overview.v1 \
  --position 2  # Insert at position 2, shift others down

✅ Added to workshop.config.json:
{
  "modules": [
    { "order": 1, "moduleRef": "core.redis-fundamentals.v1" },
    { "order": 2, "moduleRef": "core.waf-overview.v1" },      ← NEW
    { "order": 3, "moduleRef": "my-workshop.advanced-patterns.v1" }
  ]
}
```

---

### Story 6: Reorder Modules

**As a workshop creator, I want to change the order of modules in my workshop.**

#### Interactive Mode
```bash
./shared/tools/workshop-builder.py reorder --workshop my-workshop

Current order:
  1. core.redis-fundamentals.v1 (60 min)
  2. core.waf-overview.v1 (45 min)
  3. my-workshop.advanced-patterns.v1 (90 min)
  4. core.troubleshooting.v1 (60 min)

Drag to reorder (or enter new order like "1,3,2,4"):
> 1,3,2,4

✅ Reordered:
  1. core.redis-fundamentals.v1 (60 min)
  2. my-workshop.advanced-patterns.v1 (90 min)    ← MOVED UP
  3. core.waf-overview.v1 (45 min)                ← MOVED DOWN
  4. core.troubleshooting.v1 (60 min)
```

#### Direct Command
```bash
# Move module from position 3 to position 2
./shared/tools/workshop-builder.py move \
  --workshop my-workshop \
  --module my-workshop.advanced-patterns.v1 \
  --to-position 2

# Or swap two modules
./shared/tools/workshop-builder.py swap \
  --workshop my-workshop \
  --positions 2,3
```

---

### Story 7: Remove Module from Workshop

**As a workshop creator, I want to remove a module I no longer need.**

```bash
./shared/tools/workshop-builder.py remove \
  --workshop my-workshop \
  --module core.waf-overview.v1

⚠️  About to remove:
    Module: core.waf-overview.v1 (45 min)
    Position: 2
    
    This will:
    - Remove from workshop.config.json
    - Keep the module files (if customized)
    
Continue? [y/N]: y

✅ Removed from workshop
📝 Updated workshop.config.json
ℹ️  Total duration: 255 min → 210 min (45 min saved)
```

---

### Story 8: Delete Module Completely

**As a workshop creator, I want to delete a customized module I created but no longer need.**

```bash
./shared/tools/module-manager.py delete \
  --module my-workshop.old-module.v1

⚠️  WARNING: About to delete:
    Module: my-workshop.old-module.v1
    Path: workshops/my-workshop/modules/old-module/
    Files: 5
    
    This action:
    ✓ Removes module files permanently
    ✓ Removes from workshop.config.json (if present)
    ✗ CANNOT be undone
    
Continue? Type module name to confirm: my-workshop.old-module.v1

🗑️  Deleting...
✅ Deleted module files
✅ Removed from workshop.config.json
✅ Updated .workshop-index.yaml
```

---

### Story 9: Preview Workshop Structure

**As a workshop creator, I want to see what my workshop looks like before building.**

```bash
./shared/tools/workshop-builder.py preview --workshop my-workshop

📚 Workshop: My Redis Workshop
🎯 Difficulty: Intermediate
⏱️  Total Duration: 255 minutes (4h 15m)

📋 Modules:
┌────┬─────────────────────────────────────────┬──────────┬──────┬──────────┐
│ #  │ Module                                  │ Duration │ Type │ Status   │
├────┼─────────────────────────────────────────┼──────────┼──────┼──────────┤
│ 1  │ core.redis-fundamentals.v1              │ 60 min   │ 🌟   │ ✅ Ready │
│ 2  │ my-workshop.advanced-patterns.v1        │ 90 min   │ 📦   │ ✅ Ready │
│ 3  │ core.troubleshooting.v1                 │ 60 min   │ 🌟   │ ✅ Ready │
│ 4  │ my-workshop.hands-on-lab.v1             │ 45 min   │ 📦   │ ⚠️  Draft│
└────┴─────────────────────────────────────────┴──────────┴──────┴──────────┘

Legend: 🌟 Canonical | 📦 Customized

⚠️  Issues:
    - Module 4 is missing content/01-intro.md

💡 Recommendations:
    - Total duration fits 4-hour format (with 15 min buffer)
    - Consider adding breaks after modules 2 and 3
```

---

### Story 10: Build Final Workshop

**As a workshop creator, I want to generate the final workshop package that students will use.**

```bash
./shared/tools/workshop-builder.py build --workshop my-workshop

🏗️  Building workshop: my-workshop
📦 Resolving module dependencies...

Step 1: Validate modules
  ✅ core.redis-fundamentals.v1
  ✅ my-workshop.advanced-patterns.v1
  ✅ core.troubleshooting.v1

Step 2: Flatten module content
  📋 Copying inherited files from core.redis-fundamentals.v1
  ✏️  Using customized files from my-workshop.advanced-patterns.v1
  📋 Copying all files from core.troubleshooting.v1

Step 3: Generate navigation
  ✅ Created: chapters/01-redis-fundamentals/
  ✅ Created: chapters/02-advanced-patterns/
  ✅ Created: chapters/03-troubleshooting/
  ✅ Updated: README.md with navigation

Step 4: Copy assets
  ✅ Copied shared assets
  ✅ Copied module-specific assets

Step 5: Generate metadata
  ✅ Created: .workshop-manifest.json

✅ Build complete!
📁 Output: workshops/my-workshop/
⏱️  Duration: 210 minutes (3h 30m)
🔗 GitHub Pages: https://tfindelkind-redis.github.io/redis-workshops/workshops/my-workshop/

🚀 Next steps:
   1. Test locally: cd workshops/my-workshop && ./setup.sh
   2. Commit and push to deploy
   3. Share link with students!
```

---

## 🛠️ Complete Workflow Examples

### Example 1: Quick 2-Hour Workshop (All Canonical)

```bash
# Create new workshop
./shared/tools/create-workshop.sh quick-redis-intro

# Add two canonical modules
./shared/tools/workshop-builder.py add \
  --workshop quick-redis-intro \
  --module core.redis-fundamentals.v1

./shared/tools/workshop-builder.py add \
  --workshop quick-redis-intro \
  --module core.hands-on-basics.v1

# Preview
./shared/tools/workshop-builder.py preview --workshop quick-redis-intro

# Build
./shared/tools/workshop-builder.py build --workshop quick-redis-intro

# Done! Total time: 2 minutes
```

---

### Example 2: Custom 4-Hour Workshop (Mix of Canonical + Customized)

```bash
# Create workshop
./shared/tools/create-workshop.sh azure-redis-deep-dive

# Add canonical intro
./shared/tools/workshop-builder.py add \
  --workshop azure-redis-deep-dive \
  --module core.redis-fundamentals.v1

# Fork Azure module for customization
./shared/tools/module-manager.py fork \
  --parent core.azure-redis-options.v1 \
  --workshop azure-redis-deep-dive \
  --reason "Add enterprise tier deep dive"

# Customize it
code workshops/azure-redis-deep-dive/modules/azure-redis-options/content/03-enterprise.md
# (Add enterprise-specific content)

# Update lineage
./shared/tools/module-manager.py update-lineage \
  --module azure-redis-deep-dive.azure-redis-options.v1 \
  --file content/03-enterprise.md \
  --status new

# Add the customized module
./shared/tools/workshop-builder.py add \
  --workshop azure-redis-deep-dive \
  --module azure-redis-deep-dive.azure-redis-options.v1

# Add more canonical modules
./shared/tools/workshop-builder.py add \
  --workshop azure-redis-deep-dive \
  --module core.reliability-deep-dive.v1

./shared/tools/workshop-builder.py add \
  --workshop azure-redis-deep-dive \
  --module core.troubleshooting.v1

# Preview and adjust
./shared/tools/workshop-builder.py preview --workshop azure-redis-deep-dive

# Build
./shared/tools/workshop-builder.py build --workshop azure-redis-deep-dive
```

---

### Example 3: Company-Specific Workshop (New + Forked Content)

```bash
# Create workshop
./shared/tools/create-workshop.sh contoso-redis-training

# Add canonical foundation
./shared/tools/workshop-builder.py add \
  --workshop contoso-redis-training \
  --module core.redis-fundamentals.v1

# Create company-specific module
./shared/tools/module-manager.py create \
  --type workshop \
  --name "contoso-setup" \
  --workshop contoso-redis-training \
  --duration 30

# Add content to new module
mkdir -p workshops/contoso-redis-training/modules/contoso-setup/content
cat > workshops/contoso-redis-training/modules/contoso-setup/content/01-intro.md << 'EOF'
# Contoso Redis Setup
Welcome to Contoso's Redis training...
EOF

# Add the new module
./shared/tools/workshop-builder.py add \
  --workshop contoso-redis-training \
  --module contoso-redis-training.contoso-setup.v1

# Fork and customize existing module
./shared/tools/module-manager.py fork \
  --parent core.hands-on-lab.v1 \
  --workshop contoso-redis-training

# Replace exercise with Contoso data
code workshops/contoso-redis-training/modules/hands-on-lab/exercises/01-exercise.md
# (Use Contoso-specific datasets)

# Build
./shared/tools/workshop-builder.py build --workshop contoso-redis-training
```

---

## 📋 Quick Reference Commands

### Module Discovery
```bash
# Search modules
./shared/tools/module-manager.py search <query>

# View module details
./shared/tools/module-manager.py info <module-id>

# List all canonical modules
./shared/tools/module-manager.py list --type canonical

# View version tree
./shared/tools/module-manager.py tree <module-id>
```

### Module Operations
```bash
# Fork existing module
./shared/tools/module-manager.py fork --parent <id> --workshop <name>

# Create new module
./shared/tools/module-manager.py create --name <name> --type canonical|workshop

# Update lineage after editing
./shared/tools/module-manager.py update-lineage --module <id> --file <path>

# Delete module
./shared/tools/module-manager.py delete --module <id>
```

### Workshop Assembly
```bash
# Add module to workshop
./shared/tools/workshop-builder.py add --workshop <name> --module <id>

# Remove module from workshop
./shared/tools/workshop-builder.py remove --workshop <name> --module <id>

# Reorder modules
./shared/tools/workshop-builder.py move --workshop <name> --module <id> --to-position <n>
./shared/tools/workshop-builder.py swap --workshop <name> --positions <n>,<m>
./shared/tools/workshop-builder.py reorder --workshop <name>  # interactive

# Preview workshop
./shared/tools/workshop-builder.py preview --workshop <name>

# Build workshop
./shared/tools/workshop-builder.py build --workshop <name>
```

---

## 🎓 Best Practices

### When to Use Canonical vs Customized

**Use Canonical (Reference):**
- ✅ Module is perfect as-is
- ✅ You want automatic updates
- ✅ Content is audience-agnostic
- ✅ Zero maintenance desired

**Use Customized (Fork):**
- ✅ Need to add specific examples (e.g., Azure vs AWS)
- ✅ Different audience level (simplify or deepen)
- ✅ Company-specific policies or tools
- ✅ Different exercise datasets

### Module Organization Tips

1. **Start with canonical** - See what exists before creating new
2. **Fork minimally** - Only customize what's needed
3. **Track lineage** - Always update .lineage when editing
4. **Create canonical when reusable** - Share with community
5. **Keep forks synchronized** - Periodically merge parent improvements

### Workshop Design Patterns

**2-Hour Quickstart**
- 1 fundamentals module (60 min)
- 1 hands-on lab (45 min)
- 15 min buffer

**4-Hour Developer Workshop**
- 1 fundamentals (60 min)
- 1 platform-specific (60 min)
- 1 hands-on lab (60 min)
- 1 troubleshooting (45 min)
- 15 min buffer

**8-Hour Full Day**
- 2 fundamentals modules (120 min)
- 2 WAF pillars (90 min)
- 2 hands-on labs (120 min)
- 1 advanced topic (60 min)
- 30 min buffer + lunch

---

## 🚀 Next Steps

1. **Browse modules** - Visit GitHub Pages or use CLI search
2. **Create your first workshop** - Start with canonical modules
3. **Customize as needed** - Fork only what you must change
4. **Build and test** - Generate workshop package locally
5. **Deploy** - Commit and share with students!

**Questions?** Check the full documentation:
- [Module Inheritance Guide](MODULE_INHERITANCE.md)
- [Visual Diagrams](MODULE_INHERITANCE_VISUAL.md)
- [GitHub Pages Integration](GITHUB_PAGES_COMPLETE.md)
