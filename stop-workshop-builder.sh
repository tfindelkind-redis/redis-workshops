#!/bin/bash

# Workshop Builder - Docker Stop Script
# This script stops and removes the Workshop Builder container

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

CONTAINER_NAME="workshop-builder-server"

echo "========================================================================"
echo "🛑 Stopping Workshop Builder Server"
echo "========================================================================"
echo ""

# Check if container exists
if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${YELLOW}⚠️  Container '${CONTAINER_NAME}' is not running${NC}"
    echo ""
    exit 0
fi

# Stop container
echo -e "${YELLOW}Stopping container...${NC}"
if docker stop "${CONTAINER_NAME}" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Container stopped${NC}"
else
    echo -e "${RED}❌ Failed to stop container${NC}"
    exit 1
fi

# Remove container
echo -e "${YELLOW}Removing container...${NC}"
if docker rm "${CONTAINER_NAME}" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Container removed${NC}"
else
    echo -e "${RED}❌ Failed to remove container${NC}"
    exit 1
fi

echo ""
echo "========================================================================"
echo -e "${GREEN}✨ Workshop Builder Server stopped successfully${NC}"
echo "========================================================================"
echo ""
echo "To start again, run: ./start-workshop-builder.sh"
echo ""
