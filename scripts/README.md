# Workshop Scripts

This directory contains utility scripts for Redis workshop development and testing.

## 🎯 Quick Start

### In GitHub Codespaces (Automatic)
Scripts are automatically available in PATH after Codespace creation.

### On Local Mac (One-Time Setup)
```bash
./scripts/setup-local-mac.sh
source .activate-local
```

**📖 See:** [Local Development Guide](../docs/LOCAL_DEVELOPMENT_MACOS.md) | [Quick Reference](../docs/LOCAL_QUICK_REFERENCE.md)

---

## 📄 Available Scripts

### `test-notebooks`

Smart Jupyter notebook test runner with context-aware execution.

#### Basic Usage

```bash
# Test notebooks in current directory
test-notebooks

# Test entire module (from anywhere in module folder)
test-notebooks -m

# Test all notebooks in workshop
test-notebooks -a

# Test with Docker containers (PostgreSQL + Redis)
test-notebooks -d

# Verbose output
test-notebooks -v

# Custom timeout (default: 600 seconds)
test-notebooks --timeout 300
```

#### Context-Aware Behavior

The script automatically detects your location and adjusts test scope:

**Scenario 1: Inside a module directory**
```bash
cd workshops/deploy-redis-for-developers-amr/module-08-implement-caching-lab
test-notebooks        # Tests only module-08
test-notebooks -m     # Tests entire module-08
test-notebooks -a     # Tests all modules
```

**Scenario 2: Inside a subdirectory**
```bash
cd workshops/deploy-redis-for-developers-amr/module-08-implement-caching-lab/subfolder
test-notebooks        # Tests only this subfolder
test-notebooks -m     # Tests entire module-08
test-notebooks -a     # Tests all modules
```

**Scenario 3: At workshop root**
```bash
cd workshops/deploy-redis-for-developers-amr
test-notebooks        # Tests current directory
test-notebooks -a     # Tests all modules
```

#### Flags

| Flag | Long Form | Description |
|------|-----------|-------------|
| (none) | | Test current directory only |
| `-m` | `--module` | Test entire module (parent directory) |
| `-a` | `--all` | Test all notebooks in workshop |
| `-d` | `--docker` | Start Docker containers |
| `-v` | `--verbose` | Show detailed output |
| | `--timeout SEC` | Set timeout per notebook |
| `-h` | `--help` | Show help message |

#### Docker Integration

When using `-d`, the script automatically:
- Stops any existing test containers
- Starts PostgreSQL 15 on port 5432
- Starts Redis 7 on port 6379
- Cleans up containers after tests

Credentials:
- PostgreSQL: `user=workshop, password=workshop123, database=workshop`
- Redis: No authentication (localhost only)

#### Exit Codes

- `0` - All tests passed
- `1` - One or more tests failed

### `setup-environment.sh`

Configures the Codespaces environment for workshop development.

#### What it does:

1. **PATH Configuration**
   - Adds `scripts/` directory to PATH
   - Updates `.bashrc` and `.zshrc`
   - Makes scripts available from anywhere

2. **Python Dependencies**
   - Installs testing requirements
   - Sets up Jupyter kernel

3. **Docker Images**
   - Pre-pulls PostgreSQL and Redis images
   - Faster first test execution

4. **Aliases**
   - `nb-test` → `test-notebooks`
   - `nb-test-module` → `test-notebooks -m`
   - `nb-test-all` → `test-notebooks -a`
   - `nb-test-docker` → `test-notebooks -d`
   - `workshop-clean` → Clean up Docker containers

#### Running Manually

```bash
bash scripts/setup-environment.sh
```

## 🚀 Quick Start

### First Time Setup

```bash
# Run setup (automatically done in Codespaces)
bash scripts/setup-environment.sh

# Verify installation
test-notebooks --help
```

### Development Workflow

```bash
# Navigate to a module
cd workshops/deploy-redis-for-developers-amr/module-08-implement-caching-lab

# Make changes to notebook
# ...

# Test your changes
test-notebooks

# Test the entire module
test-notebooks -m

# Test with Docker if needed
test-notebooks -d
```

### CI/CD Integration

```bash
# Run all tests (CI mode)
test-notebooks -a -d --timeout 300
```

## 📊 Example Output

```
╔════════════════════════════════════════════════════╗
║  🧪 Redis Workshop Notebook Test Runner          ║
╚════════════════════════════════════════════════════╝

📍 Context:
   Repository: /workspaces/redis-workshops
   Current Dir: /workspaces/redis-workshops/workshops/.../module-08-implement-caching-lab
   Test Scope: current

🎯 Testing notebooks in current directory

🔧 Checking requirements...
   ✅ All requirements satisfied

🔍 Discovering notebooks...
   Found 1 notebook(s)

╔════════════════════════════════════════════════════╗
║  🚀 Running Tests                                  ║
╚════════════════════════════════════════════════════╝

📓 Testing: workshops/.../implement-caching-lab.ipynb
   ✅ PASSED

╔════════════════════════════════════════════════════╗
║  📊 Test Summary                                   ║
╚════════════════════════════════════════════════════╝

Total:  1 notebook(s)
Passed: 1 ✅
Failed: 0 ❌

🎉 All notebooks passed!
```

## 🎯 Use Cases

### Developer Testing

```bash
# Quick test during development
cd module-08-implement-caching-lab
test-notebooks

# Full module test before commit
test-notebooks -m -d
```

### Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit
test-notebooks -m || exit 1
```

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
steps:
  - name: Test all notebooks
    run: |
      bash scripts/setup-environment.sh
      test-notebooks -a -d --timeout 300
```

### Workshop Delivery

```bash
# Validate all notebooks before delivery
test-notebooks -a -d

# Test specific module
cd module-08-implement-caching-lab
test-notebooks -m -d
```

## 🔧 Troubleshooting

### Script not found

```bash
# Add scripts to PATH manually
export PATH="/workspaces/redis-workshops/scripts:$PATH"

# Or run directly
bash /workspaces/redis-workshops/scripts/test-notebooks
```

### Docker not starting

```bash
# Check Docker is running
docker info

# Clean up old containers
docker stop test-postgres test-redis
docker rm test-postgres test-redis

# Try again
test-notebooks -d
```

### Timeout errors

```bash
# Increase timeout for slow notebooks
test-notebooks --timeout 900  # 15 minutes
```

### Permission denied

```bash
# Make scripts executable
chmod +x scripts/*
```

## 📝 Adding New Scripts

1. Create script in `scripts/` directory
2. Add shebang: `#!/usr/bin/env bash` or `#!/usr/bin/env python3`
3. Make executable: `chmod +x scripts/your-script`
4. Update this README
5. Test from different directories

## 🤝 Contributing

When adding scripts:
- ✅ Make them context-aware (detect current directory)
- ✅ Support flexible options (-m, -a flags)
- ✅ Provide helpful error messages
- ✅ Include --help documentation
- ✅ Handle cleanup properly
- ✅ Use colors for output (RED, GREEN, YELLOW, CYAN)

## 📚 Related Documentation

- [Testing Patterns](../docs/TESTING_PATTERNS.md)
- [Tests README](../tests/README.md)
- [GitHub Actions Workflow](../.github/workflows/test-notebooks.yml)
