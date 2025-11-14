#!/usr/bin/env python3
"""
Generate workshop data for GitHub Pages
Scans workshops/ and docs/workshops/ to create data.js
"""

import os
import json
import yaml
from pathlib import Path
from datetime import datetime

def find_repo_root():
    """Find repository root"""
    current = Path.cwd()
    while current != current.parent:
        if (current / '.git').exists():
            return current
        current = current.parent
    raise Exception("Not in a git repository")

def scan_workshops(repo_root):
    """Scan workshops directory for workshop configurations"""
    workshops_dir = repo_root / 'workshops'
    workshops = []
    
    if not workshops_dir.exists():
        return workshops
    
    for workshop_dir in sorted(workshops_dir.iterdir()):
        if not workshop_dir.is_dir() or workshop_dir.name.startswith('.'):
            continue
        
        config_file = workshop_dir / 'workshop.config.json'
        if not config_file.exists():
            continue
        
        try:
            with open(config_file) as f:
                config = json.load(f)
            
            # Count modules
            modules = config.get('modules', [])
            chapters = config.get('chapters', [])
            total_count = len(modules) + len(chapters)
            
            workshop_data = {
                'id': config.get('workshopId', workshop_dir.name),
                'title': config.get('title', workshop_dir.name),
                'description': config.get('description', 'No description available'),
                'difficulty': config.get('difficulty', 'intermediate'),
                'duration': config.get('duration', 'N/A'),
                'modulesCount': total_count,
                'tags': config.get('tags', []),
                'path': f'workshops/{workshop_dir.name}',
                'lastUpdated': config.get('lastUpdated', ''),
                'hasBuiltVersion': False,
                'builtPath': None
            }
            
            workshops.append(workshop_data)
        except Exception as e:
            print(f"   ⚠️  Error processing {workshop_dir.name}: {e}")
    
    return workshops

def scan_built_workshops(repo_root, workshops):
    """Check for built workshop versions in docs/workshops/"""
    docs_workshops_dir = repo_root / 'docs' / 'workshops'
    
    if not docs_workshops_dir.exists():
        return
    
    for built_dir in sorted(docs_workshops_dir.iterdir()):
        if not built_dir.is_dir() or built_dir.name.startswith('.'):
            continue
        
        # Check if README.md exists
        readme = built_dir / 'README.md'
        if not readme.exists():
            continue
        
        # Find matching workshop in source
        base_name = built_dir.name.replace('-phase3', '').replace('-test', '')
        
        for workshop in workshops:
            if workshop['id'] == base_name or workshop['id'] in built_dir.name:
                workshop['hasBuiltVersion'] = True
                workshop['builtPath'] = f'workshops/{built_dir.name}'
                print(f"   ✓ Found built version: {built_dir.name}")
                break
        else:
            # Add as standalone built workshop
            workshops.append({
                'id': built_dir.name,
                'title': built_dir.name.replace('-', ' ').title(),
                'description': 'Built workshop version',
                'difficulty': 'intermediate',
                'duration': 'N/A',
                'modulesCount': 0,
                'tags': ['built'],
                'path': f'docs/workshops/{built_dir.name}',
                'lastUpdated': '',
                'hasBuiltVersion': True,
                'builtPath': f'workshops/{built_dir.name}'
            })
            print(f"   + Added built workshop: {built_dir.name}")

def scan_chapters(repo_root):
    """Scan for legacy chapters"""
    chapters_dir = repo_root / 'shared' / 'chapters'
    chapters = []
    
    if not chapters_dir.exists():
        return chapters
    
    for chapter_dir in sorted(chapters_dir.iterdir()):
        if not chapter_dir.is_dir():
            continue
        
        metadata_file = chapter_dir / 'metadata.yaml'
        if not metadata_file.exists():
            continue
        
        try:
            with open(metadata_file) as f:
                metadata = yaml.safe_load(f)
            
            chapter_data = {
                'id': chapter_dir.name,
                'title': metadata.get('title', chapter_dir.name),
                'description': metadata.get('description', ''),
                'difficulty': metadata.get('difficulty', 'beginner'),
                'estimatedMinutes': metadata.get('estimatedMinutes', 0),
                'tags': metadata.get('tags', []),
                'path': f'shared/chapters/{chapter_dir.name}',
                'version': metadata.get('version', '1.0.0'),
                'workshopSpecific': metadata.get('workshopSpecific', False),
                'workshop': metadata.get('workshop', None)
            }
            
            chapters.append(chapter_data)
        except Exception as e:
            print(f"   ⚠️  Error processing chapter {chapter_dir.name}: {e}")
    
    return chapters

def generate_js_file(workshops, chapters, output_path):
    """Generate JavaScript file with data"""
    
    js_content = f"""// Workshop and Chapter Data
// This file is auto-generated. Do not edit manually.
// Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

const workshopsData = {json.dumps(workshops, indent=4)};

const chaptersData = {json.dumps(chapters, indent=4)};
"""
    
    with open(output_path, 'w') as f:
        f.write(js_content)

def main():
    print("🔍 Scanning for workshops and chapters...")
    
    repo_root = find_repo_root()
    
    # Scan workshops
    print("   Scanning workshops/...")
    workshops = scan_workshops(repo_root)
    print(f"   Found {len(workshops)} workshop(s)")
    
    # Check for built versions
    print("   Checking for built versions...")
    scan_built_workshops(repo_root, workshops)
    
    # Scan chapters
    print("   Scanning chapters...")
    chapters = scan_chapters(repo_root)
    print(f"   Found {len(chapters)} chapter(s)")
    
    # Generate output file
    output_file = repo_root / 'docs' / 'data.js'
    print(f"\n📝 Generating {output_file}...")
    generate_js_file(workshops, chapters, output_file)
    
    print(f"\n✅ Generated {output_file}")
    print(f"\n📋 Summary:")
    print(f"   Workshops: {len(workshops)}")
    built_count = sum(1 for w in workshops if w['hasBuiltVersion'])
    print(f"   ├─ With built versions: {built_count}")
    print(f"   └─ Source only: {len(workshops) - built_count}")
    print(f"   Chapters: {len(chapters)}")
    print("\n✨ Workshop data ready for GitHub Pages!")

if __name__ == '__main__':
    main()
