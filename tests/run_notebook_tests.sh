#!/bin/bash
# Test all Jupyter notebooks dynamically
# This script automatically discovers and tests all notebooks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Redis Workshop Notebook Test Suite"
echo "======================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Start test infrastructure
echo "🐳 Starting Docker containers..."
docker stop test-postgres test-redis 2>/dev/null || true
docker rm test-postgres test-redis 2>/dev/null || true

docker run -d --name test-postgres \
  -e POSTGRES_PASSWORD=workshop123 \
  -e POSTGRES_USER=workshop \
  -e POSTGRES_DB=workshop \
  -p 5432:5432 \
  postgres:15-alpine > /dev/null

docker run -d --name test-redis \
  -p 6379:6379 \
  redis:7-alpine > /dev/null

echo "⏳ Waiting for containers to be ready..."
sleep 5

# Install test dependencies if needed
if ! python3 -c "import nbformat" 2>/dev/null; then
    echo "📦 Installing test dependencies..."
    pip install -q -r tests/requirements.txt
fi

# Discover all notebooks
echo ""
echo "🔍 Discovering notebooks..."
NOTEBOOKS=$(find workshops/deploy-redis-for-developers-amr -name "*.ipynb" ! -path "*/.ipynb_checkpoints/*")
NOTEBOOK_COUNT=$(echo "$NOTEBOOKS" | wc -l | tr -d ' ')

echo "Found $NOTEBOOK_COUNT notebooks"
echo ""

# Run tests
FAILED_NOTEBOOKS=()
PASSED_NOTEBOOKS=()

for notebook in $NOTEBOOKS; do
    NOTEBOOK_NAME=$(basename "$notebook" .ipynb)
    MODULE_NAME=$(basename $(dirname "$notebook"))
    
    echo -e "${YELLOW}📓 Testing: $MODULE_NAME/$NOTEBOOK_NAME${NC}"
    
    if python3 -m pytest tests/test_notebooks.py::test_notebook_execution["$notebook"] -v; then
        echo -e "${GREEN}✅ Passed: $MODULE_NAME/$NOTEBOOK_NAME${NC}"
        PASSED_NOTEBOOKS+=("$MODULE_NAME/$NOTEBOOK_NAME")
    else
        echo -e "${RED}❌ Failed: $MODULE_NAME/$NOTEBOOK_NAME${NC}"
        FAILED_NOTEBOOKS+=("$MODULE_NAME/$NOTEBOOK_NAME")
    fi
    
    echo ""
done

# Cleanup
echo "🧹 Cleaning up Docker containers..."
docker stop test-postgres test-redis > /dev/null 2>&1
docker rm test-postgres test-redis > /dev/null 2>&1

# Summary
echo "======================================"
echo "📊 Test Summary"
echo "======================================"
echo "Total: $NOTEBOOK_COUNT notebooks"
echo -e "${GREEN}Passed: ${#PASSED_NOTEBOOKS[@]}${NC}"
echo -e "${RED}Failed: ${#FAILED_NOTEBOOKS[@]}${NC}"

if [ ${#FAILED_NOTEBOOKS[@]} -gt 0 ]; then
    echo ""
    echo "Failed notebooks:"
    for nb in "${FAILED_NOTEBOOKS[@]}"; do
        echo -e "${RED}  ❌ $nb${NC}"
    done
    exit 1
else
    echo ""
    echo -e "${GREEN}🎉 All notebooks passed!${NC}"
    exit 0
fi
