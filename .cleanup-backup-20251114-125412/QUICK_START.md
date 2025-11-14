# Workshop Creator - Quick Reference Card

## 🚀 Common Commands

### Discovery
```bash
# Browse all modules
./shared/tools/module-manager.py search ""

# Search for specific topic
./shared/tools/module-manager.py search "redis fundamentals"

# Get module details
./shared/tools/module-manager.py info core.redis-fundamentals.v1

# See version tree
./shared/tools/module-manager.py tree core.redis-fundamentals.v1
```

### Creating Modules
```bash
# Fork existing module
./shared/tools/module-manager.py fork \
  --parent core.redis-fundamentals.v1 \
  --workshop my-workshop

# Create new canonical module
./shared/tools/module-manager.py create \
  --type canonical \
  --name "advanced-patterns" \
  --scope core \
  --duration 90

# Create workshop-specific module
./shared/tools/module-manager.py create \
  --type workshop \
  --name "company-setup" \
  --workshop my-workshop
```

### Assembling Workshops
```bash
# Add module
./shared/tools/workshop-builder.py add \
  --workshop my-workshop \
  --module core.redis-fundamentals.v1

# Add at specific position
./shared/tools/workshop-builder.py add \
  --workshop my-workshop \
  --module core.waf-overview.v1 \
  --position 2

# Remove module
./shared/tools/workshop-builder.py remove \
  --workshop my-workshop \
  --module core.waf-overview.v1

# Preview workshop
./shared/tools/workshop-builder.py preview \
  --workshop my-workshop
```

### Reordering
```bash
# Move module to position
./shared/tools/workshop-builder.py move \
  --workshop my-workshop \
  --module core.troubleshooting.v1 \
  --to-position 3

# Swap two positions
./shared/tools/workshop-builder.py swap \
  --workshop my-workshop \
  --positions 2,3

# Interactive reorder
./shared/tools/workshop-builder.py reorder \
  --workshop my-workshop
```

---

## ⚡ Quick Workflows

### 2-Hour Workshop (5 minutes)
```bash
./shared/tools/create-workshop.sh quick-intro
./shared/tools/workshop-builder.py add --workshop quick-intro --module core.redis-fundamentals.v1
./shared/tools/workshop-builder.py add --workshop quick-intro --module core.hands-on-basics.v1
./shared/tools/workshop-builder.py preview --workshop quick-intro
```

### 4-Hour Workshop with Customization (30 minutes)
```bash
./shared/tools/create-workshop.sh my-workshop
./shared/tools/module-manager.py fork --parent core.azure-redis-options.v1 --workshop my-workshop
# (Edit customized files)
./shared/tools/workshop-builder.py add --workshop my-workshop --module core.redis-fundamentals.v1
./shared/tools/workshop-builder.py add --workshop my-workshop --module my-workshop.azure-redis-options.v1
./shared/tools/workshop-builder.py add --workshop my-workshop --module core.hands-on-lab.v1
./shared/tools/workshop-builder.py preview --workshop my-workshop
```

---

## 📝 Module Types

| Type | Icon | Location | Use When |
|------|------|----------|----------|
| Canonical | 🌟 | `shared/modules/` | Perfect as-is |
| Customized | 📦 | `workshops/*/modules/` | Need changes |
| Legacy Chapter | 📄 | `**/chapters/` | Old format |

---

## 🎯 Workshop Formats

| Duration | Modules | Example |
|----------|---------|---------|
| 2 hours | 2 | Intro + Lab |
| 4 hours | 4 | Intro + Platform + Lab + Troubleshooting |
| 8 hours | 8-9 | Full curriculum |

---

## 💡 Best Practices

✅ **DO**
- Start with canonical modules
- Fork only when needed
- Update lineage after editing
- Preview before building
- Test locally first

❌ **DON'T**
- Copy modules manually
- Edit canonical modules directly
- Forget to update lineage
- Skip preview step
- Deploy without testing

---

## 🔗 Quick Links

- **GitHub Pages**: https://tfindelkind-redis.github.io/redis-workshops/
- **Full Guide**: [WORKSHOP_CREATOR_GUIDE.md](WORKSHOP_CREATOR_GUIDE.md)
- **Visual Guide**: [WORKFLOW_VISUAL_GUIDE.md](WORKFLOW_VISUAL_GUIDE.md)
- **User Stories**: [USER_STORIES_SUMMARY.md](USER_STORIES_SUMMARY.md)

---

## 🆘 Troubleshooting

**Module not found?**
```bash
# Check module exists
./shared/tools/module-manager.py search <module-name>
```

**Wrong order?**
```bash
# Reorder interactively
./shared/tools/workshop-builder.py reorder --workshop <name>
```

**Need to undo?**
```bash
# Remove module
./shared/tools/workshop-builder.py remove --workshop <name> --module <id>
```

**Want to see structure?**
```bash
# Always preview first!
./shared/tools/workshop-builder.py preview --workshop <name>
```

---

**Happy workshop creating! 🎓**
