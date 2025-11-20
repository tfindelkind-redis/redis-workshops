# Jupyter Notebook Testing Patterns Summary

## 🎯 Pattern Overview

This document explains the testing patterns used for dynamic Jupyter notebook validation.

---

## Pattern 1: Dynamic Discovery with Pytest Parametrize

**Best for:** Large workshop projects with many notebooks

### Implementation

```python
def find_all_notebooks():
    """Dynamically discover all .ipynb files"""
    notebooks = list(NOTEBOOKS_DIR.rglob("*.ipynb"))
    return [nb for nb in notebooks if ".ipynb_checkpoints" not in str(nb)]

@pytest.mark.parametrize("notebook_path", find_all_notebooks())
def test_notebook_execution(notebook_path):
    """Execute notebook and check for errors"""
    with open(notebook_path, 'r') as f:
        nb = nbformat.read(f, as_version=4)
    
    ep = ExecutePreprocessor(timeout=600, kernel_name='python3')
    ep.preprocess(nb, {'metadata': {'path': str(notebook_path.parent)}})
```

### Advantages
✅ Zero maintenance - automatically finds new notebooks  
✅ Each notebook is a separate test case  
✅ Detailed error reporting per notebook  
✅ Easy to run specific tests with `-k` flag  
✅ CI/CD friendly  

### When to Use
- Multiple notebooks that change frequently
- Need detailed per-notebook results
- Want pytest's ecosystem (fixtures, plugins, etc.)

---

## Pattern 2: ExecutePreprocessor (nbconvert)

**Best for:** Reliable notebook execution

### Implementation

```python
from nbconvert.preprocessors import ExecutePreprocessor

ep = ExecutePreprocessor(
    timeout=600,              # 10 minute timeout
    kernel_name='python3',    # Kernel to use
    allow_errors=False        # Stop on first error
)

ep.preprocess(notebook, {
    'metadata': {
        'path': str(notebook_dir)  # Working directory
    }
})
```

### Advantages
✅ Clean kernel for each test  
✅ Captures all outputs  
✅ Timeout protection  
✅ Well-maintained by Jupyter team  

### When to Use
- Need fresh environment for each test
- Want to capture cell outputs
- Need timeout protection

---

## Pattern 3: Fixture-Based Infrastructure

**Best for:** Tests requiring external services (Docker, databases)

### Implementation

```python
@pytest.fixture(scope="session")
def setup_environment():
    """Setup runs once for entire test session"""
    # Start Docker containers
    subprocess.run(["docker", "run", "-d", "--name", "test-postgres", ...])
    subprocess.run(["docker", "run", "-d", "--name", "test-redis", ...])
    
    time.sleep(5)  # Wait for startup
    
    yield  # Tests run here
    
    # Cleanup after all tests
    subprocess.run(["docker", "stop", "test-postgres", "test-redis"])
    subprocess.run(["docker", "rm", "test-postgres", "test-redis"])

def test_notebook(setup_environment):
    """This test uses the fixture"""
    # Docker containers are running
    execute_notebook(...)
```

### Advantages
✅ Setup runs once (faster)  
✅ Automatic cleanup  
✅ Shared resources across tests  
✅ Scope control (session, module, function)  

### When to Use
- Tests need Docker containers
- Need database connections
- Expensive setup/teardown

---

## Pattern 4: Validator Class Pattern

**Best for:** Complex validation logic

### Implementation

```python
class NotebookValidator:
    def __init__(self, notebook_path):
        self.path = notebook_path
        with open(notebook_path) as f:
            self.nb = nbformat.read(f, as_version=4)
    
    def verify_docker_commands(self):
        """Check for Docker setup"""
        return bool(self.check_for_pattern(r'docker\s+run'))
    
    def verify_database_connection(self):
        """Check for DB connection code"""
        patterns = [r'psycopg2\.connect', r'redis\.Redis\(']
        return {p: bool(self.check_for_pattern(p)) for p in patterns}
    
    def get_execution_errors(self):
        """Extract errors from executed notebook"""
        errors = []
        for i, cell in enumerate(self.nb.cells):
            if cell.cell_type == 'code' and 'outputs' in cell:
                for output in cell.outputs:
                    if output.get('output_type') == 'error':
                        errors.append({
                            'cell_number': i + 1,
                            'error': output.get('ename')
                        })
        return errors
```

### Advantages
✅ Reusable validation logic  
✅ Can validate without execution  
✅ Easy to extend with new checks  
✅ Clean test code  

