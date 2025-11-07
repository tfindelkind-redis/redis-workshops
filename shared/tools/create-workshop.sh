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
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create a new branch for the workshop
BRANCH_NAME="workshop/$WORKSHOP_ID"
echo "🌿 Creating new branch: $BRANCH_NAME"
cd "$REPO_ROOT"
git checkout -b "$BRANCH_NAME"
echo ""

# Create workshop directory from template
echo "📋 Copying template..."
cp -r "$TEMPLATE_DIR" "$REPO_ROOT/$WORKSHOP_DIR"

# Update placeholders in README.md
echo "✏️  Updating workshop README..."
sed -i.bak "s/WORKSHOP_ID_PLACEHOLDER/$WORKSHOP_ID/g" "$REPO_ROOT/$WORKSHOP_DIR/README.md"
sed -i.bak "s/WORKSHOP_NAME_PLACEHOLDER/$WORKSHOP_NAME/g" "$REPO_ROOT/$WORKSHOP_DIR/README.md"
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
echo "🌿 Branch: $BRANCH_NAME"
echo ""
echo "🔄 Generating workshop.config.json from README.md frontmatter..."
"$SCRIPT_DIR/sync-workshop-config.sh" "$REPO_ROOT/$WORKSHOP_DIR"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Edit your workshop content:"
echo "   cd $WORKSHOP_DIR"
echo "   # Edit README.md frontmatter (workshopId, title, description, etc.)"
echo "   # Add workshop content to README.md"
echo ""
echo "2. Sync configuration:"
echo "   ./shared/tools/sync-workshop-config.sh $WORKSHOP_DIR"
echo ""
echo "3. Commit your changes:"
echo "   git add $WORKSHOP_DIR"
echo "   git commit -m 'Add $WORKSHOP_NAME workshop'"
echo ""
echo "4. Push and create Pull Request:"
echo "   git push -u origin $BRANCH_NAME"
echo "   # Then create a PR on GitHub to merge into main"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 Tips:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "• You only need to edit README.md! Config file is auto-generated"
echo "• Add chapters: chapters: chapter1, chapter2, chapter3"
echo "• Always sync before committing: ./shared/tools/sync-workshop-config.sh"
echo "• See docs/workshop-creation-guide.md for detailed help"
echo ""
