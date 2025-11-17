# Command-Line Tools - Purpose & Usage

**Created:** November 16, 2025  
**Audience:** Advanced users and automation scripts  
**⚠️ Note:** Workshop creators should use **Workshop Builder GUI** instead!

## 🎯 Overview

The command-line tools in `shared/tools/` are **legacy tools** for advanced users and automation. They are **NOT** used by the Workshop Builder and **NOT** required for creating workshops.

## 📁 Tool Inventory

### Module Management

#### `create-module.sh`
**Purpose:** Create a new module via command line  
**Workshop Builder Status:** ❌ NOT USED  
**Use Case:** Advanced users who prefer CLI  

**Example:**
```bash
./shared/tools/create-module.sh workshop-id "Module Title"
```

**What it does:**
- Creates module directory
- Generates module.yaml
- Creates README.md
- Updates workshop README

**⚠️ Recommendation:** Use Workshop Builder GUI instead!

---

### Workshop Management

#### `create-workshop.sh`
**Purpose:** Create a new workshop via command line  
**Workshop Builder Status:** ❌ NOT USED  
**Use Case:** Advanced users who prefer CLI  

**Example:**
```bash
./shared/tools/create-workshop.sh "Workshop Title"
```

**What it does:**
- Creates workshop directory
- Generates README.md with frontmatter
- Creates initial structure

**⚠️ Recommendation:** Use Workshop Builder GUI instead!

---

#### `validate-workshop.sh`
**Purpose:** Validate workshop structure and frontmatter  
**Workshop Builder Status:** ❌ NOT USED  
**Use Case:** CI/CD pipelines, pre-commit hooks  

**Example:**
```bash
./shared/tools/validate-workshop.sh workshop-id
```

**What it checks:**
- Frontmatter validity
- Required fields
- Module structure
- File existence

**⚠️ Use Case:** Automated validation in CI/CD, not for manual use

---

### Data Generation

#### `generate-website-data.sh`
**Purpose:** Generate data for GitHub Pages website  
**Workshop Builder Status:** ❌ NOT USED (different purpose)  
**Use Case:** Website deployment automation  

**Example:**
```bash
./shared/tools/generate-website-data.sh
```

**What it does:**
- Scans all workshops
- Generates JSON data
- Outputs to website directory
- Used for GitHub Pages deployment

**⚠️ Use Case:** Automated website deployment only

---

#### `generate-module-data.js` / `generate-module-data.py`
**Purpose:** Generate module metadata for website  
**Workshop Builder Status:** ❌ NOT USED (different purpose)  
**Use Case:** Website data generation  

**Example:**
```bash
node shared/tools/generate-module-data.js
# or
python3 shared/tools/generate-module-data.py
```

**What it does:**
- Extracts module metadata
- Generates JSON output
- Used by website generation

**⚠️ Use Case:** Website deployment automation only

---

#### `generate-workshop-data.py`
**Purpose:** Generate workshop metadata for website  
**Workshop Builder Status:** ❌ NOT USED (different purpose)  
**Use Case:** Website data generation  

**Example:**
```bash
python3 shared/tools/generate-workshop-data.py
```

**What it does:**
- Extracts workshop metadata
- Generates JSON output
- Used by website generation

**⚠️ Use Case:** Website deployment automation only

---

### Python Tools

#### `module-manager.py`
**Purpose:** Python-based module management  
**Workshop Builder Status:** ❌ NOT USED  
**Use Case:** Python-based automation scripts  

**Example:**
```bash
python3 shared/tools/module-manager.py <command>
```

**What it does:**
- Module CRUD operations
- Navigation generation
- Python alternative to shell scripts

**⚠️ Recommendation:** Use Workshop Builder GUI instead!

---

#### `workshop-builder.py`
**Purpose:** Python-based workshop builder  
**Workshop Builder Status:** ❌ NOT USED (predecessor)  
**Use Case:** Legacy tool, replaced by Node.js version  

**Example:**
```bash
python3 shared/tools/workshop-builder.py
```

**What it does:**
- Legacy workshop management
- Replaced by modern Workshop Builder

**⚠️ Status:** DEPRECATED - Use Workshop Builder GUI instead!

---

## 🎯 Tool Categories

### Category 1: Workshop Creation (GUI Replacements)
**These tools do the same thing as Workshop Builder GUI:**

| Tool | GUI Equivalent | Recommendation |
|------|---------------|----------------|
| `create-module.sh` | "Create Module" button | ✅ Use GUI |
| `create-workshop.sh` | "Create Workshop" button | ✅ Use GUI |
| `module-manager.py` | Module management features | ✅ Use GUI |
| `workshop-builder.py` | Entire GUI (legacy) | ✅ Use GUI |

### Category 2: Validation (CI/CD)
**These tools are for automation:**

| Tool | Purpose | Recommendation |
|------|---------|----------------|
| `validate-workshop.sh` | CI/CD validation | 🤖 Automated use only |

### Category 3: Website Generation
**These tools are for website deployment:**

| Tool | Purpose | Recommendation |
|------|---------|----------------|
| `generate-website-data.sh` | Website deployment | 🌐 Website automation only |
| `generate-module-data.js` | Website metadata | 🌐 Website automation only |
| `generate-module-data.py` | Website metadata | 🌐 Website automation only |
| `generate-workshop-data.py` | Website metadata | 🌐 Website automation only |

