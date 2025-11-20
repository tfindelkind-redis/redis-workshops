"""
Test suite for Jupyter notebooks - automatically discovers and executes all notebooks
"""
import pytest
import os
import nbformat
from nbconvert.preprocessors import ExecutePreprocessor
from pathlib import Path

# Configuration
NOTEBOOKS_DIR = Path(__file__).parent.parent / "workshops" / "deploy-redis-for-developers-amr"
TIMEOUT = 600  # 10 minutes per notebook
KERNEL_NAME = "python3"

def find_all_notebooks():
    """Dynamically discover all .ipynb files in the workshop"""
    notebooks = list(NOTEBOOKS_DIR.rglob("*.ipynb"))
    # Filter out checkpoints and hidden files
    notebooks = [nb for nb in notebooks if ".ipynb_checkpoints" not in str(nb)]
    return notebooks

def get_notebook_info(notebook_path):
    """Extract metadata for test naming"""
    module_name = notebook_path.parent.name
    notebook_name = notebook_path.stem
    return f"{module_name}/{notebook_name}"

@pytest.fixture(scope="session")
def setup_environment():
    """Setup environment before running tests (e.g., start Docker containers)"""
    import subprocess
    
    print("\n🐳 Starting Docker containers for tests...")
    
    # Start PostgreSQL
    subprocess.run([
        "docker", "run", "-d", "--name", "test-postgres",
        "-e", "POSTGRES_PASSWORD=workshop123",
        "-e", "POSTGRES_USER=workshop",
        "-e", "POSTGRES_DB=workshop",
        "-p", "5432:5432",
        "postgres:15-alpine"
    ], capture_output=True)
    
    # Start Redis
    subprocess.run([
        "docker", "run", "-d", "--name", "test-redis",
        "-p", "6379:6379",
        "redis:7-alpine"
    ], capture_output=True)
    
    # Wait for containers to be ready
    import time
    time.sleep(5)
    
    yield
    
    # Cleanup
    print("\n🧹 Cleaning up Docker containers...")
    subprocess.run(["docker", "stop", "test-postgres", "test-redis"], capture_output=True)
    subprocess.run(["docker", "rm", "test-postgres", "test-redis"], capture_output=True)

@pytest.mark.parametrize("notebook_path", find_all_notebooks(), ids=get_notebook_info)
def test_notebook_execution(notebook_path, setup_environment):
    """
    Execute all cells in a notebook and check for errors.
    This test runs dynamically - any new/changed notebooks are automatically tested.
    """
    print(f"\n📓 Testing: {get_notebook_info(notebook_path)}")
    
    # Read the notebook
    with open(notebook_path, 'r', encoding='utf-8') as f:
        nb = nbformat.read(f, as_version=4)
    
    # Configure execution
    ep = ExecutePreprocessor(
        timeout=TIMEOUT,
        kernel_name=KERNEL_NAME,
        allow_errors=False  # Fail on any cell error
    )
    
    # Execute the notebook
    try:
        ep.preprocess(nb, {'metadata': {'path': str(notebook_path.parent)}})
        print(f"✅ Passed: {get_notebook_info(notebook_path)}")
    except Exception as e:
        pytest.fail(f"Notebook execution failed: {str(e)}")

@pytest.mark.parametrize("notebook_path", find_all_notebooks(), ids=get_notebook_info)
def test_notebook_has_cells(notebook_path):
    """Verify notebook has content"""
    with open(notebook_path, 'r', encoding='utf-8') as f:
        nb = nbformat.read(f, as_version=4)
    
    assert len(nb.cells) > 0, f"Notebook {notebook_path.name} has no cells"
    
    # Check for code cells
    code_cells = [c for c in nb.cells if c.cell_type == 'code']
    assert len(code_cells) > 0, f"Notebook {notebook_path.name} has no code cells"

@pytest.mark.parametrize("notebook_path", find_all_notebooks(), ids=get_notebook_info)
def test_notebook_metadata(notebook_path):
    """Verify notebook has proper metadata"""
    with open(notebook_path, 'r', encoding='utf-8') as f:
        nb = nbformat.read(f, as_version=4)
    
    # Check kernel info
    assert 'kernelspec' in nb.metadata, f"Notebook {notebook_path.name} missing kernelspec"
    assert 'language_info' in nb.metadata, f"Notebook {notebook_path.name} missing language_info"
