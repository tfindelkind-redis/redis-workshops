#!/bin/bash

# Devcontainer setup script
echo "🚀 Setting up Redis Workshops environment..."

# Install Redis
echo "📦 Installing Redis..."
sudo apt-get update
sudo apt-get install -y redis-server redis-tools

# Start Redis in background
echo "▶️ Starting Redis..."
sudo service redis-server start

# Install Jupyter and common data science packages
echo "📓 Installing Jupyter and data science tools..."
pip install jupyter jupyterlab ipykernel matplotlib plotly pandas redis flask psycopg2-binary python-dotenv azure-identity locust

# Install Python dependencies (if requirements.txt exists)
if [ -f "requirements.txt" ]; then
    echo "🐍 Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Register Python kernel for Jupyter
python -m ipykernel install --user --name redis-workshop --display-name "Python (Redis Workshop)"

# Make scripts executable
echo "🔧 Setting up scripts..."
chmod +x shared/tools/*.sh 2>/dev/null || true
chmod +x scripts/*.sh 2>/dev/null || true
chmod +x scripts/test-notebooks 2>/dev/null || true
find workshops -name "*.sh" -type f -exec chmod +x {} \; 2>/dev/null || true

# Run workshop environment setup
if [ -f "scripts/setup-environment.sh" ]; then
    echo "🎯 Configuring workshop environment..."
    bash scripts/setup-environment.sh
fi

echo "✅ Setup complete!"
echo ""
echo "📚 Available workshops:"
ls -1 workshops/ 2>/dev/null || echo "  No workshops found"
echo ""
echo "💡 Tips:"
echo "  - Navigate to a workshop: cd workshops/<workshop-name>"
echo "  - Follow the workshop README for instructions"
echo "  - Redis is running on localhost:6379"
echo "  - Test connection: redis-cli ping"
echo "  - Test notebooks: test-notebooks --help"
