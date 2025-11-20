# Interactive Jupyter Notebooks for Workshop Labs

## 🎯 Overview

Our workshop modules now include **interactive Jupyter notebooks** that allow you to run code directly in GitHub Codespaces without any local setup!

## ✨ Benefits

### Why Use Jupyter Notebooks?

- **🚀 Zero Setup** - No local Python installation needed
- **▶️ Interactive** - Run code cells one at a time, see immediate results
- **📊 Visual** - Built-in charts and graphs for performance metrics
- **🔄 Replayable** - Restart and re-run anytime
- **📝 Guided** - Step-by-step instructions within the notebook
- **💾 Persistent** - Your work is saved automatically

### What's Included?

Each interactive lab includes:

1. **Code Cells** - Executable Python code snippets
2. **Markdown Cells** - Explanations and instructions
3. **Visualizations** - Charts showing performance improvements
4. **Exercises** - Hands-on challenges to test your understanding
5. **Real-time Metrics** - See cache hit rates, latency, throughput

---

## 🚀 Getting Started

### Option 1: GitHub Codespaces (Recommended)

1. **Open Repository in Codespaces**
   ```
   Click "Code" → "Codespaces" → "Create codespace on main"
   ```

2. **Wait for Environment Setup**
   - Codespaces will automatically install:
     - Python 3.11
     - Jupyter
     - Redis
     - All required packages

3. **Open a Notebook**
   - Navigate to any workshop module
   - Look for files ending in `.ipynb`
   - Click to open in Jupyter interface

4. **Run the Lab**
   - Click "Run All" or execute cells one by one
   - Follow the instructions in each cell

### Option 2: VS Code with Jupyter Extension

1. **Install Extensions**
   ```
   - Python (ms-python.python)
   - Jupyter (ms-toolsai.jupyter)
   ```

2. **Open Workspace**
   ```bash
   code redis-workshops
   ```

3. **Select Kernel**
   - Open any `.ipynb` file
   - Click "Select Kernel" in top-right
   - Choose "Python (Redis Workshop)"

4. **Run Cells**
   - Click play button on each cell
   - Or use Shift+Enter

---

## 📚 Available Interactive Labs

### Module 6: Performance Efficiency & Data Modeling
**File:** `module-06-performance-efficiency--data-modeling/performance-data-modeling-lab.ipynb`

**What You'll Learn:**
- Master Redis data structures (Strings, Hashes, Lists, Sets, Sorted Sets)
- Benchmark performance across all data types
- Optimize memory usage (Hash vs JSON comparison)
- Build production-ready shopping cart
- Choose the right data structure for your use case

**Key Features:**
- Performance benchmarking (P95, P99 latencies)
- Memory optimization comparison
- Real-world examples (leaderboards, shopping cart)
- Decision guide for data structure selection

**Duration:** 60 minutes  
**Level:** Intermediate

---

### Module 7: Provision & Connect Lab
**File:** `module-07-provision--connect-lab/provision-connect-lab.ipynb`

**What You'll Do:**
- Deploy Azure Managed Redis programmatically with Python SDK
- Configure Entra ID authentication (passwordless)
- Implement secure connection patterns
- Test connectivity and performance
- Apply production best practices

**Key Features:**
- Complete Azure SDK automation
- DefaultAzureCredential pattern
- No access keys stored in code
- Performance benchmarking
- Troubleshooting guide

**Duration:** 60 minutes  
**Level:** Intermediate

---

### Module 8: Implement Caching Lab
**File:** `module-08-implement-caching-lab/implement-caching-lab.ipynb`

**What You'll Do:**
- Build a Flask API with PostgreSQL backend
- Implement cache-aside pattern with Redis
- Measure 10-100x performance improvements
- Visualize cache hit rates and latency
- Test cache invalidation strategies

**Key Features:**
- Mock database (no Docker required)
- Real-time performance charts
- Interactive exercises
- Cache statistics dashboard

