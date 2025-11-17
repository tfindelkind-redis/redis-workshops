# Redis Workshops

Welcome to the Redis Workshops repository! This repository hosts multiple hands-on workshops designed to help you learn Redis through practical exercises and real-world scenarios.

**🌐 Browse workshops online:** [https://tfindelkind-redis.github.io/redis-workshops/](https://tfindelkind-redis.github.io/redis-workshops/)

## 📚 Repository Structure

```
redis-workshops/
├── workshops/              # Individual workshop directories
├── shared/                 # Centrally-managed shared resources
│   ├── modules/           # Reusable learning modules
│   ├── tools/             # Shared utilities and scripts
│   └── templates/         # Templates for creating new content
└── docs/                  # Repository documentation
```

## 🎯 Available Workshops

Browse the `workshops/` directory to find available workshops. Each workshop is self-contained and references shared modules as needed.

### Workshop Index
- Coming soon...

## 🧩 Shared Modules

Modules are modular, reusable learning units that can be included in multiple workshops. They are centrally maintained in `shared/modules/` to ensure consistency and easy updates.

### Available Modules
- Coming soon...

## 🚀 Getting Started

### For Workshop Creators

**🎨 NEW! Visual Workshop Builder**

Create workshops visually - no Node.js installation required!

**Quick Start (Docker - Recommended):**
```bash
# 1. Start the server (requires Docker)
./start-workshop-builder.sh

# 2. Open the GUI in your browser
open shared/tools/workshop-builder-gui.html

# That's it! The GUI will automatically:
# - Create a Git branch
# - Load workshops from your repository
# - Save changes to workshop files
# - Commit changes with your custom messages
```

[📖 Docker Setup Guide](DOCKER_SETUP.md) | [📖 Quick Start Guide](WORKSHOP_BUILDER_QUICK_START.md)

**Features:**
- ✨ Visual interface for workshop creation
- 📂 Load and edit existing workshops from your repo
- 🌿 Automatic Git branch creation
- 💾 Save directly to workshop files
- 🎯 Drag-and-drop module ordering
- 👁️ Real-time preview and navigation
- 💬 Commit changes with custom messages

**Alternative (Manual Setup):**
```bash
# If you prefer not to use Docker
cd shared/tools/workshop-builder-server
npm install
npm start
# Then open shared/tools/workshop-builder-gui.html
```

[📖 GUI Documentation](docs/WORKSHOP_BUILDER_GUI.md) | [📖 Filesystem Integration](FILESYSTEM_INTEGRATION_COMPLETE.md)

**Command Line Tools**

For advanced users and automation:
```bash
# Create new workshop
./shared/tools/create-workshop.sh

# Manage modules
./shared/tools/module-manager.py list

# Build workshop
./shared/tools/workshop-builder.py build --workshop my-workshop
```

### For Workshop Participants

**Prerequisites:**
- A GitHub account (required for forking and secrets management)
- Basic familiarity with Git (helpful but not required)

**Quick Start:**

1. **Fork this repository**
   - Click the "Fork" button at the top right of this page
   - This creates your own copy where you can work through exercises and store secrets

2. **Open in GitHub Codespaces**
   - Go to your forked repository on GitHub
   - Click the green "Code" button → "Codespaces" → "Create codespace on main"
   - Everything is pre-configured! Redis, Python, Node.js, and all tools are ready in ~1 minute
   - No installation required - works entirely in your browser

3. **Navigate to a workshop**
   - Codespaces opens with VS Code in your browser
   - Open the terminal and navigate:
   ```bash
   cd workshops/redis-fundamentals  # or any other workshop
   ```

4. **Follow the workshop README**
   - Each workshop has its own README with specific instructions
   - Set up secrets using Codespaces Secrets (for API keys, credentials)
   - Complete modules in order
   - Redis is already running on localhost:6379!

**Why Fork + Codespaces?**
- 🔐 **Secrets Management:** Store API keys, Redis credentials safely in Codespaces Secrets
- 💾 **Save Progress:** Commit your exercise solutions to your repository
- ☁️ **Zero Setup:** No installation needed - everything works in your browser
- 🚀 **Instant Start:** From fork to coding in under 2 minutes
- 🔄 **Stay Updated:** Pull updates from the original repository when needed
- 🎯 **Personalize:** Customize workshops for your learning style

### For Workshop Authors

1. Read the [Workshop Creation Guide](docs/workshop-creation-guide.md)
2. Review the [Module Authoring Guide](docs/module-authoring-guide.md)
3. Use the templates in `shared/templates/` to get started
4. See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for contribution guidelines

## 🛠️ Quick Commands

Create a new workshop:
```bash
./shared/tools/create-workshop.sh "My Workshop Name"
```

Create a new module:
```bash
./shared/tools/create-module.sh "Module Name"
```

Validate workshop structure:
```bash
./shared/tools/validate-workshop.sh workshops/workshop-name
```

## 📖 Documentation

- [Contributing Guide](docs/CONTRIBUTING.md)
- [Workshop Creation Guide](docs/workshop-creation-guide.md)
- [Module Authoring Guide](docs/module-authoring-guide.md)
- [Workshop-Specific Modules](docs/workshop-specific-modules.md)
- [Quick Reference](docs/QUICK-REFERENCE.md)

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](docs/CONTRIBUTING.md) to get started.

## 📝 License

[Add your license information here]

## 📧 Contact

[Add contact information or links here]
