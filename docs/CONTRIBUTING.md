# Contributing to Redis Workshops

Thank you for your interest in contributing to Redis Workshops! This guide will help you create workshops, modules, and improvements using our Visual Workshop Builder and Git workflow.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Ways to Contribute](#-ways-to-contribute)
- [Workshop Builder Setup](#-workshop-builder-setup)
- [Creating Workshops](#-creating-workshops)
- [Managing Modules](#-managing-modules)
- [Git Workflow](#-git-workflow)
- [Pull Request Process](#-pull-request-process)
- [Style Guidelines](#-style-guidelines)
- [Code of Conduct](#-code-of-conduct)

---

## 🚀 Quick Start

**Never used the Workshop Builder? Start here!**

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR-USERNAME/redis-workshops.git
cd redis-workshops

# 2. Start the Workshop Builder (Docker required)
./start-workshop-builder.sh

# 3. Open the Visual Interface
open shared/tools/workshop-builder-gui.html
```

That's it! You're ready to create workshops visually. 🎨

---

## 🤝 Ways to Contribute

### 1. Create New Workshops
Design complete learning experiences using the Visual Workshop Builder. No coding required!

### 2. Create or Enhance Modules
Build reusable learning units that can be shared across multiple workshops.

### 3. Improve Documentation
Help others understand the platform better with clearer docs and examples.

### 4. Report Issues
Found a bug? Unclear instructions? Let us know!

### 5. Enhance the Builder
Improve the Workshop Builder tool itself with new features.

### 6. Review Pull Requests
Help review and test contributions from other community members.

---

## 🛠️ Workshop Builder Setup

### Option 1: Docker (Recommended)

```bash
# Start the Workshop Builder server
./start-workshop-builder.sh

# Open the GUI in your browser
open shared/tools/workshop-builder-gui.html
```

**What you get:**
- ✅ Zero configuration required
- ✅ All dependencies pre-installed
- ✅ Ready in under 2 minutes

### Option 2: Manual Setup

```bash
# Install dependencies
cd shared/tools/workshop-builder-server
npm install

# Start the server
npm start

# Open the GUI
open ../workshop-builder-gui.html
```

---

## 🎨 Creating Workshops

### Using the Visual Workshop Builder (Recommended)

The Workshop Builder provides a complete visual interface for creating workshops:

#### Step 1: Create a Branch
1. Open the Workshop Builder GUI
2. Use the branch selector dropdown in the sidebar
3. Click **"+ Create Branch"**
4. Enter a branch name: `workshop/my-new-workshop`
5. Click **"Create Branch"**

Your new branch is now active and ready for development!

#### Step 2: Create the Workshop
1. Click **"Create New Workshop"** button
2. Fill in workshop metadata:
   - **Workshop ID**: `my-new-workshop` (lowercase, hyphens)
   - **Title**: `My New Workshop`
   - **Description**: Clear description of what learners will learn
   - **Difficulty**: `beginner` | `intermediate` | `advanced`
   - **Duration**: Estimated time in minutes
   - **Prerequisites**: What learners should know
   - **Learning Objectives**: What they'll accomplish
3. Click **"Create Workshop"**

#### Step 3: Add Modules
1. Browse available modules in the **Module Browser**
   - **Shared modules**: From `shared/modules/`
   - **Workshop-specific**: Custom modules
2. Drag modules into your workshop
3. Reorder modules with drag-and-drop
4. Click **"Customize Module"** to create workshop-specific versions
5. The Builder automatically:
   - Creates module directories
   - Copies module files
   - Tracks inheritance (lineage)
   - Updates workshop YAML

#### Step 4: Save and Commit
1. Click **"Save Workshop"** to write changes to disk
2. Enter a commit message: `feat: Add My New Workshop`
3. Click **"Commit Changes"**

The Builder commits your changes to your branch automatically!

### Workshop Structure (Auto-Generated)

```
workshops/my-new-workshop/
├── workshop.yaml              # Workshop configuration (auto-generated)
├── modules/                   # Workshop-specific modules (if customized)
│   └── custom-module/
│       ├── module.yaml
│       ├── .lineage           # Tracks inheritance
│       └── content/
└── README.md                  # (Optional) Workshop documentation
```

### Workshop Guidelines

✅ **Clear Learning Objectives**
- Define what learners will accomplish
- List prerequisites clearly
- Set realistic duration estimates

✅ **Progressive Difficulty**
- Start with fundamentals
- Build complexity gradually
- End with real-world applications

✅ **Module Reusability**
- Use existing shared modules when possible
- Customize only when necessary
- Document why you customized

✅ **Appropriate Scope**
- Target 2-6 hours total duration
- Include 4-8 modules per workshop
- Balance theory and hands-on practice

✅ **Quality Content**
- Test all exercises thoroughly
- Provide clear instructions
- Include troubleshooting guidance

---

## 📚 Managing Modules

### Module Types

**1. Shared Modules** (`shared/modules/`)
- Maintained centrally
- Used across multiple workshops
- Examples: `redis-fundamentals`, `redis-security`

**2. Workshop-Specific Modules** (`workshops/{id}/modules/`)
- Customized for specific workshops
- Can inherit from shared modules
- Tracks lineage via `.lineage` file

### Creating Shared Modules

Shared modules are best created manually and should be general-purpose:

```bash
# Create module directory
mkdir -p shared/modules/my-module/content

# Create module.yaml
cat > shared/modules/my-module/module.yaml << 'EOF'
id: my-module
title: My Module Title
description: What this module teaches
difficulty: intermediate
duration_minutes: 45
learning_objectives:
  - Objective 1
  - Objective 2
prerequisites:
  - Basic Redis knowledge
EOF

# Create content
touch shared/modules/my-module/content/my-module.md
```

### Customizing Modules in Workshop Builder

To create workshop-specific versions:

1. **Browse Modules**: Use the Module Browser in the GUI
2. **Select Module**: Click on a shared module
3. **Customize**: Click **"Customize Module"** button
4. **Builder Actions**:
   - Copies all module files to `workshops/{id}/modules/`
   - Creates `.lineage` file tracking the parent
   - Updates workshop YAML to reference the local module

### Module Inheritance System

When you customize a module, the Builder tracks its lineage:

```
workshops/my-workshop/modules/redis-fundamentals/.lineage
↓
shared/modules/redis-fundamentals
```

This allows:
- ✅ Tracking module origins
- ✅ Understanding workshop dependencies
- ✅ Future update propagation
- ✅ Audit trail for customizations

### Module Structure

```
modules/module-id/
├── module.yaml              # Required: Module metadata
├── content/                 # Required: Learning content
│   └── *.md
├── .lineage                 # Auto-generated: Inheritance tracking
├── exercises/               # Optional: Hands-on exercises
├── solutions/               # Optional: Exercise solutions
└── assets/                  # Optional: Images, diagrams
```

### Module Guidelines

✅ **Self-Contained**
- Module works independently
- No external dependencies unless documented
- Includes all necessary resources

✅ **Clear Metadata**
- Accurate duration estimates (30-90 minutes)
- Specific learning objectives
- Explicit prerequisites

✅ **Hands-On Focus**
- Include 2-4 practical exercises
- Provide working code examples
- Test all exercises thoroughly

✅ **Quality Content**
- Use clear, concise language
- Include diagrams and visuals
- Provide troubleshooting tips

---

## 🔄 Git Workflow

The Workshop Builder has **built-in Git integration** for seamless collaboration!

### Branch Management (Via GUI)

**Create a Branch:**
1. Click the branch dropdown in sidebar
2. Click **"+ Create Branch"**
3. Enter branch name (e.g., `feature/my-contribution`)
4. Click **"Create Branch"** - you're now on the new branch!

**Switch Branches:**
1. Click the branch dropdown
2. Select any local branch to switch
3. Workshop Builder automatically reloads workshops

**Branch Naming Conventions:**
- `workshop/workshop-name` - New workshops
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `module/module-name` - New modules

### Making Changes (Via GUI)

**1. Create/Edit Workshops**
- Use the Visual Workshop Builder interface
- All changes are tracked in real-time

**2. Commit Changes**
- Click **"💾 Save Workshop"** button
- Enter meaningful commit message
- Example: `feat: Add Redis Streams workshop with 6 modules`
- Click **"Commit Changes"**

The Builder automatically stages and commits your changes!

**3. Push to GitHub**
```bash
# Push your branch (from terminal)
git push origin your-branch-name
```

### Commit Message Format

Follow conventional commits for clarity:

- `feat: Add new workshop about Redis Streams`
- `fix: Correct typo in redis-fundamentals module`
- `docs: Update contribution guide with Builder workflow`
- `refactor: Reorganize workshop structure`
- `test: Add validation for workshop YAML`
- `chore: Update dependencies`

### Viewing Changes

```bash
# Check what you've changed
git status

# View detailed changes
git diff

# View commit history
git log --oneline
```

---

## 📤 Pull Request Process

### Creating a Pull Request (Via GUI)

The Workshop Builder makes PR creation effortless!

**Option 1: Using the GUI (Recommended)**

1. **Finish Your Work**: Complete your workshop/module changes
2. **Commit Everything**: Use the "Save Workshop" button to commit
3. **Create PR**: Click **"Create Pull Request"** button in sidebar
4. **Fill PR Form**:
   - **Title**: Auto-populated with your workshop title
   - **Description**: Add details about your contribution
   - **Base Branch**: Usually `main`
   - **Head Branch**: Your current branch
5. **Submit**: Click **"Create Pull Request"**

The Builder opens the PR directly on GitHub for you!

**Option 2: Manual GitHub Process**

1. Push your branch to GitHub:
   ```bash
   git push origin your-branch-name
   ```

2. Go to the repository on GitHub
3. Click **"Compare & pull request"**
4. Fill in PR details
5. Click **"Create pull request"**

### PR Title Guidelines

Use clear, descriptive titles:

- ✅ `feat: Add Redis Streams workshop with real-time examples`
- ✅ `fix: Correct module loading in azure-redis workshop`
- ✅ `docs: Update README with Docker setup instructions`
- ✅ `module: Add redis-search fundamentals module`

### PR Description Template

```markdown
## Description
Brief overview of what this PR adds or changes.

## Type of Change
- [ ] New workshop
- [ ] New module
- [ ] Bug fix
- [ ] Documentation update
- [ ] Feature enhancement

## Workshop Details (if applicable)
- **Workshop ID**: workshop-name
- **Difficulty**: beginner/intermediate/advanced
- **Duration**: X hours
- **Modules**: X modules

## Testing Performed
- [ ] Created workshop in Workshop Builder
- [ ] Tested all module integrations
- [ ] Verified workshop YAML is valid
- [ ] Checked module inheritance/lineage
- [ ] Tested on clean environment

## Checklist
- [ ] Workshop metadata is complete
- [ ] All modules are properly referenced
- [ ] No sensitive data included
- [ ] Commit messages follow conventions
- [ ] Documentation updated (if needed)
- [ ] Ready for review

## Screenshots (optional)
Add screenshots showing the workshop in action.
```

### PR Review Process

**Timeline:**
- Initial review: 2-3 business days
- Feedback and iterations: As needed
- Final approval and merge: 1-2 days after approval

**What Reviewers Check:**
- ✅ Workshop quality and clarity
- ✅ Module reusability and structure
- ✅ Proper Git workflow followed
- ✅ No sensitive data or credentials
- ✅ Documentation completeness
- ✅ Commit message quality

**After Approval:**
- Your PR gets merged to `main`
- Workshop automatically deploys to GitHub Pages
- You become a contributor! 🎉

### Addressing Feedback

When reviewers request changes:

1. **Make Updates**: Edit in Workshop Builder or manually
2. **Commit Changes**: 
   ```bash
   git add .
   git commit -m "fix: Address review feedback - update module descriptions"
   ```
3. **Push Updates**:
   ```bash
   git push origin your-branch-name
   ```
4. **Respond**: Comment on the PR to notify reviewers

The PR automatically updates with your new commits!

---

## 📝 Style Guidelines

### Workshop YAML Format

```yaml
id: my-workshop
title: My Workshop Title
description: Clear, concise description
difficulty: beginner  # or intermediate, advanced
duration_minutes: 240
prerequisites:
  - Basic Redis knowledge
  - Docker installed
learning_objectives:
  - Learn concept A
  - Master technique B
  - Build project C
modules:
  - id: module-1
    source: shared  # or local
  - id: module-2
    source: local
```

### Module YAML Format

```yaml
id: module-id
title: Module Title
description: What this module teaches
difficulty: intermediate
duration_minutes: 45
learning_objectives:
  - Objective 1
  - Objective 2
prerequisites:
  - Prerequisite 1
```

### Markdown Content Style

**Headings:**
```markdown
# Main Title (H1) - Use once at top
## Major Section (H2)
### Subsection (H3)
#### Detail Level (H4)
```

**Code Blocks:**
```markdown
​```bash
# Shell commands with comments
redis-cli PING
​```

​```python
# Python code with clear examples
import redis
r = redis.Redis(host='localhost', port=6379)
​```
```

**Lists:**
- Use `-` for unordered lists
- Use `1.` for ordered lists
- Use emojis consistently: ✅ ❌ 📝 🎯 ⚠️

**Links:**
```markdown
[Descriptive Text](https://example.com)
```

### File Naming Conventions

- **Workshop IDs**: `my-workshop-name` (lowercase, hyphens)
- **Module IDs**: `module-name` (lowercase, hyphens)
- **Branch Names**: `feature/description` (prefix/lowercase-hyphens)
- **Files**: `my-file.md` (lowercase, hyphens)

### Code Quality

**Shell Scripts:**
```bash
#!/bin/bash
set -e  # Exit on error

# Clear comment explaining purpose
function setup_redis() {
    echo "Setting up Redis..."
    # Implementation
}
```

**Redis Commands:**
```bash
# Always uppercase Redis commands
SET key "value"
GET key
HSET user:1 name "Alice" age 30
```

### Content Guidelines

✅ **Be Clear and Concise**
- Write at an 8th-grade reading level
- Avoid unnecessary jargon
- Explain technical terms when first used

✅ **Be Inclusive**
- Use "they/them" as default pronouns
- Avoid idioms that don't translate well
- Welcome contributors of all skill levels

✅ **Test Everything**
- All code examples must work
- Test on clean environment
- Include expected output

✅ **Provide Context**
- Explain why, not just how
- Include real-world use cases
- Link to official documentation

---

## ✅ Quality Checklist

Before submitting your PR:

### Workshop Quality
- [ ] Clear learning objectives defined
- [ ] Accurate duration estimates
- [ ] Prerequisites listed
- [ ] Difficulty level appropriate
- [ ] All modules properly referenced
- [ ] Workshop YAML is valid

### Module Quality
- [ ] Module metadata complete
- [ ] Content is clear and tested
- [ ] Exercises include solutions
- [ ] Duration is realistic
- [ ] Learning objectives achieved
- [ ] Module YAML is valid

### Code Quality
- [ ] All code examples tested
- [ ] Scripts are executable
- [ ] No hardcoded credentials
- [ ] Error handling included
- [ ] Comments explain complex logic

### Documentation
- [ ] README updated (if needed)
- [ ] Commit messages follow conventions
- [ ] No broken links
- [ ] Spelling/grammar checked
- [ ] Screenshots added (if helpful)

### Git Workflow
- [ ] Working on feature branch (not main)
- [ ] All changes committed
- [ ] Meaningful commit messages
- [ ] Branch pushed to GitHub
- [ ] PR description complete

---

## 🐛 Reporting Issues

Found a bug or problem? Help us improve!

**Good Issue Reports Include:**
1. **Clear title**: "Workshop Builder: Save button doesn't work on Safari"
2. **Description**: What you expected vs what happened
3. **Steps to reproduce**: Numbered list of exact steps
4. **Environment**: OS, browser, Docker version, etc.
5. **Screenshots**: Visual proof helps!
6. **Severity**: How much does this block you?

**Example:**
```markdown
## Bug: Workshop Builder fails to load workshops on Firefox

**Expected:** Workshops load in the module browser
**Actual:** Blank screen with console error

**Steps to Reproduce:**
1. Start Workshop Builder with `./start-workshop-builder.sh`
2. Open Firefox (version 120)
3. Open `workshop-builder-gui.html`
4. Click "Load Workshops"
5. See blank screen

**Environment:**
- OS: macOS 14.1
- Browser: Firefox 120
- Docker: 24.0.6

**Console Error:**
```
TypeError: Cannot read property 'workshops' of undefined
```

**Severity:** High - Cannot use Workshop Builder
```

---

## 💡 Feature Requests

Have an idea? We'd love to hear it!

**Before Requesting:**
- Check [existing issues](https://github.com/tfindelkind-redis/redis-workshops/issues)
- Search [discussions](https://github.com/tfindelkind-redis/redis-workshops/discussions)

**Good Feature Requests Include:**
1. **Use case**: Why do you need this?
2. **Current workaround**: How do you solve it today?
3. **Proposed solution**: Your ideal implementation
4. **Alternatives**: Other ways to solve it
5. **Impact**: Who else would benefit?

---

## 🤝 Code of Conduct

We are committed to providing a welcoming, inclusive environment.

**Our Standards:**
- ✅ Be respectful and constructive
- ✅ Welcome diverse perspectives
- ✅ Focus on what's best for the community
- ✅ Show empathy toward others
- ✅ Accept constructive criticism gracefully

**Not Acceptable:**
- ❌ Harassment or discriminatory language
- ❌ Personal attacks or insults
- ❌ Trolling or inflammatory comments
- ❌ Publishing others' private information
- ❌ Unethical or unprofessional conduct

**Enforcement:**
Violations will be reviewed by maintainers and may result in temporary or permanent ban from the project.

**Report Issues:**
Contact maintainers privately if you witness violations.

---

## � Additional Resources

- **[Workshop Builder Quick Start](../WORKSHOP_BUILDER_QUICK_START.md)** - Get started in 5 minutes
- **[Docker Setup Guide](../DOCKER_SETUP.md)** - Detailed setup instructions
- **[Modular Design](../MODULAR_DESIGN.md)** - Understanding the architecture
- **[GitHub Pages](https://tfindelkind-redis.github.io/redis-workshops/)** - Browse workshops

---

## 📧 Getting Help

**Need Assistance?**
- 💬 [GitHub Discussions](https://github.com/tfindelkind-redis/redis-workshops/discussions) - Ask questions
- 🐛 [GitHub Issues](https://github.com/tfindelkind-redis/redis-workshops/issues) - Report bugs
- 📖 [Documentation](../README.md) - Read the docs

**Response Times:**
- Issues: 2-3 business days
- PRs: 2-3 business days
- Discussions: Best effort

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as this project.

---

## 🎉 Thank You!

Thank you for contributing to Redis Workshops! Your efforts help developers worldwide learn Redis more effectively.

**Every contribution matters:**
- First-time contributors welcome! 
- Questions are contributions too!
- Documentation improvements are valuable!
- Bug reports help everyone!

**Let's build something amazing together!** 🚀
