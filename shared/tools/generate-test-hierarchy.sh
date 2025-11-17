#!/bin/bash

# Generate deep test hierarchy for multi-level inheritance testing
# Creates test workshops with multi-level module hierarchies

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
WORKSHOPS_DIR="$REPO_ROOT/workshops"

echo "=========================================================================="
echo "🧪 Test Hierarchy Generator"
echo "=========================================================================="
echo ""
echo "This script creates test workshops with deep module hierarchies"
echo "to test multi-level inheritance features."
echo ""

# Create test workshops
create_test_workshop() {
    local workshop_id=$1
    local workshop_dir="$WORKSHOPS_DIR/$workshop_id"
    
    mkdir -p "$workshop_dir"
    
    cat > "$workshop_dir/workshop.yaml" << EOF
id: $workshop_id
title: "Test Workshop - $workshop_id"
description: "Test workshop for multi-level inheritance testing"
level: beginner
duration: 60
prerequisites: []
outcomes:
  - Test multi-level module hierarchy
  - Test circular dependency prevention
  - Test drill-down navigation
tags:
  - test
  - hierarchy
  - multi-level
EOF
    
    echo "✅ Created workshop: $workshop_id"
}

# Create test module
create_test_module() {
    local workshop_id=$1
    local module_id=$2
    local parent_path=$3
    local level=$4
    
    local module_dir="$WORKSHOPS_DIR/$workshop_id/$module_id"
    mkdir -p "$module_dir"
    
    # Create module.yaml with or without parent
    cat > "$module_dir/module.yaml" << EOF
id: $module_id
title: "$module_id (Level $level)"
description: "Test module at level $level in hierarchy"
duration: 15
EOF
    
    # Add inheritance section if has parent
    if [ -n "$parent_path" ]; then
        cat >> "$module_dir/module.yaml" << EOF
inheritance:
  parentPath: "$parent_path"
  inheritedAt: "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
EOF
    fi
    
    # Create README
    cat > "$module_dir/README.md" << EOF
# $module_id

**Level:** $level  
**Workshop:** $workshop_id

## Description

This is a test module for multi-level inheritance testing.

EOF
    
    if [ -n "$parent_path" ]; then
        echo "**Parent:** \`$parent_path\`" >> "$module_dir/README.md"
    else
        echo "**Type:** Top-level module (no parent)" >> "$module_dir/README.md"
    fi
    
    cat >> "$module_dir/README.md" << EOF

## Purpose

This module is part of the test hierarchy used to:
- Test drill-down navigation
- Test breadcrumb navigation
- Test circular dependency prevention
- Test depth calculations
- Test parent/child relationships

## Testing

This module should appear in the Workshop Builder GUI with:
- Correct level indicator
- Proper parent-child relationships
- Accurate child counts
- Working drill-down navigation
EOF
    
    echo "  ✅ Created module: $module_id (level $level)"
}

echo "Creating Test Hierarchy..."
echo ""

# ============================================================================
# Test Workshop 1: Deep Linear Hierarchy (4 levels)
# ============================================================================
echo "📦 Test Workshop 1: Deep Linear Chain"
create_test_workshop "test-deep-linear"

# Level 0 (top-level)
create_test_module "test-deep-linear" "test-module-root" "" 0

# Level 1
create_test_module "test-deep-linear" "test-module-level-1" "workshops/test-deep-linear/test-module-root" 1

# Level 2
create_test_module "test-deep-linear" "test-module-level-2" "workshops/test-deep-linear/test-module-level-1" 2

# Level 3
create_test_module "test-deep-linear" "test-module-level-3" "workshops/test-deep-linear/test-module-level-2" 3

echo ""

# ============================================================================
# Test Workshop 2: Wide Tree (1 parent, multiple children)
# ============================================================================
echo "📦 Test Workshop 2: Wide Tree Structure"
create_test_workshop "test-wide-tree"

# Level 0 (top-level parent)
create_test_module "test-wide-tree" "test-parent" "" 0

# Level 1 (multiple children)
create_test_module "test-wide-tree" "test-child-a" "workshops/test-wide-tree/test-parent" 1
create_test_module "test-wide-tree" "test-child-b" "workshops/test-wide-tree/test-parent" 1
create_test_module "test-wide-tree" "test-child-c" "workshops/test-wide-tree/test-parent" 1
create_test_module "test-wide-tree" "test-child-d" "workshops/test-wide-tree/test-parent" 1