### When to Use
- Need custom validation rules
- Want to check notebook content before execution
- Building reusable test utilities

---

## Pattern 5: Shell Script Runner

**Best for:** Simple execution without pytest

### Implementation

```bash
#!/bin/bash
NOTEBOOKS=$(find workshops -name "*.ipynb" ! -path "*/.ipynb_checkpoints/*")

for notebook in $NOTEBOOKS; do
    echo "Testing: $notebook"
    jupyter nbconvert --to notebook --execute "$notebook" \
        --output /tmp/test-output.ipynb
    
    if [ $? -eq 0 ]; then
        echo "✅ Passed"
    else
        echo "❌ Failed"
        FAILED+=("$notebook")
    fi
done

[ ${#FAILED[@]} -eq 0 ] && exit 0 || exit 1
```

### Advantages
✅ No Python dependencies  
✅ Simple and transparent  
✅ Easy to understand  
✅ Works anywhere with bash  

### When to Use
- Want minimal dependencies
- Simple pass/fail testing
- Quick validation scripts

---

## Pattern 6: CI/CD Integration

**Best for:** Automated testing on commits

### Implementation (GitHub Actions)

```yaml
name: Test Notebooks

on:
  push:
    paths: ['workshops/**/*.ipynb']
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        # ... configuration
      redis:
        image: redis:7-alpine
        # ... configuration
    
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-python@v4
    
    - name: Run tests
      run: pytest tests/test_notebooks.py -v
```

### Advantages
✅ Automatic testing on every commit  
✅ Tests run in clean environment  
✅ Services (Docker) managed by CI  
✅ Parallel execution possible  

### When to Use
- Multi-developer projects
- Want automated quality checks
- Need testing before merge

---

## Pattern Comparison Matrix

| Pattern | Setup Complexity | Flexibility | Performance | Dependencies |
|---------|-----------------|-------------|-------------|--------------|
| Pytest Parametrize | Medium | High | Good | pytest, nbformat |
| ExecutePreprocessor | Low | Medium | Good | nbconvert |
| Fixtures | Medium | High | Excellent | pytest |
| Validator Class | High | Very High | Good | nbformat |
| Shell Script | Very Low | Low | Good | bash, jupyter |
| CI/CD | High | Very High | Excellent | CI platform |

---

## Recommended Stack

For most projects, use this combination:

1. **Pytest + Parametrize** - Main test framework
2. **ExecutePreprocessor** - Notebook execution
3. **Fixtures** - Docker/infrastructure setup
4. **Validator Class** - Custom validation
5. **CI/CD** - Automated testing

This gives you:
- ✅ Dynamic discovery
- ✅ Reliable execution
- ✅ Clean setup/teardown
- ✅ Extensible validation
- ✅ Automated quality checks

---

## Quick Start Commands

```bash
# Install dependencies
pip install -r tests/requirements.txt

# Run all tests
pytest tests/test_notebooks.py -v

# Run specific module
pytest tests/test_notebooks.py -k "module-08" -v

# Use Makefile shortcuts
make test              # Full test suite
make test-simple       # Simple runner
make test-notebook NB=module-08  # Single notebook

# Shell script
./tests/run_notebook_tests.sh

# Simple Python runner
python3 tests/simple_test_runner.py
```

---

## Best Practices

### ✅ Do This

- Use dynamic discovery (find notebooks automatically)
- Parameterize tests for scalability
- Set reasonable timeouts (5-10 minutes)
- Clean up resources in fixtures
- Use descriptive test IDs
- Document expected failures

### ❌ Avoid This

- Hardcoding notebook paths
- No timeout protection
- Ignoring execution errors
- Manual test maintenance
- Skipping cleanup

---

## Real-World Example

Your Redis workshops now have:

```python
# Discovers ALL notebooks automatically
@pytest.mark.parametrize("notebook_path", find_all_notebooks())
def test_notebook_execution(notebook_path, setup_environment):
    """
    - Finds 8+ notebooks automatically
    - Starts Docker once for all tests
    - Executes each notebook in clean kernel
    - Reports errors with cell numbers
    - Cleans up automatically
    """
    validator = NotebookValidator(notebook_path)
    nb = validator.execute()
    errors = validator.get_execution_errors()
    
    assert len(errors) == 0, f"Found {len(errors)} execution errors"
```

**Result:** Add/modify notebooks freely - tests adapt automatically! 🎉
