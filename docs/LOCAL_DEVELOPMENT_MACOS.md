# Local Development on macOS

This guide explains how to run the Redis Workshop on your Mac exactly like it runs in GitHub Codespaces, without polluting the repository.

## 🎯 Quick Start

```bash
# Run the setup script (one time only)
./scripts/setup-local-mac.sh

# That's it! The script will:
# ✅ Install Redis
# ✅ Create isolated Python virtual environment (.venv/)
# ✅ Install Jupyter and all dependencies
# ✅ Add scripts to your PATH
# ✅ Start Redis server
# ✅ Configure convenient aliases
```

## 📦 What Gets Installed

The setup script installs everything needed for the workshop:

### System Tools (via Homebrew)
- **Redis** - In-memory database server
- **Docker Desktop** - For PostgreSQL containers (prompted if missing)

### Python Environment (in `.venv/`)
- **Jupyter Lab & Notebook** - Interactive notebook environment
- **Testing Framework** - pytest, nbformat, nbconvert
- **Workshop Dependencies** - redis, flask, psycopg2, azure-identity, etc.
- **Data Science Tools** - pandas, matplotlib, plotly

### Configuration
- **Jupyter Kernel** - "Python (Redis Workshop)" kernel
- **PATH** - Scripts added to shell profile
- **Aliases** - Convenient shortcuts (see below)

## 🚀 Daily Usage

### Activate Environment

Every time you open a new terminal:

```bash
# Navigate to repository
cd ~/Code/redis-workshops

# Activate the environment
source .activate-local

# Or use the alias
workshop-activate
```

**Output:**
```
✓ Python virtual environment activated
✓ Workshop scripts added to PATH
✓ Redis is running on localhost:6379
✓ Docker is running

🎉 Workshop environment ready!
```

### Working with Notebooks

```bash
# Start Jupyter Lab (recommended)
jupyter lab

# Or Jupyter Notebook (classic interface)
jupyter notebook

# Open a specific notebook
jupyter lab workshops/deploy-redis-for-developers-amr/module-08-implement-caching-lab/implement-caching-lab.ipynb
```

### Testing Notebooks

```bash
# Test current directory
cd module-08-implement-caching-lab
test-notebooks

# Test entire module
test-notebooks -m

# Test all notebooks with Docker
test-notebooks -a -d

# Test with verbose output
test-notebooks -v --timeout 900
```

### Redis Management

```bash
# Check Redis status
redis-cli ping
# Should return: PONG

# Start Redis (if stopped)
brew services start redis

# Stop Redis
brew services stop redis

# Restart Redis
brew services restart redis

# Connect to Redis CLI
redis-cli
```

## 🛠️ Convenience Aliases

The setup script creates these aliases in your shell profile:

| Alias | Command | Description |
|-------|---------|-------------|
| `workshop-activate` | `source .activate-local` | Activate environment |
| `workshop-test` | `test-notebooks` | Test current directory |
| `workshop-test-module` | `test-notebooks -m` | Test entire module |
| `workshop-test-all` | `test-notebooks -a` | Test all notebooks |
| `workshop-jupyter` | `jupyter lab` | Start Jupyter Lab |
| `workshop-redis-start` | `brew services start redis` | Start Redis |
| `workshop-redis-stop` | `brew services stop redis` | Stop Redis |
| `workshop-redis-status` | `redis-cli ping` | Check Redis status |

## 📂 Repository Structure (Local)

```
redis-workshops/
├── .venv/                  # ← Python virtual environment (gitignored)
├── .activate-local         # ← Activation script (gitignored)
├── scripts/
│   ├── setup-local-mac.sh  # ← One-time setup script
│   ├── test-notebooks      # ← Testing script (in PATH)
│   └── setup-environment.sh
├── workshops/
│   └── deploy-redis-for-developers-amr/
│       └── module-08-implement-caching-lab/
│           └── implement-caching-lab.ipynb
└── tests/
    ├── test_notebooks.py
    └── requirements.txt
```

**Note:** `.venv/` and `.activate-local` are automatically gitignored, so your local setup won't pollute the repository.

## 🔧 Differences from Codespaces

| Feature | Codespaces | Local Mac |
|---------|------------|-----------|
| Python Environment | System-wide | Isolated `.venv/` |
| Redis Installation | `apt-get` | Homebrew |
| Activation | Automatic | `source .activate-local` |
| Cleanup | Delete Codespace | `deactivate` + stop Redis |
| Docker | Built-in | Docker Desktop required |

## 🧪 Testing Your Setup

### 1. Test Redis Connection

```bash
source .activate-local
redis-cli ping
# Expected: PONG
```

### 2. Test Python Environment

```bash
source .activate-local
python --version
# Expected: Python 3.8+

which python
# Expected: /path/to/redis-workshops/.venv/bin/python
```

### 3. Test Jupyter

```bash
source .activate-local
jupyter --version
# Expected: jupyter core version info

jupyter kernelspec list
# Expected: Should include "redis-workshop"
```

### 4. Test Notebook Execution

```bash
source .activate-local
cd workshops/deploy-redis-for-developers-amr/module-08-implement-caching-lab
test-notebooks -d
```

### 5. Test Docker Integration

```bash
# Start Docker Desktop first
docker info

# Test with Docker containers
cd module-08-implement-caching-lab
test-notebooks -d
```

## 🐛 Troubleshooting

### Redis Not Running

**Problem:** `redis-cli ping` returns "Could not connect"

