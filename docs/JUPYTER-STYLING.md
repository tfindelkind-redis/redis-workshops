# 🎨 Jupyter Notebook Styling & Configuration

This document explains the custom styling and configuration applied to Jupyter notebooks in this repository for an improved learning experience.

## ✨ Features

### 1. **No Kernel Selection Required**
All notebooks are pre-configured with Python 3 kernel metadata. When you open a notebook in GitHub Codespaces:
- ✅ No "Select Kernel" prompt
- ✅ Automatic Python 3 (ipykernel) selection
- ✅ Ready to run immediately

### 2. **Enhanced Visual Styling**
Custom CSS provides professional, educational styling:

#### Code Cells
- 🔵 **Blue left border** indicates code cells
- 💡 **Hover effect** for better focus
- 🎯 **Shadow and rounded corners** for visual separation
- 📝 **Monaco font** for better code readability

#### Markdown Cells
- 🟢 **Green left border** distinguishes documentation
- 📖 **Color-coded headers**:
  - 🔴 H1 (Red) - Main sections
  - 🔵 H2 (Blue) - Subsections
  - 🔷 H3 (Cyan) - Details
- ✅ **Styled lists** with emoji support
- 💬 **Code highlighting** in inline code

#### Output Cells
- 🟡 **Yellow/amber border** for outputs
- 🟢 **Green background** for successful results
- 🔴 **Red background** for errors
- 📊 **Special styling** for Plotly visualizations

### 3. **Execution Status Indicators**
- 🟡 **Yellow border**: Cell currently running
- 🟢 **Green border**: Cell successfully executed
- 🔴 **Red highlight**: Cell execution error
- 📊 **Execution count** visible and color-coded

### 4. **Improved Readability**
- Line numbers enabled by default
- Cell status bar always visible
- Non-compact view for better spacing
- Clear cell focus indicators

## 📁 File Structure

```
.vscode/
├── settings.json              # VS Code & Jupyter configuration
└── notebook-custom.css        # Custom styling (300+ lines)

.devcontainer/
└── devcontainer.json          # Codespaces configuration

scripts/
└── configure-notebooks        # Script to update notebook metadata
```

## 🔧 Configuration Files

### VS Code Settings (`.vscode/settings.json`)

```json
{
  // Jupyter Configuration
  "jupyter.notebookFileRoot": "${workspaceFolder}",
  "notebook.lineNumbers": "on",
  "notebook.cellFocusIndicator": "border",
  "notebook.compactView": false,
  "notebook.showCellStatusBar": "visible",
  "notebook.output.textLineLimit": 100,
  
  // Python Configuration
  "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python"
}
```

### Notebook Metadata

Each notebook includes:

```json
{
  "metadata": {
    "kernelspec": {
      "display_name": "Python 3 (ipykernel)",
      "language": "python",
      "name": "python3"
    },
    "language_info": {
      "name": "python",
      "version": "3.10.0",
      "mimetype": "text/x-python"
    }
  }
}
```

## 🎨 Color Scheme

The styling uses a consistent color palette:

| Element | Color | Purpose |
|---------|-------|---------|
| Code Cells | `#0078d4` (Blue) | Indicates executable code |
| Markdown Cells | `#28a745` (Green) | Indicates documentation |
| Output Cells | `#ffc107` (Amber) | Indicates results |
| H1 Headers | `#dc3545` (Red) | Main sections |
| H2 Headers | `#0078d4` (Blue) | Subsections |
| H3 Headers | `#17a2b8` (Cyan) | Details |
| Success | `#28a745` (Green) | Successful execution |
| Error | `#dc3545` (Red) | Errors/warnings |

## 🚀 Usage

### For New Notebooks

Run the configuration script to ensure proper setup:

```bash
# Update all notebooks with kernel metadata
python3 scripts/configure-notebooks

# Or make it executable and run
chmod +x scripts/configure-notebooks
./scripts/configure-notebooks
```

### For Developers

The custom CSS is automatically applied when:
1. Opening notebooks in VS Code with Jupyter extension
2. Running notebooks in GitHub Codespaces
3. Using the devcontainer environment

No manual steps required! 🎉

## 🎯 Benefits

### For Learners
- ✅ **No configuration needed** - Just click and run
- ✅ **Clear visual hierarchy** - Easy to understand structure
- ✅ **Immediate feedback** - Color-coded execution status
- ✅ **Professional appearance** - Engaging learning experience

### For Instructors
- ✅ **Consistent experience** - All students see the same styling
- ✅ **Easy updates** - Single script updates all notebooks
- ✅ **Version controlled** - Styling tracked in Git
- ✅ **Zero maintenance** - Automatic in Codespaces

## 🔄 Updating Notebooks

When adding new notebooks:

1. **Create your notebook** with Jupyter
2. **Run the configuration script**:
   ```bash
   python3 scripts/configure-notebooks
   ```
3. **Commit changes**:
   ```bash
   git add workshops/your-workshop/your-notebook.ipynb
   git commit -m "Add new notebook with proper configuration"
   ```

## 🎨 Customizing Styling

To modify the appearance:

1. **Edit** `.vscode/notebook-custom.css`
2. **Save** the file
3. **Reload** VS Code window (Cmd+Shift+P → "Reload Window")
4. **Test** with open notebooks

**Note**: Custom CSS is automatically loaded in Codespaces via devcontainer configuration.

## 🐛 Troubleshooting

### Kernel Selection Still Required

If Codespaces still prompts for kernel:

1. Check notebook metadata:
   ```bash
   python3 -c "import json; print(json.load(open('your-notebook.ipynb'))['metadata'])"
   ```

2. Re-run configuration:
   ```bash
   python3 scripts/configure-notebooks
   ```

### Styling Not Applied

1. Reload VS Code window:
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "Reload Window"
   - Press Enter

2. Check if Jupyter extension is installed:
   ```bash
   code --list-extensions | grep jupyter
   ```

### Custom CSS Not Loading

In Codespaces, CSS should load automatically. If not:

1. Check `.devcontainer/devcontainer.json` includes Jupyter extensions
2. Rebuild container: Cmd+Shift+P → "Rebuild Container"

## 📚 Resources

- [Jupyter Notebook Format](https://nbformat.readthedocs.io/)
- [VS Code Jupyter Extension](https://marketplace.visualstudio.com/items?itemName=ms-toolsai.jupyter)
- [GitHub Codespaces](https://docs.github.com/en/codespaces)

## 🤝 Contributing

To improve the notebook experience:

1. Edit `.vscode/notebook-custom.css`
2. Test with sample notebooks
3. Document changes in this file
4. Submit pull request

---

**Last Updated**: November 20, 2025  
**Maintained By**: Redis Workshops Team
