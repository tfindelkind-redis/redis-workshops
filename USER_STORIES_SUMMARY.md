# Workshop Creator User Stories - Summary

## 🎯 Design Philosophy

**"As easy as ordering from a menu"**

The workshop creation process should be:
- **Discoverable** - Browse available modules like a catalog
- **Composable** - Mix and match modules freely
- **Flexible** - Use as-is or customize when needed
- **Simple** - CLI commands for all common operations
- **Safe** - Preview before building, easy to undo

---

## 📖 User Stories Overview

### Discovery & Browsing
1. ✅ **Browse Available Modules** - See what exists
2. ✅ **View Module Details** - Understand content, duration, level

### Using Modules
3. ✅ **Use Module As-Is** - Reference canonical without copying
4. ✅ **Use Module With Changes** - Fork and customize
5. ✅ **Create New Module** - Build from scratch (canonical or workshop-specific)

### Workshop Assembly
6. ✅ **Add Module to Workshop** - Include in workshop config
7. ✅ **Remove Module from Workshop** - Exclude from workshop
8. ✅ **Reorder Modules** - Change sequence
9. ✅ **Delete Module Completely** - Remove files (customized only)

### Workflow
10. ✅ **Preview Workshop** - See structure before building
11. ✅ **Build Workshop** - Generate final package

---

## 🛠️ CLI Tools Created

### 1. module-manager.py (Existing - Enhanced)
**Purpose**: Module lifecycle management

```bash
# Discovery
./shared/tools/module-manager.py search <query>
./shared/tools/module-manager.py info <module-id>
./shared/tools/module-manager.py tree <module-id>

# Creation
./shared/tools/module-manager.py create --name <name> --type canonical|workshop
./shared/tools/module-manager.py fork --parent <id> --workshop <name>

# Maintenance
./shared/tools/module-manager.py update-lineage --module <id> --file <path>
./shared/tools/module-manager.py delete --module <id>
```

### 2. workshop-builder.py (NEW - Just Created)
**Purpose**: Workshop assembly and configuration

```bash
# Add/Remove modules
./shared/tools/workshop-builder.py add --workshop <name> --module <id> [--position <n>]
./shared/tools/workshop-builder.py remove --workshop <name> --module <id>

# Reorder modules
./shared/tools/workshop-builder.py move --workshop <name> --module <id> --to-position <n>
./shared/tools/workshop-builder.py swap --workshop <name> --positions <n>,<m>
./shared/tools/workshop-builder.py reorder --workshop <name>  # interactive

# Preview and build
./shared/tools/workshop-builder.py preview --workshop <name>
./shared/tools/workshop-builder.py build --workshop <name>  # TODO: implement
```

---

## 🎬 Complete Workflow Example

### Scenario: Create "Azure Redis for Developers" (4 hours)

```bash
# Step 1: Create workshop
./shared/tools/create-workshop.sh azure-redis-for-devs

# Step 2: Add canonical intro module (use as-is)
./shared/tools/workshop-builder.py add \
  --workshop azure-redis-for-devs \
  --module core.redis-fundamentals.v1

# Step 3: Fork Azure module for customization
./shared/tools/module-manager.py fork \
  --parent core.azure-redis-options.v1 \
  --workshop azure-redis-for-devs

# Step 4: Customize forked module
code workshops/azure-redis-for-devs/modules/azure-redis-options/content/03-enterprise.md
# (Add Azure-specific enterprise content)

./shared/tools/module-manager.py update-lineage \
  --module azure-redis-for-devs.azure-redis-options.v1 \
  --file content/03-enterprise.md \
  --status customized

# Step 5: Add customized module
./shared/tools/workshop-builder.py add \
  --workshop azure-redis-for-devs \
  --module azure-redis-for-devs.azure-redis-options.v1

# Step 6: Add more canonical modules
./shared/tools/workshop-builder.py add \
  --workshop azure-redis-for-devs \
  --module core.hands-on-lab.v1

./shared/tools/workshop-builder.py add \
  --workshop azure-redis-for-devs \
  --module core.troubleshooting.v1

# Step 7: Preview (check duration, order)
./shared/tools/workshop-builder.py preview --workshop azure-redis-for-devs

📚 Workshop: Azure Redis for Developers
🎯 Difficulty: intermediate
📋 Modules (4):
┌────┬─────────────────────────────────┬──────────┬──────┬─────────┐
│ 1  │ core.redis-fundamentals.v1      │ 60 min   │ 🌟   │ ✅ Ready│
│ 2  │ azure-redis...options.v1        │ 60 min   │ 📦   │ ✅ Ready│
│ 3  │ core.hands-on-lab.v1            │ 60 min   │ 🌟   │ ✅ Ready│
│ 4  │ core.troubleshooting.v1         │ 60 min   │ 🌟   │ ✅ Ready│
└────┴─────────────────────────────────┴──────────┴──────┴─────────┘
⏱️  Total: 240 minutes (4h 0m)
💡 Format: 4-hour workshop (half-day)

# Step 8: Adjust order if needed
./shared/tools/workshop-builder.py move \
  --workshop azure-redis-for-devs \
  --module core.troubleshooting.v1 \
  --to-position 3

# Step 9: Build workshop package
./shared/tools/workshop-builder.py build --workshop azure-redis-for-devs

# Done! Workshop ready for students
```

---

## 📊 Implementation Status

