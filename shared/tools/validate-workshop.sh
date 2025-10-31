#!/bin/bash

# Validate Workshop Structure
# Usage: ./validate-workshop.sh workshops/workshop-name

set -e

if [ -z "$1" ]; then
    echo "Usage: ./validate-workshop.sh <workshop-directory>"
    echo "Example: ./validate-workshop.sh workshops/redis-fundamentals"
    exit 1
fi

WORKSHOP_DIR="$1"
ERRORS=0
WARNINGS=0

echo "🔍 Validating workshop structure: $WORKSHOP_DIR"
echo ""

# Check if directory exists
if [ ! -d "$WORKSHOP_DIR" ]; then
    echo "❌ Workshop directory not found: $WORKSHOP_DIR"
    exit 1
fi

# Check for required files
echo "📋 Checking required files..."

if [ ! -f "$WORKSHOP_DIR/README.md" ]; then
    echo "❌ Missing README.md"
    ((ERRORS++))
else
    echo "✅ README.md found"
fi

if [ ! -f "$WORKSHOP_DIR/workshop.config.json" ]; then
    echo "❌ Missing workshop.config.json"
    ((ERRORS++))
else
    echo "✅ workshop.config.json found"
    
    # Validate JSON syntax
    if command -v jq &> /dev/null; then
        if jq empty "$WORKSHOP_DIR/workshop.config.json" 2>/dev/null; then
            echo "✅ workshop.config.json is valid JSON"
        else
            echo "❌ workshop.config.json has invalid JSON syntax"
            ((ERRORS++))
        fi
    else
        echo "⚠️  jq not installed, skipping JSON validation"
        ((WARNINGS++))
    fi
fi

if [ ! -f "$WORKSHOP_DIR/setup.sh" ]; then
    echo "⚠️  Missing setup.sh (optional but recommended)"
    ((WARNINGS++))
else
    echo "✅ setup.sh found"
    
    # Check if executable
    if [ -x "$WORKSHOP_DIR/setup.sh" ]; then
        echo "✅ setup.sh is executable"
    else
        echo "⚠️  setup.sh is not executable"
        ((WARNINGS++))
    fi
fi

echo ""
echo "📚 Validating chapter references..."

if [ -f "$WORKSHOP_DIR/workshop.config.json" ]; then
    if command -v jq &> /dev/null; then
        # Get repository root
        REPO_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
        
        # Extract chapter references
        CHAPTER_REFS=$(jq -r '.chapters[].chapterRef' "$WORKSHOP_DIR/workshop.config.json" 2>/dev/null || echo "")
        
        if [ -z "$CHAPTER_REFS" ]; then
            echo "⚠️  No chapters defined in workshop.config.json"
            ((WARNINGS++))
        else
            for CHAPTER_REF in $CHAPTER_REFS; do
                CHAPTER_PATH="$REPO_ROOT/$CHAPTER_REF"
                
                # Determine chapter type
                if [[ "$CHAPTER_REF" == shared/chapters/* ]]; then
                    CHAPTER_TYPE="shared"
                elif [[ "$CHAPTER_REF" == workshops/*/chapters/* ]]; then
                    CHAPTER_TYPE="workshop-specific"
                else
                    CHAPTER_TYPE="unknown"
                fi
                
                if [ -d "$CHAPTER_PATH" ]; then
                    echo "✅ Chapter exists ($CHAPTER_TYPE): $CHAPTER_REF"
                    
                    # Check if chapter has README
                    if [ ! -f "$CHAPTER_PATH/README.md" ]; then
                        echo "   ⚠️  Chapter missing README.md"
                        ((WARNINGS++))
                    fi
                    
                    # Check if chapter has scripts directory
                    if [ ! -d "$CHAPTER_PATH/scripts" ]; then
                        echo "   ⚠️  Chapter missing scripts directory (recommended)"
                        ((WARNINGS++))
                    fi
                else
                    echo "❌ Chapter not found: $CHAPTER_REF"
                    ((ERRORS++))
                fi
            done
        fi
    fi
fi

echo ""
echo "📊 Validation Summary"
echo "━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ All checks passed!"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Validation passed with $WARNINGS warning(s)"
    exit 0
else
    echo "❌ Validation failed with $ERRORS error(s) and $WARNINGS warning(s)"
    exit 1
fi
