#!/bin/bash

# Local macOS Setup Script for Redis Workshops
# This script sets up your Mac environment to work exactly like Codespaces
# without polluting the repository

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  🍎 Redis Workshop - macOS Local Setup           ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}This script will set up your Mac to run the workshop${NC}"
echo -e "${BLUE}exactly like it runs in GitHub Codespaces.${NC}"
echo ""

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ This script is for macOS only!${NC}"
    echo -e "${YELLOW}   For Linux, use the Codespaces setup or adapt this script.${NC}"
    exit 1
fi

# Step 1: Check Homebrew
echo -e "${YELLOW}📦 Step 1: Checking Homebrew...${NC}"
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}   Homebrew not found. Installing...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo -e "${GREEN}   ✓ Homebrew is installed${NC}"
fi

# Step 2: Install Redis
echo ""
echo -e "${YELLOW}📦 Step 2: Installing Redis...${NC}"
if ! command -v redis-server &> /dev/null; then
    echo -e "${YELLOW}   Installing Redis via Homebrew...${NC}"
    brew install redis
else
    echo -e "${GREEN}   ✓ Redis is already installed${NC}"
fi

# Step 3: Install Docker Desktop
echo ""
echo -e "${YELLOW}🐳 Step 3: Checking Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}   Docker not found!${NC}"
    echo -e "${YELLOW}   Please install Docker Desktop from: https://www.docker.com/products/docker-desktop${NC}"
    echo -e "${YELLOW}   After installation, run this script again.${NC}"
    echo ""
    read -p "Press Enter to continue without Docker, or Ctrl+C to exit and install Docker..."
else
    echo -e "${GREEN}   ✓ Docker is installed${NC}"
    # Check if Docker is running
    if docker info &> /dev/null; then
        echo -e "${GREEN}   ✓ Docker is running${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Docker is installed but not running${NC}"
        echo -e "${YELLOW}   Please start Docker Desktop and try again.${NC}"
    fi
fi

# Step 4: Install Python 3.11 (if not present)
echo ""
echo -e "${YELLOW}🐍 Step 4: Checking Python...${NC}"
PYTHON_VERSION=$(python3 --version 2>&1 | grep -oE '[0-9]+\.[0-9]+' | head -1)
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

if [[ $PYTHON_MAJOR -ge 3 ]] && [[ $PYTHON_MINOR -ge 8 ]]; then
    echo -e "${GREEN}   ✓ Python $PYTHON_VERSION is installed${NC}"
else
    echo -e "${YELLOW}   Installing Python 3.11...${NC}"
    brew install python@3.11
fi

# Step 5: Create Virtual Environment (in .venv - gitignored)
echo ""
echo -e "${YELLOW}🔧 Step 5: Setting up Python virtual environment...${NC}"
cd "$REPO_ROOT"

if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}   Creating virtual environment in .venv/...${NC}"
    python3 -m venv .venv
    echo -e "${GREEN}   ✓ Virtual environment created${NC}"
else
    echo -e "${GREEN}   ✓ Virtual environment already exists${NC}"
fi

# Activate virtual environment
source .venv/bin/activate

# Step 6: Install Python dependencies
echo ""
echo -e "${YELLOW}📚 Step 6: Installing Python dependencies...${NC}"

# Install core packages
echo -e "${YELLOW}   Installing Jupyter and workshop dependencies...${NC}"
pip install --upgrade pip > /dev/null 2>&1

# Install from requirements if it exists
if [ -f "tests/requirements.txt" ]; then
    pip install -r tests/requirements.txt > /dev/null 2>&1
fi

# Install workshop dependencies
pip install \
    jupyter \
    jupyterlab \
    ipykernel \
    nbformat \
    nbconvert \
    pytest \
    redis \
    flask \
    psycopg2-binary \
    python-dotenv \
    azure-identity \
    azure-mgmt-redis \
    azure-mgmt-resource \
    matplotlib \
    plotly \
    pandas \
    locust \
    > /dev/null 2>&1

echo -e "${GREEN}   ✓ All Python packages installed${NC}"

