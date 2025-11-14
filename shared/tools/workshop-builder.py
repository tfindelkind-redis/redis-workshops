#!/usr/bin/env python3
"""
Workshop Builder CLI Tool
Helps workshop creators assemble and manage workshops from modules
"""

import os
import sys
import json
import yaml
import re
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import argparse
from datetime import datetime

class WorkshopBuilder:
    def __init__(self, repo_root: str = None):
        if repo_root:
            self.repo_root = Path(repo_root)
        else:
            current = Path.cwd()
            while current != current.parent:
                if (current / '.git').exists():
                    self.repo_root = current
                    break
                current = current.parent
            else:
                raise Exception("Not in a git repository")
        
        self.workshops_dir = self.repo_root / 'workshops'
        self.shared_modules = self.repo_root / 'shared' / 'modules'
    
    def get_workshop_config_path(self, workshop: str) -> Path:
        """Get path to workshop.config.json"""
        return self.workshops_dir / workshop / 'workshop.config.json'
    
    def load_workshop_config(self, workshop: str) -> Dict:
        """Load workshop configuration"""
        config_path = self.get_workshop_config_path(workshop)
        if not config_path.exists():
            raise Exception(f"Workshop '{workshop}' not found at {config_path}")
        
        with open(config_path) as f:
            return json.load(f)
    
    def save_workshop_config(self, workshop: str, config: Dict):
        """Save workshop configuration"""
        config_path = self.get_workshop_config_path(workshop)
        config['lastUpdated'] = datetime.now().strftime('%Y-%m-%d')
        
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
        
        print(f"✅ Updated: {config_path}")
    
    def resolve_module_path(self, module_id: str) -> Optional[Path]:
        """Find module path from module ID"""
        # Parse module ID: scope.module-name.version
        parts = module_id.split('.')
        if len(parts) < 3:
            return None
        
        scope = parts[0]
        module_name = '.'.join(parts[1:-1])
        version = parts[-1]
        
        # Check canonical modules
        if scope == 'core':
            canonical_path = self.shared_modules / module_name
            if canonical_path.exists():
                return canonical_path
        
        # Check workshop-specific modules
        workshop_path = self.workshops_dir / scope / 'modules' / module_name
        if workshop_path.exists():
            return workshop_path
        
        return None
    
    def get_module_info(self, module_id: str) -> Optional[Dict]:
        """Get module metadata"""
        module_path = self.resolve_module_path(module_id)
        if not module_path:
            return None
        
        module_yaml = module_path / 'module.yaml'
        if not module_yaml.exists():
            return None
        
        with open(module_yaml) as f:
            return yaml.safe_load(f)
    
    def add_module(self, workshop: str, module_id: str, position: Optional[int] = None):
        """Add module to workshop"""
        # Validate module exists
        module_info = self.get_module_info(module_id)
        if not module_info:
            print(f"❌ Error: Module '{module_id}' not found")
            return False
        
        # Load config
        config = self.load_workshop_config(workshop)
        
        # Initialize modules list if needed
        if 'modules' not in config:
            config['modules'] = []
        
        # Check if already added
        existing = [m for m in config['modules'] if m.get('moduleRef') == module_id]
        if existing:
            print(f"⚠️  Module '{module_id}' is already in workshop")
            return False
        
        # Determine module type
        module_type = 'canonical' if module_id.startswith('core.') else 'customized'
        
        # Create module entry
        module_entry = {
            'moduleRef': module_id,
            'type': module_type,
            'required': True
        }
        
        # Add at position or end
        if position is not None:
            # Insert at specific position (1-indexed)
            idx = position - 1
            config['modules'].insert(idx, module_entry)
        else:
            config['modules'].append(module_entry)
        
        # Renumber order
        for i, module in enumerate(config['modules'], 1):
            module['order'] = i
        
        # Save
        self.save_workshop_config(workshop, config)
        
        print(f"✅ Added {module_type} module: {module_id}")
        print(f"📝 Position: {position or len(config['modules'])}")
        print(f"⏱️  Duration: {module_info.get('duration', 'unknown')}")
        
        return True
    
    def remove_module(self, workshop: str, module_id: str):
        """Remove module from workshop"""
        config = self.load_workshop_config(workshop)
        
        if 'modules' not in config:
            print(f"⚠️  Workshop has no modules")
            return False
        
        # Find module
        original_count = len(config['modules'])
        config['modules'] = [m for m in config['modules'] if m.get('moduleRef') != module_id]
        
        if len(config['modules']) == original_count:
            print(f"❌ Module '{module_id}' not found in workshop")
            return False
        
        # Renumber order
        for i, module in enumerate(config['modules'], 1):
            module['order'] = i
        
        # Save
        self.save_workshop_config(workshop, config)
        
        print(f"✅ Removed module: {module_id}")
        print(f"📝 Remaining modules: {len(config['modules'])}")
        
        return True
    
    def move_module(self, workshop: str, module_id: str, to_position: int):
        """Move module to new position"""
        config = self.load_workshop_config(workshop)
        
        if 'modules' not in config or not config['modules']:
            print(f"⚠️  Workshop has no modules")
            return False
        
        # Find module
        module_entry = None
        from_idx = None
        for i, m in enumerate(config['modules']):
            if m.get('moduleRef') == module_id:
                module_entry = m
                from_idx = i
                break
        
        if module_entry is None:
            print(f"❌ Module '{module_id}' not found in workshop")
            return False
        
        # Validate position
        if to_position < 1 or to_position > len(config['modules']):
            print(f"❌ Invalid position: {to_position} (must be 1-{len(config['modules'])})")
            return False
        
        to_idx = to_position - 1
        
        if from_idx == to_idx:
            print(f"⚠️  Module is already at position {to_position}")
            return False
        
        # Move module
        config['modules'].pop(from_idx)
        config['modules'].insert(to_idx, module_entry)
        
        # Renumber order
        for i, module in enumerate(config['modules'], 1):
            module['order'] = i
        
        # Save
        self.save_workshop_config(workshop, config)
        
        print(f"✅ Moved module: {module_id}")
        print(f"📝 Position: {from_idx + 1} → {to_position}")
        
        return True
    
    def swap_modules(self, workshop: str, pos1: int, pos2: int):
        """Swap two modules by position"""
        config = self.load_workshop_config(workshop)
        
        if 'modules' not in config or not config['modules']:
            print(f"⚠️  Workshop has no modules")
            return False
        
        # Validate positions
        max_pos = len(config['modules'])
        if pos1 < 1 or pos1 > max_pos or pos2 < 1 or pos2 > max_pos:
            print(f"❌ Invalid positions: must be 1-{max_pos}")
            return False
        
        # Swap
        idx1, idx2 = pos1 - 1, pos2 - 1
        config['modules'][idx1], config['modules'][idx2] = config['modules'][idx2], config['modules'][idx1]
        
        # Renumber order
        for i, module in enumerate(config['modules'], 1):
            module['order'] = i
        
        # Save
        self.save_workshop_config(workshop, config)
        
        print(f"✅ Swapped modules at positions {pos1} ↔ {pos2}")
        
        return True
    
    def preview_workshop(self, workshop: str):
        """Show workshop structure"""
        config = self.load_workshop_config(workshop)
        
        print(f"\n📚 Workshop: {config.get('title', workshop)}")
        print(f"🎯 Difficulty: {config.get('difficulty', 'unknown')}")
        
        # Calculate total duration
        total_duration = 0
        modules = config.get('modules', [])
        
        if not modules:
            print("\n⚠️  No modules in workshop")
            return
        
        print(f"\n📋 Modules ({len(modules)}):")
        print("┌────┬─────────────────────────────────────────┬──────────┬──────┬──────────┐")
        print("│ #  │ Module                                  │ Duration │ Type │ Status   │")
        print("├────┼─────────────────────────────────────────┼──────────┼──────┼──────────┤")
        
        for module in modules:
            module_id = module.get('moduleRef', 'unknown')
            order = module.get('order', '?')
            module_type = '🌟' if module.get('type') == 'canonical' else '📦'
            
            # Get module info
            module_info = self.get_module_info(module_id)
            if module_info:
                duration = module_info.get('duration', 'unknown')
                status = '✅ Ready'
                
                # Parse duration (e.g., "60 min" -> 60)
                try:
                    duration_num = int(duration.split()[0])
                    total_duration += duration_num
                except:
                    pass
            else:
                duration = 'unknown'
                status = '❌ Missing'
            
            # Truncate module ID if too long
            display_id = module_id if len(module_id) <= 39 else module_id[:36] + '...'
            
            print(f"│ {order:<2} │ {display_id:<39} │ {duration:<8} │ {module_type:<4} │ {status:<8} │")
        
        print("└────┴─────────────────────────────────────────┴──────────┴──────┴──────────┘")
        print(f"\nLegend: 🌟 Canonical | 📦 Customized")
        
        # Show total duration
        if total_duration > 0:
            hours = total_duration // 60
            minutes = total_duration % 60
            print(f"\n⏱️  Total Duration: {total_duration} minutes ({hours}h {minutes}m)")
            
            # Recommendations
            if total_duration <= 120:
                print("💡 Format: 2-hour quickstart")
            elif total_duration <= 240:
                print("💡 Format: 4-hour workshop (half-day)")
            elif total_duration <= 480:
                print("💡 Format: 8-hour workshop (full-day)")
            else:
                print("💡 Format: Multi-day workshop")
    
    def reorder_interactive(self, workshop: str):
        """Interactive module reordering"""
        config = self.load_workshop_config(workshop)
        modules = config.get('modules', [])
        
        if not modules:
            print("⚠️  No modules to reorder")
            return False
        
        print("\n📋 Current order:")
        for i, module in enumerate(modules, 1):
            module_id = module.get('moduleRef', 'unknown')
            module_info = self.get_module_info(module_id)
            duration = module_info.get('duration', 'unknown') if module_info else 'unknown'
            print(f"  {i}. {module_id} ({duration})")
        
        print("\n💡 Enter new order as comma-separated positions (e.g., '1,3,2,4')")
        print("   Or press Enter to cancel")
        
        user_input = input("> ").strip()
        
        if not user_input:
            print("❌ Cancelled")
            return False
        
        # Parse input
        try:
            new_order = [int(x.strip()) for x in user_input.split(',')]
        except ValueError:
            print("❌ Invalid input: must be numbers separated by commas")
            return False
        
        # Validate
        if len(new_order) != len(modules):
            print(f"❌ Wrong number of positions: expected {len(modules)}, got {len(new_order)}")
            return False
        
        if sorted(new_order) != list(range(1, len(modules) + 1)):
            print(f"❌ Invalid positions: must use each position 1-{len(modules)} exactly once")
            return False
        
        # Reorder
        reordered_modules = [modules[i - 1] for i in new_order]
        config['modules'] = reordered_modules
        
        # Renumber order
        for i, module in enumerate(config['modules'], 1):
            module['order'] = i
        
        # Save
        self.save_workshop_config(workshop, config)
        
        print("\n✅ Reordered modules:")
        for i, module in enumerate(config['modules'], 1):
            print(f"  {i}. {module.get('moduleRef', 'unknown')}")
        
        return True
    
    def generate_navigation(self, workshop: str, auto_update: bool = False):
        """Generate navigation for all modules in workshop"""
        config = self.load_workshop_config(workshop)
        modules = config.get('modules', [])
        
        if not modules:
            print("⚠️  No modules in workshop")
            return False
        
        if not auto_update:
            print(f"\n🧭 Generating navigation for workshop: {config.get('title', workshop)}")
        
        # Build navigation context for each module
        nav_contexts = []
        for i, module in enumerate(modules):
            module_id = module.get('moduleRef')
            module_info = self.get_module_info(module_id)
            
            if not module_info:
                if not auto_update:
                    print(f"⚠️  Skipping {module_id} (module not found)")
                continue
            
            # Get module metadata
            title = module_info.get('name', 'Unknown Module')
            duration = module_info.get('duration', 'unknown')
            
            # Build navigation context
            nav_context = {
                'module_id': module_id,
                'title': title,
                'duration': duration,
                'position': i + 1,
                'total': len(modules),
                'folder': f"{i+1:02d}-{self._slugify(title)}",
                'previous': None,
                'next': None,
                'home': '../../README.md',
                'all_modules': []
            }
            
            # Add previous module
            if i > 0:
                prev_module_id = modules[i-1].get('moduleRef')
                prev_module_info = self.get_module_info(prev_module_id)
                if prev_module_info:
                    nav_context['previous'] = {
                        'module_id': prev_module_id,
                        'title': prev_module_info.get('name', 'Unknown'),
                        'duration': prev_module_info.get('duration', 'unknown'),
                        'folder': f"{i:02d}-{self._slugify(prev_module_info.get('name', 'unknown'))}"
                    }
            
            # Add next module
            if i < len(modules) - 1:
                next_module_id = modules[i+1].get('moduleRef')
                next_module_info = self.get_module_info(next_module_id)
                if next_module_info:
                    nav_context['next'] = {
                        'module_id': next_module_id,
                        'title': next_module_info.get('name', 'Unknown'),
                        'duration': next_module_info.get('duration', 'unknown'),
                        'folder': f"{i+2:02d}-{self._slugify(next_module_info.get('name', 'unknown'))}"
                    }
            
            # Add all modules for module list
            for j, all_mod in enumerate(modules):
                all_mod_id = all_mod.get('moduleRef')
                all_mod_info = self.get_module_info(all_mod_id)
                if all_mod_info:
                    nav_context['all_modules'].append({
                        'position': j + 1,
                        'module_id': all_mod_id,
                        'title': all_mod_info.get('name', 'Unknown'),
                        'folder': f"{j+1:02d}-{self._slugify(all_mod_info.get('name', 'unknown'))}",
                        'is_current': (j == i)
                    })
            
            nav_contexts.append(nav_context)
        
        # Generate navigation HTML for each module
        updated_count = 0
        for nav_ctx in nav_contexts:
            nav_html = self._render_navigation_html(nav_ctx)
            
            # Save navigation to temporary file (will be used during build)
            nav_file = self.workshops_dir / workshop / '.nav' / f"{nav_ctx['folder']}.html"
            nav_file.parent.mkdir(exist_ok=True)
            nav_file.write_text(nav_html)
            
            updated_count += 1
            if not auto_update:
                print(f"✅ Generated navigation for: {nav_ctx['title']}")
        
        if not auto_update:
            print(f"\n✅ Generated navigation for {updated_count} modules!")
            print(f"📁 Saved to: workshops/{workshop}/.nav/")
            print(f"\n💡 Navigation will be applied during build:")
            print(f"   ./shared/tools/workshop-builder.py build --workshop {workshop}")
        
        return True
    
    def _slugify(self, text: str) -> str:
        """Convert text to URL-friendly slug"""
        # Convert to lowercase
        slug = text.lower()
        # Replace spaces and special chars with hyphens
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'[-\s]+', '-', slug)
        # Remove leading/trailing hyphens
        slug = slug.strip('-')
        return slug
    
    def _render_navigation_html(self, ctx: Dict) -> str:
        """Render navigation HTML from context"""
        
        # Previous link
        if ctx['previous']:
            prev_html = f"""<td width="33%" align="left">

### [◀️ Previous](../{ctx['previous']['folder']}/README.md)
**{ctx['previous']['title']}**  
⏱️ {ctx['previous']['duration']}

</td>"""
        else:
            prev_html = """<td width="33%" align="left">

### 🏁
**First Module**

</td>"""
        
        # Home link (always present)
        home_html = f"""<td width="34%" align="center">

### [🏠 Home]({ctx['home']})
**Workshop Home**  
📍 Module {ctx['position']} of {ctx['total']}

</td>"""
        
        # Next link
        if ctx['next']:
            next_html = f"""<td width="33%" align="right">

### [Next ▶️](../{ctx['next']['folder']}/README.md)
**{ctx['next']['title']}**  
⏱️ {ctx['next']['duration']}

</td>"""
        else:
            next_html = """<td width="33%" align="right">

### 🎉
**Last Module**

</td>"""
        
        # Build module list
        module_list = []
        for mod in ctx['all_modules']:
            if mod['is_current']:
                module_list.append(f"{mod['position']}. **{mod['title']}** ← *You are here*")
            else:
                module_list.append(f"{mod['position']}. [{mod['title']}](../{mod['folder']}/README.md)")
        
        module_list_html = '\n'.join(module_list)
        
        # Complete navigation HTML
        navigation_html = f"""<!-- NAV:START -->
<!-- This navigation is auto-generated. Do not edit manually. -->
## 🧭 Navigation

<table>
<tr>
{prev_html}
{home_html}
{next_html}
</tr>
</table>

---

### 📚 Workshop Modules

{module_list_html}

---
<!-- NAV:END -->"""
        
        return navigation_html
    
    def build(self, workshop: str, output_dir: Optional[str] = None):
        """
        Build workshop by flattening modules into a single directory structure.
        
        This command:
        1. Validates workshop configuration
        2. Resolves all module paths (canonical vs customized)
        3. Copies content files to output directory
        4. Injects navigation into content files
        5. Generates workshop home page
        
        Args:
            workshop: Workshop name (directory name in workshops/)
            output_dir: Optional output directory (default: workshops/{workshop}/build/)
        """
        print(f"🔨 Building workshop: {workshop}")
        print()
        
        # Load configuration
        config = self.load_workshop_config(workshop)
        workshop_path = self.workshops_dir / workshop
        
        # Determine output directory
        if output_dir:
            build_dir = Path(output_dir)
        else:
            build_dir = workshop_path / 'build'
        
        # Create clean build directory
        if build_dir.exists():
            print(f"🗑️  Cleaning existing build directory: {build_dir}")
            shutil.rmtree(build_dir)
        build_dir.mkdir(parents=True, exist_ok=True)
        
        # Validate and resolve modules
        print("📦 Resolving modules...")
        modules = self._resolve_modules(workshop, config)
        
        if not modules:
            raise Exception("No modules found in workshop configuration")
        
        print(f"   Found {len(modules)} module(s)")
        print()
        
        # Copy module content
        print("📋 Copying module content...")
        module_dirs = self._copy_module_content(workshop, modules, build_dir)
        print()
        
        # Inject navigation
        print("🧭 Injecting navigation...")
        self._inject_navigation(workshop, module_dirs, build_dir)
        print()
        
        # Generate home page
        print("📄 Generating workshop home page...")
        self._generate_home_page(workshop, config, modules, build_dir)
        print()
        
        print(f"✅ Build complete!")
        print(f"📁 Output: {build_dir}")
        print()
        print("🎯 Next steps:")
        print("   1. Review the generated files")
        print("   2. Test the workshop flow")
        print("   3. Deploy to GitHub Pages or your platform")
    
    def _resolve_modules(self, workshop: str, config: Dict) -> List[Dict]:
        """
        Resolve module paths from configuration.
        Returns list of module info dicts with resolved paths.
        """
        modules = []
        workshop_path = self.workshops_dir / workshop
        
        # Check for new 'modules' array first, fall back to 'chapters' for backward compatibility
        module_refs = config.get('modules', [])
        if not module_refs:
            module_refs = config.get('chapters', [])
            ref_key = 'chapterRef'
        else:
            ref_key = 'moduleRef'
        
        for module_entry in module_refs:
            module_ref = module_entry.get(ref_key, '')
            
            # Handle module ID format (e.g., core.redis-fundamentals.v1)
            if '.' in module_ref and not module_ref.startswith('shared/') and not module_ref.startswith('modules/'):
                # This is a module ID, need to resolve to path
                module_name = module_ref.split('.')[1]  # Extract module-name from scope.module-name.version
                
                # Check customized first
                custom_path = workshop_path / 'modules' / module_name
                shared_path = self.shared_modules / module_name
                
                if custom_path.exists():
                    module_path = custom_path
                    module_type = 'customized'
                elif shared_path.exists():
                    module_path = shared_path
                    module_type = 'canonical'
                else:
                    raise Exception(f"Module not found: {module_ref} (searched: {custom_path}, {shared_path})")
            
            # Resolve module path from chapterRef-style paths
            elif module_ref.startswith('shared/'):
                # Canonical module or legacy chapter
                module_path = self.repo_root / module_ref
                module_type = 'canonical'
            elif module_ref.startswith('modules/'):
                # Customized module (relative to workshop)
                module_path = workshop_path / module_ref
                module_type = 'customized'
            else:
                # Try both locations
                shared_path = self.repo_root / 'shared' / 'modules' / module_ref
                custom_path = workshop_path / 'modules' / module_ref
                
                if custom_path.exists():
                    module_path = custom_path
                    module_type = 'customized'
                elif shared_path.exists():
                    module_path = shared_path
                    module_type = 'canonical'
                else:
                    raise Exception(f"Module not found: {module_ref}")
            
            # Validate module exists
            if not module_path.exists():
                raise Exception(f"Module path does not exist: {module_path}")
            
            # Load module metadata
            module_yaml = module_path / 'module.yaml'
            if not module_yaml.exists():
                print(f"⚠️  Warning: No module.yaml found in {module_path}")
                module_metadata = {'name': module_path.name}
            else:
                with open(module_yaml) as f:
                    module_metadata = yaml.safe_load(f)
            
            modules.append({
                'order': module_entry.get('order', 0),
                'path': module_path,
                'type': module_type,
                'metadata': module_metadata,
                'customizations': module_entry.get('customizations', {})
            })
        
        # Sort by order
        modules.sort(key=lambda m: m['order'])
        
        return modules
    
    def _copy_module_content(self, workshop: str, modules: List[Dict], build_dir: Path) -> List[Path]:
        """
        Copy module content files to build directory.
        Returns list of module directories in build.
        """
        module_dirs = []
        
        for idx, module in enumerate(modules, 1):
            module_path = module['path']
            metadata = module['metadata']
            
            # Get module name from metadata (for consistent naming with navigation)
            module_display_name = metadata.get('name', module_path.name)
            module_slug = self._slugify(module_display_name)
            
            # Create module directory in build
            # Use format: 01-module-name, 02-module-name, etc.
            padded_num = str(idx).zfill(2)
            module_build_dir = build_dir / f"{padded_num}-{module_slug}"
            module_build_dir.mkdir(parents=True, exist_ok=True)
            
            print(f"   [{idx}] {module_display_name} → {module_build_dir.name}/")
            
            # Copy all content files (skip module.yaml and .lineage)
            files_copied = 0
            has_readme = False
            
            for item in module_path.iterdir():
                if item.name in ['module.yaml', '.lineage', '.DS_Store']:
                    continue
                
                if item.is_file():
                    shutil.copy2(item, module_build_dir / item.name)
                    files_copied += 1
                    if item.name == 'README.md':
                        has_readme = True
                elif item.is_dir():
                    shutil.copytree(item, module_build_dir / item.name, dirs_exist_ok=True)
                    # Count files in subdirectory
                    files_copied += sum(1 for _ in (module_build_dir / item.name).rglob('*') if _.is_file())
            
            # If no README.md exists, create a module index
            if not has_readme:
                self._create_module_index(module_build_dir, metadata, idx, len(modules))
                files_copied += 1
                has_readme = True
            
            print(f"       Copied {files_copied} file(s)")
            
            module_dirs.append(module_build_dir)
        
        return module_dirs
    
    def _create_module_index(self, module_dir: Path, metadata: Dict, module_num: int, total_modules: int):
        """
        Create a README.md index for modules that don't have one.
        """
        module_name = metadata.get('name', module_dir.name)
        description = metadata.get('description', 'No description available.')
        duration = metadata.get('duration', 'N/A')
        difficulty = metadata.get('difficulty', 'N/A')
        objectives = metadata.get('learning_objectives', [])
        
        content = f"""# {module_name}

**Module {module_num} of {total_modules}**

{description}

## 📋 Module Details

- **Duration**: {duration} minutes
- **Difficulty**: {difficulty.capitalize()}

"""
        
        if objectives:
            content += "## 🎯 Learning Objectives\n\n"
            for obj in objectives:
                content += f"- {obj}\n"
            content += "\n"
        
        # List content files if they exist in a content/ subdirectory
        content_dir = module_dir / 'content'
        if content_dir.exists():
            content_files = sorted([f for f in content_dir.iterdir() if f.suffix == '.md'])
            if content_files:
                content += "## 📚 Content\n\n"
                for content_file in content_files:
                    # Extract number and title from filename (e.g., "01-what-is-redis.md")
                    file_name = content_file.stem
                    title = file_name.split('-', 1)[1].replace('-', ' ').title() if '-' in file_name else file_name
                    content += f"- [{title}](content/{content_file.name})\n"
                content += "\n"
        
        content += """---

*Navigate using the controls at the top of this page.*
"""
        
        readme_file = module_dir / 'README.md'
        with open(readme_file, 'w') as f:
            f.write(content)
    
    def _inject_navigation(self, workshop: str, module_dirs: List[Path], build_dir: Path):
        """
        Inject navigation HTML into content files.
        """
        workshop_path = self.workshops_dir / workshop
        nav_dir = workshop_path / '.nav'
        
        if not nav_dir.exists():
            print("   ⚠️  No navigation files found (.nav/ directory missing)")
            print("   💡 Run: workshop-builder.py update-navigation --workshop " + workshop)
            return
        
        # Find all navigation files (saved as .html)
        nav_files = list(nav_dir.glob('*.html'))
        
        if not nav_files:
            print("   ⚠️  No navigation files found in .nav/ directory")
            return
        
        files_updated = 0
        
        # Inject navigation into each module's README
        for module_dir in module_dirs:
            # The module_dir is like "01-redis-fundamentals"
            # The nav file is named "01-redis-fundamentals.html"
            nav_file = nav_dir / f"{module_dir.name}.html"
            readme_file = module_dir / 'README.md'
            
            if not nav_file.exists():
                print(f"   ⚠️  No navigation file for module: {module_dir.name}")
                continue
            
            if not readme_file.exists():
                print(f"   ⚠️  No README.md in module: {module_dir.name}")
                continue
            
            # Read navigation content
            with open(nav_file) as f:
                nav_content = f.read()
            
            # Read README content
            with open(readme_file) as f:
                readme_content = f.read()
            
            # Check if navigation markers exist
            if '<!-- NAV:START -->' in readme_content and '<!-- NAV:END -->' in readme_content:
                # Replace existing navigation
                pattern = r'<!-- NAV:START -->.*?<!-- NAV:END -->'
                updated_content = re.sub(
                    pattern,
                    nav_content,
                    readme_content,
                    flags=re.DOTALL
                )
            else:
                # Add navigation at the top (after title if present)
                lines = readme_content.split('\n')
                insert_pos = 0
                
                # Skip title lines (# Title)
                for i, line in enumerate(lines):
                    if line.strip() and not line.startswith('#'):
                        insert_pos = i
                        break
                    elif i > 0 and lines[i-1].startswith('#') and not line.strip():
                        insert_pos = i + 1
                        break
                
                lines.insert(insert_pos, nav_content)
                updated_content = '\n'.join(lines)
            
            # Write updated content
            with open(readme_file, 'w') as f:
                f.write(updated_content)
            
            files_updated += 1
            print(f"   ✓ {module_dir.name}/README.md")
        
        print(f"   Updated {files_updated} file(s)")
    
    def _generate_home_page(self, workshop: str, config: Dict, modules: List[Dict], build_dir: Path):
        """
        Generate workshop home page (README.md in build directory).
        """
        home_page = build_dir / 'README.md'
        
        # Extract metadata
        title = config.get('title', 'Workshop')
        description = config.get('description', '')
        duration = config.get('duration', 'N/A')
        difficulty = config.get('difficulty', 'N/A')
        prerequisites = config.get('prerequisites', [])
        objectives = config.get('learningObjectives', [])
        authors = config.get('authors', [])
        
        # Build content
        content = f"""# {title}

{description}

## 📋 Workshop Details

- **Duration**: {duration}
- **Difficulty**: {difficulty.capitalize()}
- **Last Updated**: {config.get('lastUpdated', 'N/A')}

## 🎯 Learning Objectives

"""
        
        for obj in objectives:
            content += f"- {obj}\n"
        
        if prerequisites:
            content += "\n## 📚 Prerequisites\n\n"
            for prereq in prerequisites:
                content += f"- {prereq}\n"
        
        content += "\n## 📖 Workshop Modules\n\n"
        
        # List modules with links
        total_duration = 0
        for idx, module in enumerate(modules, 1):
            metadata = module['metadata']
            module_name = metadata.get('name', 'Unknown Module')
            module_duration = metadata.get('duration', 0)
            module_difficulty = metadata.get('difficulty', 'N/A')
            # Use slugified name for consistency with navigation and build directory
            module_slug = self._slugify(module_name)
            module_dir_name = f"{str(idx).zfill(2)}-{module_slug}"
            
            total_duration += module_duration
            
            content += f"### {idx}. [{module_name}]({module_dir_name}/README.md)\n\n"
            content += f"- **Duration**: {module_duration} minutes\n"
            content += f"- **Difficulty**: {module_difficulty.capitalize()}\n"
            
            if 'description' in metadata:
                desc = metadata['description'].strip()
                # Take first line/sentence
                first_line = desc.split('\n')[0]
                content += f"- **Description**: {first_line}\n"
            
            content += "\n"
        
        content += f"\n**Total Duration**: ~{total_duration} minutes ({total_duration / 60:.1f} hours)\n"
        
        if authors:
            content += "\n## 👥 Authors\n\n"
            for author in authors:
                name = author.get('name', 'Unknown')
                email = author.get('email', '')
                if email:
                    content += f"- {name} ({email})\n"
                else:
                    content += f"- {name}\n"
        
        content += f"""
---

## 🚀 Getting Started

1. Review the prerequisites above
2. Work through modules in order (recommended)
3. Each module contains hands-on exercises
4. Estimated completion: {duration}

## 📝 Workshop Structure

This workshop is built using a modular system. Each module is self-contained with:
- Learning objectives
- Conceptual explanations
- Hands-on exercises
- Additional resources

## 🆘 Support

If you encounter issues or have questions:
1. Check the module's README for troubleshooting tips
2. Review the prerequisites
3. Contact the workshop authors

---

*This workshop was generated using the Redis Workshops modular system.*
*Built on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*
"""
        
        # Write home page
        with open(home_page, 'w') as f:
            f.write(content)
        
        print(f"   ✓ README.md (workshop home page)")

