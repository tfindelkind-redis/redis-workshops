"""
Advanced notebook testing with cell-level validation and output checking
"""
import pytest
import nbformat
from nbconvert.preprocessors import ExecutePreprocessor
from pathlib import Path
import re

NOTEBOOKS_DIR = Path(__file__).parent.parent / "workshops" / "deploy-redis-for-developers-amr"

class NotebookValidator:
    """Utility class for validating notebook execution and outputs"""
    
    def __init__(self, notebook_path):
        self.path = notebook_path
        with open(notebook_path, 'r', encoding='utf-8') as f:
            self.nb = nbformat.read(f, as_version=4)
    
    def execute(self, timeout=600):
        """Execute all cells and return the notebook"""
        ep = ExecutePreprocessor(
            timeout=timeout,
            kernel_name='python3',
            allow_errors=True  # Continue on errors to collect all failures
        )
        
        try:
            ep.preprocess(self.nb, {'metadata': {'path': str(self.path.parent)}})
        except Exception as e:
            print(f"⚠️  Execution error: {e}")
        
        return self.nb
    
    def get_execution_errors(self):
        """Extract errors from executed notebook"""
        errors = []
        for i, cell in enumerate(self.nb.cells):
            if cell.cell_type == 'code' and 'outputs' in cell:
                for output in cell.outputs:
                    if output.get('output_type') == 'error':
                        errors.append({
                            'cell_index': i,
                            'cell_number': i + 1,
                            'error_name': output.get('ename', 'Unknown'),
                            'error_value': output.get('evalue', ''),
                            'traceback': output.get('traceback', [])
                        })
        return errors
    
    def check_for_pattern(self, pattern, cell_type='code'):
        """Check if any cell contains a specific pattern"""
        matching_cells = []
        for i, cell in enumerate(self.nb.cells):
            if cell.cell_type == cell_type:
                if re.search(pattern, cell.source, re.IGNORECASE):
                    matching_cells.append({
                        'cell_number': i + 1,
                        'source': cell.source[:100] + '...'  # Preview
                    })
        return matching_cells
    
    def get_cell_outputs(self, cell_index):
        """Get outputs from a specific cell"""
        if cell_index >= len(self.nb.cells):
            return None
        
        cell = self.nb.cells[cell_index]
        if cell.cell_type != 'code' or 'outputs' not in cell:
            return None
        
        outputs = []
        for output in cell.outputs:
            if output.get('output_type') == 'stream':
                outputs.append({
                    'type': 'stream',
                    'text': output.get('text', '')
                })
            elif output.get('output_type') == 'execute_result':
                outputs.append({
                    'type': 'result',
                    'data': output.get('data', {})
                })
            elif output.get('output_type') == 'display_data':
                outputs.append({
                    'type': 'display',
                    'data': output.get('data', {})
                })
        
        return outputs
    
    def verify_docker_commands(self):
        """Check if notebook contains Docker setup"""
        docker_patterns = [
            r'docker\s+(run|start|ps)',
            r'%%bash.*docker',
        ]
        
        for pattern in docker_patterns:
            matches = self.check_for_pattern(pattern)
            if matches:
                return True
        return False
    
    def verify_database_connection(self):
        """Check if notebook contains database connection code"""
        patterns = [
            r'psycopg2\.connect',
            r'redis\.Redis\(',
            r'import\s+psycopg2',
            r'import\s+redis'
        ]
        
        results = {}
        for pattern in patterns:
            matches = self.check_for_pattern(pattern)
            results[pattern] = len(matches) > 0
        
        return results

def test_notebook_with_validation():
    """
    Example of using NotebookValidator for advanced testing
    """
    notebook_path = NOTEBOOKS_DIR / "module-08-implement-caching-lab" / "implement-caching-lab.ipynb"
    
    if not notebook_path.exists():
        pytest.skip(f"Notebook not found: {notebook_path}")
    
    validator = NotebookValidator(notebook_path)
    
    # Test 1: Verify Docker commands exist
    has_docker = validator.verify_docker_commands()
    assert has_docker, "Module 8 should contain Docker setup commands"
    
    # Test 2: Verify database connections
    db_connections = validator.verify_database_connection()
    assert db_connections.get(r'psycopg2\.connect', False), "Should have PostgreSQL connection"
    assert db_connections.get(r'redis\.Redis\(', False), "Should have Redis connection"
    
    # Test 3: Execute and check for errors
    validator.execute()
    errors = validator.get_execution_errors()
    
    if errors:
        error_summary = "\n".join([
            f"Cell {e['cell_number']}: {e['error_name']} - {e['error_value']}"
            for e in errors
        ])
        pytest.fail(f"Notebook has execution errors:\n{error_summary}")
