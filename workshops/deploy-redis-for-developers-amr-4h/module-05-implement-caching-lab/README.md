---
title: Implement Caching Lab
description: Implement caching patterns with Redis using hands-on exercises in Jupyter notebook.
duration: 60
difficulty: intermediate
type: hands-on
---

<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->

| Previous | Home | Next |
|----------|:----:|------:|
| [⬅️ Previous: Provision & Connect Lab](../module-04-provision-connect-lab/README.md) | [🏠 Workshop Home](../README.md) |  |

[🏠 Workshop Home](../README.md) > **Module 5 of 5**

### Deploy Redis for Developers - Azure Managed Redis 4h

**Progress:** `██████████` 100%

---

<!-- ✏️ EDIT YOUR CONTENT BELOW THIS LINE ✏️ -->

# Module 5: Implement Caching Lab
**Duration:** 60 minutes  
**Format:** Hands-On Lab (Interactive Jupyter notebook)  
**Level:** Intermediate

This interactive Jupyter notebook demonstrates Redis caching patterns with hands-on exercises.

## 🎨 Styling

This notebook includes custom styling with:
- **Blue background with frame** for all cell outputs
- Professional Redis-themed design
- Enhanced readability for code and results

### ✨ Automatic CSS Loading

The styling loads **automatically** when you open the notebook in VS Code - no manual steps required!

#### How It Works

When you create a new GitHub Codespace:
1. The devcontainer runs `scripts/setup-notebook-styling.sh` automatically
2. This installs an IPython startup script at `~/.ipython/profile_default/startup/00-auto-load-notebook-css.py`
3. When any Jupyter kernel starts, it checks for `notebook-styles.css` in the current directory
4. If found, the CSS is automatically injected into the notebook

You'll see: `✅ Workshop styling loaded automatically!` when the kernel starts.

#### For Existing Codespaces

If you created your Codespace before this feature was added, run:

```bash
bash scripts/setup-notebook-styling.sh
```

Then restart your Jupyter kernel (Kernel → Restart Kernel).

### Manual Loading (Troubleshooting)

If the automatic loading doesn't work, you can manually load the styling by running this in a cell:

```python
from IPython.display import HTML, display
with open('notebook-styles.css', 'r') as f:
    display(HTML(f'<style>{f.read()}</style>'))
```

## 📁 Files

- `implement-caching-lab.ipynb` - Main interactive notebook
- `notebook-styles.css` - Custom styling (auto-loads)
- `.vscode/settings.json` - VS Code Jupyter settings
- `README.md` - This file

## 🚀 Getting Started

1. Open `implement-caching-lab.ipynb` in VS Code
2. The styling loads automatically when the kernel starts
3. Start with the first cell and follow along!

## 🔧 Technical Details

### IPython Startup Script

The auto-loading is powered by an IPython startup script that:
- Runs on every Jupyter kernel startup
- Checks for `notebook-styles.css` in the notebook's directory
- Injects CSS using IPython's HTML display system
- Works for **any notebook** in any folder with a `notebook-styles.css` file

### Devcontainer Integration

The setup is automated through:
- `.devcontainer/setup.sh` - Runs `scripts/setup-notebook-styling.sh` on Codespace creation
- `scripts/setup-notebook-styling.sh` - Installs the IPython startup script
- `~/.ipython/profile_default/startup/00-auto-load-notebook-css.py` - The auto-load script

This ensures **every new Codespace** has automatic styling configured!

## 🐛 Troubleshooting

**Styling not loading?**
1. Check if the startup script exists: `ls -la ~/.ipython/profile_default/startup/`
2. Restart the Jupyter kernel: Kernel → Restart Kernel
3. Re-run setup: `bash scripts/setup-notebook-styling.sh`

**CSS file not found?**
- Make sure `notebook-styles.css` is in the same folder as the notebook
- Check current directory: The kernel must be started in the notebook's folder

**Still not working?**
- Manually load CSS using the code snippet above
- Check kernel output for error messages

<!-- ✏️ EDIT YOUR CONTENT ABOVE THIS LINE ✏️ -->

---

<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->

## Navigation

| Previous | Home | Next |
|----------|:----:|------:|
| [⬅️ Previous: Provision & Connect Lab](../module-04-provision-connect-lab/README.md) | [🏠 Workshop Home](../README.md) | ✅ **Workshop Complete!** |

---

*Module 5 of 5*
