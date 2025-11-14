# Workshop Builder - Docker Setup

## 🐳 Overview

The Workshop Builder server is now containerized with Docker! This means you don't need to install Node.js manually - just run the start script and you're ready to go.

## 🚀 Quick Start

### Prerequisites

You only need **Docker** installed:
- **macOS**: [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
- **Linux**: [Docker Engine](https://docs.docker.com/engine/install/)
- **Windows**: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)

### Start the Server

```bash
# From the repository root
./start-workshop-builder.sh
```

That's it! The script will:
1. ✅ Check Docker is installed and running
2. ✅ Build the Docker image
3. ✅ Start the container
4. ✅ Mount your repository
5. ✅ Wait for server to be ready
6. ✅ Display connection info

### Stop the Server

```bash
./stop-workshop-builder.sh
```

## 📋 What the Start Script Does

```bash
./start-workshop-builder.sh
```

**Step by step:**

1. **Checks Docker installation**
   - Verifies Docker CLI is available
   - Checks Docker daemon is running

2. **Stops existing container** (if any)
   - Removes previous `workshop-builder-server` container
   - Ensures clean start

3. **Builds Docker image**
   - Creates image: `redis-workshops/workshop-builder`
   - Installs Node.js dependencies
   - Optimized with Alpine Linux (small image)

4. **Starts container**
   - Container name: `workshop-builder-server`
   - Port mapping: `3000:3000`
   - Mounts repository: `/repo` inside container
   - Auto-restart: Unless manually stopped

5. **Waits for server**
   - Polls health endpoint
   - Times out after 30 seconds

6. **Shows information**
   - Server URL, health check, useful commands
   - Next steps to open GUI

## 🛠️ Manual Docker Commands

If you prefer to run Docker commands manually:

### Build Image
```bash
cd shared/tools/workshop-builder-server
docker build -t redis-workshops/workshop-builder .
```

### Run Container
```bash
# From repository root
REPO_ROOT=$(pwd)
docker run -d \
  --name workshop-builder-server \
  -p 3000:3000 \
  -v "${REPO_ROOT}:/repo:rw" \
  -e REPO_ROOT=/repo \
  --restart unless-stopped \
  redis-workshops/workshop-builder
```

### Stop Container
```bash
docker stop workshop-builder-server
docker rm workshop-builder-server
```

### View Logs
```bash
# Show all logs
docker logs workshop-builder-server

# Follow logs in real-time
docker logs -f workshop-builder-server

# Show last 50 lines
docker logs --tail 50 workshop-builder-server
```

### Enter Container (Debug)
```bash
docker exec -it workshop-builder-server sh
```

Inside container:
```bash
# Check repository mount
ls -la /repo/workshops

# Check Git
cd /repo && git status

# Check Node.js
node --version

# Check server files
ls -la /app
```

## 📦 Docker Image Details

### Base Image
- **Base**: `node:20-alpine`
- **Size**: ~150MB (Alpine Linux + Node.js)
- **Node.js**: v20 LTS

### What's Inside
```
/app/
├── server.js           # Express server
├── git-ops.js          # Git operations
├── workshop-ops.js     # Workshop operations
├── package.json        # Dependencies
└── node_modules/       # Installed packages

/repo/                  # Your repository (mounted)
├── workshops/          # Workshop files
├── shared/
└── .git/               # Git repository
```

### Environment Variables
- `NODE_ENV=production`
- `PORT=3000`
- `REPO_ROOT=/repo` (set by start script)

### Port Mapping
- Container port: `3000`
- Host port: `3000` (configurable with `PORT` env var)

### Volume Mounts
- Host: Your repository root
- Container: `/repo` (read-write)

### Health Check
- Endpoint: `GET /api/health`
- Interval: 30 seconds
- Timeout: 3 seconds
- Retries: 3

## 🔧 Configuration

### Custom Port

```bash
# Start on port 3001 instead of 3000
PORT=3001 ./start-workshop-builder.sh
```

Then open GUI and update API URL to `http://localhost:3001/api`

### Persist Container

The container uses `--restart unless-stopped`, meaning:
- ✅ Auto-restarts on Docker daemon restart
- ✅ Auto-restarts on container crash
- ❌ Does NOT restart if manually stopped

### Development Mode

For development with auto-reload:

```bash
# Don't use Docker, use direct Node.js
cd shared/tools/workshop-builder-server
npm install
npm run dev  # Uses nodemon for auto-reload
```

## 🐛 Troubleshooting

### Docker Not Installed

**Error**: `docker: command not found`

**Solution**: Install Docker Desktop or Docker Engine for your platform.

### Docker Daemon Not Running

**Error**: `Cannot connect to the Docker daemon`

**Solution**:
- **macOS**: Open Docker Desktop app
- **Linux**: `sudo systemctl start docker`

### Port Already in Use

**Error**: `bind: address already in use`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 ./start-workshop-builder.sh
```

### Container Won't Start

**Check logs**:
```bash
docker logs workshop-builder-server
```

**Common issues**:
1. Repository not mounted correctly
2. Git not initialized in repository
3. Permissions issue with mounted volume

### Repository Not Accessible

**Error**: `ENOENT: no such file or directory, scandir '/repo/workshops'`

**Solution**: Ensure repository is mounted correctly:
```bash
# Check mount
docker inspect workshop-builder-server | grep -A 10 Mounts

# Verify inside container
docker exec -it workshop-builder-server ls -la /repo
```

### Server Not Responding

**Error**: GUI shows "Server not available"

**Check health**:
```bash
curl http://localhost:3000/api/health
```

**Check container status**:
```bash
docker ps | grep workshop-builder-server
```

**Restart container**:
```bash
docker restart workshop-builder-server
```

## 📊 Monitoring

### Check Container Status
```bash
docker ps -f name=workshop-builder-server
```

### View Resource Usage
```bash
docker stats workshop-builder-server
```

### Check Health Status
```bash
docker inspect --format='{{.State.Health.Status}}' workshop-builder-server
```

## 🔄 Updates

### Rebuild Image (After Code Changes)

```bash
# Stop and remove old container
./stop-workshop-builder.sh

# Rebuild and start
./start-workshop-builder.sh
```

The start script automatically rebuilds the image each time.

### Update Dependencies

```bash
cd shared/tools/workshop-builder-server
# Update package.json
# Then rebuild
./start-workshop-builder.sh
```

## 🚀 Production Deployment

### Docker Compose (Recommended)

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  workshop-builder:
    build: ./shared/tools/workshop-builder-server
    container_name: workshop-builder-server
    ports:
      - "3000:3000"
    volumes:
      - .:/repo:rw
    environment:
      - NODE_ENV=production
      - REPO_ROOT=/repo
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

Then:
```bash
docker-compose up -d    # Start
docker-compose down     # Stop
docker-compose logs -f  # View logs
```

### Kubernetes

Create `deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: workshop-builder
spec:
  replicas: 1
  selector:
    matchLabels:
      app: workshop-builder
  template:
    metadata:
      labels:
        app: workshop-builder
    spec:
      containers:
      - name: workshop-builder
        image: redis-workshops/workshop-builder:latest
        ports:
        - containerPort: 3000
        env:
        - name: REPO_ROOT
          value: /repo
        volumeMounts:
        - name: repo
          mountPath: /repo
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 30
      volumes:
      - name: repo
        hostPath:
          path: /path/to/redis-workshops
          type: Directory
```

## ✨ Benefits of Docker Setup

### For Users
- ✅ **No Node.js installation** required
- ✅ **One command** to start: `./start-workshop-builder.sh`
- ✅ **Consistent environment** across all systems
- ✅ **Isolated dependencies** - no conflicts with other projects
- ✅ **Easy cleanup** - just remove container

### For Development
- ✅ **Reproducible builds** - same image everywhere
- ✅ **Version control** - Dockerfile in Git
- ✅ **Easy distribution** - push image to registry
- ✅ **Scalable** - can run multiple instances
- ✅ **Production-ready** - same container in dev and prod

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Alpine Linux](https://alpinelinux.org/)

## 🆘 Getting Help

1. **Check logs**: `docker logs workshop-builder-server`
2. **Check health**: `curl http://localhost:3000/api/health`
3. **Check container**: `docker ps -a | grep workshop-builder`
4. **Rebuild**: `./stop-workshop-builder.sh && ./start-workshop-builder.sh`

## 📝 Script Locations

```
redis-workshops/
├── start-workshop-builder.sh   # 🚀 Start script
├── stop-workshop-builder.sh    # 🛑 Stop script
└── shared/tools/workshop-builder-server/
    ├── Dockerfile              # 🐳 Docker image definition
    ├── .dockerignore          # 📦 Files to exclude from image
    └── server.js              # 🖥️ Server application
```

## ✅ Quick Reference

```bash
# Start server (Docker)
./start-workshop-builder.sh

# Stop server
./stop-workshop-builder.sh

# View logs
docker logs -f workshop-builder-server

# Restart
docker restart workshop-builder-server

# Health check
curl http://localhost:3000/api/health

# Open GUI
open shared/tools/workshop-builder-gui.html
```

---

**Ready to go!** Just run `./start-workshop-builder.sh` and start building workshops! 🚀

Last Updated: November 14, 2025
