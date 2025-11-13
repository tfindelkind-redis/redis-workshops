#!/usr/bin/env python3
"""
Generate Module Data for GitHub Pages
Scans shared/modules and workshops/*/modules to create module-data.js
"""

import os
import sys
import json
import yaml
from pathlib import Path
from datetime import datetime

REPO_ROOT = Path(__file__).parent.parent.parent
SHARED_MODULES = REPO_ROOT / 'shared' / 'modules'
SHARED_CHAPTERS = REPO_ROOT / 'shared' / 'chapters'
WORKSHOPS_DIR = REPO_ROOT / 'workshops'
OUTPUT_FILE = REPO_ROOT / 'docs' / 'module-data.js'

def find_modules():
    """Find all module directories"""
    modules = []
    
    # Scan canonical modules
    if SHARED_MODULES.exists():
        for module_dir in SHARED_MODULES.iterdir():
            if module_dir.is_dir():
                module_yaml = module_dir / 'module.yaml'
                if module_yaml.exists():
                    modules.append({
                        'type': 'canonical',
                        'path': str(module_dir.relative_to(REPO_ROOT)),
                        'full_path': module_dir
                    })
    
    # Scan workshop-specific modules
    if WORKSHOPS_DIR.exists():
        for workshop_dir in WORKSHOPS_DIR.iterdir():
            if not workshop_dir.is_dir():
                continue
                
            modules_dir = workshop_dir / 'modules'
            if modules_dir.exists():
                for module_dir in modules_dir.iterdir():
                    if module_dir.is_dir():
                        module_yaml = module_dir / 'module.yaml'
                        lineage_file = module_dir / '.lineage'
                        
                        if module_yaml.exists() and lineage_file.exists():
                            modules.append({
                                'type': 'customized',
                                'workshop': workshop_dir.name,
                                'path': str(module_dir.relative_to(REPO_ROOT)),
                                'full_path': module_dir
                            })
    
    return modules

def find_chapters():
    """Find all legacy chapter directories"""
    chapters = []
    
    # Scan shared chapters
    if SHARED_CHAPTERS.exists():
        for chapter_dir in SHARED_CHAPTERS.iterdir():
            if chapter_dir.is_dir():
                readme_file = chapter_dir / 'README.md'
                if readme_file.exists():
                    chapters.append({
                        'type': 'chapter',
                        'style': 'shared',
                        'path': str(chapter_dir.relative_to(REPO_ROOT)),
                        'full_path': chapter_dir,
                        'legacy': True
                    })
    
    # Scan workshop-specific chapters
    if WORKSHOPS_DIR.exists():
        for workshop_dir in WORKSHOPS_DIR.iterdir():
            if not workshop_dir.is_dir():
                continue
                
            chapters_dir = workshop_dir / 'chapters'
            if chapters_dir.exists():
                for chapter_dir in chapters_dir.iterdir():
                    if chapter_dir.is_dir():
                        readme_file = chapter_dir / 'README.md'
                        if readme_file.exists():
                            chapters.append({
                                'type': 'chapter',
                                'style': 'workshop-specific',
                                'workshop': workshop_dir.name,
                                'path': str(chapter_dir.relative_to(REPO_ROOT)),
                                'full_path': chapter_dir,
                                'legacy': True
                            })
    
    return chapters

