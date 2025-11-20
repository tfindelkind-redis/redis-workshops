# Jupyter Notebook Testing

This directory contains a **dynamic testing framework** for all Redis workshop Jupyter notebooks.

## 🎯 Key Features

✅ **Dynamic Discovery** - Automatically finds all `.ipynb` files  
✅ **No Manual Updates** - Tests adapt to notebook changes automatically  
✅ **Cell Execution** - Runs every code cell and checks for errors  
✅ **Docker Integration** - Starts PostgreSQL & Redis for realistic testing  
✅ **CI/CD Ready** - GitHub Actions workflow included  
✅ **Detailed Reporting** - Shows which cells failed and why  

## 🚀 Quick Start

### Local Testing

```bash
# Install dependencies
pip install -r tests/requirements.txt

# Run all notebook tests
chmod +x tests/run_notebook_tests.sh
./tests/run_notebook_tests.sh

# Or use pytest directly
pytest tests/test_notebooks.py -v
```

### Run Specific Tests

```bash
# Test a specific notebook
pytest tests/test_notebooks.py -k "module-08"

# Test with more detail
pytest tests/test_notebooks.py -v --tb=long

# Run advanced validation tests
pytest tests/test_notebook_advanced.py
```

## 📚 Test Patterns Used

### 1. **Parameterized Testing Pattern**

```python
@pytest.mark.parametrize("notebook_path", find_all_notebooks())
def test_notebook_execution(notebook_path):
    # Execute notebook and check for errors
    pass
```

**Benefits:**
- Automatically discovers new notebooks
- Each notebook is a separate test case
- Easy to identify which notebook failed

### 2. **ExecutePreprocessor Pattern**

```python
from nbconvert.preprocessors import ExecutePreprocessor

ep = ExecutePreprocessor(timeout=600, kernel_name='python3')
ep.preprocess(notebook, {'metadata': {'path': notebook_dir}})
```

**Benefits:**
- Runs notebooks in clean kernel
- Captures execution errors
- Works with any Python version

### 3. **Fixture-Based Setup Pattern**

```python
@pytest.fixture(scope="session")
def setup_environment():
    # Start Docker containers
    yield
    # Clean up containers
```

**Benefits:**
- Setup runs once for all tests
- Automatic cleanup
- Shares resources across tests

### 4. **Validation Pattern**

```python
class NotebookValidator:
    def verify_docker_commands(self): ...
    def verify_database_connection(self): ...
    def get_execution_errors(self): ...
```

**Benefits:**
- Reusable validation logic
- Check notebook content without execution
- Extensible for new checks

## 🏗️ Architecture

```
tests/
├── test_notebooks.py           # Main dynamic execution tests
├── test_notebook_advanced.py   # Advanced validation tests
├── requirements.txt            # Test dependencies
├── run_notebook_tests.sh       # Shell script runner
└── README.md                   # This file

.github/workflows/
└── test-notebooks.yml          # CI/CD automation

pytest.ini                      # Pytest configuration
```

## 🔍 What Gets Tested

### Automatic Checks

1. **Execution** - All code cells run without errors
2. **Content** - Notebooks have cells and code
3. **Metadata** - Proper kernel and language info
4. **Docker** - Required Docker commands present
5. **Connections** - Database connection code exists
6. **Outputs** - Cells produce expected outputs

### Per-Notebook Tests

Each notebook is tested for:
- ✅ Successful execution of all cells
- ✅ No Python exceptions
- ✅ No syntax errors
- ✅ Proper imports
- ✅ Database connectivity
- ✅ Redis connectivity

## 🎓 Testing Philosophy

### **Dynamic Over Static**

❌ **Don't do this:**
```python
def test_module_8():
    # Hardcoded test for specific notebook
    run_notebook("module-08/implement-caching-lab.ipynb")
```

✅ **Do this instead:**
```python
@pytest.mark.parametrize("notebook_path", find_all_notebooks())
def test_notebook_execution(notebook_path):
    # Works for any notebook, automatically
    execute_notebook(notebook_path)
```

### **Benefits of Dynamic Testing**

1. **Zero Maintenance** - Add/remove notebooks, tests adapt
2. **Scalable** - Works with 8 notebooks or 800 notebooks
3. **Consistent** - Same testing logic for all notebooks
4. **Fast Feedback** - Know immediately if changes break anything
5. **CI/CD Ready** - Runs automatically on every commit

## 🛠️ Customization

### Add Custom Validators

```python
class NotebookValidator:
    def verify_custom_pattern(self):
        """Add your own validation logic"""
        pattern = r'your_pattern_here'
        return self.check_for_pattern(pattern)
```

### Skip Specific Notebooks

```python
SKIP_NOTEBOOKS = [
    "module-07-provision-connect-lab",  # Azure-only
]

def find_all_notebooks():
    notebooks = list(NOTEBOOKS_DIR.rglob("*.ipynb"))
    return [nb for nb in notebooks if nb.stem not in SKIP_NOTEBOOKS]
```

### Adjust Timeouts

```python
# In test_notebooks.py
TIMEOUT = 600  # 10 minutes per notebook

# Or in pytest.ini
timeout = 600
```

## 🐛 Debugging Failed Tests

### View Full Traceback

```bash
pytest tests/test_notebooks.py -v --tb=long
```

### Test Single Notebook

```bash
pytest tests/test_notebooks.py::test_notebook_execution[module-08/implement-caching-lab.ipynb] -v
```

### Check Notebook Output

```bash
# Execute notebook manually and save output
jupyter nbconvert --to notebook --execute \
  --output=/tmp/output.ipynb \
  workshops/deploy-redis-for-developers-amr/module-08-implement-caching-lab/implement-caching-lab.ipynb

# View the output
jupyter notebook /tmp/output.ipynb
```

## 📊 CI/CD Integration

Tests run automatically on:
- **Push to main/develop** - Full test suite
- **Pull Requests** - Full test suite with PR comments
- **Schedule** - (Optional) Daily/weekly tests

View results in GitHub Actions tab.

## 🔗 Related Patterns

- **Papermill** - Parameterized notebook execution
- **nbval** - Validate notebook outputs
- **testbook** - Unit test notebook cells
- **treon** - Simple notebook test runner

Our approach combines the best of these patterns for maximum flexibility.

## 💡 Tips

1. **Fast iteration**: Use `-k` flag to test specific notebooks during development
2. **Parallel execution**: Use `pytest-xdist` for faster tests: `pytest -n auto`
3. **Coverage**: Add `pytest-cov` to measure test coverage
4. **Monitoring**: Set up alerts for test failures in CI/CD
5. **Documentation**: Keep notebooks as both docs and tests!

## 📝 Example Output

```
🧪 Redis Workshop Notebook Test Suite
======================================

🐳 Starting Docker containers...
⏳ Waiting for containers to be ready...

🔍 Discovering notebooks...
Found 8 notebooks

📓 Testing: module-02-azure-architecture-lab/azure-architecture-lab
✅ Passed: module-02-azure-architecture-lab/azure-architecture-lab

📓 Testing: module-08-implement-caching-lab/implement-caching-lab
✅ Passed: module-08-implement-caching-lab/implement-caching-lab

======================================
📊 Test Summary
======================================
Total: 8 notebooks
Passed: 8
Failed: 0

🎉 All notebooks passed!
```

## 🤝 Contributing

When adding new notebooks:
1. ✅ No test changes needed! Tests discover automatically
2. ✅ Ensure notebooks can run in clean environment
3. ✅ Use standard imports and dependencies
4. ✅ Include Docker setup if needed

That's it! The test framework handles the rest.
