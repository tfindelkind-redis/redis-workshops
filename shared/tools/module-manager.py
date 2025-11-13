#!/usr/bin/env python3
"""
Redis Workshop Module Manager
Handles module versioning, lineage tracking, and discovery
"""

import os
import sys
import yaml
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
import argparse

class ModuleManager:
    def __init__(self, repo_root: str = None):
        if repo_root:
            self.repo_root = Path(repo_root)
        else:
            # Find repo root (where .git directory is)
            current = Path.cwd()
            while current != current.parent:
                if (current / '.git').exists():
                    self.repo_root = current
                    break
                current = current.parent
            else:
                raise Exception("Not in a git repository")
        
        self.shared_modules = self.repo_root / 'shared' / 'modules'
        self.workshops_dir = self.repo_root / 'workshops'
        self.index_file = self.repo_root / '.workshop-index.yaml'
    
    def find_modules(self, query: str = "") -> List[Dict]:
        """Search for modules matching query"""
        modules = []
        
        # Search in shared modules
        if self.shared_modules.exists():
            for module_dir in self.shared_modules.iterdir():
                if module_dir.is_dir():
                    module_file = module_dir / 'module.yaml'
                    if module_file.exists():
                        with open(module_file) as f:
                            module_data = yaml.safe_load(f)
                        
                        # Check if matches query
                        if query.lower() in module_data.get('name', '').lower() or \
                           query.lower() in module_data.get('id', '').lower() or \
                           any(query.lower() in tag for tag in module_data.get('metadata', {}).get('tags', [])):
                            module_data['path'] = str(module_dir.relative_to(self.repo_root))
                            module_data['is_canonical'] = True
                            modules.append(module_data)
        
        # Search in workshop modules
        if self.workshops_dir.exists():
            for workshop_dir in self.workshops_dir.iterdir():
                if not workshop_dir.is_dir():
                    continue
                    
                modules_dir = workshop_dir / 'modules'
                if modules_dir.exists():
                    for module_dir in modules_dir.iterdir():
                        if module_dir.is_dir():
                            module_file = module_dir / 'module.yaml'
                            lineage_file = module_dir / '.lineage'
                            
                            if module_file.exists() and lineage_file.exists():
                                with open(module_file) as f:
                                    module_data = yaml.safe_load(f)
                                with open(lineage_file) as f:
                                    lineage_data = yaml.safe_load(f)
                                
                                # Check if matches query
                                if query.lower() in module_data.get('name', '').lower() or \
                                   query.lower() in module_data.get('id', '').lower():
                                    module_data['path'] = str(module_dir.relative_to(self.repo_root))
                                    module_data['is_canonical'] = False
                                    module_data['lineage'] = lineage_data
                                    modules.append(module_data)
        
        return modules
    
    def get_module_tree(self, module_name: str) -> Dict:
        """Get the version tree for a module"""
        modules = self.find_modules(module_name)
        
        # Build tree structure
        canonical = None
        versions = []
        
        for module in modules:
            if module.get('is_canonical'):
                canonical = module
            else:
                versions.append(module)
        
        if not canonical:
            return None
        
        # Organize versions by parent
        tree = {
            'canonical': canonical,
            'versions': self._build_tree(canonical['id'], versions)
        }
        
        return tree
    
    def _build_tree(self, parent_id: str, all_versions: List[Dict], depth: int = 1) -> List[Dict]:
        """Recursively build version tree"""
        children = []
        
        for version in all_versions:
            lineage = version.get('lineage', {})
            if lineage.get('parent_module') == parent_id:
                version['depth'] = depth
                version['children'] = self._build_tree(version['id'], all_versions, depth + 1)
                children.append(version)
        
        return children
    
    def display_search_results(self, modules: List[Dict]):
        """Display search results in a nice format"""
        if not modules:
            print("No modules found.")
            return
        
        # Group by canonical vs versions
        canonical = [m for m in modules if m.get('is_canonical')]
        versions = [m for m in modules if not m.get('is_canonical')]
        
        if canonical:
            print("\n" + "="*60)
            print("📦 CANONICAL MODULES")
            print("="*60)
            
            for module in canonical:
                print(f"\n🌟 {module.get('name')}")
                print(f"   ID: {module.get('id')}")
                print(f"   📁 {module.get('path')}")
                print(f"   ⏱️  {module.get('metadata', {}).get('duration')} minutes")
                print(f"   📝 {module.get('description', '')[:80]}...")
                print(f"   🏷️  Tags: {', '.join(module.get('metadata', {}).get('tags', []))}")
        
        if versions:
            print(f"\n" + "="*60)
            print(f"🔀 CUSTOMIZED VERSIONS ({len(versions)} found)")
            print("="*60)
            
            for module in versions:
                lineage = module.get('lineage', {})
                print(f"\n📦 {module.get('name')}")
                print(f"   ID: {module.get('id')}")
                print(f"   📁 {module.get('path')}")
                print(f"   🔗 Parent: {lineage.get('parent_module')}")
                print(f"   📝 {lineage.get('description', '')[:80]}...")
    
    def display_tree(self, tree: Dict, indent: int = 0):
        """Display module version tree"""
        if not tree:
            print("Module not found.")
            return
        
        canonical = tree['canonical']
        
        print("\n" + "="*60)
        print(f"🌳 MODULE VERSION TREE: {canonical.get('name')}")
        print("="*60 + "\n")
        
        # Display canonical
        print(f"📦 {canonical.get('id')} (CANONICAL)")
        print(f"│  📁 {canonical.get('path')}")
        print(f"│  ⏱️  {canonical.get('metadata', {}).get('duration')} min")
        print(f"│  📅 Updated: {canonical.get('last_updated', 'N/A')}")
        print(f"│  ✏️  {canonical.get('description', '')[:60]}...")
        
        # Display versions recursively
        self._display_tree_recursive(tree['versions'], "")
        
        print("\n" + "="*60)
    
    def _display_tree_recursive(self, versions: List[Dict], prefix: str):
        """Recursively display version tree"""
        for i, version in enumerate(versions):
            is_last = i == len(versions) - 1
            branch = "└─➤" if is_last else "├─➤"
            continuation = "   " if is_last else "│  "
            
            print(f"│{prefix}{branch} 📦 {version.get('id')}")
            
            lineage = version.get('lineage', {})
            files = lineage.get('files', {})
            
            customized = sum(1 for f in files.values() if f.get('status') == 'customized')
            inherited = sum(1 for f in files.values() if f.get('status') == 'inherited')
            
            print(f"│{prefix}{continuation}  📁 {version.get('path')}")
            print(f"│{prefix}{continuation}  ⏱️  {version.get('metadata', {}).get('duration')} min")
            print(f"│{prefix}{continuation}  ✏️  {lineage.get('description', '')[:50]}...")
            print(f"│{prefix}{continuation}  📊 Customized: {customized} | Inherited: {inherited}")
            
            # Display children
            if version.get('children'):
                self._display_tree_recursive(version['children'], prefix + continuation)
    
    def fork_module(self, source_module_id: str, destination: str, description: str = ""):
        """Fork a module to create a new version"""
        # Find source module
        modules = self.find_modules("")
        source = None
        
        for module in modules:
            if module.get('id') == source_module_id:
                source = module
                break
        
        if not source:
            print(f"❌ Source module not found: {source_module_id}")
            return False
        
        source_path = self.repo_root / source['path']
        dest_path = self.repo_root / destination
        
        if dest_path.exists():
            print(f"❌ Destination already exists: {destination}")
            return False
        
        # Create destination directory
        dest_path.mkdir(parents=True, exist_ok=True)
        
        # Generate new module ID
        workshop_name = Path(destination).parts[1] if len(Path(destination).parts) > 1 else "custom"
        module_name = Path(destination).parts[-1]
        new_module_id = f"{workshop_name}.{module_name}.v1"
        
        # Create lineage file
        lineage_data = {
            'module_id': new_module_id,
            'parent_module': source_module_id,
            'parent_path': str(source_path.relative_to(self.repo_root)),
            'created': datetime.now().isoformat(),
            'created_by': os.environ.get('USER', 'unknown'),
            'description': description or f"Forked from {source_module_id}",
            'files': {}
        }
        
        # Copy content directory structure
        content_dest = dest_path / 'content'
        content_dest.mkdir(exist_ok=True)
        
        # For now, just track that files are inherited
        source_content = source_path / 'content'
        if source_content.exists():
            for file in source_content.glob('*.md'):
                lineage_data['files'][file.name] = {
                    'status': 'inherited',
                    'source': str((source_content / file.name).relative_to(self.repo_root))
                }
        
        # Copy and update module.yaml
        source_module_yaml = source_path / 'module.yaml'
        dest_module_yaml = dest_path / 'module.yaml'
        
        with open(source_module_yaml) as f:
            module_data = yaml.safe_load(f)
        
        module_data['id'] = new_module_id
        module_data['lineage'] = {
            'is_canonical': False,
            'parent': source_module_id
        }
        
        with open(dest_module_yaml, 'w') as f:
            yaml.dump(module_data, f, default_flow_style=False)
        
        # Write lineage file
        with open(dest_path / '.lineage', 'w') as f:
            yaml.dump(lineage_data, f, default_flow_style=False)
        
        print(f"\n✅ Module forked successfully!")
        print(f"   Source: {source_module_id}")
        print(f"   Destination: {destination}")
        print(f"   New ID: {new_module_id}")
        print(f"\n📝 Next steps:")
        print(f"   1. Customize files in: {destination}/content/")
        print(f"   2. Update .lineage file to mark customized files")
        print(f"   3. Build workshop to test changes")
        
        return True

