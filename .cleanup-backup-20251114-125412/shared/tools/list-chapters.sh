#!/bin/bash

# List all available chapters

set -e

REPO_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
CHAPTERS_DIR="$REPO_ROOT/shared/chapters"

echo "📖 Available Redis Workshop Chapters"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ! -d "$CHAPTERS_DIR" ] || [ -z "$(ls -A $CHAPTERS_DIR)" ]; then
    echo "No chapters found."
    exit 0
fi

for CHAPTER_PATH in "$CHAPTERS_DIR"/*; do
    if [ -d "$CHAPTER_PATH" ]; then
        CHAPTER_ID=$(basename "$CHAPTER_PATH")
        METADATA_FILE="$CHAPTER_PATH/.chapter-metadata.json"
        README_FILE="$CHAPTER_PATH/README.md"
        
        echo "$CHAPTER_ID"
        
        if [ -f "$METADATA_FILE" ] && command -v jq &> /dev/null; then
            TITLE=$(jq -r '.title // "N/A"' "$METADATA_FILE")
            DIFFICULTY=$(jq -r '.difficulty // "N/A"' "$METADATA_FILE")
            DURATION=$(jq -r '.estimatedMinutes // "N/A"' "$METADATA_FILE")
            DESCRIPTION=$(jq -r '.description // "N/A"' "$METADATA_FILE")
            VERSION=$(jq -r '.version // "N/A"' "$METADATA_FILE")
            
            echo "  Title: $TITLE"
            echo "  Difficulty: $DIFFICULTY"
            echo "  Duration: $DURATION minutes"
            echo "  Version: $VERSION"
            echo "  Description: $DESCRIPTION"
        elif [ -f "$README_FILE" ]; then
            # Extract title from README if metadata not available
            TITLE=$(head -1 "$README_FILE" | sed 's/^# //')
            echo "  Title: $TITLE"
        fi
        
        echo "  Location: shared/chapters/$CHAPTER_ID"
        echo ""
    fi
done

echo "Chapters can be referenced in workshop.config.json using:"
echo "  \"chapterRef\": \"shared/chapters/<chapter-id>\""
