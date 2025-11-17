# GitHub Pull Request Integration

## Overview

The Workshop Builder now includes **GitHub Pull Request (PR) integration**, allowing you to create PRs directly from the GUI without using the command line. This streamlines the workflow for contributing workshop changes back to the repository.

## 🎯 Key Features

### 1. **Persistent Branch Workflow**
- **One branch per session:** The system creates a feature branch only once when you're on `main`
- **Branch persistence:** You stay on the same branch across container restarts
- **No duplicate branches:** Won't create new branches unnecessarily

### 2. **Automatic PR Button**
- **Smart visibility:** PR button appears automatically when working on a feature branch
- **Status detection:** Shows if a PR already exists for your branch
- **One-click creation:** Create PRs directly from the GUI

### 3. **Branch Management**
- **Auto-creation:** Branches created automatically with timestamp when needed
- **Format:** `workshop-builder-2025-11-15T06-47-58`
- **Git integration:** Proper commits with configured author info

---

## 🚀 How It Works

### Branch Creation Logic

```
START
  ↓
Check current branch
  ↓
If on 'main' or 'master'
  ↓ YES
  Create new branch: workshop-builder-{timestamp}
  Switch to new branch
  ↓
Else
  ↓ NO
  Stay on current branch
  ↓
Show branch name in UI
Show PR button (if not on main)
```

**Result:** You only get a new branch the first time. After that, you stay on the same branch until you create a PR.

### PR Creation Flow

```
User clicks "Create Pull Request"
  ↓
System checks: Does PR already exist?
  ↓ YES
  Open existing PR in browser
  ↓ NO
  Prompt for PR title and description
  Push branch to GitHub
  Create PR via GitHub API
  Show success message
  Open PR in browser
```

---

## 📋 Setup Instructions

### Step 1: Get a GitHub Personal Access Token

