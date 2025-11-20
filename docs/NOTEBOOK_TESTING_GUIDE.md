# Smart Notebook Testing - Complete Guide

This guide explains how to use the context-aware notebook testing system.

## 🎯 Overview

The `test-notebooks` script is a **smart, context-aware** testing tool that:

✅ Automatically detects your current location  
✅ Tests only what you need (current dir, module, or all)  
✅ Runs from anywhere in the repository  
✅ Manages Docker containers automatically  
✅ Available in PATH (no need for `./` or full paths)  

## 🚀 Quick Start

### Installation (Automatic in Codespaces)

The script is automatically added to your PATH when you open the Codespace.

```bash
# Verify installation
test-notebooks --help

# Or use the alias
nb-test --help
```

### Manual Installation (Local Development)

```bash
# Add scripts to PATH
export PATH="/path/to/redis-workshops/scripts:$PATH"

# Add to your shell profile for persistence
echo 'export PATH="/path/to/redis-workshops/scripts:$PATH"' >> ~/.bashrc

# Install dependencies
pip install jupyter nbformat nbconvert
```

## 📖 Usage Patterns

### Pattern 1: Test Current Directory

When you're working on a specific notebook:

```bash
cd workshops/deploy-redis-for-developers-amr/module-08-implement-caching-lab
test-notebooks
```

**What it does:**
- Tests only notebooks in `module-08-implement-caching-lab`
- Fast execution (only 1 notebook)
- Perfect for development workflow

### Pattern 2: Test Entire Module

When you want to test a complete module:

```bash
cd workshops/deploy-redis-for-developers-amr/module-08-implement-caching-lab
test-notebooks -m
```

**What it does:**
- Finds the module root (searches for `module-XX-` pattern)
- Tests all notebooks in the module and subdirectories
- Works from any subdirectory within the module

**Example:**
```bash
# Works from any depth!
cd module-08-implement-caching-lab/some/deep/folder
test-notebooks -m  # Still tests entire module-08
```

### Pattern 3: Test All Notebooks

When you want to validate the entire workshop:

```bash
# From anywhere
test-notebooks -a
```

**What it does:**
- Finds the workshops directory
- Tests ALL notebooks in ALL modules
- Full validation before releases

### Pattern 4: Test with Docker

When your notebooks need PostgreSQL or Redis:

```bash
test-notebooks -d      # Current directory + Docker
test-notebooks -m -d   # Module + Docker
test-notebooks -a -d   # All + Docker
```

**What it does:**
- Starts PostgreSQL 15 on port 5432
- Starts Redis 7 on port 6379
- Runs tests
- Cleans up containers automatically

## 🎨 Real-World Scenarios

### Scenario 1: Developing Module 8

```bash
# Start your work
cd workshops/deploy-redis-for-developers-amr/module-08-implement-caching-lab

# Edit notebook
code implement-caching-lab.ipynb

# Quick test (no Docker)
test-notebooks

# Full test with Docker
test-notebooks -d

# Before committing: test entire module
test-notebooks -m -d
```

### Scenario 2: Working in Subfolder

```bash
# Navigate to subfolder
cd workshops/deploy-redis-for-developers-amr/module-08-implement-caching-lab/exercises

# Test just this folder
test-notebooks

# Test entire module-08
test-notebooks -m
```

### Scenario 3: Pre-Commit Validation

```bash
# Changed multiple modules - test everything
test-notebooks -a -d --timeout 300
```

### Scenario 4: Workshop Delivery

```bash
# Final validation before delivery
cd workshops/deploy-redis-for-developers-amr
test-notebooks -a -d -v

# Check specific problematic module
cd module-08-implement-caching-lab
test-notebooks -m -d -v
```

## 🔧 Advanced Options

### Timeout Control

Some notebooks take longer to execute:

```bash
# Default: 600 seconds (10 minutes)
test-notebooks

# Increase for slow notebooks
test-notebooks --timeout 900  # 15 minutes

# Decrease for fast tests
test-notebooks --timeout 180  # 3 minutes
```

### Verbose Output

See detailed execution logs:

```bash
test-notebooks -v        # Show all output
test-notebooks -m -d -v  # Verbose with Docker
```

### Combining Flags

```bash
# Module + Docker + Verbose + Custom timeout
test-notebooks -m -d -v --timeout 900

# All notebooks + Docker + Verbose
test-notebooks -a -d -v
```

## 🎯 Aliases (Available After Setup)

### Standard Aliases

```bash
nb-test              # test-notebooks
nb-test-module       # test-notebooks -m
nb-test-all          # test-notebooks -a
nb-test-docker       # test-notebooks -d
workshop-clean       # Clean up Docker containers
```

### Usage Examples

```bash
# Quick test
nb-test

# Test module
nb-test-module

# Test all with Docker
nb-test-all -d

# Cleanup
workshop-clean
```

## 📊 Understanding Output

### Success Output

```
╔════════════════════════════════════════════════════╗
║  🧪 Redis Workshop Notebook Test Runner          ║
╚════════════════════════════════════════════════════╝

📍 Context:
   Repository: /workspaces/redis-workshops
   Current Dir: .../module-08-implement-caching-lab
   Test Scope: current

🎯 Testing notebooks in current directory

🔧 Checking requirements...
   ✅ All requirements satisfied

🔍 Discovering notebooks...
   Found 1 notebook(s)

╔════════════════════════════════════════════════════╗
║  🚀 Running Tests                                  ║
╚════════════════════════════════════════════════════╝

📓 Testing: implement-caching-lab.ipynb
   ✅ PASSED

╔════════════════════════════════════════════════════╗
║  📊 Test Summary                                   ║
╚════════════════════════════════════════════════════╝

Total:  1 notebook(s)
Passed: 1 ✅
Failed: 0 ❌

🎉 All notebooks passed!
```

