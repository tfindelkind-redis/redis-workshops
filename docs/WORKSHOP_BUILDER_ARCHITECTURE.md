# Workshop Builder Architecture

**Created:** November 16, 2025  
**Status:** ✅ SELF-CONTAINED & INDEPENDENT

## 🎯 Overview

The **Workshop Builder** is a **fully self-contained web application** that operates **independently** from command-line tools. Workshop creators should **ONLY** use the Workshop Builder GUI to create and manage modules, workshops, and navigation.

## 🏗️ Architecture

### Complete Stack:
```
┌─────────────────────────────────────────────────────────┐
│  Workshop Builder GUI (workshop-builder-gui.html)      │
│  • Visual interface for all operations                  │
│  • Runs in browser at http://localhost:3000            │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓ HTTP API calls
┌─────────────────────────────────────────────────────────┐
│  Express REST API (server.js)                          │
│  • Handles all workshop/module operations               │
│  • Runs in Docker container                             │
└─────────────────────┬───────────────────────────────────┘
                      │
         ┌────────────┴────────────┬─────────────────┐
         ↓                         ↓                  ↓
┌──────────────────┐  ┌────────────────────┐  ┌──────────────────┐
│  workshop-ops.js │  │    git-ops.js      │  │  github-ops.js   │
│  • File I/O      │  │    • Git commits   │  │  • PR creation   │
│  • Module CRUD   │  │    • Branching     │  │  • GitHub API    │
└──────────────────┘  └────────────────────┘  └──────────────────┘
         │
         ↓ Direct file system operations
┌─────────────────────────────────────────────────────────┐
│  Repository Files (/repo)                               │
│  • workshops/                                           │
│  • shared/modules/                                      │
│  • shared/templates/                                    │
└─────────────────────────────────────────────────────────┘
```

## ✅ What Workshop Builder DOES

### 1. **Module Creation** (Built-in)
- ✅ Creates module directories directly via JavaScript
- ✅ Generates module.yaml files
- ✅ Generates README.md with proper navigation
- ✅ Auto-numbering (module-01, module-02, etc.)
- ✅ All done through `workshop-ops.js`

**Code:** `workshop-ops.js` → `createModuleDirectory()`

### 2. **Navigation Generation** (Built-in)
- ✅ Generates module navigation headers automatically
- ✅ Generates module navigation footers automatically
- ✅ Updates workshop README with module links
- ✅ All done programmatically in JavaScript

**Code:** `workshop-ops.js` → `generateModuleNavigation()` and `generateModuleFooter()`

### 3. **Workshop Operations** (Built-in)
- ✅ List all workshops
- ✅ Get workshop details
- ✅ Update workshop frontmatter
- ✅ Create new workshops
- ✅ All done through file system operations

**Code:** `workshop-ops.js` → `listWorkshops()`, `getWorkshop()`, `updateWorkshop()`, etc.

### 4. **Git Integration** (Built-in)
- ✅ Create feature branches
- ✅ Commit changes
- ✅ Push to remote
- ✅ All done through simple-git library

**Code:** `git-ops.js` → Uses `simple-git` npm package

### 5. **GitHub Integration** (Built-in)
- ✅ Create pull requests
- ✅ Update PR descriptions
- ✅ All done through @octokit/rest library

**Code:** `github-ops.js` → Uses `@octokit/rest` npm package

## ❌ What Workshop Builder DOES NOT Use

### 1. **Does NOT Call Shell Scripts**
- ❌ Does NOT call `create-module.sh`
- ❌ Does NOT call `create-workshop.sh`
- ❌ Does NOT call `validate-workshop.sh`
- ❌ Does NOT call any `.sh` scripts

**Verification:**
```bash
# Search showed NO shell script calls in application code
docker exec workshop-builder-server grep -r "\.sh" /app/
# Result: Only references in node_modules (library code)
```

### 2. **Does NOT Use Python Scripts**
- ❌ Does NOT call `workshop-builder.py`
- ❌ Does NOT call `module-manager.py`
- ❌ Does NOT call `generate-module-data.py`

### 3. **Does NOT Require Terminal Commands**
- ❌ Creators don't need terminal access
- ❌ Creators don't need to run CLI tools
- ❌ Everything is done through the GUI

## 📁 Command-Line Tools Still in Repository

These tools exist in `shared/tools/` but are **NOT used by Workshop Builder**:

```
shared/tools/
├── create-module.sh              ❌ NOT USED by Workshop Builder
├── create-workshop.sh            ❌ NOT USED by Workshop Builder
├── validate-workshop.sh          ❌ NOT USED by Workshop Builder
├── generate-module-data.js       ❌ NOT USED by Workshop Builder
├── generate-module-data.py       ❌ NOT USED by Workshop Builder
├── generate-website-data.sh      ❌ NOT USED by Workshop Builder
├── generate-workshop-data.py     ❌ NOT USED by Workshop Builder
├── module-manager.py             ❌ NOT USED by Workshop Builder
└── workshop-builder.py           ❌ NOT USED by Workshop Builder
```

### Why Do These Files Still Exist?

These are **legacy tools** for:
1. **Advanced users** who prefer CLI
2. **Automation scripts** (CI/CD)
3. **Website generation** (generate-website-data.sh)
4. **Backward compatibility**

**⚠️ Workshop creators should IGNORE these files!**

## 🎨 User Experience

