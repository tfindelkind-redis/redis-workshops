#!/bin/bash

##############################################################################
# Repository Cleanup Script
# Safely removes obsolete documentation and completion files
# Creates backup archive before deletion
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
NC='\033[0m' # No Color

print_header() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_info() { echo -e "${BLUE}ℹ${NC} $1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }

# Files to delete - organized by category
declare -a PHASE_COMPLETION_DOCS=(
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
)

declare -a PLANNING_DESIGN_DOCS=(
    "NEXT_STEPS.md"
    "MODULAR_DESIGN.md"
    "UNIFIED_MODULES_DESIGN.md"
    "MODULE_INHERITANCE.md"
    "MODULE_INHERITANCE_VISUAL.md"
    "NAVIGATION_DESIGN.md"
    "NAVIGATION_IMPLEMENTATION.md"
    "GUI_FILESYSTEM_INTEGRATION_PLAN.md"
    "PROOF_OF_CONCEPT_SUMMARY.md"
)

declare -a INTERIM_DOCS=(
    "USER_STORIES_COMPLETE.md"
    "USER_STORIES_SUMMARY.md"
    "GITHUB_PAGES_IMPLEMENTATION.md"
    "GITHUB_PAGES_MIGRATION.md"
    "GITHUB_PAGES_PREVIEW.md"
    "WORKFLOW_VISUAL_GUIDE.md"
    "FRONTMATTER-FEATURE.md"
)

declare -a DUPLICATE_DOCS=(
    "QUICK_START.md"
    "QUICK_REFERENCE.md"
    "WORKSHOP_CREATOR_GUIDE.md"
    "BUILD_COMMAND.md"
    "DEPLOYMENT_GUIDE.md"
)

declare -a OBSOLETE_TOOLS=(
    "shared/tools/sync-workshop-config.sh"
    "shared/tools/sync-workshop-config-v2.sh"
    "shared/tools/yaml-to-config.py"
    "shared/tools/generate-chapter-metadata.py"
    "shared/tools/list-chapters.sh"
    "shared/tools/list-workshops.sh"
)

# Function to check if file exists
file_exists() {
    local file="$1"
    if [ -f "${SCRIPT_DIR}/${file}" ]; then
        return 0
    else
        return 1
    fi
}

# Function to get file size
get_file_size() {
    local file="$1"
    if [ -f "${SCRIPT_DIR}/${file}" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            stat -f%z "${SCRIPT_DIR}/${file}"
        else
            # Linux
            stat -c%s "${SCRIPT_DIR}/${file}"
        fi
    else
        echo "0"
    fi
}

# Function to format bytes
format_bytes() {
    local bytes=$1
    if [ $bytes -lt 1024 ]; then
        echo "${bytes}B"
    elif [ $bytes -lt 1048576 ]; then
        echo "$(( bytes / 1024 ))KB"
    else
        echo "$(( bytes / 1048576 ))MB"
    fi
}

# Function to display files in category
show_category() {
    local category_name="$1"
    shift
    local files=("$@")
    local found=0
    local total_size=0
    
    echo ""
    echo -e "${YELLOW}📁 ${category_name}${NC}"
    
    for file in "${files[@]}"; do
        if file_exists "$file"; then
            local fsize
            fsize=$(get_file_size "$file")
            total_size=$((total_size + fsize))
            printf "   %-50s %8s\n" "$file" "$(format_bytes $fsize)"
            found=$((found + 1))
        fi
    done
    
    if [ $found -eq 0 ]; then
        echo "   (no files found)"
    else
        echo "   ─────────────────────────────────────────────────────────"
        echo "   Total: $found files, $(format_bytes $total_size)"
    fi
}

# Function to create backup
create_backup() {
    local files_to_backup=("$@")
    
    print_header "📦 Creating Backup"
    
    mkdir -p "$BACKUP_DIR"
    print_info "Backup location: $BACKUP_DIR"
    
    local backed_up=0
    for file in "${files_to_backup[@]}"; do
        if file_exists "$file"; then
            # Create subdirectories in backup if needed
            local dir=$(dirname "$file")
            mkdir -p "${BACKUP_DIR}/${dir}"
            
            cp "${SCRIPT_DIR}/${file}" "${BACKUP_DIR}/${file}"
            backed_up=$((backed_up + 1))
        fi
    done
    
    print_success "Backed up $backed_up files"
    echo ""
}

# Function to delete files
delete_files() {
    local files_to_delete=("$@")
    
    print_header "🗑️  Deleting Files"
    
    local deleted=0
    for file in "${files_to_delete[@]}"; do
        if file_exists "$file"; then
            rm "${SCRIPT_DIR}/${file}"
            print_success "Deleted: $file"
            deleted=$((deleted + 1))
        fi
    done
    
    echo ""
    print_success "Deleted $deleted files"
    echo ""
}

# Main execution
main() {
    clear
    print_header "🧹 Redis Workshops - Repository Cleanup"
    
    echo ""
    print_info "This script will safely remove obsolete documentation files."
    print_info "All files will be backed up before deletion."
    echo ""
    
    # Show what will be deleted
    print_header "📋 Files to be Removed"
    
    local total_size=0
    
    show_category "Phase/Completion Documents" "${PHASE_COMPLETION_DOCS[@]}"
    
    show_category "Planning/Design Documents" "${PLANNING_DESIGN_DOCS[@]}"
    
    show_category "Interim Documentation" "${INTERIM_DOCS[@]}"
    
    show_category "Duplicate/Redundant Documentation" "${DUPLICATE_DOCS[@]}"
    
    show_category "Potentially Obsolete Tools" "${OBSOLETE_TOOLS[@]}"
    
    # Calculate total manually
    for file in "${PHASE_COMPLETION_DOCS[@]}" "${PLANNING_DESIGN_DOCS[@]}" "${INTERIM_DOCS[@]}" "${DUPLICATE_DOCS[@]}" "${OBSOLETE_TOOLS[@]}"; do
        if file_exists "$file"; then
            local fsize=$(get_file_size "$file")
            total_size=$((total_size + fsize))
        fi
    done
    
    echo ""
    print_header "📊 Summary"
    echo -e "Total files to remove: ${GREEN}$(( ${#PHASE_COMPLETION_DOCS[@]} + ${#PLANNING_DESIGN_DOCS[@]} + ${#INTERIM_DOCS[@]} + ${#DUPLICATE_DOCS[@]} + ${#OBSOLETE_TOOLS[@]} ))${NC}"
    echo -e "Total space to reclaim: ${GREEN}$(format_bytes $total_size)${NC}"
    echo ""
    
    # Confirmation
    print_warning "This will:"
    echo "  1. Create a backup in: ${BACKUP_DIR}"
    echo "  2. Delete all listed files from the repository"
    echo "  3. Allow you to restore files if needed"
    echo ""
    
    read -p "$(echo -e ${YELLOW}Continue with cleanup? [y/N]:${NC} )" -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleanup cancelled."
        exit 0
    fi
    
    # Combine all files to process
    local all_files=(
        "${PHASE_COMPLETION_DOCS[@]}"
        "${PLANNING_DESIGN_DOCS[@]}"
        "${INTERIM_DOCS[@]}"
        "${DUPLICATE_DOCS[@]}"
        "${OBSOLETE_TOOLS[@]}"
    )
    
    # Create backup
    create_backup "${all_files[@]}"
    
    # Delete files
    delete_files "${all_files[@]}"
    
    # Success message
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
    
    # Git status
    print_header "📝 Next Steps"
    echo ""
    print_info "Review the changes with:"
    echo "  git status"
    echo ""
    print_info "If everything looks good, commit the cleanup:"
    echo "  git add -A"
    echo "  git commit -m \"Clean up obsolete documentation and completion files\""
    echo "  git push origin main"
    echo ""
}

# Run main function
main