## 📊 When to Use What

### For Workshop Creators:
```
┌─────────────────────────────────────────────┐
│  ALWAYS Use: Workshop Builder GUI          │
│  URL: http://localhost:3000                 │
│                                             │
│  ✅ Create modules                          │
│  ✅ Edit navigation                         │
│  ✅ Manage workshops                        │
│  ✅ Create pull requests                    │
│                                             │
│  ❌ Don't use CLI tools                     │
└─────────────────────────────────────────────┘
```

### For Advanced Users:
```
┌─────────────────────────────────────────────┐
│  Option 1: Workshop Builder GUI (Easier)   │
│  URL: http://localhost:3000                 │
│                                             │
│  Option 2: CLI Tools (Advanced)             │
│  • create-module.sh                         │
│  • create-workshop.sh                       │
│                                             │
│  Recommendation: Still use GUI!             │
└─────────────────────────────────────────────┘
```

### For CI/CD:
```
┌─────────────────────────────────────────────┐
│  Automated Workflows:                       │
│                                             │
│  • validate-workshop.sh                     │
│    └─→ In GitHub Actions                    │
│                                             │
│  • generate-website-data.sh                 │
│    └─→ Website deployment                   │
└─────────────────────────────────────────────┘
```

## 🔄 Migration Status

### Old CLI → New GUI

| Old Tool | Status | New Tool |
|----------|--------|----------|
| `workshop-builder.py` | 🔴 DEPRECATED | Workshop Builder GUI |
| `create-module.sh` | 🟡 LEGACY | Workshop Builder GUI |
| `create-workshop.sh` | 🟡 LEGACY | Workshop Builder GUI |
| `module-manager.py` | 🟡 LEGACY | Workshop Builder GUI |
| `validate-workshop.sh` | 🟢 ACTIVE (CI/CD) | No replacement needed |
| `generate-*-data.*` | 🟢 ACTIVE (Website) | No replacement needed |

**Legend:**
- 🔴 DEPRECATED = Do not use, replaced
- 🟡 LEGACY = Works but GUI preferred
- 🟢 ACTIVE = Still actively used (automation)

## 🎓 Learning Path

### For New Workshop Creators:

```
Step 1: Ignore CLI tools
   ↓
Step 2: Open Workshop Builder GUI
   ↓
Step 3: Click buttons in GUI
   ↓
Step 4: Workshop created! 🎉
```

**Don't learn CLI tools unless you're an advanced user!**

### For Advanced Users:

```
Step 1: Try Workshop Builder GUI first
   ↓
Step 2: If GUI doesn't meet needs, explore CLI
   ↓
Step 3: Read CLI tool documentation
   ↓
Step 4: Use at your own risk
   ↓
Recommendation: Stick with GUI!
```

## 📝 Examples

### Creating a Module

**❌ Old CLI Way:**
```bash
# Terminal commands (complex)
cd shared/tools
./create-module.sh intro-to-redis "Introduction to Redis"
cd ../../workshops/intro-to-redis
ls -la
```

**✅ New GUI Way:**
```
1. Open http://localhost:3000
2. Click "Create Module"
3. Fill form:
   - Name: "Introduction to Redis"
   - Duration: 30
   - Difficulty: Beginner
4. Click "Create"
5. Done! 🎉
```

**Result:** Same outcome, GUI is easier!

### Validating a Workshop

**🤖 Automated (CI/CD):**
```yaml
# .github/workflows/validate.yml
- name: Validate workshops
  run: ./shared/tools/validate-workshop.sh intro-to-redis
```

**✅ Manual (GUI):**
```
1. Open Workshop Builder
2. Workshop structure auto-validated
3. Errors shown in GUI
4. Fix in GUI
5. Done! 🎉
```

### Generating Website Data

**🌐 Automated (Deployment):**
```bash
# Automated script
./shared/tools/generate-website-data.sh
# Outputs to website directory
```

**⚠️ Not needed for workshop creators!**

## 🎯 Summary

### For Workshop Creators:
- ✅ **USE:** Workshop Builder GUI
- ❌ **IGNORE:** All CLI tools in `shared/tools/`
- 🎉 **RESULT:** Easier workflow, same results!

### For Advanced Users:
- 🟡 **OPTION 1:** Workshop Builder GUI (recommended)
- 🟡 **OPTION 2:** CLI tools (if you must)
- 💡 **TIP:** GUI is easier, even for advanced users!

### For Automation:
- 🤖 **CI/CD:** `validate-workshop.sh`
- 🌐 **Website:** `generate-*-data.*`
- ✅ **These are fine to use!**

## 📚 See Also

- **Workshop Builder Architecture:** `WORKSHOP_BUILDER_ARCHITECTURE.md`
- **Module Authoring Guide:** `module-authoring-guide.md` (coming soon)
- **Workshop Creation Guide:** `workshop-creation-guide.md`

---

**Last Updated:** November 16, 2025  
**Recommendation:** **Use Workshop Builder GUI for all workshop operations!** 🎉
