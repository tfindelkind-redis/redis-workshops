#!/usr/bin/env python3
"""
Lightweight notebook test runner - alternative to full pytest setup
Can be run standalone without installing pytest
"""
import subprocess
import sys
from pathlib import Path
import json

NOTEBOOKS_DIR = Path(__file__).parent.parent / "workshops" / "deploy-redis-for-developers-amr"
TIMEOUT = 600

def find_notebooks():
    """Find all notebook files"""
    notebooks = list(NOTEBOOKS_DIR.rglob("*.ipynb"))
    return [nb for nb in notebooks if ".ipynb_checkpoints" not in str(nb)]

def execute_notebook(notebook_path):
    """Execute notebook using jupyter nbconvert"""
    cmd = [
        "jupyter", "nbconvert",
        "--to", "notebook",
        "--execute",
        "--ExecutePreprocessor.timeout={}".format(TIMEOUT),
        "--output", "/tmp/test-output.ipynb",
        str(notebook_path)
    ]
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=TIMEOUT
        )
        return result.returncode == 0, result.stderr
    except subprocess.TimeoutExpired:
        return False, f"Timeout after {TIMEOUT} seconds"
    except Exception as e:
        return False, str(e)

def main():
    print("🧪 Notebook Test Runner")
    print("=" * 50)
    
    notebooks = find_notebooks()
    print(f"\n📓 Found {len(notebooks)} notebooks\n")
    
    passed = []
    failed = []
    
    for notebook in notebooks:
        relative_path = notebook.relative_to(NOTEBOOKS_DIR.parent)
        print(f"Testing: {relative_path}... ", end="", flush=True)
        
        success, error = execute_notebook(notebook)
        
        if success:
            print("✅ PASS")
            passed.append(str(relative_path))
        else:
            print("❌ FAIL")
            print(f"  Error: {error[:200]}")
            failed.append(str(relative_path))
    
    print("\n" + "=" * 50)
    print("📊 Summary")
    print("=" * 50)
    print(f"Total:  {len(notebooks)}")
    print(f"Passed: {len(passed)} ✅")
    print(f"Failed: {len(failed)} ❌")
    
    if failed:
        print("\nFailed notebooks:")
        for nb in failed:
            print(f"  ❌ {nb}")
        sys.exit(1)
    else:
        print("\n🎉 All notebooks passed!")
        sys.exit(0)

if __name__ == "__main__":
    main()
