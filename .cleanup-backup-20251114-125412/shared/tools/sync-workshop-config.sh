#!/usr/bin/env bash

##############################################################################
# sync-workshop-config.sh
# Auto-generates workshop.config.json from README.md frontmatter
##############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}ℹ${NC} $1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }

# Check arguments
if [ $# -eq 0 ]; then
    print_error "Usage: $0 <workshop-path>"
    print_info "Example: $0 workshops/my-workshop"
    exit 1
fi

WORKSHOP_PATH="$1"
WORKSHOP_PATH="${WORKSHOP_PATH%/}"

# Convert to absolute path
if [[ ! "$WORKSHOP_PATH" = /* ]]; then
    WORKSHOP_PATH="${REPO_ROOT}/${WORKSHOP_PATH}"
fi

# Validate
if [ ! -d "$WORKSHOP_PATH" ]; then
    print_error "Workshop directory not found: $WORKSHOP_PATH"
    exit 1
fi

README_FILE="${WORKSHOP_PATH}/README.md"
CONFIG_FILE="${WORKSHOP_PATH}/workshop.config.json"

if [ ! -f "$README_FILE" ]; then
    print_error "README.md not found in workshop directory"
    exit 1
fi

print_info "Extracting frontmatter from README.md..."

# Extract frontmatter between first pair of --- markers
FRONTMATTER=$(awk '/^---$/{if(++n==2) exit; next} n==1' "$README_FILE")

if [ -z "$FRONTMATTER" ]; then
    print_error "No frontmatter found in README.md"
    exit 1
fi

print_success "Frontmatter extracted"
print_info "Parsing YAML and generating JSON..."

# Create temp file
TEMP_YAML=$(mktemp)
echo "$FRONTMATTER" > "$TEMP_YAML"

# Convert YAML to JSON using Python script
CONFIG_JSON=$("${SCRIPT_DIR}/yaml-to-config.py" "$TEMP_YAML")
EXIT_CODE=$?

# Cleanup temp file
rm -f "$TEMP_YAML"

if [ $EXIT_CODE -ne 0 ]; then
    print_error "Failed to generate config"
    exit 1
fi

print_success "Config generated"

# Backup existing config
if [ -f "$CONFIG_FILE" ]; then
    cp "$CONFIG_FILE" "${CONFIG_FILE}.backup"
    print_warning "Backed up existing config to ${CONFIG_FILE}.backup"
fi

# Write config file
echo "$CONFIG_JSON" | jq '.' > "$CONFIG_FILE"

print_success "Generated: ${CONFIG_FILE}"

# Show summary
echo ""
print_info "Workshop Configuration Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Workshop ID: $(echo "$CONFIG_JSON" | jq -r '.workshopId')"
echo "  Title: $(echo "$CONFIG_JSON" | jq -r '.title')"
echo "  Version: $(echo "$CONFIG_JSON" | jq -r '.version')"
echo "  Difficulty: $(echo "$CONFIG_JSON" | jq -r '.difficulty')"
echo "  Chapters: $(echo "$CONFIG_JSON" | jq '.chapters | length')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

print_success "Workshop config synchronized successfully!"

exit 0
