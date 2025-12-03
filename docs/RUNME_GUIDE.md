# 🚀 Using Runme in This Workshop

## What is Runme?

Runme transforms ordinary Markdown documentation into **interactive, executable notebooks**. Instead of copying and pasting commands from documentation, you can run them directly with a single click!

---

## 🎯 Why Runme for This Workshop?

This workshop combines:
- **Jupyter Notebooks** for Python code and interactive Redis exercises
- **Runme Markdown** for Azure CLI commands and shell operations

### When to Use Each:

| Tool | Best For | Modules |
|------|----------|---------|
| **Jupyter** | Python code, data analysis, Redis operations | 01, 05, 06, 07, 08, 11 |
| **Runme** | Azure CLI, redis-cli diagnostics, shell commands | 02, 09, 10 |

---

## 🔧 Getting Started with Runme

### In GitHub Codespaces (Auto-Installed)

Runme is automatically available when you open this repository in GitHub Codespaces!

1. Open any README.md file in modules 02, 09, or 10
2. VS Code will automatically open it as a Runme notebook
3. Look for the ▶️ **play button** next to code blocks
4. Click to execute commands directly!

### Manual Installation (Local VS Code)

If you're using VS Code locally:

1. Open Extensions (`Ctrl+Shift+X` or `Cmd+Shift+X`)
2. Search for "Runme"
3. Install the extension by Stateful
4. Reload VS Code

---

## 📝 Using Runme Notebooks

### Opening a File as Runme Notebook

1. Navigate to any README.md file with shell commands
2. Right-click the file
3. Select **"Open With..." → "Runme"**

Or:
- Click the **notebook icon** in the file tab
- VS Code will render it as an interactive notebook

### Running Commands

#### ▶️ Single Command
Click the **play button** (▶️) next to any code block to execute it.

#### 🔄 All Commands
Click **"Run All"** at the top to execute all commands in sequence.

#### ⏸️ Stop Execution
Click the **stop button** (⏹️) to halt running commands.

---

## 🎨 Runme Features in This Workshop

### 1. **Environment Variables**

Commands automatically share environment variables within the same notebook session:

```sh
# Set variables
REDIS_HOST="my-redis-cache.redis.cache.windows.net"
RESOURCE_GROUP="rg-redis-workshop"

# Use in subsequent commands
az redis show --name $REDIS_HOST --resource-group $RESOURCE_GROUP
```

### 2. **Interactive Prompts**

Some commands may prompt for input (like passwords or confirmation).

### 3. **Output Display**

Command outputs appear directly below each cell with:
- ✅ Success indicators
- ❌ Error messages
- 📊 Formatted results

### 4. **Background Processes**

Long-running commands (like monitoring) run in dedicated terminals.

---

## 📚 Modules Using Runme

### Module 01: Redis Fundamentals
**README with interactive redis-cli demonstrations:**
- Redis data structure commands (Strings, Lists, Sets, Hashes, Sorted Sets)
- Docker Redis container setup
- redis-cli diagnostic tools
- Performance testing with redis-benchmark
- Real-time analytics examples
- Hands-on exercises (blog post system, caching patterns)

**Example Commands:**
```sh
# Start Redis with Docker
docker run --name redis-local -d -p 6379:6379 redis:latest

# Test connection
redis-cli ping

# Demo String operations
SET user:1000:name "John Doe"
GET user:1000:name
```

---

### Module 02: Azure Managed Redis Architecture
**README with executable Azure CLI commands:**
- Creating Redis instances with zone redundancy
- Configuring persistence strategies
- Setting up private endpoints
- Creating private DNS zones

**Example Commands:**
```sh
# Create Redis with high availability
az redis create \
  --resource-group myRG \
  --name myRedis \
  --zones 1 2 3
```

---

### Module 09: Monitoring & Alerts Lab
**README with monitoring setup commands:**
- Creating Log Analytics workspace
- Enabling diagnostic settings
- Setting up metric alerts
- Configuring action groups

**Example Commands:**
```sh
# Enable diagnostics
az monitor diagnostic-settings create \
  --name redis-diagnostics \
  --resource $REDIS_ID \
  --workspace $WORKSPACE_ID
```

---

### Module 10: Troubleshooting & Migration
**README with diagnostic commands:**
- redis-cli diagnostic commands
- Network troubleshooting
- Performance analysis
- Memory diagnostics

**Example Commands:**
```sh
# Check server latency
redis-cli -h <host> -p 6380 -a <key> --tls --latency

# Monitor real-time
redis-cli -h <host> -p 6380 -a <key> --tls MONITOR
```

---

## 💡 Tips & Best Practices

### ✅ Do's

1. **Update Placeholders**: Replace `<your-cache>`, `<access-key>`, etc. with your actual values
2. **Run Commands in Order**: Some commands depend on previous outputs
3. **Check Variables**: Ensure environment variables are set before using them
4. **Review Output**: Always check command output for errors

### ❌ Don'ts

1. **Don't Skip Prerequisites**: Run setup commands before main operations
2. **Don't Run All Blindly**: Some commands modify resources - review before executing
3. **Don't Forget Cleanup**: Run cleanup commands at the end of labs

---

## 🔍 Troubleshooting

### Issue: Code blocks don't have play buttons

**Solution:**
- Right-click the README.md file
- Select "Open With..." → "Runme"
- Or click the notebook icon in the file tab

### Issue: Command fails with "variable not set"

**Solution:**
- Scroll up and run the variable definition commands first
- Environment variables are session-specific

### Issue: Azure CLI authentication fails

**Solution:**
```sh
# Login to Azure
az login

# Set your subscription
az account set --subscription YOUR_SUBSCRIPTION_ID
```

### Issue: redis-cli commands timeout

**Solution:**
- Verify your Redis hostname and port
- Check firewall rules allow your IP
- Ensure access key is correct

---

## 🎓 Learning Resources

### Official Runme Documentation
- 📖 [docs.runme.dev](https://docs.runme.dev/)
- 🎥 [Runme in 2 Minutes](https://docs.runme.dev/)
- 💬 [Discord Community](https://discord.gg/runme)

### This Workshop
- 📝 [Module 02: Azure Architecture](../workshops/deploy-redis-for-developers-amr/module-02-azure-managed-redis-architecture/README.md)
- 📊 [Module 09: Monitoring & Alerts](../workshops/deploy-redis-for-developers-amr/module-09-monitoring-alerts-lab/README.md)
- 🔧 [Module 10: Troubleshooting](../workshops/deploy-redis-for-developers-amr/module-10-troubleshooting-migration/README.md)

---

## 🎯 Quick Start Checklist

- [ ] Open GitHub Codespaces or install Runme locally
- [ ] Navigate to Module 02, 09, or 10 README
- [ ] Open file with Runme
- [ ] Update placeholder values in commands
- [ ] Click ▶️ to run individual commands
- [ ] Check output for success/errors
- [ ] Continue to next command

---

## 🎉 Happy Learning!

Runme makes it easy to:
- ✅ Execute commands without copy-paste errors
- ✅ Share environment variables across commands
- ✅ See real-time output
- ✅ Learn by doing

For questions or issues, check the [workshop documentation](../README.md) or ask in discussions!

---

**Last Updated:** December 2025  
**Workshop Version:** 2.0
