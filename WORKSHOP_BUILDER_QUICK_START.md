# Workshop Builder - Quick Start Guide

## 🎯 Overview

The Workshop Builder now works directly with your repository files! It automatically creates Git branches, loads existing workshops, and saves changes to workshop README.md files.

## 🚀 Getting Started

### Step 1: Install Node.js (if needed)

```bash
# macOS
brew install node

# Or download from https://nodejs.org/
```

### Step 2: Start the Backend Server

```bash
cd shared/tools/workshop-builder-server
npm install
npm start
```

The server will start on `http://localhost:3000`

You should see:
```
🚀 Workshop Builder Server Started
📡 Server running on: http://localhost:3000
📁 Repository: /path/to/redis-workshops
🌿 Current branch: main
```

### Step 3: Open the Workshop Builder GUI

Open `shared/tools/workshop-builder-gui.html` in your browser.

The GUI will:
1. ✅ Detect the server automatically
2. ✅ Create a new Git branch (if you're on `main`)
3. ✅ Display the current branch in the header
4. ✅ Load workshops from your `workshops/` directory

## 📋 Workflow

### Create a New Workshop

1. **Fill in Workshop Details** (left sidebar):
   - Workshop ID (lowercase, hyphens only)
   - Title
   - Description
   - Duration
   - Difficulty level

2. **Add Modules** (Modules tab):
   - Click "Add to Workshop" on available modules
   - Drag to reorder modules

3. **Preview Navigation** (Navigation tab):
   - See the auto-generated navigation structure

4. **Save**:
   - Click "💾 Save Workshop"
   - Choose "Yes" to commit changes
   - Enter a commit message

### Edit an Existing Workshop

1. **Load Workshop**:
   - Click "📂 Load Workshop" button
   - Search and select a workshop from the browser
   - The browser shows ALL workshops from `workshops/` directory!

2. **Make Changes**:
   - Update metadata (title, duration, difficulty)
   - Add/remove modules
   - Reorder modules (drag-and-drop)

3. **Save**:
   - Click "💾 Save Workshop"
   - Commit with a descriptive message

### What Happens Behind the Scenes

When you **save** a workshop:
1. GUI sends update to backend server
2. Server updates the frontmatter in `workshops/{id}/README.md`
3. Content sections remain untouched
4. You're prompted to commit changes
5. Changes are committed to your current branch

## 🌿 Git Workflow

### Automatic Branch Creation

When you start the GUI:
- If on `main`: Creates `workshop-builder-2025-11-14T10-30-00`
- If on feature branch: Uses that branch
- Branch name shown in header

### Committing Changes

After saving a workshop, you can:
- **Yes, commit**: Adds and commits the README.md file
- **No, not yet**: Leaves changes uncommitted (you can commit later)

### Viewing Changes

```bash
# See what's changed
git status

# See the diff
git diff workshops/my-workshop/README.md

# Commit manually if needed
git add workshops/my-workshop/README.md
git commit -m "Update workshop"
```

## 🔒 Safety Features

### What the GUI Can Modify
✅ Workshop README.md frontmatter (metadata)
✅ Module list and ordering
✅ Workshop metadata (title, description, duration, difficulty)

### What the GUI Cannot Modify
❌ Module content files
❌ Workshop content sections (below frontmatter)
❌ Chapter content files
❌ Canonical module library

### Example: What Gets Modified

**Before** (`workshops/my-workshop/README.md`):
```yaml
---
workshopId: my-workshop
title: My Workshop
description: Original description
duration: 4 hours
difficulty: intermediate
chapters: core.redis-fundamentals.v1
---

# My Workshop
[All content here remains unchanged]
```

**After** (when you add a module and change duration):
```yaml
---
workshopId: my-workshop
title: My Workshop
description: Original description
duration: 5 hours
difficulty: intermediate
chapters: core.redis-fundamentals.v1,core.redis-security.v1
---

# My Workshop
[All content here remains unchanged]
```

## 🔄 Fallback Mode

If the server isn't running:
- GUI automatically falls back to localStorage
- All features work (create, edit, save)
- Data saved in browser only
- Can export JSON to build later

To switch from localStorage to filesystem:
1. Start the server
2. Refresh the GUI
3. Export your localStorage workshops as JSON
4. Use the CLI to build them in the filesystem

## 🧪 Testing the Setup

### 1. Test Server
```bash
curl http://localhost:3000/api/health
```

Should return:
```json
{
  "success": true,
  "status": "healthy"
}
```

### 2. Test Git Init
```bash
curl http://localhost:3000/api/git/init
```

Should return:
```json
{
  "success": true,
  "branch": "workshop-builder-2025-11-14T10-30-00",
  "created": true
}
```

### 3. Test Workshop Listing
```bash
curl http://localhost:3000/api/workshops
```

Should return list of workshops from `workshops/` directory.

## 🐛 Troubleshooting

### Server won't start
**Problem**: `npm start` fails

**Solution**:
```bash
# Check Node.js is installed
node --version

# If not, install:
brew install node  # macOS

# Reinstall dependencies
cd shared/tools/workshop-builder-server
rm -rf node_modules
npm install
```

### GUI can't connect to server
**Problem**: GUI shows "Server not available"

**Solution**:
1. Check server is running: `curl http://localhost:3000/api/health`
2. Check the browser console for errors
3. Try a different port: `PORT=3001 npm start`

### Git branch not created
**Problem**: Still on `main` branch

**Solution**:
```bash
# Manually create branch
git checkout -b workshop-builder-manual

# Refresh GUI
```

### Changes not saved to file
**Problem**: Saved in GUI but not in filesystem

**Solution**:
1. Check server logs in terminal
2. Verify workshop ID is correct
3. Check file permissions on `workshops/` directory

## 📚 Example Workflow

```bash
# Terminal 1: Start server
cd shared/tools/workshop-builder-server
npm start

# Terminal 2: Check status
git status
# Should show: On branch workshop-builder-2025-11-14T10-30-00

# Browser: Open GUI
open shared/tools/workshop-builder-gui.html

# In GUI:
# 1. Click "Load Workshop"
# 2. Select "redis-fundamentals"
# 3. Change duration to "5 hours"
# 4. Add module "core.redis-security.v1"
# 5. Click "Save Workshop"
# 6. Commit with message: "Add security module to Redis Fundamentals"

# Terminal 2: Verify changes
git log -1
git show HEAD

# When done editing:
git push origin workshop-builder-2025-11-14T10-30-00
# Create PR on GitHub
```

## 🎓 Next Steps

1. **Read the docs**:
   - [Filesystem Integration Plan](GUI_FILESYSTEM_INTEGRATION_PLAN.md)
   - [Server API Documentation](shared/tools/workshop-builder-server/README.md)
   - [Workshop Creator Guide](WORKSHOP_CREATOR_GUIDE.md)

2. **Try it out**:
   - Load an existing workshop
   - Add a new module
   - Save and commit
   - Check the diff

3. **Create a PR**:
   - Push your branch to GitHub
   - Create a Pull Request
   - Review the changes
   - Merge when ready

## 🆘 Getting Help

- Check the [Server README](shared/tools/workshop-builder-server/README.md) for API docs
- Review server logs in the terminal
- Check browser console for JavaScript errors
- Verify Git status: `git status`

## ✨ Tips

1. **Commit often**: Commit after each significant change
2. **Descriptive messages**: Use clear commit messages
3. **Preview changes**: Always check the Navigation tab before saving
4. **Test locally**: Test workshop changes before pushing
5. **Branch per workshop**: Create a new branch for each workshop edit

---

**Happy Workshop Building!** 🚀

Last Updated: November 14, 2025