def parse_chapter(chapter_meta):
    """Parse chapter data from README.md frontmatter"""
    readme_path = chapter_meta['full_path'] / 'README.md'
    
    # Read README.md and extract frontmatter
    with open(readme_path, 'r') as f:
        content = f.read()
    
    # Default values
    result = {
        'id': chapter_meta['full_path'].name,
        'name': chapter_meta['full_path'].name.replace('-', ' ').title(),
        'description': 'Legacy chapter',
        'type': 'chapter',
        'style': chapter_meta['style'],
        'path': chapter_meta['path'],
        'duration': 30,
        'difficulty': 'beginner',
        'tags': [],
        'legacy': True,
        'hasVersioning': False,
        'canMigrate': chapter_meta['style'] == 'shared'
    }
    
    # Try to extract metadata from README
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if line.startswith('# '):
            result['name'] = line[2:].strip()
        elif '**Estimated Time:**' in line or '**Duration:**' in line:
            try:
                duration_str = line.split('**')[2].strip()
                duration_parts = duration_str.split()
                if duration_parts:
                    result['duration'] = int(duration_parts[0])
            except:
                pass
        elif '**Difficulty:**' in line:
            try:
                difficulty = line.split('**')[2].strip().lower()
                result['difficulty'] = difficulty
            except:
                pass
        elif line.startswith('##') and 'Overview' in line:
            # Get description from next paragraph
            for j in range(i+1, min(i+5, len(lines))):
                if lines[j].strip() and not lines[j].startswith('#'):
                    result['description'] = lines[j].strip()
                    break
    
    # Add workshop info for workshop-specific chapters
    if chapter_meta['style'] == 'workshop-specific':
        result['workshop'] = chapter_meta['workshop']
        result['workshopSpecific'] = True
    
    return result

def find_modules():
    """Find all module directories"""
    modules = []
    
    # Scan canonical modules
    if SHARED_MODULES.exists():
        for module_dir in SHARED_MODULES.iterdir():
            if module_dir.is_dir():
                module_yaml = module_dir / 'module.yaml'
                if module_yaml.exists():
                    modules.append({
                        'type': 'canonical',
                        'path': str(module_dir.relative_to(REPO_ROOT)),
                        'full_path': module_dir
                    })
    
    # Scan workshop-specific modules
    if WORKSHOPS_DIR.exists():
        for workshop_dir in WORKSHOPS_DIR.iterdir():
            if not workshop_dir.is_dir():
                continue
                
            modules_dir = workshop_dir / 'modules'
            if modules_dir.exists():
                for module_dir in modules_dir.iterdir():
                    if module_dir.is_dir():
                        module_yaml = module_dir / 'module.yaml'
                        lineage_file = module_dir / '.lineage'
                        
                        if module_yaml.exists() and lineage_file.exists():
                            modules.append({
                                'type': 'customized',
                                'workshop': workshop_dir.name,
                                'path': str(module_dir.relative_to(REPO_ROOT)),
                                'full_path': module_dir
                            })
    
    return modules

def parse_module(module_meta):
    """Parse module data from YAML files"""
    module_yaml_path = module_meta['full_path'] / 'module.yaml'
    with open(module_yaml_path, 'r') as f:
        module_data = yaml.safe_load(f)
    
    result = {
        'id': module_data.get('id'),
        'name': module_data.get('name'),
        'description': module_data.get('description', ''),
        'type': 'module',
        'style': module_meta['type'],
        'path': module_meta['path'],
        'duration': module_data.get('metadata', {}).get('duration', 60),
        'difficulty': module_data.get('metadata', {}).get('difficulty', 'beginner'),
        'tags': module_data.get('metadata', {}).get('tags', []),
        'sections': len(module_data.get('sections', [])),
        'exercises': len(module_data.get('exercises', [])),
        'lastUpdated': module_data.get('last_updated', datetime.now().strftime('%Y-%m-%d')),
        'hasVersioning': True,
        'legacy': False
    }
    
    # Add lineage info for canonical modules
    if module_meta['type'] == 'canonical':
        result['children'] = module_data.get('lineage', {}).get('children', [])
    
    # Add parent info for customized modules
    if module_meta['type'] == 'customized':
        lineage_path = module_meta['full_path'] / '.lineage'
        with open(lineage_path, 'r') as f:
            lineage_data = yaml.safe_load(f)
        
        result['parent'] = lineage_data.get('parent_module')
        result['workshop'] = module_meta['workshop']
        
        # Count customizations
        files = lineage_data.get('files', {})
        result['customizations'] = {
            'files_customized': sum(1 for f in files.values() if f.get('status') == 'customized'),
            'files_inherited': sum(1 for f in files.values() if f.get('status') == 'inherited'),
            'files_new': sum(1 for f in files.values() if f.get('status') == 'new')
        }
    
    return result

