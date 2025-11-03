#!/bin/bash

# Validate Chapter Requirements
# Checks if all requirements for a chapter are met before starting

set -e

CHAPTER_DIR="${1:-.}"
METADATA_FILE="$CHAPTER_DIR/.chapter-metadata.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Validating chapter requirements...${NC}\n"

if [ ! -f "$METADATA_FILE" ]; then
    echo -e "${RED}❌ Error: .chapter-metadata.json not found${NC}"
    echo "Run: ./shared/tools/generate-chapter-metadata.py $CHAPTER_DIR"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ Error: jq is required but not installed${NC}"
    exit 1
fi

CHAPTER_TITLE=$(jq -r '.title' "$METADATA_FILE")
echo -e "${BLUE}Chapter: ${CHAPTER_TITLE}${NC}\n"

ALL_PASSED=true

# Function to check a command exists
check_command() {
    local cmd=$1
    local name=$2
    if command -v "$cmd" &> /dev/null; then
        echo -e "${GREEN}✓${NC} $name found"
        return 0
    else
        echo -e "${RED}✗${NC} $name not found"
        return 1
    fi
}

# Function to check environment variable
check_env_var() {
    local var_name=$1
    local required=$2
    local secret=$3
    
    if [ -n "${!var_name}" ]; then
        if [ "$secret" = "true" ]; then
            echo -e "${GREEN}✓${NC} $var_name is set (secret)"
        else
            echo -e "${GREEN}✓${NC} $var_name = ${!var_name}"
        fi
        return 0
    else
        if [ "$required" = "true" ]; then
            echo -e "${RED}✗${NC} $var_name is not set (required)"
            return 1
        else
            echo -e "${YELLOW}⚠${NC} $var_name is not set (optional)"
            return 0
        fi
    fi
}

# Check Redis connection
if jq -e '.requirements.redis' "$METADATA_FILE" &> /dev/null || \
   jq -e '.requirements["azure-redis"]' "$METADATA_FILE" &> /dev/null; then
    echo -e "${BLUE}Checking Redis connection...${NC}"
    
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✓${NC} Redis connection successful"
    else
        echo -e "${RED}✗${NC} Cannot connect to Redis"
        echo "  Make sure Redis is running and connection details are correct"
        ALL_PASSED=false
    fi
    echo ""
fi

# Check tools
if jq -e '.requirements.tools' "$METADATA_FILE" &> /dev/null; then
    echo -e "${BLUE}Checking required tools...${NC}"
    
    jq -c '.requirements.tools[]' "$METADATA_FILE" | while read -r tool; do
        tool_name=$(echo "$tool" | jq -r '.name')
        validation=$(echo "$tool" | jq -r '.validation')
        
        if eval "$validation" &> /dev/null; then
            echo -e "${GREEN}✓${NC} $tool_name"
        else
            echo -e "${RED}✗${NC} $tool_name"
            install_url=$(echo "$tool" | jq -r '.installUrl // empty')
            if [ -n "$install_url" ]; then
                echo "  Install: $install_url"
            fi
            ALL_PASSED=false
        fi
    done
    echo ""
fi

# Check environment variables
if jq -e '.requirements.environment' "$METADATA_FILE" &> /dev/null; then
    echo -e "${BLUE}Checking environment variables...${NC}"
    
    jq -r '.requirements.environment | keys[]' "$METADATA_FILE" | while read -r var_name; do
        required=$(jq -r ".requirements.environment.\"$var_name\".required" "$METADATA_FILE")
        secret=$(jq -r ".requirements.environment.\"$var_name\".secret // false" "$METADATA_FILE")
        
        if ! check_env_var "$var_name" "$required" "$secret"; then
            ALL_PASSED=false
        fi
    done
    echo ""
fi

# Check Python packages
if jq -e '.requirements.python_packages' "$METADATA_FILE" &> /dev/null; then
    echo -e "${BLUE}Checking Python packages...${NC}"
    
    jq -r '.requirements.python_packages[]' "$METADATA_FILE" | while read -r package; do
        package_name=$(echo "$package" | cut -d'>' -f1 | cut -d'=' -f1)
        
        if python -c "import ${package_name//-/_}" &> /dev/null; then
            echo -e "${GREEN}✓${NC} $package"
        else
            echo -e "${RED}✗${NC} $package"
            echo "  Install: pip install $package"
            ALL_PASSED=false
        fi
    done
    echo ""
fi

# Final result
if [ "$ALL_PASSED" = true ]; then
    echo -e "${GREEN}✅ All requirements met! You're ready to start this chapter.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some requirements are not met. Please fix the issues above.${NC}"
    echo -e "\n${YELLOW}💡 Tips:${NC}"
    echo "  - Set environment variables in Codespaces Secrets or .env file"
    echo "  - Run setup scripts in the workshop directory"
    echo "  - Check the workshop README for detailed setup instructions"
    exit 1
fi
