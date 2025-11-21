"""Auto-load notebook CSS styling on startup"""
import os
from IPython.display import HTML, display

# Get the directory of the current notebook
notebook_dir = os.getcwd()
css_path = os.path.join(notebook_dir, 'notebook-styles.css')

# Load and apply CSS if file exists
if os.path.exists(css_path):
    try:
        with open(css_path, 'r', encoding='utf-8') as f:
            css_content = f.read()
        display(HTML(f'<style>{css_content}</style>'))
        print('✅ Workshop styling loaded automatically!')
    except Exception as e:
        print(f'⚠️  Could not load styling: {e}')
else:
    print('ℹ️  Using default notebook styling')