### Failure Output

```
📓 Testing: implement-caching-lab.ipynb
   ❌ FAILED
   Run with -v for detailed error output

╔════════════════════════════════════════════════════╗
║  📊 Test Summary                                   ║
╚════════════════════════════════════════════════════╝

Total:  1 notebook(s)
Passed: 0 ✅
Failed: 1 ❌

Failed notebooks:
  ❌ implement-caching-lab.ipynb

💡 Tips:
  - Run with -v for detailed error output
  - Check if Docker containers are needed (-d flag)
  - Increase timeout with --timeout <seconds>
```

## 🐛 Troubleshooting

### Problem: Script not found

**Solution:**
```bash
# Check PATH
echo $PATH | grep scripts

# Add manually
export PATH="/workspaces/redis-workshops/scripts:$PATH"

# Or run setup again
bash scripts/setup-environment.sh
```

### Problem: Jupyter not installed

**Solution:**
```bash
pip install jupyter nbformat nbconvert
```

### Problem: Docker containers failing

**Solution:**
```bash
# Check Docker is running
docker info

# Clean up old containers
workshop-clean

# Try again
test-notebooks -d
```

### Problem: Notebook timeout

**Solution:**
```bash
# Increase timeout
test-notebooks --timeout 1200  # 20 minutes

# Or check notebook for infinite loops
test-notebooks -v  # See where it hangs
```

### Problem: Permission denied

**Solution:**
```bash
chmod +x scripts/test-notebooks
```

## 🔄 Development Workflow

### Daily Development

```bash
# 1. Navigate to module
cd workshops/.../module-XX-...

# 2. Edit notebook
# (make your changes)

# 3. Quick test
test-notebooks

# 4. Full test before commit
test-notebooks -m -d
```

### Before Pull Request

```bash
# Test everything
test-notebooks -a -d

# If successful, commit
git add .
git commit -m "feat: updated notebooks"
git push
```

### Workshop Delivery

```bash
# Final validation
test-notebooks -a -d -v --timeout 900

# Generate report
test-notebooks -a -d > test-report.txt 2>&1
```

## 📈 Performance Tips

### Faster Testing During Development

```bash
# Skip Docker if not needed
test-notebooks  # Much faster

# Test only current directory
cd specific-module
test-notebooks  # Only tests this folder
```

### Parallel Testing

For future implementation:

```bash
# Could add parallel execution
test-notebooks -a --parallel 4  # 4 notebooks at once
```

## 🎓 Best Practices

### ✅ Do This

1. **Test frequently** during development
   ```bash
   test-notebooks  # After each change
   ```

2. **Test module** before committing
   ```bash
   test-notebooks -m -d
   ```

3. **Test all** before releasing
   ```bash
   test-notebooks -a -d
   ```

4. **Use appropriate scope**
   - Current dir for quick iteration
   - Module for feature completion
   - All for final validation

5. **Add Docker** when needed
   ```bash
   test-notebooks -d  # Only if notebooks use DB
   ```

### ❌ Avoid This

1. **Don't skip tests** before committing
2. **Don't test all** for every small change (too slow)
3. **Don't forget Docker** flag for DB-dependent notebooks
4. **Don't ignore timeouts** (might indicate issues)

## 🔗 Integration Examples

### Git Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Test affected modules
CHANGED_NOTEBOOKS=$(git diff --cached --name-only | grep "\.ipynb$")

if [ -n "$CHANGED_NOTEBOOKS" ]; then
    echo "Testing changed notebooks..."
    test-notebooks -m || exit 1
fi
```

### GitHub Actions (Already Configured)

```yaml
# .github/workflows/test-notebooks.yml
- name: Test notebooks
  run: test-notebooks -a -d
```

### VS Code Task

```json
{
  "label": "Test Current Notebook",
  "type": "shell",
  "command": "test-notebooks",
  "problemMatcher": []
}
```

## 📚 Related Documentation

- [Scripts README](../scripts/README.md) - All available scripts
- [Testing Patterns](../docs/TESTING_PATTERNS.md) - Testing patterns explained
- [Tests README](../tests/README.md) - Pytest-based testing

## 💡 Pro Tips

1. **Use tab completion** - `test-<TAB>` shows all test commands
2. **Create custom aliases** - Add your own shortcuts to `.bashrc`
3. **Chain commands** - `test-notebooks && git commit -m "fix: notebook"`
4. **Use verbose** for debugging - Always add `-v` when troubleshooting
5. **Bookmark this guide** - Reference for all testing scenarios

## 🎉 Summary

The `test-notebooks` script gives you:

✅ **Context-aware testing** - Knows where you are  
✅ **Flexible scopes** - Test what you need  
✅ **Docker integration** - Automatic container management  
✅ **Fast feedback** - Quick iteration during development  
✅ **CI/CD ready** - Same tool everywhere  

Just remember:
- No flags = current directory
- `-m` = entire module
- `-a` = all notebooks
- `-d` = with Docker

Happy testing! 🚀