1. Go to GitHub: **Settings** > **Developer settings** > **Personal access tokens** > **Tokens (classic)**
2. Click **"Generate new token"** > **"Generate new token (classic)"**
3. Give it a name: `Workshop Builder`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Actions workflows)
5. Click **"Generate token"**
6. **Copy the token** (you won't see it again!)

### Step 2: Set the Token as Environment Variable

**On macOS/Linux:**
```bash
export GITHUB_TOKEN='your_token_here'
```

**To make it permanent, add to `~/.zshrc` or `~/.bashrc`:**
```bash
echo 'export GITHUB_TOKEN="your_token_here"' >> ~/.zshrc
source ~/.zshrc
```

**On Windows (PowerShell):**
```powershell
$env:GITHUB_TOKEN='your_token_here'
```

### Step 3: Start the Container with Token

**Using the start script:**
```bash
export GITHUB_TOKEN='your_token_here'
./start-workshop-builder.sh
```

The script will detect the token and pass it to the container:
```
✅ GitHub token detected - PR creation will be enabled
```

**Or manually with Docker:**
```bash
docker run -d \
  --name workshop-builder-server \
  -p 3000:3000 \
  -v "$(pwd):/repo:rw" \
  -e REPO_ROOT=/repo \
  -e GITHUB_TOKEN='your_token_here' \
  workshop-builder-server
```

---

## 🎨 UI Elements

### Header PR Button

When working on a feature branch, you'll see:

```
┌─────────────────────────────────────────────────────┐
│ 🎓 Workshop Builder GUI          🚀 Create Pull Request│
│ 🌿 Branch: workshop-builder-...                     │
└─────────────────────────────────────────────────────┘
```

**Button States:**

| State | Button Text | Status Text |
|-------|-------------|-------------|
| No PR exists | 🚀 Create Pull Request | (empty) |
| PR exists | 📋 View Pull Request | PR #123 exists (link) |
| On main branch | (button hidden) | - |
| No GitHub token | (button hidden) | - |

---

## 📖 Usage Guide

### Scenario 1: Fresh Start (First Time)

1. **Open GUI:** http://localhost:3000
2. **System creates branch:** `workshop-builder-2025-11-15T06-47-58`
3. **Make changes:** Add modules, edit content, save
4. **Click "Create Pull Request":**
   - Enter title: "Add Redis fundamentals workshop"
   - Enter description: "Complete workshop with 3 modules"
5. **PR created!** Opens in browser automatically
6. **Continue working:** Stay on same branch, make more changes
7. **Save again:** Changes committed to same branch
8. **PR updates automatically** with new commits

### Scenario 2: Existing Branch

1. **Container restart:** System detects existing branch
2. **No new branch created:** Stay on `workshop-builder-2025-11-15T06-47-58`
3. **PR button shows:** Either "Create PR" or "View PR"
4. **Continue working:** All commits go to existing branch

### Scenario 3: PR Already Exists

1. **Click PR button:** Shows "📋 View Pull Request"
2. **Button action:** Opens existing PR in browser
3. **No new PR created:** Prevents duplicates
4. **Continue working:** New commits push to same PR

---

## 🔧 Technical Details

### Branch Naming Convention

Format: `workshop-builder-{ISO_TIMESTAMP}`

Example: `workshop-builder-2025-11-15T06-47-58`

**Why this format?**
- ✅ Unique per session
- ✅ Human-readable
- ✅ Sortable chronologically
- ✅ No special characters (Git-safe)

### Git Configuration in Container

The Docker container is pre-configured with:

```dockerfile
RUN git config --global user.name "Workshop Builder"
RUN git config --global user.email "workshop-builder@redis.com"
RUN git config --global --add safe.directory /repo
```

This ensures commits work without manual configuration.

### API Endpoints

**Check GitHub Status:**
```
GET /api/github/status
```

Response:
```json
{
  "success": true,
  "configured": true,
  "repository": {
    "owner": "tfindelkind-redis",
    "repo": "redis-workshops"
  },
  "currentBranch": "workshop-builder-2025-11-15T06-47-58",
  "existingPR": {
    "number": 123,
    "url": "https://github.com/owner/repo/pull/123",
    "state": "open",
    "title": "Workshop updates"
  }
}
```

**Create Pull Request:**
```
POST /api/github/pull-request
Content-Type: application/json

{
  "title": "Add Redis fundamentals workshop",
  "body": "Complete workshop with 3 modules covering basics to advanced topics",
  "base": "main"
}
```

Response:
```json
{
  "success": true,
  "exists": false,
  "number": 124,
  "url": "https://github.com/owner/repo/pull/124",
  "state": "open",
  "title": "Add Redis fundamentals workshop"
}
```

---

## 🔒 Security Considerations

### GitHub Token Security

**DO:**
- ✅ Store token in environment variables
- ✅ Use personal access tokens (not passwords)
- ✅ Set minimum required scopes (`repo` only)
- ✅ Regenerate tokens periodically
- ✅ Keep tokens out of code and version control

**DON'T:**
- ❌ Commit tokens to Git repositories
- ❌ Share tokens with others
- ❌ Use tokens with unnecessary permissions
- ❌ Store tokens in plain text files

### Token Permissions

Minimum required scopes:
- **`repo`** - Create PRs, push branches, access repository

Optional scopes:
- **`workflow`** - If PRs need to trigger GitHub Actions

---

## 🐛 Troubleshooting

### PR Button Not Showing

**Cause:** GitHub token not configured or on main branch

**Solutions:**
1. Check environment variable: `echo $GITHUB_TOKEN`
2. Restart container with token: `docker run ... -e GITHUB_TOKEN=...`
3. Verify not on main: Branch indicator should show feature branch
4. Check browser console for errors

### "GitHub token not configured" Error

**Cause:** Container started without `GITHUB_TOKEN` environment variable

**Solution:**
```bash
# Stop container
docker stop workshop-builder-server
docker rm workshop-builder-server

# Start with token
export GITHUB_TOKEN='your_token_here'
./start-workshop-builder.sh
```

### "Pull request already exists" Error

**Cause:** A PR is already open for your branch

**Solution:**
- Click "View Pull Request" to open existing PR
- Continue making changes and commits
- New commits will automatically update the PR

### "Failed to push branch" Error

**Possible Causes:**
1. **No remote origin:** Repository not connected to GitHub
2. **Permission denied:** Token doesn't have `repo` access
3. **Branch name conflict:** Branch exists remotely but not locally

**Solutions:**
1. Verify remote: `git remote -v` (in container or local)
2. Regenerate token with correct scopes
3. Delete remote branch or switch to different branch

### Container Can't Access GitHub

**Symptoms:**
- Timeouts when creating PR
- "Network error" messages
- API requests fail

**Solutions:**
1. Check internet connection
2. Verify GitHub is accessible: `curl https://api.github.com`
3. Check firewall/proxy settings
4. Restart Docker daemon

---

## 📊 Workflow Comparison

### Before PR Integration

```
1. Make changes in GUI
2. Save workshop
3. Open terminal
4. git add .
5. git commit -m "message"
6. git push origin branch
7. Go to GitHub website
8. Click "New Pull Request"
9. Fill in title and description
10. Submit PR
```

**Steps:** 10 | **Context switches:** 3 | **Manual commands:** 4

### After PR Integration

```
1. Make changes in GUI
2. Save workshop
3. Click "Create Pull Request"
4. Enter title and description
5. PR created and opened
```

**Steps:** 5 | **Context switches:** 0 | **Manual commands:** 0

**Time saved:** ~2-3 minutes per PR 🎉

---

## 🔄 Branch Lifecycle

### Complete Workflow Example

```
Session 1: Initial Work
├─ Open GUI
├─ Branch created: workshop-builder-2025-11-15T06-47-58
├─ Add modules
├─ Save workshop → Commit to branch
└─ Close browser

Session 2: Continue Work (Same Day)
├─ Open GUI
├─ Same branch detected: workshop-builder-2025-11-15T06-47-58
├─ Make more changes
├─ Save workshop → Commit to same branch
└─ Create PR

Session 3: After PR Created
├─ Open GUI  
├─ Same branch: workshop-builder-2025-11-15T06-47-58
├─ PR button shows: "View Pull Request"
├─ Make additional changes
├─ Save → Commits added to PR automatically
└─ PR updated

After PR Merged:
├─ Branch merged to main
├─ Next GUI open: On main branch
├─ New branch created: workshop-builder-2025-11-16T...
└─ New workflow begins
```

---

## ⚙️ Configuration Options

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GITHUB_TOKEN` | For PR creation | GitHub Personal Access Token | `ghp_abc123...` |
| `REPO_ROOT` | Yes | Repository mount point | `/repo` |
| `PORT` | No (default: 3000) | Server port | `3000` |

### Start Script Options

The `start-workshop-builder.sh` script automatically:
- ✅ Detects `GITHUB_TOKEN` environment variable
- ✅ Passes token to container if available
- ✅ Shows clear messages about token status
- ✅ Works without token (PR features disabled)

---

## 📚 Best Practices

### Branch Management

1. **One feature per branch:** Create PR when feature is complete
2. **Descriptive PR titles:** Clearly state what changed
3. **Regular commits:** Save frequently, commit often
4. **Merge PRs promptly:** Don't let branches get stale
5. **Start fresh after merge:** New branch for new work

### PR Workflow

1. **Review before creating:** Check preview tab before PR
2. **Write good descriptions:** Explain what and why
3. **Link to issues:** Reference related GitHub issues
4. **Request reviews:** Tag appropriate reviewers
5. **Respond to feedback:** Address review comments

### Security

1. **Protect tokens:** Never share or commit them
2. **Minimum permissions:** Only grant necessary scopes
3. **Rotate regularly:** Generate new tokens periodically
4. **Monitor usage:** Check GitHub for unexpected activity
5. **Revoke if compromised:** Delete token immediately if exposed

---

## 🎓 FAQ

**Q: What happens if I don't configure a GitHub token?**  
A: PR creation will be disabled. You can still use all other features (save, commit, edit). The PR button won't appear.

**Q: Can I work offline?**  
A: Yes! All features work offline except PR creation. Your work saves locally and you can create PRs later.

**Q: What if multiple people use the same container?**  
A: Each person should have their own container instance with their own GitHub token. Don't share tokens!

**Q: Can I create multiple PRs from the same branch?**  
A: No. GitHub doesn't allow duplicate PRs. The system detects existing PRs and shows "View PR" instead.

**Q: What if I want to start a new branch manually?**  
A: Switch to main first: `git checkout main` (in terminal), then restart the container. A new branch will be created.

**Q: Do I need to manually push commits?**  
A: No! When you create a PR, the branch is automatically pushed to GitHub.

**Q: What happens to my branch after the PR is merged?**  
A: The branch stays in your local repository until you delete it. GitHub typically deletes the remote branch automatically.

**Q: Can I edit the PR after creating it?**  
A: Yes! Continue making changes and saving. New commits automatically appear in the PR.

---

## 🎉 Summary

The GitHub PR integration provides:

✅ **One-click PR creation** - No terminal commands needed  
✅ **Persistent branches** - Stay on same branch across restarts  
✅ **Smart detection** - Shows existing PRs automatically  
✅ **Automatic pushing** - Branches pushed when creating PR  
✅ **Security** - Token-based authentication  
✅ **Simple setup** - Just set environment variable  
✅ **Works without token** - PR features optional  

This makes contributing to the repository **faster, easier, and more intuitive** for everyone! 🚀
