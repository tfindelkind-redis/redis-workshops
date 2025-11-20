#!/bin/bash
#
# Codespaces setup script
# This script is run automatically when the Codespace is created
# It sets up the environment for workshop development

echo "🚀 Setting up Redis Workshop environment..."

# Get the workspace directory
WORKSPACE_DIR="${WORKSPACE_DIR:-/workspaces/redis-workshops}"
SCRIPTS_DIR="${WORKSPACE_DIR}/scripts"

# Add scripts directory to PATH for current shell
export PATH="${SCRIPTS_DIR}:${PATH}"

# Add to bash profile for future sessions
if ! grep -q "${SCRIPTS_DIR}" ~/.bashrc 2>/dev/null; then
    echo "" >> ~/.bashrc
    echo "# Redis Workshop Scripts" >> ~/.bashrc
    echo "export PATH=\"${SCRIPTS_DIR}:\${PATH}\"" >> ~/.bashrc
    echo "✅ Added scripts directory to PATH in ~/.bashrc"
fi

# Add to zsh profile if zsh is available
if [ -f ~/.zshrc ] && ! grep -q "${SCRIPTS_DIR}" ~/.zshrc 2>/dev/null; then
    echo "" >> ~/.zshrc
    echo "# Redis Workshop Scripts" >> ~/.zshrc
    echo "export PATH=\"${SCRIPTS_DIR}:\${PATH}\"" >> ~/.zshrc
    echo "✅ Added scripts directory to PATH in ~/.zshrc"
fi

# Install Python testing dependencies
if [ -f "${WORKSPACE_DIR}/tests/requirements.txt" ]; then
    echo "📦 Installing Python testing dependencies..."
    pip install -q -r "${WORKSPACE_DIR}/tests/requirements.txt"
    echo "✅ Python dependencies installed"
fi

# Pre-pull Docker images for faster testing
if command -v docker &> /dev/null; then
    echo "🐳 Pre-pulling Docker images..."
    docker pull postgres:15-alpine > /dev/null 2>&1 &
    docker pull redis:7-alpine > /dev/null 2>&1 &
    echo "✅ Docker images pulling in background"
fi

# Create aliases for convenience
cat > /tmp/workshop-aliases.sh << 'EOF'
# Redis Workshop Aliases
alias nb-test='test-notebooks'
alias nb-test-module='test-notebooks -m'
alias nb-test-all='test-notebooks -a'
alias nb-test-docker='test-notebooks -d'
alias workshop-clean='docker stop test-postgres test-redis 2>/dev/null; docker rm test-postgres test-redis 2>/dev/null'
EOF

# Source aliases
source /tmp/workshop-aliases.sh

# Add aliases to shell profiles
if [ -f ~/.bashrc ]; then
    cat /tmp/workshop-aliases.sh >> ~/.bashrc
fi

if [ -f ~/.zshrc ]; then
    cat /tmp/workshop-aliases.sh >> ~/.zshrc
fi

echo ""
echo "✅ Redis Workshop environment ready!"
echo ""
echo "📚 Available commands:"
echo "   test-notebooks          - Test notebooks in current directory"
echo "   test-notebooks -m       - Test entire module"
echo "   test-notebooks -a       - Test all notebooks"
echo "   test-notebooks -d       - Test with Docker containers"
echo "   test-notebooks --help   - Show detailed help"
echo ""
echo "🔧 Aliases:"
echo "   nb-test                 - Short for test-notebooks"
echo "   nb-test-module          - Test entire module"
echo "   nb-test-all             - Test all notebooks"
echo "   nb-test-docker          - Test with Docker"
echo "   workshop-clean          - Clean up Docker containers"
echo ""
echo "💡 Try: cd into any module and run 'test-notebooks'"
