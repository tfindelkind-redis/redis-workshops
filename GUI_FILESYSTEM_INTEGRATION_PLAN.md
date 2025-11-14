# Workshop Builder GUI - Filesystem Integration Plan

## 🎯 Goal
Transform the Workshop Builder GUI from a browser-only localStorage tool into a file-system integrated tool that:
1. Works directly with workshop files in the repository
2. Creates Git branches automatically
3. Loads existing workshops (not just drafts)
4. Saves changes to actual workshop README.md frontmatter
5. Only modifies navigation and metadata (never content)

## 📋 Current vs. Target Architecture

### Current (Browser-Only)
```
User → GUI → localStorage → Export JSON → CLI Build
```

### Target (Filesystem-Integrated)
```
User → GUI → Git Branch → Load/Edit Workshop Files → Save to Frontmatter → Commit
```

## 🔧 Technical Requirements

### 1. Git Integration
**Challenge:** Browser JavaScript cannot directly access filesystem or run Git commands

**Solutions:**
- **Option A: Local Server Backend** (Recommended)
  - Create Node.js/Python backend server
  - GUI sends HTTP requests to server
  - Server handles Git operations and file I/O
  - Works on localhost during development

- **Option B: VS Code Extension**
  - Package GUI as VS Code extension
  - Use VS Code API for filesystem access
  - Built-in Git integration
  - More complex but native experience

- **Option C: GitHub Codespaces with Terminal Proxy**
  - GUI runs in Codespaces browser
  - Use terminal/shell scripts for Git operations
  - File I/O through server endpoints
  - Best for cloud-based workflow

### 2. Workshop File Structure
```
workshops/
├── test-workshop/
│   ├── README.md              # Contains frontmatter with metadata
│   ├── workshop.config.json   # Optional config (currently empty)
│   └── chapters/              # Workshop-specific content (DON'T MODIFY)
└── redis-fundamentals/
    ├── README.md
    └── chapters/
```

**Frontmatter Format:**
```yaml
---
workshopId: test-workshop
title: Test Workshop
description: Brief description
duration: 4 hours
difficulty: intermediate
chapters: shared/chapters/chapter-01-getting-started
---
```

### 3. Operations to Support

#### A. Initialize (On App Start)
1. Check if on a branch (not `main`)
2. If on `main`, create new branch: `workshop-builder-{timestamp}`
3. Switch to that branch
4. Show current branch in UI header

#### B. Load Workshop
1. Scan `workshops/` directory for all workshop folders
2. Parse each `README.md` frontmatter
3. Display workshop browser with:
   - Workshop ID
   - Title
   - Description
   - Difficulty
   - Current module list
4. User selects workshop
5. Load frontmatter data into GUI
6. Populate module list from `chapters:` field

#### C. Edit Workshop
- **Metadata:** Edit in sidebar (title, description, duration, difficulty)
- **Modules:** 
  - Add modules (from canonical library)
  - Remove modules
  - Reorder modules (drag-and-drop)
  - Preview navigation structure
- **Constraints:**
  - Never modify content files (`chapters/*/README.md`)
  - Only update frontmatter in workshop `README.md`

#### D. Save Workshop
1. Build updated frontmatter YAML
2. Read current workshop `README.md`
3. Replace frontmatter section (between `---` delimiters)
4. Write file back to disk
5. Show success notification
6. Option to commit changes

#### E. Create New Workshop
1. Prompt for workshop ID (validate: lowercase, hyphens only)
2. Create `workshops/{id}/` directory
3. Create `README.md` with template frontmatter
4. Create empty `chapters/` directory
5. Open in editor for module addition

## 🏗️ Implementation Architecture

### Backend API Endpoints (Node.js/Express)

```javascript
// Git Operations
POST /api/git/branch/create    // Create new branch
GET  /api/git/branch/current    // Get current branch
POST /api/git/branch/switch     // Switch branch
POST /api/git/commit            // Commit changes

// Workshop Operations
GET  /api/workshops             // List all workshops
GET  /api/workshops/:id         // Get specific workshop
POST /api/workshops             // Create new workshop
PUT  /api/workshops/:id         // Update workshop frontmatter
DEL  /api/workshops/:id         // Delete workshop

// Module Operations
GET  /api/modules/canonical     // List canonical modules
GET  /api/modules/:id           // Get module metadata
```

