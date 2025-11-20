# Local Development Setup - Complete Guide

## Overview

This setup allows you to run the Redis Workshop on your Mac **exactly like GitHub Codespaces**, with all dependencies isolated so you don't pollute your system or the repository.

## Key Features

✅ **Isolated Environment** - Everything in `.venv/` (gitignored)  
✅ **No Repository Pollution** - Local files are gitignored  
✅ **Same as Codespaces** - Identical Python packages and tools  
✅ **One Command Setup** - `./scripts/setup-local-mac.sh`  
✅ **Easy Activation** - `source .activate-local`  
✅ **Jupyter Integration** - Full Jupyter Lab/Notebook support  
✅ **Testing Framework** - Same `test-notebooks` script  
✅ **Docker Support** - PostgreSQL and Redis containers  

## Quick Start

### 1. Initial Setup (One Time)

```bash
cd ~/Code/redis-workshops
./scripts/setup-local-mac.sh
```

**What it does:**
- Installs Redis via Homebrew
- Creates Python virtual environment in `.venv/`
- Installs Jupyter and all workshop dependencies
- Registers Jupyter kernel
- Starts Redis server
- Adds scripts to PATH
- Creates convenience aliases

**Time:** ~5 minutes

### 2. Daily Usage

```bash
# Activate environment
source .activate-local

# Start working
cd workshops/deploy-redis-for-developers-amr/module-08-implement-caching-lab
test-notebooks -d
```

## File Structure

```
redis-workshops/
├── .venv/                     # ← Python virtual environment (GITIGNORED)
│   ├── bin/
│   │   ├── python             # Isolated Python
│   │   ├── jupyter            # Jupyter executable
│   │   └── pytest             # Test runner
│   ├── lib/
│   │   └── python3.x/
│   │       └── site-packages/ # All workshop packages
│   └── ...
│
├── .activate-local            # ← Activation script (GITIGNORED)
│
├── scripts/
│   ├── setup-local-mac.sh     # ← One-time setup script
│   ├── test-notebooks         # ← Testing script
│   └── setup-environment.sh   # ← Codespaces setup
│
├── workshops/
│   └── deploy-redis-for-developers-amr/
│       ├── module-02-azure-architecture-lab/
│       ├── module-04-reliability-security-lab/
│       ├── module-05-cost-optimization-lab/
│       ├── module-06-performance-data-modeling-lab/
│       ├── module-08-implement-caching-lab/
│       ├── module-10-troubleshooting-migration-lab/
│       └── module-11-advanced-features-lab/
│
├── tests/
│   ├── test_notebooks.py      # Pytest tests
│   ├── requirements.txt       # Python dependencies
│   └── ...
│
└── docs/
    ├── LOCAL_DEVELOPMENT_MACOS.md    # Full documentation
    ├── LOCAL_QUICK_REFERENCE.md      # Quick reference
    └── NOTEBOOK_TESTING_GUIDE.md     # Testing guide
```

## Installed Packages

All packages are installed in `.venv/lib/python3.x/site-packages/`:

### Core Jupyter
- `jupyter` - Jupyter metapackage
- `jupyterlab` - Modern Jupyter interface
- `ipykernel` - Python kernel for Jupyter
- `notebook` - Classic Jupyter Notebook

### Testing Framework
- `pytest` - Testing framework
- `nbformat` - Notebook format library
- `nbconvert` - Notebook conversion tool

### Workshop Dependencies
- `redis` - Redis Python client
- `flask` - Web framework
- `psycopg2-binary` - PostgreSQL adapter
- `python-dotenv` - Environment variables
- `azure-identity` - Azure authentication
- `azure-mgmt-redis` - Azure Redis management
- `azure-mgmt-resource` - Azure resource management

### Data Science
- `pandas` - Data analysis
- `matplotlib` - Plotting
- `plotly` - Interactive visualizations

### Performance Testing
- `locust` - Load testing framework

## Verification Checklist

After running `./scripts/setup-local-mac.sh`, verify:

```bash
# 1. Python virtual environment
source .activate-local
which python
# Expected: /path/to/redis-workshops/.venv/bin/python

# 2. Jupyter installed
jupyter --version
# Expected: jupyter core, jupyterlab, notebook versions

# 3. Jupyter kernel registered
jupyter kernelspec list | grep redis-workshop
# Expected: redis-workshop   /path/to/kernels/redis-workshop

# 4. Redis running
redis-cli ping
# Expected: PONG

# 5. Docker available (optional)
docker info
# Expected: Docker information (if Docker Desktop installed)

# 6. Scripts in PATH
which test-notebooks
# Expected: /path/to/redis-workshops/scripts/test-notebooks

# 7. Test execution
cd workshops/deploy-redis-for-developers-amr/module-08-implement-caching-lab
test-notebooks --help
# Expected: Help text with usage instructions
```