**Duration:** 45-60 minutes  
**Level:** Intermediate

---

### Module 11: Advanced Features
**File:** `module-11-advanced-features/advanced-features-lab.ipynb`

**What You'll Explore:**
- **RedisJSON**: Native JSON document storage
- **Redis Streams**: Event streaming and messaging
- **HyperLogLog**: Cardinality estimation (unique counting)
- **Probabilistic structures**: Memory-efficient algorithms

**Key Features:**
- RedisJSON path-based queries
- Stream consumer patterns
- HyperLogLog accuracy testing
- Performance benchmarks

**Duration:** 60 minutes  
**Level:** Advanced

---

### Module 7: Monitoring & Alerts Lab
**File:** `module-09-monitoring--alerts-lab/monitoring-alerts-lab.ipynb` *(Coming Soon)*

**What You'll Do:**
- Query Redis metrics programmatically
- Create custom monitoring dashboards
- Write KQL queries for Log Analytics
- Visualize time-series data
- Test alerting rules

**Key Features:**
- Live Redis metrics
- Custom Plotly dashboards
- KQL query builder
- Alert simulation

**Duration:** 45 minutes

---

### Module 8: Troubleshooting & Migration Lab
**File:** `module-10-troubleshooting--migration/troubleshooting-lab.ipynb` *(Coming Soon)*

**What You'll Do:**
- Run diagnostic commands
- Analyze performance bottlenecks
- Simulate common issues
- Test migration tools (RIOT)
- Validate data integrity

**Key Features:**
- Interactive diagnostics
- Performance profiling
- Data migration simulation
- Validation tools

**Duration:** 60 minutes

---

### Module 9: Advanced Features Lab
**File:** `module-11-advanced-features/advanced-features-lab.ipynb` *(Coming Soon)*

**What You'll Do:**
- Work with RedisJSON documents
- Build search indexes with RediSearch
- Store time-series data
- Use probabilistic data structures
- Implement event streaming

**Key Features:**
- JSON document manipulation
- Full-text search examples
- Time-series visualizations
- Stream processing

**Duration:** 60 minutes

---

## 🔧 Technical Details

### Pre-installed Packages

The devcontainer includes:

```python
# Core
jupyter
jupyterlab
ipykernel

# Redis
redis
redis-py

# Azure
azure-identity
azure-monitor

# Data Science
pandas
matplotlib
plotly
numpy

# Web Development
flask
psycopg2-binary
python-dotenv

# Testing
locust
```

### Jupyter Kernel

- **Name:** `redis-workshop`
- **Display Name:** "Python (Redis Workshop)"
- **Python Version:** 3.11

### Port Forwarding

Codespaces automatically forwards:
- **3000** - Workshop Builder UI
- **5000** - Flask API (labs)
- **6379** - Redis Server
- **8000** - Jupyter Lab (optional)

---

## 💡 Tips for Using Notebooks

### Running Cells

```
Shift + Enter    - Run cell and move to next
Ctrl + Enter     - Run cell and stay
Alt + Enter      - Run cell and insert new cell below
```

### Restarting Kernel

If something goes wrong:
1. Click "Restart" in the kernel dropdown
2. Re-run cells from the top
3. All state is cleared and fresh

### Saving Work

- **Auto-save:** Notebooks save automatically every 2 minutes
- **Manual save:** `Ctrl + S` or click save icon
- **Version control:** Commit notebook changes to Git

### Clearing Output

To clear all cell outputs:
1. Click "Clear All Outputs" in the toolbar
2. Useful before committing to Git
3. Reduces file size

---

## 🎓 Learning Path

### For Beginners

1. **Start with Module 6** (Caching Lab)
   - Most accessible
   - Clear performance wins
   - Good introduction to Redis

2. **Follow Notebook Top-to-Bottom**
   - Run each cell in order
   - Read explanations
   - Complete exercises

3. **Experiment**
   - Modify code in cells
   - Change parameters
   - See what happens!

