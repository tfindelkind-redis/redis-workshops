#!/bin/bash

# Create New Chapter Script
# Usage: ./create-chapter.sh "Chapter Name" [--workshop="workshop-name"]

set -e

if [ -z "$1" ]; then
    echo "Usage: ./create-chapter.sh \"Chapter Name\" [--workshop=\"workshop-name\"]"
    echo ""
    echo "Examples:"
    echo "  Shared chapter:    ./create-chapter.sh \"Redis Data Structures\""
    echo "  Workshop chapter:  ./create-chapter.sh \"Building Chat Backend\" --workshop=\"redis-chat-app\""
    exit 1
fi

CHAPTER_NAME="$1"
WORKSHOP_NAME=""

# Parse optional workshop parameter
for arg in "$@"; do
    case $arg in
        --workshop=*)
            WORKSHOP_NAME="${arg#*=}"
            shift
            ;;
    esac
done

# Get next chapter number
REPO_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"

# Determine if this is a workshop-specific or shared chapter
if [ -n "$WORKSHOP_NAME" ]; then
    # Workshop-specific chapter
    WORKSHOP_DIR="$REPO_ROOT/workshops/$WORKSHOP_NAME"
    
    if [ ! -d "$WORKSHOP_DIR" ]; then
        echo "❌ Workshop not found: $WORKSHOP_NAME"
        echo "   Available workshops:"
        ls -1 "$REPO_ROOT/workshops" 2>/dev/null || echo "   (none)"
        exit 1
    fi
    
    CHAPTERS_DIR="$WORKSHOP_DIR/chapters"
    mkdir -p "$CHAPTERS_DIR"
    
    # For workshop chapters, use simple naming
    CHAPTER_ID=$(echo "$CHAPTER_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')
    FULL_CHAPTER_ID="$CHAPTER_ID"
    CHAPTER_DIR="$CHAPTERS_DIR/$FULL_CHAPTER_ID"
    CHAPTER_TYPE="workshop-specific"
    
    echo "🎨 Creating workshop-specific chapter: $CHAPTER_NAME"
    echo "📁 Workshop: $WORKSHOP_NAME"
    echo "📁 Chapter ID: $FULL_CHAPTER_ID"
else
    # Shared chapter
    CHAPTERS_DIR="$REPO_ROOT/shared/chapters"
    
    # Find the highest chapter number
    HIGHEST_NUM=0
    for dir in "$CHAPTERS_DIR"/chapter-*; do
        if [ -d "$dir" ]; then
            NUM=$(basename "$dir" | sed 's/chapter-\([0-9]*\)-.*/\1/')
            if [ "$NUM" -gt "$HIGHEST_NUM" ]; then
                HIGHEST_NUM=$NUM
            fi
        fi
    done
    
    NEXT_NUM=$((HIGHEST_NUM + 1))
    CHAPTER_NUM=$(printf "%02d" $NEXT_NUM)
    
    # Convert chapter name to ID
    CHAPTER_ID=$(echo "$CHAPTER_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')
    FULL_CHAPTER_ID="chapter-$CHAPTER_NUM-$CHAPTER_ID"
    CHAPTER_DIR="$CHAPTERS_DIR/$FULL_CHAPTER_ID"
    CHAPTER_TYPE="shared"
    
    echo "🎨 Creating shared chapter: $CHAPTER_NAME"
    echo "📁 Chapter ID: $FULL_CHAPTER_ID"
fi

echo ""

# Check if chapter already exists
if [ -d "$CHAPTER_DIR" ]; then
    echo "❌ Chapter already exists at $CHAPTER_DIR"
    exit 1
fi

# Copy template
TEMPLATE_DIR="$REPO_ROOT/shared/templates/chapter-template"
echo "📋 Copying template..."
cp -r "$TEMPLATE_DIR" "$CHAPTER_DIR"

# Update placeholders
echo "✏️  Updating chapter files..."
TODAY=$(date +%Y-%m-%d)

# Update README.md
sed -i.bak "s/Chapter XX/Chapter $CHAPTER_NUM/g" "$CHAPTER_DIR/README.md"
sed -i.bak "s/\[Chapter Title\]/$CHAPTER_NAME/g" "$CHAPTER_DIR/README.md"
sed -i.bak "s/YYYY-MM-DD/$TODAY/g" "$CHAPTER_DIR/README.md"
rm "$CHAPTER_DIR/README.md.bak"

# Update metadata
sed -i.bak "s/chapter-XX-name/$FULL_CHAPTER_ID/g" "$CHAPTER_DIR/.chapter-metadata.json"
sed -i.bak "s/Chapter Title/$CHAPTER_NAME/g" "$CHAPTER_DIR/.chapter-metadata.json"
sed -i.bak "s/2025-10-31/$TODAY/g" "$CHAPTER_DIR/.chapter-metadata.json"
rm "$CHAPTER_DIR/.chapter-metadata.json.bak"

# Update scripts
sed -i.bak "s/\[Chapter Name\]/$CHAPTER_NAME/g" "$CHAPTER_DIR/scripts/setup.sh"
sed -i.bak "s/\[Chapter Name\]/$CHAPTER_NAME/g" "$CHAPTER_DIR/scripts/cleanup.sh"
rm "$CHAPTER_DIR/scripts/setup.sh.bak"
rm "$CHAPTER_DIR/scripts/cleanup.sh.bak"

# Make scripts executable
chmod +x "$CHAPTER_DIR/scripts"/*.sh
chmod +x "$CHAPTER_DIR/scripts/solutions"/*.sh

# Create assets directory
mkdir -p "$CHAPTER_DIR/assets"

echo ""
echo "✅ Chapter created successfully!"
echo ""
if [ "$CHAPTER_TYPE" = "workshop-specific" ]; then
    echo "📂 Location: workshops/$WORKSHOP_NAME/chapters/$FULL_CHAPTER_ID"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 Next Steps:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Edit chapter content:"
    echo "   cd workshops/$WORKSHOP_NAME/chapters/$FULL_CHAPTER_ID"
    echo "   # Edit README.md with your chapter content"
    echo ""
    echo "2. Add chapter to workshop frontmatter:"
    echo "   # Edit workshops/$WORKSHOP_NAME/README.md"
    echo "   # Add to chapters: ..., workshops/$WORKSHOP_NAME/chapters/$FULL_CHAPTER_ID"
    echo ""
    echo "3. Sync workshop configuration:"
    echo "   ./shared/tools/sync-workshop-config.sh workshops/$WORKSHOP_NAME"
    echo ""
    echo "4. Commit changes:"
    echo "   git add workshops/$WORKSHOP_NAME"
    echo "   git commit -m 'Add $CHAPTER_NAME chapter to $WORKSHOP_NAME'"
    echo ""
    echo "💡 Remember: Chapter must be added to README.md frontmatter!"
else
    echo "📂 Location: shared/chapters/$FULL_CHAPTER_ID"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 Next Steps:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Edit chapter content:"
    echo "   cd shared/chapters/$FULL_CHAPTER_ID"
    echo "   # Edit README.md with your chapter content"
    echo ""
    echo "2. Add chapter to workshop(s):"
    echo "   # Edit workshop README.md frontmatter"
    echo "   # Add to chapters: ..., shared/chapters/$FULL_CHAPTER_ID"
    echo ""
    echo "3. Sync workshop configuration:"
    echo "   ./shared/tools/sync-workshop-config.sh workshops/WORKSHOP_NAME"
    echo ""
    echo "4. Commit changes:"
    echo "   git add shared/chapters/$FULL_CHAPTER_ID"
    echo "   git commit -m 'Add shared chapter: $CHAPTER_NAME'"
fi
echo ""
echo "See docs/chapter-authoring-guide.md for more details."
echo ""