### Frontend Changes (GUI)

**New Components:**
1. **Branch Indicator** - Show current Git branch in header
2. **Workshop Loader** - Load from filesystem, not localStorage
3. **File-backed Storage** - Replace localStorage with API calls
4. **Commit Dialog** - Option to commit after save
5. **Validation** - Ensure frontmatter format is correct

**Modified Workflows:**
1. **App Init** → Check/create branch → Load available workshops
2. **Load Workshop** → Fetch from filesystem → Parse frontmatter
3. **Save Workshop** → Update frontmatter → Write to disk → Optional commit
4. **Export** → Still support JSON export for sharing

## 📝 Implementation Steps

### Phase 1: Backend Server Setup ⏳
1. Create `shared/tools/workshop-builder-server/` directory
2. Initialize Node.js project with Express
3. Implement Git wrapper (using `simple-git` library)
4. Implement filesystem operations
5. Create API endpoints
6. Add CORS for local GUI access

### Phase 2: GUI Integration ⏳
1. Add backend configuration (API URL)
2. Replace localStorage calls with API calls
3. Add branch indicator to header
4. Update workshop loader to fetch from API
5. Modify save operation to use API
6. Add commit dialog UI

### Phase 3: Frontmatter Parsing ⏳
1. Create YAML parser utility
2. Extract frontmatter from README.md
3. Build `chapters:` field from module list
4. Write frontmatter back to file
5. Preserve content sections (everything after frontmatter)

### Phase 4: Safety & Validation ⏳
1. Validate workshop IDs (no spaces, special chars)
2. Check for existing workshops before create
3. Confirm before overwriting existing files
4. Validate frontmatter YAML syntax
5. Add undo/rollback capability

### Phase 5: Testing ⏳
1. Test branch creation/switching
2. Test loading existing workshops
3. Test editing metadata
4. Test reordering modules
5. Test saving changes
6. Test commit workflow
7. Test error handling

## 🛡️ Safety Constraints

### What GUI CAN Modify:
✅ Workshop README.md frontmatter
✅ Workshop metadata (title, description, duration, difficulty)
✅ Module list and order (`chapters:` field)
✅ Workshop directory structure (create/delete workshops)

### What GUI CANNOT Modify:
❌ Module content files (`shared/chapters/*/README.md`)
❌ Canonical module library
❌ Workshop content sections (below frontmatter)
❌ Chapter content files (`workshops/*/chapters/*/README.md`)

## 📊 File Format Example

### Before (Current)
Workshop stored in browser localStorage as JSON:
```json
{
  "workshopId": "my-workshop",
  "title": "My Workshop",
  "modules": ["core.redis-fundamentals.v1", "..."]
}
```

### After (Target)
Workshop stored in `workshops/my-workshop/README.md`:
```markdown
---
workshopId: my-workshop
title: My Workshop
description: Learn Redis fundamentals
duration: 4 hours
difficulty: intermediate
chapters: core.redis-fundamentals.v1,core.azure-redis-options.v1
---

# My Workshop

[Content sections remain untouched by GUI]
```

## 🚀 Deployment Options

### Development (Local)
```bash
# Terminal 1: Start backend server
cd shared/tools/workshop-builder-server
npm install
npm start
# Server runs on http://localhost:3000

# Terminal 2: Open GUI
open shared/tools/workshop-builder-gui.html
# GUI connects to localhost:3000
```

### Production (Codespaces)
1. Backend runs as Codespaces service
2. GUI served through Codespaces port forwarding
3. Auto-detect Codespaces environment
4. Use forwarded port for API

### Alternative: VS Code Extension
1. Package as VS Code extension
2. Use VS Code filesystem API
3. Use VS Code Git API
4. No separate server needed
5. Native integration

## 🎯 User Experience Flow

### Scenario 1: Edit Existing Workshop
1. User opens Workshop Builder GUI
2. GUI shows: "Current branch: workshop-builder-20250114"
3. Click "Load Workshop" button
4. Workshop browser shows all workshops from `workshops/`
5. Select "Redis Fundamentals"
6. GUI loads frontmatter data
7. Edit metadata: Change duration from "4 hours" to "5 hours"
8. Reorder modules: Drag module 3 to position 1
9. Click "Save Workshop"
10. GUI updates README.md frontmatter
11. Show success: "Saved to workshops/redis-fundamentals/README.md"
12. Option: "Commit Changes Now?" → Yes
13. Git commit with message: "Update Redis Fundamentals workshop"