### For Advanced Users

1. **Skip to Advanced Labs** (Module 9)
   - RedisJSON, RediSearch, Streams
   - More complex scenarios

2. **Customize Notebooks**
   - Add your own cells
   - Import your data
   - Build on examples

3. **Connect to Azure**
   - Replace mock database with real PostgreSQL
   - Connect to Azure Redis
   - Use production credentials

---

## 🐛 Troubleshooting

### Kernel Won't Start

**Problem:** "Failed to start kernel"

**Solution:**
```bash
# In terminal:
pip install --upgrade jupyter ipykernel
python -m ipykernel install --user --name redis-workshop
```

### Package Not Found

**Problem:** `ModuleNotFoundError: No module named 'redis'`

**Solution:**
```bash
# In notebook cell:
!pip install redis
```

### Redis Connection Failed

**Problem:** "Connection refused: localhost:6379"

**Solution:**
```bash
# In terminal:
sudo service redis-server start
redis-cli ping  # Should return "PONG"
```

### Jupyter Not Found

**Problem:** "jupyter: command not found"

**Solution:**
```bash
pip install jupyter jupyterlab
```

---

## 📖 Resources

### Jupyter Documentation
- [Jupyter Notebook Docs](https://jupyter-notebook.readthedocs.io/)
- [JupyterLab Docs](https://jupyterlab.readthedocs.io/)
- [IPython Keyboard Shortcuts](https://ipython.readthedocs.io/en/stable/interactive/shortcuts.html)

### Redis in Python
- [redis-py Documentation](https://redis-py.readthedocs.io/)
- [Redis Commands Reference](https://redis.io/commands)
- [Redis University](https://university.redis.com/)

### GitHub Codespaces
- [Codespaces Docs](https://docs.github.com/en/codespaces)
- [Devcontainer Reference](https://containers.dev/)
- [VS Code Jupyter Extension](https://marketplace.visualstudio.com/items?itemName=ms-toolsai.jupyter)

---

## 🤝 Contributing

### Adding New Notebooks

1. **Create Notebook File**
   ```bash
   # In module folder
   touch module-name/lab-name.ipynb
   ```

2. **Use Template Structure**
   - Part 1: Setup & Dependencies
   - Part 2: Core Concepts
   - Part 3: Hands-On Exercises
   - Part 4: Visualizations
   - Part 5: Advanced Topics
   - Part 6: Cleanup

3. **Test Thoroughly**
   - Run all cells from scratch
   - Verify visualizations render
   - Check error handling
   - Test in Codespaces

4. **Update Module README**
   - Add link to notebook
   - Explain benefits
   - Provide prerequisites

### Best Practices

✅ **Do:**
- Include clear explanations
- Add code comments
- Provide example output
- Handle errors gracefully
- Add visualizations
- Include exercises

❌ **Don't:**
- Assume prior knowledge
- Skip error handling
- Use complex dependencies
- Require external services
- Make cells too long

---

## 🎉 Success Stories

> "The interactive notebooks made caching concepts click instantly. Seeing the 50x speedup in real-time was incredible!" - Workshop Participant

> "Being able to experiment without breaking anything helped me learn Redis patterns much faster than documentation alone." - Developer

> "No setup required meant we could start learning immediately. The visualizations made performance impact obvious." - Team Lead

---

## 📊 Feedback

We'd love to hear about your experience with the interactive labs!

- 🐛 **Found a bug?** [Open an issue](https://github.com/tfindelkind-redis/redis-workshops/issues)
- 💡 **Have a suggestion?** [Start a discussion](https://github.com/tfindelkind-redis/redis-workshops/discussions)
- ⭐ **Enjoyed the labs?** Star the repository!

---

## 🚀 Next Steps

1. **Open a notebook** and start learning
2. **Complete the exercises** to reinforce concepts
3. **Share your results** with the team
4. **Apply to your projects** using patterns learned

Happy coding! 🎓✨