def parse_module(module_meta):
    """Parse module data from YAML files"""
    module_yaml_path = module_meta['full_path'] / 'module.yaml'
    with open(module_yaml_path, 'r') as f:
        module_data = yaml.safe_load(f)
    
    result = {
        'id': module_data.get('id'),
        'name': module_data.get('name'),
        'description': module_data.get('description', ''),
        'type': 'module',
        'style': module_meta['type'],
        'path': module_meta['path'],
        'duration': module_data.get('metadata', {}).get('duration', 60),
        'difficulty': module_data.get('metadata', {}).get('difficulty', 'beginner'),
        'tags': module_data.get('metadata', {}).get('tags', []),
        'sections': len(module_data.get('sections', [])),
        'exercises': len(module_data.get('exercises', [])),
        'lastUpdated': module_data.get('last_updated', datetime.now().strftime('%Y-%m-%d')),
        'hasVersioning': True,
        'legacy': False
    }
    
    # Add lineage info for canonical modules
    if module_meta['type'] == 'canonical':
        result['children'] = module_data.get('lineage', {}).get('children', [])
    
    # Add parent info for customized modules
    if module_meta['type'] == 'customized':
        lineage_path = module_meta['full_path'] / '.lineage'
        with open(lineage_path, 'r') as f:
            lineage_data = yaml.safe_load(f)
        
        result['parent'] = lineage_data.get('parent_module')
        result['workshop'] = module_meta['workshop']
        
        # Count customizations
        files = lineage_data.get('files', {})
        result['customizations'] = {
            'files_customized': sum(1 for f in files.values() if f.get('status') == 'customized'),
            'files_inherited': sum(1 for f in files.values() if f.get('status') == 'inherited'),
            'files_new': sum(1 for f in files.values() if f.get('status') == 'new')
        }
    
    return result

def find_descendants(parent_id, all_modules):
    """Find descendants recursively"""
    children = [m for m in all_modules if m.get('parent') == parent_id]
    
    return [
        {
            **child,
            'children': find_descendants(child['id'], all_modules)
        }
        for child in children
    ]

def build_version_tree(all_units):
    """Build version tree structure (only for modules, not chapters)"""
    trees = []
    
    # Only work with modules that have versioning
    modules = [u for u in all_units if u.get('type') == 'module']
    
    # Find canonical modules (roots)
    canonical_modules = [m for m in modules if m['style'] == 'canonical']
    
    for canonical in canonical_modules:
        tree = {
            **canonical,
            'versions': []
        }
        
        # Find direct children
        children = [m for m in modules if m.get('parent') == canonical['id']]
        
        for child in children:
            tree['versions'].append({
                **child,
                'children': find_descendants(child['id'], modules)
            })
        
        trees.append(tree)
    
    return trees

