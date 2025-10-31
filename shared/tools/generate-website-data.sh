#!/bin/bash

# Generate GitHub Pages Data
# This script scans workshops and chapters and generates data.js for the website

set -eo pipefail

# Determine repository root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]:-$0}" )" && pwd )"
REPO_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"
OUTPUT_FILE="$REPO_ROOT/docs/data.js"

echo "🔍 Scanning repository for workshops and chapters..."

# Ensure docs directory exists
mkdir -p "$REPO_ROOT/docs"

echo "DEBUG: REPO_ROOT=$REPO_ROOT"
echo "DEBUG: OUTPUT_FILE=$OUTPUT_FILE"

# Start generating the data.js file
echo "DEBUG: Creating data.js file..."
cat > "$OUTPUT_FILE" << 'EOF'
// Workshop and Chapter Data
// This file is auto-generated. Do not edit manually.
// Generated on: DATE_PLACEHOLDER

const workshopsData = [
EOF

echo "DEBUG: Starting workshop scan..."

# Process workshops
WORKSHOP_COUNT=0
FIRST_WORKSHOP=true

for WORKSHOP_DIR in "$REPO_ROOT/workshops"/*; do
    if [ -d "$WORKSHOP_DIR" ]; then
        WORKSHOP_ID=$(basename "$WORKSHOP_DIR")
        CONFIG_FILE="$WORKSHOP_DIR/workshop.config.json"
        
        if [ -f "$CONFIG_FILE" ] && command -v jq &> /dev/null; then
            # Extract data from config
            TITLE=$(jq -r '.title // "Untitled Workshop"' "$CONFIG_FILE")
            DESCRIPTION=$(jq -r '.description // "No description"' "$CONFIG_FILE")
            DIFFICULTY=$(jq -r '.difficulty // "beginner"' "$CONFIG_FILE")
            DURATION=$(jq -r '.duration // "Unknown"' "$CONFIG_FILE")
            CHAPTERS_COUNT=$(jq '.chapters | length' "$CONFIG_FILE")
            TAGS=$(jq -c '.tags // []' "$CONFIG_FILE")
            LAST_UPDATED=$(jq -r '.lastUpdated // "Unknown"' "$CONFIG_FILE")
            
            # Escape quotes in strings for JSON
            TITLE_ESC=$(echo "$TITLE" | sed 's/"/\\"/g')
            DESCRIPTION_ESC=$(echo "$DESCRIPTION" | sed 's/"/\\"/g')
            
            # Add comma before this entry if not the first
            if [ "$FIRST_WORKSHOP" = false ]; then
                printf ",\n" >> "$OUTPUT_FILE"
            fi
            FIRST_WORKSHOP=false
            
            cat >> "$OUTPUT_FILE" << EOF
    {
        id: "$WORKSHOP_ID",
        title: "$TITLE_ESC",
        description: "$DESCRIPTION_ESC",
        difficulty: "$DIFFICULTY",
        duration: "$DURATION",
        chaptersCount: $CHAPTERS_COUNT,
        tags: $TAGS,
        path: "workshops/$WORKSHOP_ID",
        lastUpdated: "$LAST_UPDATED"
    }
EOF
            ((WORKSHOP_COUNT++))
        fi
    fi
done

# Close workshops array and start chapters array
cat >> "$OUTPUT_FILE" << 'EOF'

];

const chaptersData = [
EOF

# Process shared chapters
CHAPTER_COUNT=0
FIRST_CHAPTER=true

for CHAPTER_DIR in "$REPO_ROOT/shared/chapters"/*; do
    if [ -d "$CHAPTER_DIR" ]; then
        CHAPTER_ID=$(basename "$CHAPTER_DIR")
        METADATA_FILE="$CHAPTER_DIR/.chapter-metadata.json"
        
        if [ -f "$METADATA_FILE" ] && command -v jq &> /dev/null; then
            TITLE=$(jq -r '.title // "Untitled Chapter"' "$METADATA_FILE")
            DESCRIPTION=$(jq -r '.description // "No description"' "$METADATA_FILE")
            DIFFICULTY=$(jq -r '.difficulty // "beginner"' "$METADATA_FILE")
            MINUTES=$(jq -r '.estimatedMinutes // 30' "$METADATA_FILE")
            TAGS=$(jq -c '.tags // []' "$METADATA_FILE")
            VERSION=$(jq -r '.version // "1.0.0"' "$METADATA_FILE")
            
            TITLE_ESC=$(echo "$TITLE" | sed 's/"/\\"/g')
            DESCRIPTION_ESC=$(echo "$DESCRIPTION" | sed 's/"/\\"/g')
            
            # Add comma and newline after previous entry if not the first
            if [ "$FIRST_CHAPTER" = false ]; then
                printf ",\n" >> "$OUTPUT_FILE"
            fi
            
            cat >> "$OUTPUT_FILE" << EOF
    {
        id: "$CHAPTER_ID",
        title: "$TITLE_ESC",
        description: "$DESCRIPTION_ESC",
        difficulty: "$DIFFICULTY",
        estimatedMinutes: $MINUTES,
        tags: $TAGS,
        path: "shared/chapters/$CHAPTER_ID",
        version: "$VERSION",
        workshopSpecific: false
    }
EOF
            FIRST_CHAPTER=false
            ((CHAPTER_COUNT++))
        fi
    fi
done

# Process workshop-specific chapters
for WORKSHOP_DIR in "$REPO_ROOT/workshops"/*; do
    if [ -d "$WORKSHOP_DIR" ]; then
        WORKSHOP_ID=$(basename "$WORKSHOP_DIR")
        CHAPTERS_DIR="$WORKSHOP_DIR/chapters"
        
        if [ -d "$CHAPTERS_DIR" ]; then
            for CHAPTER_DIR in "$CHAPTERS_DIR"/*; do
                if [ -d "$CHAPTER_DIR" ]; then
                    CHAPTER_ID=$(basename "$CHAPTER_DIR")
                    METADATA_FILE="$CHAPTER_DIR/.chapter-metadata.json"
                    
                    if [ -f "$METADATA_FILE" ] && command -v jq &> /dev/null; then
                        TITLE=$(jq -r '.title // "Untitled Chapter"' "$METADATA_FILE")
                        DESCRIPTION=$(jq -r '.description // "No description"' "$METADATA_FILE")
                        DIFFICULTY=$(jq -r '.difficulty // "beginner"' "$METADATA_FILE")
                        MINUTES=$(jq -r '.estimatedMinutes // 30' "$METADATA_FILE")
                        TAGS=$(jq -c '.tags // []' "$METADATA_FILE")
                        VERSION=$(jq -r '.version // "1.0.0"' "$METADATA_FILE")
                        
                        TITLE_ESC=$(echo "$TITLE" | sed 's/"/\\"/g')
                        DESCRIPTION_ESC=$(echo "$DESCRIPTION" | sed 's/"/\\"/g')
                        
                        # Add comma before this entry if not the first
                        if [ "$FIRST_CHAPTER" = false ]; then
                            printf ",\n" >> "$OUTPUT_FILE"
                        fi
                        FIRST_CHAPTER=false
                        
                        cat >> "$OUTPUT_FILE" << EOF
    {
        id: "$CHAPTER_ID",
        title: "$TITLE_ESC",
        description: "$DESCRIPTION_ESC",
        difficulty: "$DIFFICULTY",
        estimatedMinutes: $MINUTES,
        tags: $TAGS,
        path: "workshops/$WORKSHOP_ID/chapters/$CHAPTER_ID",
        version: "$VERSION",
        workshopSpecific: true,
        workshop: "$WORKSHOP_ID"
    }
EOF
                        ((CHAPTER_COUNT++))
                    fi
                fi
            done
        fi
    fi
done

# Close chapters array
cat >> "$OUTPUT_FILE" << 'EOF'

];
EOF

# Update date and fix formatting
TODAY=$(date +%Y-%m-%d)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i.bak "s/DATE_PLACEHOLDER/$TODAY/" "$OUTPUT_FILE"
    rm "$OUTPUT_FILE.bak" 2>/dev/null || true
else
    # Linux
    sed -i "s/DATE_PLACEHOLDER/$TODAY/" "$OUTPUT_FILE"
fi

# Fix comma formatting: change "    }\n,\n" to "    },\n" using awk
awk 'BEGIN{prev=""} {if(prev ~ /^[[:space:]]*}$/ && $0==","){print prev","; prev=""; next} else if(prev!=""){print prev} prev=$0} END{if(prev!="")print prev}' "$OUTPUT_FILE" > "$OUTPUT_FILE.tmp" && mv "$OUTPUT_FILE.tmp" "$OUTPUT_FILE"

echo ""
echo "✅ Generated data.js successfully!"
echo ""
echo "📊 Statistics:"
echo "   Workshops: $WORKSHOP_COUNT"
echo "   Chapters: $CHAPTER_COUNT (shared + workshop-specific)"
echo ""
echo "📂 Output: docs/data.js"
echo ""
echo "Next steps:"
echo "1. Review the generated data.js file"
echo "2. Commit and push to GitHub"
echo "3. Enable GitHub Pages in repository settings"
echo "4. Your site will be live at: https://tfindelkind-redis.github.io/redis-workshops/"