**Solution:**
```bash
# Start Redis
brew services start redis

# Wait a few seconds
sleep 2

# Test again
redis-cli ping
```

### Docker Not Available

**Problem:** `test-notebooks -d` fails with Docker errors

**Solution:**
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop
2. Install and start Docker Desktop
3. Wait for Docker icon in menu bar to show "Docker is running"
4. Test: `docker info`

### Python Environment Not Activated

**Problem:** `test-notebooks` command not found

**Solution:**
```bash
# Navigate to repository
cd ~/Code/redis-workshops

# Activate environment
source .activate-local

# Verify
which test-notebooks
# Expected: /path/to/redis-workshops/scripts/test-notebooks
```

### Jupyter Kernel Not Found

**Problem:** Jupyter doesn't show "Python (Redis Workshop)" kernel

**Solution:**
```bash
source .activate-local
python -m ipykernel install --user --name redis-workshop --display-name "Python (Redis Workshop)"
```

### Module Import Errors in Notebooks

**Problem:** `ModuleNotFoundError: No module named 'redis'`

**Solution:**
```bash
source .activate-local
pip install -r tests/requirements.txt

# Or install individual package
pip install redis psycopg2-binary azure-identity
```

### Permission Denied on Scripts

**Problem:** `Permission denied` when running scripts

**Solution:**
```bash
chmod +x scripts/*.sh
chmod +x scripts/test-notebooks
```

## 🔄 Updating Your Setup

If you pull new changes from the repository:

```bash
# Navigate to repository
cd ~/Code/redis-workshops

# Activate environment
source .activate-local

# Update Python packages
pip install --upgrade -r tests/requirements.txt

# Update scripts permissions
chmod +x scripts/*.sh scripts/test-notebooks
```

## 🧹 Cleaning Up

### Deactivate Environment

```bash
# Deactivate Python virtual environment
deactivate

# Stop Redis
brew services stop redis
```

### Remove Local Setup (Complete Cleanup)

```bash
# Remove virtual environment
rm -rf .venv

# Remove activation script
rm .activate-local

# Stop Redis
brew services stop redis

# Remove Redis (optional)
brew uninstall redis

# Remove from shell profile (manual)
# Edit ~/.zshrc or ~/.bash_profile and remove:
# - Redis Workshop Scripts section
# - Redis Workshop Aliases section
```

## 📚 Additional Resources

### Running Individual Modules

```bash
source .activate-local

# Module 8 with Docker
cd workshops/deploy-redis-for-developers-amr/module-08-implement-caching-lab
test-notebooks -d

# Module 7 (Azure provisioning)
cd workshops/deploy-redis-for-developers-amr/module-07-provision--connect-lab
jupyter notebook provision-connect-lab.ipynb
```

### Using VS Code

1. Open repository in VS Code
2. Install Python extension
3. Select Python interpreter: `.venv/bin/python`
4. Open a notebook
5. Select kernel: "Python (Redis Workshop)"
6. Run cells

### Using Jupyter Lab

```bash
source .activate-local
jupyter lab

# Features:
# - File browser on left
# - Multiple notebooks in tabs
# - Terminal access
# - Extension manager
# - Better debugging
```

### Using Makefile Commands

```bash
source .activate-local

# Run all tests
make test

# Test specific module
make test-notebook NB=module-08-implement-caching-lab

# Start Docker containers
make docker-start

# Clean up
make clean
```

## 🎓 Best Practices

### 1. Always Activate First

```bash
# ❌ Don't do this
cd ~/Code/redis-workshops
jupyter lab  # Uses system Python!

# ✅ Do this
cd ~/Code/redis-workshops
source .activate-local  # Activates .venv
jupyter lab  # Uses workshop Python
```

### 2. Check Redis Before Testing

```bash
source .activate-local
redis-cli ping  # Make sure Redis is running
test-notebooks -d  # Then test
```

### 3. Use Docker for PostgreSQL

```bash
# Module 8 needs PostgreSQL
test-notebooks -d  # Automatically starts Docker containers

# Or start manually
docker run --name workshop-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 -d postgres:15-alpine
```

### 4. Keep Dependencies Updated

```bash
source .activate-local
pip list --outdated  # Check for updates
pip install --upgrade jupyter nbformat nbconvert
```

## 🆚 Comparison: Local vs Codespaces

### Use Local When:
- ✅ Working offline
- ✅ Need faster performance
- ✅ Prefer your own editor/IDE
- ✅ Want persistent setup
- ✅ Have powerful Mac

### Use Codespaces When:
- ✅ On different computer
- ✅ Don't want to install anything
- ✅ Need clean environment
- ✅ Collaborating with others
- ✅ Quick testing

## 📞 Support

If you encounter issues:

1. **Check Prerequisites:**
   ```bash
   brew --version  # Homebrew
   python3 --version  # Python 3.8+
   redis-cli --version  # Redis
   docker --version  # Docker
   ```

2. **Re-run Setup:**
   ```bash
   ./scripts/setup-local-mac.sh
   ```

3. **Check Logs:**
   ```bash
   brew services list
   tail -f /usr/local/var/log/redis.log
   ```

4. **Reset Environment:**
   ```bash
   deactivate
   rm -rf .venv
   ./scripts/setup-local-mac.sh
   ```

---

**🎉 Enjoy Your Local Workshop Environment!**

Your Mac is now configured exactly like GitHub Codespaces, with all dependencies isolated in `.venv/` so you don't pollute your system or the repository.
