#!/bin/bash

##############################################################################
# Repository Cleanup Script - Simplified Version
# Safely removes obsolete documentation and completion files
##############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/.cleanup-backup-$(date +%Y%m%d-%H%M%S)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_info() { echo -e "${BLUE}ℹ${NC} $1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }

# List all files to delete
FILES_TO_DELETE=(
    # Phase/Completion Documents (11)
    "PHASE_1_COMPLETE.md"
    "PHASE_2_COMPLETE.md"
    "PHASE_3_COMPLETE.md"
    "PHASE_4_COMPLETE.md"
    "IMPLEMENTATION_COMPLETE.md"
    "FILESYSTEM_INTEGRATION_COMPLETE.md"
    "STEPS_1_5_COMPLETE.md"
    "GITHUB_PAGES_COMPLETE.md"
    "DOCKER_COMPLETE.md"
    "SETUP-COMPLETE.md"
    "END_TO_END_TEST_RESULTS.md"
    
    # Planning/Design Documents (9)
    "NEXT_STEPS.md"
    "MODULAR_DESIGN.md"
    "UNIFIED_MODULES_DESIGN.md"
    "MODULE_INHERITANCE.md"
    "MODULE_INHERITANCE_VISUAL.md"
    "NAVIGATION_DESIGN.md"
    "NAVIGATION_IMPLEMENTATION.md"
    "GUI_FILESYSTEM_INTEGRATION_PLAN.md"
    "PROOF_OF_CONCEPT_SUMMARY.md"
    
    # Interim Documentation (7)
    "USER_STORIES_COMPLETE.md"
    "USER_STORIES_SUMMARY.md"
    "GITHUB_PAGES_IMPLEMENTATION.md"
    "GITHUB_PAGES_MIGRATION.md"
    "GITHUB_PAGES_PREVIEW.md"
    "WORKFLOW_VISUAL_GUIDE.md"
    "FRONTMATTER-FEATURE.md"
    
    # Duplicate/Redundant Documentation (5)
    "QUICK_START.md"
    "QUICK_REFERENCE.md"
    "WORKSHOP_CREATOR_GUIDE.md"
    "BUILD_COMMAND.md"
    "DEPLOYMENT_GUIDE.md"
    
    # Obsolete Tools (6)
    "shared/tools/sync-workshop-config.sh"
    "shared/tools/sync-workshop-config-v2.sh"
    "shared/tools/yaml-to-config.py"
    "shared/tools/generate-chapter-metadata.py"
    "shared/tools/list-chapters.sh"
    "shared/tools/list-workshops.sh"
)

clear
print_header "🧹 Redis Workshops - Repository Cleanup"
echo ""
print_info "This script will safely remove obsolete documentation files."
print_info "All files will be backed up before deletion."
echo ""

# Show files
print_header "📋 Files to be Removed"
echo ""

existing_count=0
total_size=0

for file in "${FILES_TO_DELETE[@]}"; do
    if [ -f "${SCRIPT_DIR}/${file}" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            size=$(stat -f%z "${SCRIPT_DIR}/${file}")
        else
            size=$(stat -c%s "${SCRIPT_DIR}/${file}")
        fi
        
        total_size=$((total_size + size))
        existing_count=$((existing_count + 1))
        
        # Format size
        if [ $size -lt 1024 ]; then
            size_str="${size}B"
        elif [ $size -lt 1048576 ]; then
            size_str="$(( size / 1024 ))KB"
        else
            size_str="$(( size / 1048576 ))MB"
        fi
        
        printf "  ${GREEN}✓${NC} %-55s %8s\n" "$file" "$size_str"
    fi
done

# Format total size
if [ $total_size -lt 1024 ]; then
    total_size_str="${total_size}B"
elif [ $total_size -lt 1048576 ]; then
    total_size_str="$(( total_size / 1024 ))KB"
else
    total_size_str="$(( total_size / 1048576 ))MB"
fi

echo ""
print_header "📊 Summary"
echo -e "  Files found: ${GREEN}${existing_count}${NC} of ${#FILES_TO_DELETE[@]}"
echo -e "  Space to reclaim: ${GREEN}${total_size_str}${NC}"
echo ""

if [ $existing_count -eq 0 ]; then
    print_info "No files to delete. Repository already clean!"
    exit 0
fi

# Confirmation
print_warning "This will:"
echo "  1. Create backup in: ${BACKUP_DIR}"
echo "  2. Delete $existing_count files from the repository"
echo "  3. Allow you to restore files if needed"
echo ""

read -p "$(echo -e ${YELLOW}Continue with cleanup? [y/N]:${NC} )" -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Cleanup cancelled."
    exit 0
fi

# Create backup
echo ""
print_header "📦 Creating Backup"
mkdir -p "$BACKUP_DIR"
print_info "Backup location: $BACKUP_DIR"

backed_up=0
for file in "${FILES_TO_DELETE[@]}"; do
    if [ -f "${SCRIPT_DIR}/${file}" ]; then
        dir=$(dirname "$file")
        mkdir -p "${BACKUP_DIR}/${dir}"
        cp "${SCRIPT_DIR}/${file}" "${BACKUP_DIR}/${file}"
        backed_up=$((backed_up + 1))
    fi
done

print_success "Backed up $backed_up files"
echo ""

# Delete files
print_header "🗑️  Deleting Files"

deleted=0
for file in "${FILES_TO_DELETE[@]}"; do
    if [ -f "${SCRIPT_DIR}/${file}" ]; then
        rm "${SCRIPT_DIR}/${file}"
        print_success "Deleted: $file"
        deleted=$((deleted + 1))
    fi
done

echo ""
print_success "Deleted $deleted files"
echo ""

# Success
print_header "✅ Cleanup Complete!"
echo ""
print_success "Repository cleaned successfully!"
print_info "Backup saved to: ${BACKUP_DIR}"
echo ""
print_warning "To restore files if needed:"
echo "  cp -r ${BACKUP_DIR}/* ."
echo ""
print_info "To permanently remove backup (after verifying everything works):"
echo "  rm -rf ${BACKUP_DIR}"
echo ""

# Next steps
print_header "📝 Next Steps"
echo ""
print_info "Review the changes:"
echo "  git status"
echo ""
print_info "Commit the cleanup:"
echo "  git add -A"
echo "  git commit -m \"Clean up obsolete documentation and completion files\""
echo "  git push origin main"
echo ""