def generate_javascript(learning_units, version_trees):
    """Generate JavaScript file content"""
    timestamp = datetime.now().isoformat()
    
    js_content = f'''// Learning Units Data for GitHub Pages (Modules + Chapters)
// This file is auto-generated by shared/tools/generate-module-data.py
// Generated on: {timestamp}

const learningUnitsData = {json.dumps(learning_units, indent=4)};

const moduleVersionTrees = {json.dumps(version_trees, indent=4)};

// Helper functions
function findUnitById(id) {{
    return learningUnitsData.find(u => u.id === id);
}}

function findCanonicalModules() {{
    return learningUnitsData.filter(u => u.type === 'module' && u.style === 'canonical');
}}

function findCustomizedModules() {{
    return learningUnitsData.filter(u => u.type === 'module' && u.style === 'customized');
}}

function findAllModules() {{
    return learningUnitsData.filter(u => u.type === 'module');
}}

function findLegacyChapters() {{
    return learningUnitsData.filter(u => u.type === 'chapter' && u.legacy === true);
}}

function findSharedUnits() {{
    return learningUnitsData.filter(u => u.style === 'shared' || u.style === 'canonical');
}}

function findWorkshopSpecificUnits() {{
    return learningUnitsData.filter(u => 
        u.style === 'customized' || u.style === 'workshop-specific'
    );
}}

function findUnitsByWorkshop(workshopName) {{
    return learningUnitsData.filter(u => u.workshop === workshopName);
}}

function getVersionTree(moduleNameOrId) {{
    return moduleVersionTrees.find(tree => 
        tree.id === moduleNameOrId || 
        tree.name.toLowerCase().includes(moduleNameOrId.toLowerCase())
    );
}}

function searchLearningUnits(query) {{
    const lowerQuery = query.toLowerCase();
    return learningUnitsData.filter(u =>
        u.name.toLowerCase().includes(lowerQuery) ||
        u.description.toLowerCase().includes(lowerQuery) ||
        (u.tags && u.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
}}

function filterByDifficulty(difficulty) {{
    return learningUnitsData.filter(u => u.difficulty === difficulty);
}}

function filterByType(type) {{
    if (type === 'all') return learningUnitsData;
    if (type === 'modules') return findAllModules();
    if (type === 'chapters') return findLegacyChapters();
    if (type === 'shared') return findSharedUnits();
    if (type === 'customized') return findWorkshopSpecificUnits();
    return learningUnitsData;
}}
'''
    
    return js_content

def main():
    """Main function"""
    print('🔍 Scanning for learning units...')
    
    # Find modules
    module_metas = find_modules()
    print(f'   Found {len(module_metas)} modules')
    
    # Find chapters
    chapter_metas = find_chapters()
    print(f'   Found {len(chapter_metas)} legacy chapters')
    
    print('📊 Parsing data...')
    modules = [parse_module(meta) for meta in module_metas]
    chapters = [parse_chapter(meta) for meta in chapter_metas]
    
    # Combine all learning units
    all_units = modules + chapters
    
    canonical_count = sum(1 for m in modules if m['style'] == 'canonical')
    customized_count = sum(1 for m in modules if m['style'] == 'customized')
    shared_chapters = sum(1 for c in chapters if c['style'] == 'shared')
    workshop_chapters = sum(1 for c in chapters if c['style'] == 'workshop-specific')
    
    print(f'   Modules: {len(modules)} (Canonical: {canonical_count}, Customized: {customized_count})')
    print(f'   Chapters: {len(chapters)} (Shared: {shared_chapters}, Workshop-specific: {workshop_chapters})')
    
    print('🌳 Building version trees...')
    version_trees = build_version_tree(all_units)
    print(f'   Created {len(version_trees)} version trees')
    
    print('📝 Generating JavaScript...')
    js_content = generate_javascript(all_units, version_trees)
    
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w') as f:
        f.write(js_content)
    print(f'✅ Generated {OUTPUT_FILE}')
    
    # Print summary
    print('\n📋 Summary:')
    print(f'   Total learning units: {len(all_units)}')
    print(f'   ├─ Modules: {len(modules)}')
    print(f'   │  ├─ Canonical: {canonical_count}')
    print(f'   │  └─ Customized: {customized_count}')
    print(f'   └─ Legacy Chapters: {len(chapters)}')
    print(f'      ├─ Shared: {shared_chapters}')
    print(f'      └─ Workshop-specific: {workshop_chapters}')
    print(f'   Version trees: {len(version_trees)}')
    print('\n✨ Learning units data ready for GitHub Pages!')

if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(f'❌ Error: {error}', file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