## Comparison: Local vs Codespaces

| Aspect | GitHub Codespaces | Local Mac |
|--------|------------------|-----------|
| **Setup** | Automatic on launch | One-time `setup-local-mac.sh` |
| **Activation** | Automatic | `source .activate-local` |
| **Python** | System-wide | Isolated `.venv/` |
| **Dependencies** | Pre-installed | Pre-installed in `.venv/` |
| **Redis** | Auto-start | `brew services start redis` |
| **Docker** | Built-in | Docker Desktop required |
| **Storage** | Cloud | Local disk |
| **Performance** | Cloud VM | Native Mac speed |
| **Offline** | ❌ No | ✅ Yes |
| **Cost** | GitHub quota | Free (local) |
| **Cleanup** | Delete Codespace | `rm -rf .venv/` |

## Environment Activation

The `.activate-local` script (auto-generated) does:

```bash
# Activate Python virtual environment
source .venv/bin/activate

# Add scripts to PATH
export PATH="$PWD/scripts:$PATH"

# Check Redis status
redis-cli ping &> /dev/null && echo "✓ Redis running"

# Check Docker status
docker info &> /dev/null && echo "✓ Docker running"

# Display available commands
echo "Available: test-notebooks, jupyter, redis-cli, docker"
```

## Convenience Aliases

Added to your shell profile (`~/.zshrc` or `~/.bash_profile`):

```bash
# Activation
alias workshop-activate='source .activate-local'

# Testing
alias workshop-test='test-notebooks'
alias workshop-test-module='test-notebooks -m'
alias workshop-test-all='test-notebooks -a'

# Jupyter
alias workshop-jupyter='jupyter lab'

# Redis Management
alias workshop-redis-start='brew services start redis'
alias workshop-redis-stop='brew services stop redis'
alias workshop-redis-status='redis-cli ping'
```

## Common Workflows

### Workflow 1: Work on Specific Module

```bash
# 1. Activate
cd ~/Code/redis-workshops
source .activate-local

# 2. Navigate to module
cd workshops/deploy-redis-for-developers-amr/module-08-implement-caching-lab

# 3. Open in Jupyter
jupyter lab implement-caching-lab.ipynb

# 4. Test
test-notebooks -d
```

### Workflow 2: Test All Modules

```bash
# 1. Activate
cd ~/Code/redis-workshops
source .activate-local

# 2. Test everything
test-notebooks -a -d

# Or use Makefile
make test
```

### Workflow 3: Develop and Test

```bash
# 1. Activate
source .activate-local

# 2. Edit notebook
jupyter lab workshops/.../module-08.../implement-caching-lab.ipynb

# 3. Test changes
cd workshops/.../module-08...
test-notebooks

# 4. Test entire module
test-notebooks -m

# 5. Test all before commit
cd ~/Code/redis-workshops
test-notebooks -a -d
```

### Workflow 4: Clean Development

```bash
# Start fresh session
cd ~/Code/redis-workshops
source .activate-local

# Verify environment
redis-cli ping
docker info
python --version
jupyter --version

# Work
cd workshops/.../module-08...
jupyter lab

# Test
test-notebooks -d -v

# Deactivate when done
deactivate
brew services stop redis
```

## Troubleshooting

### Issue: `test-notebooks: command not found`

**Cause:** Environment not activated

**Solution:**
```bash
cd ~/Code/redis-workshops
source .activate-local
```

### Issue: `redis-cli ping` returns error

**Cause:** Redis not running

**Solution:**
```bash
brew services start redis
sleep 2
redis-cli ping
```

### Issue: Docker commands fail

**Cause:** Docker Desktop not running

**Solution:**
1. Open Docker Desktop app
2. Wait for "Docker is running" in menu bar
3. Verify: `docker info`

### Issue: Jupyter kernel not found

**Cause:** Kernel not registered

**Solution:**
```bash
source .activate-local
python -m ipykernel install --user --name redis-workshop --display-name "Python (Redis Workshop)"
jupyter kernelspec list
```

### Issue: `ModuleNotFoundError` in notebooks

**Cause:** Package not installed in virtual environment

**Solution:**
```bash
source .activate-local
pip install redis psycopg2-binary azure-identity pandas matplotlib plotly flask
# Or install all
pip install -r tests/requirements.txt
```

### Issue: Wrong Python version

**Cause:** System Python being used

**Solution:**
```bash
source .activate-local
which python
# Should show: /path/to/.venv/bin/python

# If not, check activation
deactivate
source .activate-local
```

## Updating Your Setup

When you pull new changes:

```bash
# 1. Activate environment
source .activate-local

# 2. Update Python packages
pip install --upgrade -r tests/requirements.txt

# 3. Update Jupyter kernel (if needed)
python -m ipykernel install --user --name redis-workshop --display-name "Python (Redis Workshop)"

# 4. Update script permissions
chmod +x scripts/*.sh scripts/test-notebooks

# 5. Verify
test-notebooks --help
```

## Complete Cleanup

To remove all local setup:

```bash
# 1. Deactivate environment
deactivate

# 2. Stop services
brew services stop redis

# 3. Remove virtual environment
rm -rf .venv

# 4. Remove activation script
rm .activate-local

# 5. Clean Python cache
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null

# 6. (Optional) Remove Redis
brew uninstall redis

# 7. (Optional) Clean shell profile
# Manually edit ~/.zshrc or ~/.bash_profile
# Remove sections:
# - Redis Workshop Scripts
# - Redis Workshop Aliases
```

## Best Practices

### ✅ Do This

```bash
# Always activate first
source .activate-local

# Check services before testing
redis-cli ping
docker info

# Use aliases for convenience
workshop-test-module

# Keep packages updated
pip install --upgrade -r tests/requirements.txt

# Deactivate when done
deactivate
```

### ❌ Don't Do This

```bash
# Don't use system Python
jupyter lab  # Without activating first

# Don't install packages globally
pip install redis  # Should be in .venv

# Don't commit local files
git add .venv/  # Already gitignored

# Don't forget to activate
test-notebooks  # Without source .activate-local
```

## Performance Tips

### Faster Test Execution

```bash
# Test single module instead of all
test-notebooks -m

# Skip Docker if not needed
test-notebooks  # Without -d flag

# Use timeout for slow notebooks
test-notebooks --timeout 300
```

### Faster Jupyter Startup

```bash
# Start in specific directory
cd module-08-implement-caching-lab
jupyter lab

# Use classic notebook (lighter)
jupyter notebook
```

### Optimize Redis

```bash
# Monitor Redis performance
redis-cli info stats
redis-cli info memory

# Restart Redis if needed
brew services restart redis
```

## Security Notes

### Credentials Management

```bash
# Never commit credentials
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# Use environment variables
export AZURE_SUBSCRIPTION_ID="..."

# Or use .env file (gitignored)
cat > .env.local << EOF
AZURE_SUBSCRIPTION_ID=your-subscription-id
REDIS_PASSWORD=your-password
EOF
```

### Safe Testing

```bash
# Use Docker for databases (isolated)
test-notebooks -d

# Clean up after tests
docker stop workshop-postgres workshop-redis
docker rm workshop-postgres workshop-redis

# Flush Redis after tests
redis-cli FLUSHALL
```

## Integration with VS Code

### Setup

1. Open repository in VS Code
2. Install Python extension
3. `Cmd+Shift+P` → "Python: Select Interpreter"
4. Choose `.venv/bin/python`
5. Open a notebook
6. Select kernel: "Python (Redis Workshop)"

### Features

- ✅ IntelliSense with installed packages
- ✅ Debugging support
- ✅ Integrated terminal (auto-activates .venv)
- ✅ Jupyter extension
- ✅ Git integration

## Additional Resources

### Documentation Files

- **[LOCAL_DEVELOPMENT_MACOS.md](LOCAL_DEVELOPMENT_MACOS.md)** - Complete guide (20+ pages)
- **[LOCAL_QUICK_REFERENCE.md](LOCAL_QUICK_REFERENCE.md)** - Quick reference card
- **[NOTEBOOK_TESTING_GUIDE.md](NOTEBOOK_TESTING_GUIDE.md)** - Testing guide
- **[scripts/README.md](../scripts/README.md)** - Scripts documentation

### External Resources

- [Homebrew](https://brew.sh/) - Package manager for macOS
- [Python venv](https://docs.python.org/3/library/venv.html) - Virtual environments
- [Jupyter Lab](https://jupyterlab.readthedocs.io/) - Jupyter interface
- [Redis](https://redis.io/docs/) - Redis documentation
- [Docker Desktop](https://www.docker.com/products/docker-desktop) - Docker for Mac

## Summary

Your local Mac setup provides:

✅ **Isolated Python environment** in `.venv/`  
✅ **All Jupyter dependencies** pre-installed  
✅ **Redis server** running locally  
✅ **Docker support** for PostgreSQL  
✅ **Testing framework** with `test-notebooks`  
✅ **Convenience aliases** for common tasks  
✅ **No repository pollution** (everything gitignored)  
✅ **Same experience** as GitHub Codespaces  

**🎉 You can now develop workshops locally on your Mac exactly like in Codespaces!**

---

**Need Help?**
- Re-run setup: `./scripts/setup-local-mac.sh`
- Check status: `source .activate-local`
- View logs: `brew services list`
- Reset: `rm -rf .venv && ./scripts/setup-local-mac.sh`