# Step 7: Register Jupyter kernel
echo ""
echo -e "${YELLOW}📓 Step 7: Registering Jupyter kernel...${NC}"
python -m ipykernel install --user --name redis-workshop --display-name "Python (Redis Workshop)" > /dev/null 2>&1
echo -e "${GREEN}   ✓ Jupyter kernel registered${NC}"

# Step 8: Start Redis
echo ""
echo -e "${YELLOW}▶️  Step 8: Starting Redis server...${NC}"
if pgrep -x "redis-server" > /dev/null; then
    echo -e "${GREEN}   ✓ Redis is already running${NC}"
else
    # Start Redis in background
    brew services start redis > /dev/null 2>&1
    sleep 2
    if redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}   ✓ Redis started successfully${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Redis may not have started properly${NC}"
        echo -e "${YELLOW}   Try running: brew services start redis${NC}"
    fi
fi

# Step 9: Add scripts to PATH (in shell profile)
echo ""
echo -e "${YELLOW}🔧 Step 9: Adding scripts to PATH...${NC}"

SHELL_PROFILE=""
if [ -f "$HOME/.zshrc" ]; then
    SHELL_PROFILE="$HOME/.zshrc"
elif [ -f "$HOME/.bash_profile" ]; then
    SHELL_PROFILE="$HOME/.bash_profile"
elif [ -f "$HOME/.bashrc" ]; then
    SHELL_PROFILE="$HOME/.bashrc"
fi

PATH_EXPORT="export PATH=\"$REPO_ROOT/scripts:\$PATH\""

if [ -n "$SHELL_PROFILE" ]; then
    if ! grep -q "$REPO_ROOT/scripts" "$SHELL_PROFILE" 2>/dev/null; then
        echo "" >> "$SHELL_PROFILE"
        echo "# Redis Workshop Scripts" >> "$SHELL_PROFILE"
        echo "$PATH_EXPORT" >> "$SHELL_PROFILE"
        echo -e "${GREEN}   ✓ Added scripts to PATH in $SHELL_PROFILE${NC}"
    else
        echo -e "${GREEN}   ✓ Scripts already in PATH${NC}"
    fi
fi

# Add to current session
export PATH="$REPO_ROOT/scripts:$PATH"

# Step 10: Create activation script
echo ""
echo -e "${YELLOW}📝 Step 10: Creating activation script...${NC}"
cat > "$REPO_ROOT/.activate-local" << 'EOF'
#!/bin/bash

# Activation script for local Redis Workshop development
# Source this file to activate the workshop environment

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Activate Python virtual environment
if [ -f "$SCRIPT_DIR/.venv/bin/activate" ]; then
    source "$SCRIPT_DIR/.venv/bin/activate"
    echo "✓ Python virtual environment activated"
fi

# Add scripts to PATH
export PATH="$SCRIPT_DIR/scripts:$PATH"
echo "✓ Workshop scripts added to PATH"

# Check Redis
if redis-cli ping &> /dev/null; then
    echo "✓ Redis is running on localhost:6379"
else
    echo "⚠️  Redis is not running. Start with: brew services start redis"
fi

# Check Docker
if docker info &> /dev/null; then
    echo "✓ Docker is running"
else
    echo "⚠️  Docker is not running (needed for PostgreSQL tests)"
fi

echo ""
echo "🎉 Workshop environment ready!"
echo ""
echo "Available commands:"
echo "  test-notebooks          - Test notebooks in current directory"
echo "  test-notebooks -m       - Test entire module"
echo "  test-notebooks -a -d    - Test all with Docker containers"
echo "  jupyter lab             - Start Jupyter Lab"
echo "  jupyter notebook        - Start Jupyter Notebook"
echo ""
echo "To deactivate: deactivate"
EOF

chmod +x "$REPO_ROOT/.activate-local"
echo -e "${GREEN}   ✓ Created .activate-local script${NC}"

# Step 11: Create convenience aliases
echo ""
echo -e "${YELLOW}🔧 Step 11: Creating convenience aliases...${NC}"

if [ -n "$SHELL_PROFILE" ]; then
    ALIASES=$(cat << 'EOF'

# Redis Workshop Aliases
alias workshop-activate='source .activate-local'
alias workshop-test='test-notebooks'
alias workshop-test-module='test-notebooks -m'
alias workshop-test-all='test-notebooks -a'
alias workshop-jupyter='jupyter lab'
alias workshop-redis-start='brew services start redis'
alias workshop-redis-stop='brew services stop redis'
alias workshop-redis-status='redis-cli ping'
EOF
)
    
    if ! grep -q "Redis Workshop Aliases" "$SHELL_PROFILE" 2>/dev/null; then
        echo "$ALIASES" >> "$SHELL_PROFILE"
        echo -e "${GREEN}   ✓ Added convenience aliases to $SHELL_PROFILE${NC}"
    else
        echo -e "${GREEN}   ✓ Aliases already configured${NC}"
    fi
fi

# Step 12: Update .gitignore
echo ""
echo -e "${YELLOW}📝 Step 12: Updating .gitignore...${NC}"

GITIGNORE_ENTRIES=(
    "# Local development (macOS setup)"
    ".venv/"
    "**/.venv/"
    ".activate-local"
    "*.local"
    ".DS_Store"
    "**/.DS_Store"
)

GITIGNORE="$REPO_ROOT/.gitignore"
for entry in "${GITIGNORE_ENTRIES[@]}"; do
    if ! grep -qF "$entry" "$GITIGNORE" 2>/dev/null; then
        echo "$entry" >> "$GITIGNORE"
    fi
done
echo -e "${GREEN}   ✓ .gitignore updated${NC}"

# Summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Local Setup Complete!                          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📋 What was installed:${NC}"
echo -e "   ✓ Redis server (running on localhost:6379)"
echo -e "   ✓ Python virtual environment (.venv/)"
echo -e "   ✓ Jupyter Lab & Notebook"
echo -e "   ✓ All workshop Python dependencies"
echo -e "   ✓ Testing framework (pytest, nbformat, nbconvert)"
echo -e "   ✓ Workshop scripts in PATH"
echo ""
echo -e "${CYAN}🚀 Getting Started:${NC}"
echo ""
echo -e "${YELLOW}1. Activate the environment:${NC}"
echo -e "   ${BLUE}source .activate-local${NC}"
echo ""
echo -e "${YELLOW}2. Test the setup:${NC}"
echo -e "   ${BLUE}test-notebooks --help${NC}"
echo -e "   ${BLUE}redis-cli ping${NC}"
echo ""
echo -e "${YELLOW}3. Start Jupyter:${NC}"
echo -e "   ${BLUE}jupyter lab${NC}"
echo -e "   ${BLUE}# or${NC}"
echo -e "   ${BLUE}jupyter notebook${NC}"
echo ""
echo -e "${YELLOW}4. Run tests:${NC}"
echo -e "   ${BLUE}cd workshops/deploy-redis-for-developers-amr/module-08-implement-caching-lab${NC}"
echo -e "   ${BLUE}test-notebooks -d${NC}"
echo ""
echo -e "${CYAN}📚 Available aliases:${NC}"
echo -e "   ${BLUE}workshop-activate${NC}        - Activate environment"
echo -e "   ${BLUE}workshop-test${NC}            - Test current directory"
echo -e "   ${BLUE}workshop-test-module${NC}     - Test entire module"
echo -e "   ${BLUE}workshop-test-all${NC}        - Test all notebooks"
echo -e "   ${BLUE}workshop-jupyter${NC}         - Start Jupyter Lab"
echo -e "   ${BLUE}workshop-redis-start${NC}     - Start Redis"
echo -e "   ${BLUE}workshop-redis-stop${NC}      - Stop Redis"
echo ""
echo -e "${CYAN}🔄 Next time you open a terminal:${NC}"
echo -e "   ${BLUE}source .activate-local${NC}"
echo -e "   ${BLUE}# or${NC}"
echo -e "   ${BLUE}workshop-activate${NC}"
echo ""
echo -e "${GREEN}✨ Your Mac is now configured like Codespaces!${NC}"
echo ""

# Activate for current session
source "$REPO_ROOT/.activate-local"
