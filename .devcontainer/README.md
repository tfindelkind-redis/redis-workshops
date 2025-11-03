# Devcontainer Configuration

This directory contains the configuration for GitHub Codespaces and VS Code devcontainers.

## What's Included

When you open this repository in Codespaces or a devcontainer, you automatically get:

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
4. Wait for the container to build (first time only)
5. You're ready to go!

## Using VS Code Devcontainers Locally

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Install the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension
3. Clone your fork locally
4. Open in VS Code
5. Click "Reopen in Container" when prompted

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

**In Codespaces:**
1. Go to your Codespace settings
2. Add secrets via the UI
3. They're automatically available as environment variables

**In Local Devcontainers:**
1. Create a `.env` file in the workshop directory
2. Add your secrets (this file is gitignored)
3. Load them in your code

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
- Command Palette → "Remote-Containers: Rebuild Container"
