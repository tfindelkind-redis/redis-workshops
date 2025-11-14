#!/bin/bash

# Workshop Builder - Docker Start Script
# This script builds and runs the Workshop Builder server in a Docker container

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="workshop-builder-server"
IMAGE_NAME="redis-workshops/workshop-builder"
PORT="${PORT:-3000}"
REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"

echo "========================================================================"
echo "🐳 Workshop Builder Server - Docker Launcher"
echo "========================================================================"
echo ""

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        echo ""
        echo "Please install Docker first:"
        echo "  macOS: https://docs.docker.com/desktop/install/mac-install/"
        echo "  Linux: https://docs.docker.com/engine/install/"
        echo "  Windows: https://docs.docker.com/desktop/install/windows-install/"
        echo ""
        exit 1
    fi
    echo -e "${GREEN}✅ Docker is installed: $(docker --version)${NC}"
}

# Function to check if Docker daemon is running
check_docker_running() {
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker daemon is not running${NC}"
        echo ""
        echo "Please start Docker Desktop or Docker daemon:"
        echo "  macOS: Open Docker Desktop app"
        echo "  Linux: sudo systemctl start docker"
        echo ""
        exit 1
    fi
    echo -e "${GREEN}✅ Docker daemon is running${NC}"
}

# Function to stop existing container
stop_existing_container() {
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo -e "${YELLOW}⚠️  Stopping existing container...${NC}"
        docker stop "${CONTAINER_NAME}" > /dev/null 2>&1 || true
        docker rm "${CONTAINER_NAME}" > /dev/null 2>&1 || true
        echo -e "${GREEN}✅ Existing container removed${NC}"
    fi
}

# Function to build Docker image
build_image() {
    echo ""
    echo -e "${BLUE}📦 Building Docker image...${NC}"
    cd "${REPO_ROOT}/shared/tools/workshop-builder-server"
    
    if docker build -t "${IMAGE_NAME}" . ; then
        echo -e "${GREEN}✅ Docker image built successfully${NC}"
    else
        echo -e "${RED}❌ Failed to build Docker image${NC}"
        exit 1
    fi
}

# Function to run container
run_container() {
    echo ""
    echo -e "${BLUE}🚀 Starting Workshop Builder server...${NC}"
    
    # Mount the repository root as a volume so server can access workshops
    docker run -d \
        --name "${CONTAINER_NAME}" \
        -p "${PORT}:3000" \
        -v "${REPO_ROOT}:/repo:rw" \
        -e REPO_ROOT=/repo \
        --restart unless-stopped \
        "${IMAGE_NAME}"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Container started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start container${NC}"
        exit 1
    fi
}

# Function to wait for server to be ready
wait_for_server() {
    echo ""
    echo -e "${BLUE}⏳ Waiting for server to be ready...${NC}"
    
    for i in {1..30}; do
        if curl -s "http://localhost:${PORT}/api/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Server is ready!${NC}"
            return 0
        fi
        sleep 1
        echo -n "."
    done
    
    echo ""
    echo -e "${YELLOW}⚠️  Server did not respond in 30 seconds${NC}"
    echo "Check logs with: docker logs ${CONTAINER_NAME}"
}

# Function to show server info
show_info() {
    echo ""
    echo "========================================================================"
    echo -e "${GREEN}✨ Workshop Builder Server is Running!${NC}"
    echo "========================================================================"
    echo ""
    echo "📡 Server URL:     http://localhost:${PORT}"
    echo "🏥 Health Check:   http://localhost:${PORT}/api/health"
    echo "📊 Server Info:    http://localhost:${PORT}/api/info"
    echo "🐳 Container:      ${CONTAINER_NAME}"
    echo "📁 Repository:     ${REPO_ROOT}"
    echo ""
    echo "========================================================================"
    echo "📚 Useful Commands:"
    echo "========================================================================"
    echo ""
    echo "View logs:         docker logs ${CONTAINER_NAME}"
    echo "Follow logs:       docker logs -f ${CONTAINER_NAME}"
    echo "Stop server:       docker stop ${CONTAINER_NAME}"
    echo "Restart server:    docker restart ${CONTAINER_NAME}"
    echo "Remove container:  docker rm -f ${CONTAINER_NAME}"
    echo "Enter container:   docker exec -it ${CONTAINER_NAME} sh"
    echo ""
    echo "========================================================================"
    echo "🎨 Next Steps:"
    echo "========================================================================"
    echo ""
    echo "1. Open the Workshop Builder GUI:"
    echo "   open ${REPO_ROOT}/shared/tools/workshop-builder-gui.html"
    echo ""
    echo "2. The GUI will automatically:"
    echo "   • Detect the server"
    echo "   • Create a Git branch (if on main)"
    echo "   • Load workshops from your repository"
    echo ""
    echo "3. Start building workshops visually!"
    echo ""
    echo "========================================================================"
}

# Main execution
main() {
    check_docker
    check_docker_running
    stop_existing_container
    build_image
    run_container
    wait_for_server
    show_info
}

# Run main function
main