def main():
    parser = argparse.ArgumentParser(description='Redis Workshop Module Manager')
    subparsers = parser.add_subparsers(dest='command', help='Command to execute')
    
    # Search command
    search_parser = subparsers.add_parser('search', help='Search for modules')
    search_parser.add_argument('query', nargs='?', default='', help='Search query')
    
    # Tree command
    tree_parser = subparsers.add_parser('tree', help='Show module version tree')
    tree_parser.add_argument('module', help='Module name or ID')
    
    # Fork command
    fork_parser = subparsers.add_parser('fork', help='Fork a module')
    fork_parser.add_argument('--from', dest='source', required=True, help='Source module ID')
    fork_parser.add_argument('--to', dest='destination', required=True, help='Destination path')
    fork_parser.add_argument('--description', default='', help='Description of customization')
    
    # Info command
    info_parser = subparsers.add_parser('info', help='Show module information')
    info_parser.add_argument('module', help='Module ID')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    manager = ModuleManager()
    
    if args.command == 'search':
        modules = manager.find_modules(args.query)
        manager.display_search_results(modules)
    
    elif args.command == 'tree':
        tree = manager.get_module_tree(args.module)
        manager.display_tree(tree)
    
    elif args.command == 'fork':
        manager.fork_module(args.source, args.destination, args.description)
    
    elif args.command == 'info':
        modules = manager.find_modules(args.module)
        for module in modules:
            if module.get('id') == args.module:
                print(json.dumps(module, indent=2, default=str))
                break

if __name__ == '__main__':
    main()
