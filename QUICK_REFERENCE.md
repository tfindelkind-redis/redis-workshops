# Quick Reference Card

## 🚀 Module Manager Commands

```bash
# Search for modules
./shared/tools/module-manager.py search [query]

# View version tree
./shared/tools/module-manager.py tree [module-name]

# Fork a module
./shared/tools/module-manager.py fork \
  --from SOURCE_MODULE_ID \
  --to DESTINATION_PATH \
  --description "What you're customizing"

# Get module details
./shared/tools/module-manager.py info MODULE_ID
```

## 🔨 Workshop Builder Commands

```bash
# Add module to workshop
./shared/tools/workshop-builder.py add \
  --workshop WORKSHOP_NAME \
  --module MODULE_ID

# Remove module from workshop
./shared/tools/workshop-builder.py remove \
  --workshop WORKSHOP_NAME \
  --module MODULE_ID

# Reorder modules
./shared/tools/workshop-builder.py reorder \
  --workshop WORKSHOP_NAME

# Preview workshop structure
./shared/tools/workshop-builder.py preview \
  --workshop WORKSHOP_NAME

# Generate navigation
./shared/tools/workshop-builder.py update-navigation \
  --workshop WORKSHOP_NAME

# Build workshop (flatten for deployment)
./shared/tools/workshop-builder.py build \
  --workshop WORKSHOP_NAME \
  [--output-dir PATH]
```

## 🎯 Complete Workshop Workflow

```bash
# 1. Create workshop
bash shared/tools/create-workshop.sh my-workshop "My Workshop" "4 hours"

# 2. Add modules
./shared/tools/workshop-builder.py add --workshop my-workshop --module core.redis-fundamentals.v1
./shared/tools/workshop-builder.py add --workshop my-workshop --module core.azure-redis-options.v1

# 3. (Optional) Customize modules
./shared/tools/module-manager.py fork \
  --from core.redis-fundamentals.v1 \
  --to workshops/my-workshop/modules/redis-fundamentals
# Edit: workshops/my-workshop/modules/redis-fundamentals/content/*.md

# 4. Generate navigation
./shared/tools/workshop-builder.py update-navigation --workshop my-workshop

# 5. Build for deployment
./shared/tools/workshop-builder.py build --workshop my-workshop

# 6. Deploy
cp -r workshops/my-workshop/build/* docs/workshops/my-workshop/
git add . && git commit -m "Deploy workshop" && git push
```

## 📁 Module Structure

```
your-module/
├── module.yaml       # Metadata & configuration
├── .lineage          # Tracks parent & customizations
└── content/          # Content files
    ├── 01-intro.md
    ├── 02-main.md
    └── exercises/
```

## 🏷️ File Status Types

| Status | Meaning | Action |
|--------|---------|--------|
| **inherited** | Unchanged from parent | Auto-copied during build |
| **customized** | Modified after fork | Use local version |
| **new** | Doesn't exist in parent | Include as-is |

## 📊 Module ID Format

```
scope.module-name.version

Examples:
  core.redis-fundamentals.v1         # Canonical
  azure-waf.redis-fundamentals.v1    # Azure-specific
  enterprise.redis-fundamentals.v1   # Enterprise version
```

## ⚙️ Workflow in 4 Steps

### 1. Search
```bash
./shared/tools/module-manager.py search redis
```
Find modules matching your needs

### 2. View Tree
```bash
./shared/tools/module-manager.py tree redis-fundamentals
```
See all versions and choose closest match

### 3. Fork
```bash
./shared/tools/module-manager.py fork \
  --from core.redis-fundamentals.v1 \
  --to workshops/my-workshop/modules/redis-fundamentals \
  --description "Azure version with compliance focus"
```

### 4. Customize
- Edit content files as needed
- Update `.lineage` to mark customized files
- Add new files for additional content

## 📝 .lineage File Template

```yaml
module_id: "your-workshop.module-name.v1"
parent_module: "parent-workshop.module-name.v1"
parent_path: "path/to/parent/module"

created: "2025-11-12T18:00:00Z"
created_by: "your-name"
description: "What makes this version unique"

files:
  # Unchanged from parent
  filename.md:
    status: inherited
    source: "path/to/parent/file.md"
  
  # Modified from parent
  another-file.md:
    status: customized
    source: "path/to/parent/another-file.md"
    customization_date: "2025-11-12T18:15:00Z"
    changes:
      - "Added Azure-specific examples"
      - "Updated pricing information"
  
  # Doesn't exist in parent
  new-file.md:
    status: new
    created: "2025-11-12T18:30:00Z"
    description: "New compliance section"
```

## 🎯 Best Practices

### ✅ DO
- Fork from closest match (not always canonical)
- Customize only what's necessary
- Document changes in .lineage
- Use clear, descriptive module IDs
- Keep modules 45-90 minutes

### ❌ DON'T
- Don't fork canonical if specialized version exists
- Don't customize without updating .lineage
- Don't make modules too small (<30 min)
- Don't make modules too large (>120 min)
- Don't duplicate content unnecessarily

## 🌳 Version Tree Example

```
core.redis-fundamentals.v1 (CANONICAL)
└─➤ azure.redis-fundamentals.v1
    ├─➤ enterprise.redis-fundamentals.v1
    └─➤ quickstart.redis-fundamentals.v1
```

## 📏 Module Sizing Guidelines

| Duration | Use Case |
|----------|----------|
| 30-45 min | Quick intro or focused topic |
| 60 min | **Ideal size** - Full topic coverage |
| 75-90 min | Deep dive with extensive exercises |
| 120+ min | **Too large** - Split into multiple modules |

## 🔍 Search Output

```
============================================================
📦 CANONICAL MODULES
============================================================
🌟 Module Name
   ID: core.module-name.v1
   📁 shared/modules/module-name
   ⏱️  60 minutes
   📝 Description...
   🏷️  Tags: tag1, tag2

============================================================
🔀 CUSTOMIZED VERSIONS (N found)
============================================================
📦 Module Name
   ID: workshop.module-name.v1
   📁 workshops/workshop-name/modules/module-name
   🔗 Parent: core.module-name.v1
   📝 Description...
```

## 🎨 Icon Legend

| Icon | Meaning |
|------|---------|
| 🌟 | Canonical module |
| 📦 | Customized module |
| 📁 | File path |
| ⏱️ | Duration |
| 📝 | Description |
| 🏷️ | Tags |
| 🔗 | Parent link |
| 📊 | Statistics |
| ✅ | Success/Completed |
| ⚠️ | Warning |
| ❌ | Error |

## 🔧 Troubleshooting

### "Module not found"
- Check spelling of module ID
- Run `search` to see available modules
- Verify you're in repository root

### "Destination already exists"
- Choose different destination path
- Remove existing directory first
- Check if you've already forked

### "Parent module not found"
- Verify parent module ID is correct
- Run `search` to find available modules
- Check parent module exists in repository

## 📚 Documentation

- **Full Guide**: See `MODULE_INHERITANCE.md`
- **Visual Guide**: See `MODULE_INHERITANCE_VISUAL.md`
- **Proof of Concept**: See `PROOF_OF_CONCEPT_SUMMARY.md`

## 💡 Tips

1. **Search first** - Existing version might already have what you need
2. **View tree** - See all variants before forking
3. **Fork closest match** - Minimize customization needed
4. **Document changes** - Future you will thank you
5. **Keep it modular** - 60 minutes is the sweet spot

---

**Need help?** Run: `./shared/tools/module-manager.py --help`