def main():
    parser = argparse.ArgumentParser(
        description='Workshop Builder - Assemble workshops from modules',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Add canonical module
  %(prog)s add --workshop my-workshop --module core.redis-fundamentals.v1
  
  # Add at specific position
  %(prog)s add --workshop my-workshop --module core.waf-overview.v1 --position 2
  
  # Remove module
  %(prog)s remove --workshop my-workshop --module core.waf-overview.v1
  
  # Move module
  %(prog)s move --workshop my-workshop --module core.waf-overview.v1 --to-position 3
  
  # Swap two modules
  %(prog)s swap --workshop my-workshop --positions 2,3
  
  # Interactive reorder
  %(prog)s reorder --workshop my-workshop
  
  # Preview workshop
  %(prog)s preview --workshop my-workshop
  
  # Build workshop (flatten modules)
  %(prog)s build --workshop my-workshop
  
  # Build to custom directory
  %(prog)s build --workshop my-workshop --output-dir /path/to/output
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Command to run')
    
    # Add command
    add_parser = subparsers.add_parser('add', help='Add module to workshop')
    add_parser.add_argument('--workshop', required=True, help='Workshop name')
    add_parser.add_argument('--module', required=True, help='Module ID')
    add_parser.add_argument('--position', type=int, help='Position to insert (1-indexed)')
    
    # Remove command
    remove_parser = subparsers.add_parser('remove', help='Remove module from workshop')
    remove_parser.add_argument('--workshop', required=True, help='Workshop name')
    remove_parser.add_argument('--module', required=True, help='Module ID')
    
    # Move command
    move_parser = subparsers.add_parser('move', help='Move module to new position')
    move_parser.add_argument('--workshop', required=True, help='Workshop name')
    move_parser.add_argument('--module', required=True, help='Module ID')
    move_parser.add_argument('--to-position', type=int, required=True, help='New position (1-indexed)')
    
    # Swap command
    swap_parser = subparsers.add_parser('swap', help='Swap two modules')
    swap_parser.add_argument('--workshop', required=True, help='Workshop name')
    swap_parser.add_argument('--positions', required=True, help='Two positions to swap (e.g., "2,3")')
    
    # Reorder command
    reorder_parser = subparsers.add_parser('reorder', help='Interactive reorder')
    reorder_parser.add_argument('--workshop', required=True, help='Workshop name')
    
    # Preview command
    preview_parser = subparsers.add_parser('preview', help='Preview workshop structure')
    preview_parser.add_argument('--workshop', required=True, help='Workshop name')
    
    # Update-navigation command
    nav_parser = subparsers.add_parser('update-navigation', help='Generate navigation for all modules')
    nav_parser.add_argument('--workshop', required=True, help='Workshop name')
    
    # Build command
    build_parser = subparsers.add_parser('build', help='Build workshop (flatten modules into deployable structure)')
    build_parser.add_argument('--workshop', required=True, help='Workshop name')
    build_parser.add_argument('--output-dir', help='Custom output directory (default: workshops/{workshop}/build/)')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    try:
        builder = WorkshopBuilder()
        
        if args.command == 'add':
            builder.add_module(args.workshop, args.module, args.position)
        
        elif args.command == 'remove':
            builder.remove_module(args.workshop, args.module)
        
        elif args.command == 'move':
            builder.move_module(args.workshop, args.module, args.to_position)
        
        elif args.command == 'swap':
            pos1, pos2 = map(int, args.positions.split(','))
            builder.swap_modules(args.workshop, pos1, pos2)
        
        elif args.command == 'reorder':
            builder.reorder_interactive(args.workshop)
        
        elif args.command == 'preview':
            builder.preview_workshop(args.workshop)
        
        elif args.command == 'update-navigation':
            builder.generate_navigation(args.workshop)
        
        elif args.command == 'build':
            builder.build(args.workshop, args.output_dir)
        
        return 0
    
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

if __name__ == '__main__':
    sys.exit(main())
