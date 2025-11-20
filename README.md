# Redis Workshops

A comprehensive platform for creating, managing, and delivering hands-on Redis workshops with a visual workshop builder and modular content system.

**🌐 Browse Published Workshops:** [https://tfindelkind-redis.github.io/redis-workshops/](https://tfindelkind-redis.github.io/redis-workshops/)

---

## 🎯 What's Inside

This repository provides everything you need to create professional Redis training workshops:

- **🎨 Visual Workshop Builder** - Build workshops through an intuitive drag-and-drop interface
- **🧩 Modular Content System** - Reusable learning modules with multi-level inheritance
- **🔄 Git Integration** - Built-in version control with branch management and PR creation
- **📦 Docker-Ready** - Zero-config setup with Docker Compose
- **🌐 GitHub Pages Integration** - Automatic workshop catalog publishing

---

## 🚀 Quick Start

### For Workshop Participants (Interactive Labs)

**✨ NEW: Complete labs interactively in GitHub Codespaces with Jupyter notebooks!**

```bash
# 1. Open in Codespaces
Click "Code" → "Codespaces" → "Create codespace on main"

# 2. Navigate to a workshop module
cd workshops/deploy-redis-for-developers-amr/module-08-implement-caching-lab/

# 3. Open the Jupyter notebook
# Click on implement-caching-lab.ipynb

# 4. Run cells step-by-step and see results instantly!
```

**Features:**
- ✅ Zero setup - runs in your browser
- ✅ Interactive code cells with immediate feedback
- ✅ Real-time performance visualizations
- ✅ Guided exercises with solutions
- ✅ Connects to local Redis (or Azure)

📖 **[Learn more about Interactive Labs →](docs/INTERACTIVE-LABS.md)**

---

### For Workshop Creators (Build New Workshops)

**Option 1: Docker (Recommended - 2 Minutes to Start!)**

```bash
# 1. Start the Workshop Builder server
./start-workshop-builder.sh

# 2. Open the GUI in your browser
open shared/tools/workshop-builder-gui.html
```

**That's it!** The Workshop Builder is now running with:
- ✅ Full Git integration (branch creation, switching, commits, PRs)
- ✅ Visual workshop editor with drag-and-drop modules
- ✅ Real-time file system synchronization
- ✅ Module browser with inheritance support
- ✅ Automatic workshop validation

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

## 🎨 Workshop Builder Features

The Visual Workshop Builder provides a complete workshop authoring environment:

### Core Capabilities
- **📝 Workshop Management**
  - Create new workshops from scratch
  - Load and edit existing workshops
  - Delete workshops with safety confirmations
  - Set metadata (title, description, difficulty, duration)

- **🧩 Module System**
  - Browse shared and workshop-specific modules
  - Multi-level module inheritance
  - Drag-and-drop module ordering
  - Customize modules per workshop
  - Visual dependency tree

- **🔄 Git & GitHub Integration**
  - Create and switch between branches
  - Commit changes with custom messages
  - Create Pull Requests directly from the GUI
  - Branch status indicators
  - GitHub Pages link integration

- **💾 File System Operations**
  - Real-time workshop YAML updates
  - Automatic module file copying
  - Directory structure management
  - Module lineage tracking

- **🌐 Publishing**
  - One-click access to GitHub Pages catalog
  - Workshop preview and navigation
  - Difficulty-based filtering

---

## 📚 Repository Structure

```
redis-workshops/
├── workshops/                          # Workshop content
│   ├── azure-managed-redis/           # Production workshop
│   ├── deploy-redis-for-developers/   # Production workshop
│   └── test-*/                        # Test/development workshops
│
├── shared/                            # Shared resources
│   ├── modules/                       # Reusable learning modules
│   │   ├── redis-fundamentals/
│   │   ├── redis-performance/
│   │   └── redis-security/
│   ├── tools/                         # Workshop Builder & utilities
│   │   ├── workshop-builder-gui.html  # Visual interface
│   │   ├── workshop-builder-server/   # Backend API
│   │   └── workshop-builder.py        # CLI tools
│   ├── templates/                     # Content templates
│   └── chapters/                      # Shared chapter content
│
├── docs/                              # GitHub Pages site
│   ├── index.html                     # Workshop catalog
│   └── app-new.js                     # Frontend logic
│
├── start-workshop-builder.sh          # Docker startup script
└── docker-compose.yml                 # Container orchestration
```

---

## 🧩 Module System

Workshops are built from **modules** - reusable learning units that can be shared across multiple workshops.

### Module Types

1. **Shared Modules** (`shared/modules/`)
   - Centrally maintained
   - Used across multiple workshops
   - Version controlled with inheritance tracking
   - Examples: redis-fundamentals, redis-security

2. **Workshop-Specific Modules** (`workshops/{workshop-name}/modules/`)
   - Customized for specific workshop needs
   - Can inherit from shared modules (tracks lineage)
   - Workshop-specific examples and exercises

### Module Inheritance

Modules support multi-level inheritance, allowing you to:
- Start from a shared module base
- Customize content for your workshop
- Track the inheritance lineage
- Update from parent modules when needed

```yaml
# Example module with inheritance
id: redis-fundamentals
title: Redis Fundamentals
inherits_from: shared/modules/redis-fundamentals
difficulty: beginner
duration_minutes: 45
```

---

## 📖 Workshop Authoring Workflow

### 1. Create Your Workshop
```bash
# Using the GUI (recommended)
1. Click "Create New Workshop"
2. Fill in workshop metadata
3. Add modules via drag-and-drop
4. Save and commit

# Using CLI
./shared/tools/create-workshop.sh "My Workshop Name"
```

### 2. Add Content
- Browse available shared modules
- Customize modules for your needs
- Arrange modules in learning order
- Add workshop-specific resources

### 3. Test and Validate
- Preview in the Workshop Builder
- Test module dependencies
- Validate YAML structure
- Review inheritance chains

### 4. Test Your Workshop
```bash
# Navigate to your workshop module
cd workshops/my-workshop/module-01/

# Test current directory
test-notebooks

# Test entire module (from anywhere in module)
test-notebooks -m

# Test all workshops
test-notebooks -a

# Test with Docker (for PostgreSQL/Redis dependent notebooks)
test-notebooks -d
```

**Testing Script Features:**
- ✅ Context-aware (knows where you are in the repo)
- ✅ Automatically discovers notebooks
- ✅ Works with any workshop structure
- ✅ Docker integration for database testing
- ✅ Detailed error reporting

**Common Usage:**
```bash
# Quick test while working on a module
cd workshops/deploy-redis-for-developers-amr/module-08/
test-notebooks

# Test everything before committing
test-notebooks -a -d

# Verbose output for debugging
test-notebooks -v

# Custom timeout for long-running notebooks
test-notebooks --timeout 900
```

### 5. Publish
- Commit changes to your branch
- Create Pull Request from GUI
- Merge to main
- Workshop automatically appears on GitHub Pages

---

## 🧪 Testing Notebooks

The repository includes a smart testing script that validates Jupyter notebooks:

### Quick Start

```bash
# Test notebooks in your current directory
test-notebooks

# Test entire module (even from subfolders)
test-notebooks -m

# Test all workshops
test-notebooks -a

# With Docker (PostgreSQL + Redis)
test-notebooks -d
```

### Script Features

**Context-Aware Testing:**
- Automatically detects your location in the repository
- Tests based on scope: current directory, module, or all workshops
- No configuration needed for new workshops

**Smart Discovery:**
- Finds all `.ipynb` files automatically
- Skips `.ipynb_checkpoints` directories
- Works with any workshop structure

**Docker Integration:**
- Automatically starts PostgreSQL 15 (port 5432)
- Automatically starts Redis 7 (port 6379)
- Cleans up containers after testing

**Flexible Options:**
```bash
test-notebooks [OPTIONS]

Options:
  (no options)     Test notebooks in current directory
  -m, --module     Test entire module (parent directory)
  -a, --all        Test all notebooks in all workshops
  -d, --docker     Start Docker containers
  -v, --verbose    Show detailed output
  --timeout SEC    Set timeout per notebook (default: 600)
  -h, --help       Show help message
```

### Testing Workflow Examples

**1. While Developing a Module:**
```bash
cd workshops/my-workshop/module-03/
test-notebooks
# → Tests only notebooks in module-03
```

**2. Before Committing:**
```bash
test-notebooks -a -d
# → Tests all notebooks with Docker
```

**3. Debugging Failures:**
```bash
test-notebooks -v --timeout 900
# → Verbose output with 15-minute timeout
```

**4. CI/CD Integration:**
```bash
# In your GitHub Actions workflow
- name: Test Notebooks
  run: |
    test-notebooks -a -d
```

### Multi-Workshop Support

The testing script automatically works with **any workshop** you add:

```
workshops/
├── deploy-redis-for-developers-amr/    ✅ Tested
├── my-new-workshop/                    ✅ Tested
└── another-workshop/                   ✅ Tested
```

No configuration changes needed! Just add your workshop and run `test-notebooks -a`.

---

## 🎓 For Workshop Participants

### Prerequisites
- GitHub account
- Basic Git knowledge (helpful)
- Modern web browser

### Taking a Workshop

1. **Browse Available Workshops**
   - Visit [GitHub Pages Catalog](https://tfindelkind-redis.github.io/redis-workshops/)
   - Filter by difficulty level
   - Read workshop descriptions

2. **Fork & Clone**
   ```bash
   # Fork on GitHub, then:
   git clone https://github.com/YOUR-USERNAME/redis-workshops.git
   cd redis-workshops
   ```

3. **Navigate to Workshop**
   ```bash
   cd workshops/azure-managed-redis-developer-workshop
   ```

4. **Follow Workshop Instructions**
   - Each workshop has its own README
   - Complete modules in order
   - Work through exercises
   - Track your progress with Git commits

### Using GitHub Codespaces

For a zero-setup experience:

1. Fork this repository
2. Click "Code" → "Codespaces" → "Create codespace"
3. Everything is pre-configured!
4. Navigate to your workshop and start learning

---

## �️ Technical Details

### Backend API (Workshop Builder Server)

The Node.js/Express server provides:
- Workshop CRUD operations
- Git operations (branch, commit, PR creation)
- GitHub API integration
- Module management
- File system operations

**Endpoints:**
- `GET /workshops` - List all workshops
- `POST /workshops` - Create workshop
- `GET /workshops/:id` - Get workshop details
- `PUT /workshops/:id` - Update workshop
- `DELETE /workshops/:id` - Delete workshop
- `POST /git/*` - Git operations
- `GET /github/*` - GitHub API calls

### Frontend (Workshop Builder GUI)

Modern HTML5/JavaScript SPA featuring:
- Drag-and-drop interface
- Real-time validation
- Git integration UI
- Module browser with tree view
- Workshop preview

### Module System Architecture

```yaml
# Workshop YAML structure
id: my-workshop
title: My Workshop
difficulty: intermediate
duration_minutes: 180
modules:
  - id: module-1
    source: shared
  - id: module-2
    source: local
    inherits_from: shared/modules/base-module
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

1. **Report Issues** - Found a bug? [Open an issue](https://github.com/tfindelkind-redis/redis-workshops/issues)
2. **Create Workshops** - Share your Redis expertise
3. **Improve Modules** - Enhance shared learning content
4. **Enhance Tools** - Improve the Workshop Builder
5. **Documentation** - Help others learn the system

### Development Setup

```bash
# Clone the repository
git clone https://github.com/tfindelkind-redis/redis-workshops.git
cd redis-workshops

# Start the Workshop Builder
./start-workshop-builder.sh

# Make your changes
# Test thoroughly
# Create a Pull Request
```

---

## 📖 Documentation

- **[Workshop Builder Quick Start](WORKSHOP_BUILDER_QUICK_START.md)** - Get started in 5 minutes
- **[Docker Setup Guide](DOCKER_SETUP.md)** - Detailed Docker configuration
- **[GUI Documentation](docs/WORKSHOP_BUILDER_GUI.md)** - Complete GUI reference
- **[Filesystem Integration](FILESYSTEM_INTEGRATION_COMPLETE.md)** - How file operations work
- **[Frontmatter Feature](FRONTMATTER-FEATURE.md)** - Workshop metadata system
- **[Modular Design](MODULAR_DESIGN.md)** - Architecture overview

---

## 🔧 System Requirements

### For Workshop Creators
- **Docker Desktop** (recommended) OR
- **Node.js 18+** (manual setup)
- **Git**
- **Modern web browser** (Chrome, Firefox, Edge, Safari)

### For Workshop Participants
- **Git**
- **Modern web browser**
- Workshop-specific requirements (detailed in each workshop)

---

## 📊 Project Status

- ✅ Visual Workshop Builder (fully functional)
- ✅ Git/GitHub integration (branch mgmt, PRs, commits)
- ✅ Module system with inheritance
- ✅ GitHub Pages catalog
- ✅ Docker deployment
- ✅ File system synchronization
- 🔄 Workshop content (expanding)
- 🔄 Documentation (ongoing)

---

## 📧 Support

- **Issues:** [GitHub Issues](https://github.com/tfindelkind-redis/redis-workshops/issues)
- **Discussions:** [GitHub Discussions](https://github.com/tfindelkind-redis/redis-workshops/discussions)
- **Pull Requests:** [Contributing Guide](#-contributing)

---

## 📝 License

[Add license information]

---

**Ready to create amazing Redis workshops?** 🚀

```bash
./start-workshop-builder.sh
open shared/tools/workshop-builder-gui.html
```