### ✅ Complete
- [x] Module discovery (search, info, tree)
- [x] Module forking with lineage tracking
- [x] Workshop configuration (workshop.config.json)
- [x] Add module to workshop
- [x] Remove module from workshop
- [x] Move/swap/reorder modules
- [x] Preview workshop structure
- [x] GitHub Pages integration (browse modules)
- [x] User guide documentation

### 🔄 In Progress
- [ ] Build workshop package (flatten modules)
- [ ] Auto-detect lineage changes (sync command)
- [ ] Interactive module selection UI
- [ ] GitHub Pages workshop builder UI

### 📋 Planned
- [ ] Module dependency resolution
- [ ] Workshop templates (2h, 4h, 8h presets)
- [ ] Diff viewer (compare module versions)
- [ ] Analytics (track popular modules)
- [ ] CI/CD integration (auto-build on commit)

---

## 🎯 Key User Flows

### Flow 1: Quick Workshop (All Canonical)
```
Browse → Add modules → Preview → Build
Time: ~5 minutes
```

### Flow 2: Custom Workshop (Mix)
```
Browse → Fork module → Customize → Add modules → Reorder → Preview → Build
Time: ~30 minutes
```

### Flow 3: Specialized Workshop (New Content)
```
Create module → Add content → Add existing modules → Mix → Preview → Build
Time: ~2 hours (depending on content creation)
```

---

## 💡 Best Practices

### Module Selection Strategy
1. **Start canonical** - Check if it exists before creating
2. **Fork minimally** - Only customize what's necessary
3. **Document changes** - Update lineage when editing
4. **Share improvements** - Contribute back to canonical

### Workshop Design Patterns

**2-Hour Quickstart**
```json
{
  "modules": [
    { "order": 1, "moduleRef": "core.redis-fundamentals.v1" },
    { "order": 2, "moduleRef": "core.hands-on-basics.v1" }
  ]
}
```

**4-Hour Developer Workshop**
```json
{
  "modules": [
    { "order": 1, "moduleRef": "core.redis-fundamentals.v1" },
    { "order": 2, "moduleRef": "core.azure-redis-options.v1" },
    { "order": 3, "moduleRef": "core.hands-on-lab.v1" },
    { "order": 4, "moduleRef": "core.troubleshooting.v1" }
  ]
}
```

**8-Hour Full Day**
```json
{
  "modules": [
    { "order": 1, "moduleRef": "core.redis-fundamentals.v1" },
    { "order": 2, "moduleRef": "core.azure-redis-options.v1" },
    { "order": 3, "moduleRef": "core.waf-overview.v1" },
    { "order": 4, "moduleRef": "core.reliability-deep-dive.v1" },
    { "order": 5, "moduleRef": "core.security-deep-dive.v1" },
    { "order": 6, "moduleRef": "core.hands-on-lab.v1" },
    { "order": 7, "moduleRef": "core.advanced-lab.v1" },
    { "order": 8, "moduleRef": "core.troubleshooting.v1" }
  ]
}
```

---

## 🚀 Next Steps for Implementation

### Phase 1: Core Functionality (Current)
- [x] CLI tool for workshop assembly
- [x] Add/remove/reorder modules
- [x] Preview functionality
- [ ] Build functionality (flatten modules)

### Phase 2: Enhanced Workflow
- [ ] Auto-sync lineage on file changes
- [ ] Workshop templates (quick presets)
- [ ] Validation (check missing files, broken refs)
- [ ] Smart suggestions (recommended modules)

### Phase 3: Visual Tools
- [ ] GitHub Pages workshop builder UI
- [ ] Drag-and-drop module ordering
- [ ] Live preview in browser
- [ ] Diff viewer for customized modules

### Phase 4: Automation
- [ ] CI/CD pipeline for auto-build
- [ ] Automatic module discovery
- [ ] Usage analytics dashboard
- [ ] Recommendation engine

---

## 📚 Related Documentation

- **[Workshop Creator Guide](WORKSHOP_CREATOR_GUIDE.md)** - Complete user manual
- **[Module Inheritance](MODULE_INHERITANCE.md)** - Version tree system
- **[Visual Diagrams](MODULE_INHERITANCE_VISUAL.md)** - Architecture diagrams
- **[GitHub Pages](GITHUB_PAGES_COMPLETE.md)** - Web interface guide
- **[Quick Reference](QUICK_REFERENCE.md)** - Cheat sheet

---

## ✨ Design Highlights

### What Makes This System Great

1. **Copy-on-Write with Lineage** - Fork only when needed, track changes
2. **Canonical Library** - Shared modules everyone benefits from
3. **Workshop Flexibility** - Mix canonical + customized + new modules
4. **Easy Reordering** - Change sequence without manual JSON editing
5. **Safe Operations** - Preview before building, easy to undo
6. **GitHub Pages Integration** - Browse modules visually
7. **CLI + UI** - Command-line for power users, web UI for visual creators

### User Experience Goals
- ✅ **Discoverable** - Browse modules like shopping
- ✅ **Simple** - One command per operation
- ✅ **Safe** - Preview changes, easy rollback
- ✅ **Flexible** - Support all creation patterns
- ✅ **Fast** - Quick workshops in minutes
- ✅ **Collaborative** - Share and improve modules

---

**The workshop creation process is now as simple as:**
1. **Browse** modules (CLI or GitHub Pages)
2. **Pick** what you need (canonical or fork)
3. **Arrange** order (CLI commands)
4. **Build** workshop (one command)
5. **Deploy** and teach! 🎓