echo ""

# ============================================================================
# Test Workshop 3: Complex Multi-Level Tree
# ============================================================================
echo "📦 Test Workshop 3: Complex Multi-Level Tree"
create_test_workshop "test-complex-tree"

# Level 0 (top-level)
create_test_module "test-complex-tree" "test-root-alpha" "" 0
create_test_module "test-complex-tree" "test-root-beta" "" 0

# Level 1 under alpha
create_test_module "test-complex-tree" "test-alpha-child-1" "workshops/test-complex-tree/test-root-alpha" 1
create_test_module "test-complex-tree" "test-alpha-child-2" "workshops/test-complex-tree/test-root-alpha" 1

# Level 1 under beta
create_test_module "test-complex-tree" "test-beta-child-1" "workshops/test-complex-tree/test-root-beta" 1

# Level 2 under alpha-child-1
create_test_module "test-complex-tree" "test-alpha-grandchild-1" "workshops/test-complex-tree/test-alpha-child-1" 2
create_test_module "test-complex-tree" "test-alpha-grandchild-2" "workshops/test-complex-tree/test-alpha-child-1" 2

# Level 2 under alpha-child-2
create_test_module "test-complex-tree" "test-alpha-grandchild-3" "workshops/test-complex-tree/test-alpha-child-2" 2

# Level 3 under grandchild-1
create_test_module "test-complex-tree" "test-alpha-greatgrand-1" "workshops/test-complex-tree/test-alpha-grandchild-1" 3

echo ""

# ============================================================================
# Test Workshop 4: Multiple Top-Level Nodes
# ============================================================================
echo "📦 Test Workshop 4: Multiple Top-Level Entry Points"
create_test_workshop "test-multi-roots"

# Multiple top-level modules
create_test_module "test-multi-roots" "test-entry-point-1" "" 0
create_test_module "test-multi-roots" "test-entry-point-2" "" 0
create_test_module "test-multi-roots" "test-entry-point-3" "" 0

# Children under first entry point
create_test_module "test-multi-roots" "test-ep1-child-a" "workshops/test-multi-roots/test-entry-point-1" 1
create_test_module "test-multi-roots" "test-ep1-child-b" "workshops/test-multi-roots/test-entry-point-1" 1

# Children under second entry point
create_test_module "test-multi-roots" "test-ep2-child-a" "workshops/test-multi-roots/test-entry-point-2" 1

echo ""

# ============================================================================
# Summary
# ============================================================================
echo "=========================================================================="
echo "✅ Test Hierarchy Generated Successfully!"
echo "=========================================================================="
echo ""
echo "📊 Summary:"
echo "   • 4 test workshops created"
echo "   • 24 test modules created"
echo "   • Hierarchy levels: 0-3 (4 levels total)"
echo ""
echo "📚 Test Workshops:"
echo "   1. test-deep-linear     - 4 modules in linear chain (levels 0-3)"
echo "   2. test-wide-tree       - 5 modules (1 parent + 4 children)"
echo "   3. test-complex-tree    - 9 modules (complex multi-level tree)"
echo "   4. test-multi-roots     - 6 modules (3 top-level + children)"
echo ""
echo "🧪 Testing Scenarios:"
echo "   ✓ Deep linear chains (test-deep-linear)"
echo "   ✓ Wide trees with many children (test-wide-tree)"
echo "   ✓ Complex multi-level hierarchies (test-complex-tree)"
echo "   ✓ Multiple entry points (test-multi-roots)"
echo "   ✓ Grandchildren and great-grandchildren"
echo "   ✓ Different tree structures"
echo ""
echo "🎯 Next Steps:"
echo "   1. Restart Workshop Builder: ./start-workshop-builder.sh"
echo "   2. Open GUI: http://localhost:3000"
echo "   3. Go to Module Manager > Browse Modules"
echo "   4. Enable 'Show Test Modules' checkbox"
echo "   5. Navigate through test hierarchies"
echo ""
echo "🧹 Cleanup:"
echo "   To remove test data later:"
echo "   rm -rf workshops/test-*"
echo ""
echo "=========================================================================="
