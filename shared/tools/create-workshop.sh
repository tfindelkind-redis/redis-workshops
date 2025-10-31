#!/bin/bash

# Create New Workshop Script
# Usage: ./create-workshop.sh "Workshop Name"

set -e

if [ -z "$1" ]; then
    echo "Usage: ./create-workshop.sh \"Workshop Name\""
    echo "Example: ./create-workshop.sh \"Redis Advanced Patterns\""
    exit 1
fi

WORKSHOP_NAME="$1"
# Convert to lowercase and replace spaces with hyphens
WORKSHOP_ID=$(echo "$WORKSHOP_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')
WORKSHOP_DIR="workshops/$WORKSHOP_ID"

echo "🎨 Creating new workshop: $WORKSHOP_NAME"
echo "📁 Workshop ID: $WORKSHOP_ID"
echo ""

# Check if workshop already exists
if [ -d "$WORKSHOP_DIR" ]; then
    echo "❌ Workshop already exists at $WORKSHOP_DIR"
    exit 1
fi

# Get the repository root (assuming script is in shared/tools/)
REPO_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
TEMPLATE_DIR="$REPO_ROOT/shared/templates/workshop-template"

# Create workshop directory from template
echo "📋 Copying template..."
cp -r "$TEMPLATE_DIR" "$REPO_ROOT/$WORKSHOP_DIR"

# Update placeholders in README.md
echo "✏️  Updating workshop README..."
sed -i.bak "s/Workshop Name/$WORKSHOP_NAME/g" "$REPO_ROOT/$WORKSHOP_DIR/README.md"
sed -i.bak "s/\[workshop-name\]/$WORKSHOP_ID/g" "$REPO_ROOT/$WORKSHOP_DIR/README.md"
rm "$REPO_ROOT/$WORKSHOP_DIR/README.md.bak"

# Update workshop.config.json
echo "✏️  Updating workshop configuration..."
TODAY=$(date +%Y-%m-%d)
sed -i.bak "s/workshop-name/$WORKSHOP_ID/g" "$REPO_ROOT/$WORKSHOP_DIR/workshop.config.json"
sed -i.bak "s/Workshop Title/$WORKSHOP_NAME/g" "$REPO_ROOT/$WORKSHOP_DIR/workshop.config.json"
sed -i.bak "s/2025-10-31/$TODAY/g" "$REPO_ROOT/$WORKSHOP_DIR/workshop.config.json"
rm "$REPO_ROOT/$WORKSHOP_DIR/workshop.config.json.bak"

# Update setup.sh
sed -i.bak "s/\[Workshop Name\]/$WORKSHOP_NAME/g" "$REPO_ROOT/$WORKSHOP_DIR/setup.sh"
rm "$REPO_ROOT/$WORKSHOP_DIR/setup.sh.bak"

# Make setup.sh executable
chmod +x "$REPO_ROOT/$WORKSHOP_DIR/setup.sh"

# Create assets directory
mkdir -p "$REPO_ROOT/$WORKSHOP_DIR/assets"

echo ""
echo "✅ Workshop created successfully!"
echo ""
echo "📂 Location: $WORKSHOP_DIR"
echo ""
echo "🔄 Generating workshop.config.json from README.md frontmatter..."
"$SCRIPT_DIR/sync-workshop-config.sh" "$REPO_ROOT/$WORKSHOP_DIR"
echo ""
echo "Next steps:"
echo "1. cd $WORKSHOP_DIR"
echo "2. Edit README.md frontmatter to customize your workshop metadata"
echo "3. Add workshop content and chapters to the README.md"
echo "4. Run: ./shared/tools/sync-workshop-config.sh $WORKSHOP_DIR (to update config)"
echo "5. Add any workshop-specific assets to the assets/ directory"
echo ""
echo "💡 Tip: You only need to edit README.md! The config file is auto-generated."
echo "See docs/workshop-creation-guide.md for more details."
