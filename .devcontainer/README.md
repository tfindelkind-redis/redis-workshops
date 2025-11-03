# Devcontainer Configuration

This directory contains the configuration for GitHub Codespaces.

## What's Included

When you open this repository in Codespaces, you automatically get:

### 🛠️ Pre-installed Tools
- **Redis Server** - Running on localhost:6379
- **Redis CLI** - Command-line client for Redis
- **Python 3.11** - For Python-based workshops
- **Node.js 20** - For JavaScript-based workshops
- **Git** - Version control
- **Docker** - Container runtime (if needed by workshops)

### 📦 VS Code Extensions
- Python language support
- YAML editing support
- Markdown linting
- And more...

### 🚀 Automatic Setup
The `setup.sh` script runs automatically when the container is created:
- Starts Redis server
- Makes workshop scripts executable
- Installs dependencies
- Displays available workshops

## Using Codespaces

1. Fork this repository to your GitHub account
2. Go to your fork on GitHub
3. Click "Code" → "Codespaces" → "Create codespace on main"
4. Wait for the container to build (~1 minute first time)
5. You're ready to go!

## Port Forwarding

The following ports are automatically forwarded:
- **3000** - Web applications
- **5000** - Flask/development servers
- **6379** - Redis server
- **8000** - HTTP servers

## Customization

You can customize the devcontainer by editing `devcontainer.json`:
- Add more VS Code extensions
- Install additional tools
- Configure environment variables
- Adjust port forwarding

## Secrets Management

For workshops requiring API keys or credentials:

1. Click the gear icon in Codespaces
2. Go to "Codespaces" → "Secrets"
3. Add your secrets
4. They're automatically available as environment variables in your workspace

**Never commit secrets to your repository!**

## Troubleshooting

**Redis not starting:**
```bash
sudo service redis-server start
```

**Check Redis status:**
```bash
redis-cli ping
# Should return: PONG
```

**Rebuild container:**
- Command Palette (F1) → "Codespaces: Rebuild Container"
