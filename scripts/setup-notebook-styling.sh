#!/bin/bash
#
# Setup Notebook Auto-Styling for Redis Workshops
# This script installs IPython startup scripts to automatically load CSS styling
# for Jupyter notebooks that have a notebook-styles.css file.
#
# Usage: ./setup-notebook-styling.sh
#

set -e

echo "🎨 Setting up automatic notebook styling..."

# Create IPython startup directory
IPYTHON_STARTUP_DIR="$HOME/.ipython/profile_default/startup"
mkdir -p "$IPYTHON_STARTUP_DIR"

# Create the auto-load CSS script
cat > "$IPYTHON_STARTUP_DIR/00-auto-load-notebook-css.py" << 'PYTHON_EOF'
"""
Auto-load notebook CSS styling for Redis workshops
This script runs automatically when IPython/Jupyter starts
"""
import os
from pathlib import Path

def load_notebook_css():
    """Load CSS if notebook-styles.css exists in current directory"""
    try:
        from IPython.display import HTML, display
        from IPython import get_ipython
        
        # Check if we're in a notebook environment
        ipython = get_ipython()
        if ipython is None:
            return
            
        # Only run in notebook/jupyter environments
        if 'IPKernelApp' not in ipython.config:
            return
        
        # Look for CSS file in current working directory
        css_path = Path.cwd() / 'notebook-styles.css'
        
        if css_path.exists():
            with open(css_path, 'r', encoding='utf-8') as f:
                css_content = f.read()
            display(HTML(f'<style>{css_content}</style>'))
            print('✅ Workshop styling loaded automatically!')
        
    except Exception as e:
        # Silently fail - don't break notebook startup
        pass

# Auto-execute when notebook starts
load_notebook_css()
PYTHON_EOF

echo "✅ IPython startup script created at:"
echo "   $IPYTHON_STARTUP_DIR/00-auto-load-notebook-css.py"
echo ""
echo "🎯 Automatic CSS loading is now configured!"
echo "   Any notebook with 'notebook-styles.css' in its folder will be styled automatically."
echo ""
echo "📝 To verify: ls -la $IPYTHON_STARTUP_DIR"