### Scenario 2: Create New Workshop
1. Click "New Workshop" button
2. Enter workshop ID: "my-redis-workshop"
3. GUI creates: `workshops/my-redis-workshop/`
4. Creates template README.md with frontmatter
5. Add modules from browser
6. Arrange order
7. Fill metadata
8. Click "Save Workshop"
9. Commit changes
10. Export JSON for sharing (optional)

## 🔧 Technical Decisions

### Decision 1: Backend Technology
**Chosen: Node.js + Express**
- Lightweight and fast
- Good Git integration (`simple-git` library)
- Easy YAML parsing (`js-yaml`)
- Can run in Codespaces
- Minimal dependencies

### Decision 2: Communication Protocol
**Chosen: REST API over HTTP**
- Simple and standard
- Works with CORS for local dev
- Easy to debug
- No WebSocket complexity needed

### Decision 3: Git Strategy
**Chosen: Branch per session**
- Always create new branch on app start
- Never work directly on `main`
- Easy to review changes via PR
- Safe rollback if needed
- Branch name: `workshop-builder-{timestamp}`

### Decision 4: Frontmatter Format
**Chosen: YAML (keep existing format)**
- Already used in workshops
- Human-readable
- Easy to parse (`js-yaml`)
- Supported by Jekyll/GitHub Pages

## 📦 Dependencies

### Backend (Node.js)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "simple-git": "^3.20.0",
    "js-yaml": "^4.1.0",
    "body-parser": "^1.20.2"
  }
}
```

### Frontend (GUI)
- No new dependencies
- Keep pure JavaScript
- Add fetch() calls to API
- Add error handling

## 🧪 Testing Checklist

- [ ] Create new branch on app start
- [ ] List all existing workshops
- [ ] Load workshop from filesystem
- [ ] Parse frontmatter correctly
- [ ] Edit metadata fields
- [ ] Add modules to workshop
- [ ] Remove modules from workshop
- [ ] Reorder modules (drag-and-drop)
- [ ] Save changes to README.md
- [ ] Preserve content sections
- [ ] Commit changes with message
- [ ] Create new workshop directory
- [ ] Validate workshop ID format
- [ ] Handle file not found errors
- [ ] Handle invalid YAML errors
- [ ] Rollback on save failure

## 📚 Documentation Needed

1. **Server Setup Guide** - How to start backend
2. **API Documentation** - Endpoint reference
3. **Developer Guide** - How to extend GUI
4. **User Guide Update** - New filesystem workflow
5. **Troubleshooting** - Common issues

## ⏱️ Estimated Effort

- Phase 1: Backend Setup - 4-6 hours
- Phase 2: GUI Integration - 3-4 hours
- Phase 3: Frontmatter Parsing - 2-3 hours
- Phase 4: Safety & Validation - 2-3 hours
- Phase 5: Testing - 3-4 hours
- Documentation - 2-3 hours

**Total: ~16-23 hours**

## ✅ Success Criteria

1. ✅ GUI can create new Git branch automatically
2. ✅ Can load any existing workshop from `workshops/`
3. ✅ Can edit workshop metadata (title, duration, etc.)
4. ✅ Can reorder modules in workshop
5. ✅ Saves changes to workshop README.md frontmatter
6. ✅ Never modifies content sections or chapter files
7. ✅ Can commit changes with descriptive message
8. ✅ Works in both local and Codespaces environments
9. ✅ Provides clear error messages
10. ✅ Has "undo" capability for mistakes

---

## 🚦 Next Steps

**Immediate:**
1. ✅ Review and approve this plan
2. ⏳ Create backend server directory structure
3. ⏳ Implement basic Git operations
4. ⏳ Build workshop listing API
5. ⏳ Integrate with GUI

**Questions to Answer:**
1. Should we support workshop.config.json or only README.md frontmatter?
2. Do we want auto-commit or always prompt user?
3. Should GUI also update navigation.yml files?
4. Do we need multi-user conflict detection?
5. Should we validate module references exist?

---

**Status:** 📋 PLAN READY FOR REVIEW
**Date:** November 14, 2025
**Version:** 1.0
