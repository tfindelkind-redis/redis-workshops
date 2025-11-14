#!/bin/bash

# List all available workshops

set -e

REPO_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
WORKSHOPS_DIR="$REPO_ROOT/workshops"

echo "📚 Available Redis Workshops"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ! -d "$WORKSHOPS_DIR" ] || [ -z "$(ls -A $WORKSHOPS_DIR)" ]; then
    echo "No workshops found."
    exit 0
fi

for WORKSHOP_PATH in "$WORKSHOPS_DIR"/*; do
    if [ -d "$WORKSHOP_PATH" ]; then
        WORKSHOP_ID=$(basename "$WORKSHOP_PATH")
        CONFIG_FILE="$WORKSHOP_PATH/workshop.config.json"
        
        echo "Workshop: $WORKSHOP_ID"
        
        if [ -f "$CONFIG_FILE" ] && command -v jq &> /dev/null; then
            TITLE=$(jq -r '.title // "N/A"' "$CONFIG_FILE")
            DIFFICULTY=$(jq -r '.difficulty // "N/A"' "$CONFIG_FILE")
            DURATION=$(jq -r '.duration // "N/A"' "$CONFIG_FILE")
            DESCRIPTION=$(jq -r '.description // "N/A"' "$CONFIG_FILE")
            
            echo "  Title: $TITLE"
            echo "  Difficulty: $DIFFICULTY"
            echo "  Duration: $DURATION"
            echo "  Description: $DESCRIPTION"
        fi
        
        echo "  Location: workshops/$WORKSHOP_ID"
        echo ""
    fi
done

echo "To start a workshop, navigate to its directory and run:"
echo "  cd workshops/<workshop-id>"
echo "  ./setup.sh"
