# 🚀 Quick Start: Interactive Jupyter Labs

## For Workshop Participants

### Step 1: Open in Codespaces (30 seconds)

```
1. Go to: https://github.com/tfindelkind-redis/redis-workshops
2. Click green "Code" button
3. Click "Codespaces" tab
4. Click "Create codespace on main"
```

### Step 2: Wait for Setup (2-3 minutes)

Codespaces will automatically:
- ✅ Install Python 3.11
- ✅ Install Jupyter
- ✅ Install Redis
- ✅ Install all required packages
- ✅ Start Redis server

You'll see: `✅ Setup complete!`

### Step 3: Open a Notebook (10 seconds)

```bash
# In VS Code explorer:
workshops/
  └── deploy-redis-for-developers-amr/
      └── module-08-implement-caching-lab/
          └── 📓 implement-caching-lab.ipynb  ← Click here!
```

### Step 4: Run the Lab! (45 minutes)

**Option A: Run All Cells**
```
Click "Run All" button in toolbar
→ Sit back and watch everything execute
→ See all results and visualizations
```

**Option B: Run Step-by-Step**
```
Click ▶️ on first cell (or press Shift+Enter)
→ Read the output
→ Click ▶️ on next cell
→ Repeat
```

---

## What You'll See

### Code Cell Example

```python
# Get product from cache (first time - miss)
result = get_product_with_cache(1)
print(f"Latency: {result['latency_ms']}ms")
print(f"Cached: {result['cached']}")
```

**Output:**
```
Latency: 28.45ms
Cached: False
```

### Visualization Example

You'll see charts like:

```
📊 Request Latency: Cache Miss vs Hit
    
    30ms │ ●                    Cache Miss (Red)
         │   ● ●
    20ms │
         │       ● ● ● ● ● ●   Cache Hit (Green)
    10ms │
         │
     0ms └────────────────────────────
         1  5  10  15  20  25  30
              Request Number
```

### Statistics Example

```
📊 Performance Summary:
  Average Database Latency: 27.34ms
  Average Cache Latency: 2.18ms
  Speedup: 12.5x faster with cache
  Cache Hit Rate: 86.7%
```

---

## ⌨️ Keyboard Shortcuts

```
Shift + Enter    - Run cell and move to next
Ctrl + Enter     - Run cell (stay on same cell)
Esc             - Exit edit mode
A               - Insert cell above
B               - Insert cell below
DD              - Delete cell
Z               - Undo delete
M               - Convert to Markdown
Y               - Convert to Code
```

---

## 🎯 Learning Path

### Beginner Path (Follow in Order)

1. **Start Here:** Module 6 - Implement Caching Lab
   - File: `module-08-implement-caching-lab/implement-caching-lab.ipynb`
   - Duration: 45-60 minutes
   - Difficulty: ⭐⭐ Intermediate
   - What you'll learn: Cache-aside pattern, performance measurement

2. **Next:** Module 7 - Monitoring & Alerts
   - File: `module-09-monitoring--alerts-lab/monitoring-lab.ipynb` *(coming soon)*
   - Duration: 45 minutes
   - Difficulty: ⭐⭐ Intermediate

3. **Then:** Module 8 - Troubleshooting & Migration
   - File: `module-10-troubleshooting--migration/troubleshooting-lab.ipynb` *(coming soon)*
   - Duration: 60 minutes
   - Difficulty: ⭐⭐⭐ Advanced

4. **Finally:** Module 9 - Advanced Features
   - File: `module-11-advanced-features/advanced-features-lab.ipynb` *(coming soon)*
   - Duration: 60 minutes
   - Difficulty: ⭐⭐⭐ Advanced

---

## 💡 Pro Tips

### Tip 1: Restart Kernel if Stuck

If something goes wrong:
```
1. Click "Restart" in kernel dropdown (top-right)
2. Click "Restart" to confirm
3. Run cells from the beginning
```

### Tip 2: Clear Outputs Before Saving

To reduce file size:
```
1. Click "..." menu in toolbar
2. Select "Clear All Outputs"
3. Commit cleaner files to Git
```

### Tip 3: Experiment!

Notebooks are safe to experiment with:
- ✅ Change values and re-run
- ✅ Add your own cells
- ✅ Break things (you can always restart)
- ✅ Try different parameters

### Tip 4: Use Mock Database First

Start with the mock database (included):
```python
USE_LOCAL_REDIS = True  # Use local Redis in Codespaces
```

When confident, connect to Azure:
```python
USE_LOCAL_REDIS = False  # Use Azure Redis
REDIS_HOST = 'your-cache.redis.cache.windows.net'
```

---

## 🐛 Troubleshooting

### Problem: Kernel Won't Start

**Error:** `Failed to start kernel`

**Solution:**
```python
# In a notebook cell, run:
!pip install --upgrade jupyter ipykernel
!python -m ipykernel install --user --name redis-workshop

# Then restart VS Code
```

### Problem: Redis Connection Failed

**Error:** `Connection refused`

**Solution:**
```bash
# In terminal (Ctrl + `):
sudo service redis-server start
redis-cli ping  # Should return PONG
```

### Problem: Package Not Found

**Error:** `ModuleNotFoundError: No module named 'redis'`

**Solution:**
```python
# In notebook cell:
!pip install redis matplotlib plotly pandas
```

### Problem: Visualizations Not Showing

**Error:** Charts don't render

**Solution:**
```python
# Add to first cell:
%matplotlib inline

# Or use:
import matplotlib
matplotlib.use('Agg')
```

---

## 📖 Additional Resources

### Jupyter Basics
- [Jupyter Notebook Tutorial](https://jupyter-notebook.readthedocs.io/)
- [Keyboard Shortcuts](https://ipython.readthedocs.io/en/stable/interactive/shortcuts.html)
- [Markdown Guide](https://www.markdownguide.org/)

### Redis Python Client
- [redis-py Documentation](https://redis-py.readthedocs.io/)
- [Redis Commands](https://redis.io/commands)
- [Redis Python Examples](https://redis.io/docs/clients/python/)

### GitHub Codespaces
- [Codespaces Documentation](https://docs.github.com/en/codespaces)
- [VS Code in Browser](https://code.visualstudio.com/docs/remote/codespaces)
- [Devcontainer Reference](https://containers.dev/)

---

## 🎉 Success Checklist

After completing a notebook, you should:

- ✅ Understand cache-aside pattern
- ✅ Know how to measure cache performance
- ✅ See 10-100x speedup with caching
- ✅ Understand cache invalidation
- ✅ Know when to use Redis caching
- ✅ Be able to apply patterns to your apps

---

## 🤝 Need Help?

### Getting Stuck?

1. **Read the error message** - Often tells you exactly what's wrong
2. **Restart kernel** - Clears state and starts fresh
3. **Check Redis is running** - `redis-cli ping`
4. **Review the explanation cells** - Markdown cells have hints
5. **Check solutions** - Exercise solutions are included

### Still Stuck?

- 💬 [Ask in Discussions](https://github.com/tfindelkind-redis/redis-workshops/discussions)
- 🐛 [Open an Issue](https://github.com/tfindelkind-redis/redis-workshops/issues)
- 📧 Contact your workshop instructor

---

## 🚀 Ready to Start?

1. Open in Codespaces
2. Navigate to a module folder
3. Open the `.ipynb` file
4. Click "Run All"
5. Learn Redis interactively!

**Happy Learning! 🎓✨**
