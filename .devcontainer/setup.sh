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

# Install Python dependencies (if requirements.txt exists)
if [ -f "requirements.txt" ]; then
    echo "🐍 Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Make scripts executable
echo "🔧 Setting up scripts..."
chmod +x shared/tools/*.sh 2>/dev/null || true
find workshops -name "*.sh" -type f -exec chmod +x {} \; 2>/dev/null || true

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