### For Workshop Creators:

```
1. Open browser → http://localhost:3000
   └─→ Workshop Builder GUI loads

2. Click "Create Module" button
   └─→ Fill in form (name, duration, difficulty)
   └─→ Workshop Builder creates:
       ├── Module directory (module-01-name/)
       ├── module.yaml file
       ├── README.md with navigation
       └── Updates workshop README

3. Click "Edit Module" button
   └─→ Visual editor opens
   └─→ Make changes
   └─→ Save directly to file system

4. Click "Create PR" button
   └─→ Git commit created
   └─→ Branch pushed
   └─→ Pull request opened on GitHub

ALL DONE IN GUI! No terminal needed! 🎉
```

## 🔧 Technical Implementation

### Module Creation Example:

**Old Way (Shell Script):**
```bash
# ❌ Users had to run this in terminal
./shared/tools/create-module.sh workshop-name "Module Title"
```

**New Way (Workshop Builder):**
```javascript
// ✅ Workshop Builder does this automatically
async function createModuleDirectory(workshopId, moduleData, moduleIndex) {
    // 1. Create directory
    const folderName = `module-${String(moduleIndex + 1).padStart(2, '0')}-${name}`;
    await fs.mkdir(modulePath, { recursive: true });
    
    // 2. Generate navigation
    const header = generateModuleNavigation({ moduleName, moduleIndex, totalModules });
    const footer = generateModuleFooter({ workshopId, moduleIndex, totalModules });
    
    // 3. Create module.yaml
    await fs.writeFile(yamlPath, yaml.dump(moduleYaml), 'utf-8');
    
    // 4. Create README.md with navigation
    const content = `${header}# ${moduleName}\n\n${body}\n\n${footer}`;
    await fs.writeFile(readmePath, content, 'utf-8');
    
    return moduleInfo;
}
```

**Result:** Users just click buttons in GUI, Workshop Builder handles everything!

## 📊 Dependencies

### Workshop Builder Server:
```json
{
  "dependencies": {
    "express": "REST API server",
    "cors": "Cross-origin requests",
    "body-parser": "Parse JSON requests",
    "js-yaml": "Parse/write YAML files",
    "simple-git": "Git operations (NO shell commands)",
    "@octokit/rest": "GitHub API (NO shell commands)"
  }
}
```

**Key Point:** All operations use **JavaScript libraries**, not shell commands!

## 🚀 Deployment

### Docker Container:
```bash
# Start Workshop Builder
./start-workshop-builder.sh

# What it does:
1. Builds Docker image
2. Installs npm dependencies
3. Starts Express server on port 3000
4. Mounts /repo for file system access
5. Serves GUI at http://localhost:3000
```

### File System Access:
```
Docker Container:
  /repo → Mounted from host
  /app  → Workshop Builder application
    ├── server.js         (REST API)
    ├── workshop-ops.js   (File operations)
    ├── git-ops.js        (Git operations)
    └── github-ops.js     (GitHub API)

Host:
  /workshops            → Docker can read/write
  /shared/modules       → Docker can read/write
  /shared/templates     → Docker can read
```

## 🎯 Key Takeaways

### ✅ DO:
1. ✅ Use **Workshop Builder GUI** for all workshop operations
2. ✅ Trust Workshop Builder to handle module creation
3. ✅ Trust Workshop Builder to handle navigation
4. ✅ Trust Workshop Builder to handle Git and GitHub
5. ✅ Just use the browser interface!

### ❌ DON'T:
1. ❌ Don't use `create-module.sh` manually
2. ❌ Don't use `create-workshop.sh` manually
3. ❌ Don't run Python scripts manually
4. ❌ Don't edit navigation manually
5. ❌ Don't run terminal commands (unless troubleshooting)

## 🔍 Verification

To verify Workshop Builder is self-contained:

```bash
# 1. Check for shell script calls (should be NONE)
docker exec workshop-builder-server grep -r "execSync\|spawn\|exec" /app/*.js

# 2. Check dependencies (should be JavaScript libraries only)
docker exec workshop-builder-server cat /app/package.json

# 3. Check file operations (should be fs module only)
docker exec workshop-builder-server grep -r "require('fs')" /app/

# Result: ✅ All operations use JavaScript, no shell scripts!
```

## 📚 Documentation

For workshop creators:
- **Primary Tool:** Workshop Builder GUI at http://localhost:3000
- **Backup Documentation:** `docs/module-authoring-guide.md` (coming soon)
- **Architecture:** This file (`WORKSHOP_BUILDER_ARCHITECTURE.md`)

For developers:
- **Server Code:** `shared/tools/workshop-builder-server/`
- **GUI Code:** `shared/tools/workshop-builder-gui.html`
- **API Docs:** See inline comments in `server.js`

## 🎓 Summary

**The Workshop Builder is a complete, self-contained application that:**

1. ✅ Operates **independently** from CLI tools
2. ✅ Uses **only JavaScript** (no shell scripts)
3. ✅ Provides **full GUI** for all operations
4. ✅ Handles **everything** (modules, navigation, Git, GitHub)
5. ✅ Requires **zero terminal knowledge** from workshop creators

**Workshop creators should forget the CLI tools exist and use only the Workshop Builder GUI!** 🎉

---

**Last Updated:** November 16, 2025  
**Status:** ✅ **VERIFIED** - No shell script dependencies found in application code
