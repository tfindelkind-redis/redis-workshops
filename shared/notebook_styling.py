# Redis Workshops - Notebook Styling Helper
# Add this to the first code cell of your notebook to apply custom styling

from IPython.display import HTML, display

def load_redis_notebook_style():
    """Load Redis workshop custom CSS styling for Jupyter notebooks"""
    
    # Path to the CSS file (adjust based on notebook location)
    css_paths = [
        '../../shared/notebook-styles.css',  # For notebooks in workshops/xxx/module-xx/
        '../shared/notebook-styles.css',     # For notebooks in workshops/xxx/
        './shared/notebook-styles.css',      # For notebooks in root
    ]
    
    css_loaded = False
    for css_path in css_paths:
        try:
            with open(css_path, 'r') as f:
                css_content = f.read()
                display(HTML(f'<style>{css_content}</style>'))
                css_loaded = True
                print('✅ Redis workshop styling loaded successfully!')
                break
        except FileNotFoundError:
            continue
    
    if not css_loaded:
        # Fallback to inline minimal styling
        fallback_css = """
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono&display=swap');
        body { font-family: 'Inter', sans-serif; }
        h1 { color: #DC382C; border-bottom: 3px solid #DC382C; }
        h2 { color: #1a1a1a; border-bottom: 2px solid #e2e8f0; }
        code { background-color: #f1f5f9; color: #DC382C; padding: 0.2rem 0.4rem; border-radius: 4px; }
        pre { background-color: #2d2d2d; color: #e2e8f0; padding: 1rem; border-radius: 8px; border-left: 4px solid #DC382C; }
        table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
        th { background-color: #DC382C; color: white; padding: 1rem; }
        td { padding: 0.75rem; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) { background-color: #f8fafc; }
        </style>
        """
        display(HTML(fallback_css))
        print('⚠️  Using fallback styling (CSS file not found)')
    
    return css_loaded

# Auto-load styling when module is imported
if __name__ != '__main__':
    load_redis_notebook_style()
