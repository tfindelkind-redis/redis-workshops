#!/usr/bin/env python3
"""
Generate chapter metadata JSON from simplified YAML frontmatter
"""
import sys
import json
import yaml
import os
from datetime import datetime

# Default requirement definitions
REQUIREMENT_TEMPLATES = {
    "redis": {
        "type": "connection",
        "description": "Redis instance (local or cloud)",
        "validation": "redis-cli ping",
        "helpUrl": "https://redis.io/docs/getting-started/"
    },
    "azure-redis": {
        "type": "connection",
        "description": "Azure Managed Redis instance",
        "validation": "redis-cli ping",
        "helpUrl": "https://learn.microsoft.com/azure/azure-cache-for-redis/"
    }
}

TOOL_TEMPLATES = {
    "redis-cli": {
        "name": "redis-cli",
        "validation": "which redis-cli",
        "installUrl": "https://redis.io/docs/getting-started/installation/"
    },
    "python": {
        "name": "python",
        "version": ">=3.8",
        "validation": "python --version"
    },
    "terraform": {
        "name": "terraform",
        "validation": "which terraform",
        "installUrl": "https://www.terraform.io/downloads"
    },
    "azure-cli": {
        "name": "az",
        "validation": "which az",
        "installUrl": "https://learn.microsoft.com/cli/azure/install-azure-cli"
    }
}

ENV_VAR_TEMPLATES = {
    "REDIS_HOST": {
        "description": "Redis server hostname",
        "default": "localhost",
        "required": True
    },
    "REDIS_PORT": {
        "description": "Redis server port",
        "default": "6379",
        "required": True
    },
    "REDIS_PASSWORD": {
        "description": "Redis password (if authentication enabled)",
        "required": False,
        "secret": True
    },
    "AZURE_SUBSCRIPTION_ID": {
        "description": "Azure subscription ID",
        "required": True,
        "secret": False
    },
    "AZURE_RESOURCE_GROUP": {
        "description": "Azure resource group name",
        "required": True,
        "secret": False
    }
}

def parse_frontmatter(readme_path):
    """Extract YAML frontmatter from README"""
    with open(readme_path, 'r') as f:
        content = f.read()
    
    if not content.startswith('---'):
        return None
    
    # Extract frontmatter between --- markers
    parts = content.split('---', 2)
    if len(parts) < 3:
        return None
    
    return yaml.safe_load(parts[1])

def generate_metadata(chapter_dir):
    """Generate full metadata from simplified requirements"""
    readme_path = os.path.join(chapter_dir, 'README.md')
    
    if not os.path.exists(readme_path):
        print(f"Error: README.md not found in {chapter_dir}", file=sys.stderr)
        return None
    
    frontmatter = parse_frontmatter(readme_path)
    if not frontmatter:
        print(f"Error: No frontmatter found in {readme_path}", file=sys.stderr)
        return None
    
    # Extract basic metadata
    metadata = {
        "title": frontmatter.get('title', 'Untitled Chapter'),
        "description": frontmatter.get('description', 'No description'),
        "difficulty": frontmatter.get('difficulty', 'beginner'),
        "estimatedMinutes": frontmatter.get('estimatedMinutes', 30),
        "tags": frontmatter.get('tags', ['redis']),
        "version": "1.0.0",
        "lastUpdated": datetime.now().strftime('%Y-%m-%d')
    }
    
    # Process requirements if present
    if 'requirements' in frontmatter:
        reqs = frontmatter['requirements']
        metadata['requirements'] = {}
        
        # Process connection requirements (redis, azure-redis, etc.)
        for conn_type in ['redis', 'azure-redis']:
            if reqs.get(conn_type):
                metadata['requirements'][conn_type] = REQUIREMENT_TEMPLATES[conn_type]
        
        # Process environment variables
        if 'environment' in reqs:
            metadata['requirements']['environment'] = {}
            for env_var in reqs['environment']:
                # Parse format: "VAR_NAME" or "VAR_NAME (optional)" or "VAR_NAME (optional, secret)"
                var_name = env_var.split('(')[0].strip()
                is_optional = '(optional' in env_var.lower()
                is_secret = 'secret' in env_var.lower()
                
                if var_name in ENV_VAR_TEMPLATES:
                    var_config = ENV_VAR_TEMPLATES[var_name].copy()
                    if is_optional:
                        var_config['required'] = False
                    if is_secret:
                        var_config['secret'] = True
                    metadata['requirements']['environment'][var_name] = var_config
                else:
                    # Custom environment variable
                    metadata['requirements']['environment'][var_name] = {
                        "description": f"Custom variable: {var_name}",
                        "required": not is_optional,
                        "secret": is_secret
                    }
        
        # Process tool requirements
        if 'tools' in reqs:
            metadata['requirements']['tools'] = []
            for tool in reqs['tools']:
                # Parse format: "tool-name" or "tool-name>=version"
                tool_parts = tool.split('>=')
                tool_name = tool_parts[0].strip()
                
                if tool_name in TOOL_TEMPLATES:
                    tool_config = TOOL_TEMPLATES[tool_name].copy()
                    if len(tool_parts) > 1:
                        tool_config['version'] = f">={tool_parts[1].strip()}"
                    metadata['requirements']['tools'].append(tool_config)
        
        # Process Python package requirements
        if 'packages' in reqs:
            metadata['requirements']['python_packages'] = reqs['packages']
    
    return metadata

def main():
    if len(sys.argv) != 2:
        print("Usage: generate-chapter-metadata.py <chapter_directory>", file=sys.stderr)
        print("Example: generate-chapter-metadata.py shared/chapters/redis-data-structures", file=sys.stderr)
        sys.exit(1)
    
    chapter_dir = sys.argv[1]
    
    if not os.path.isdir(chapter_dir):
        print(f"Error: Directory not found: {chapter_dir}", file=sys.stderr)
        sys.exit(1)
    
    metadata = generate_metadata(chapter_dir)
    if not metadata:
        sys.exit(1)
    
    # Write to .chapter-metadata.json
    output_path = os.path.join(chapter_dir, '.chapter-metadata.json')
    with open(output_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"✅ Generated metadata: {output_path}")
    print(f"\n📋 Summary:")
    print(f"   Title: {metadata['title']}")
    print(f"   Difficulty: {metadata['difficulty']}")
    print(f"   Duration: {metadata['estimatedMinutes']} minutes")
    
    if 'requirements' in metadata:
        print(f"\n🔧 Requirements:")
        if 'redis' in metadata['requirements'] or 'azure-redis' in metadata['requirements']:
            print(f"   ✓ Redis connection required")
        if 'environment' in metadata['requirements']:
            print(f"   ✓ Environment variables: {len(metadata['requirements']['environment'])}")
        if 'tools' in metadata['requirements']:
            print(f"   ✓ Tools: {', '.join([t['name'] for t in metadata['requirements']['tools']])}")
        if 'python_packages' in metadata['requirements']:
            print(f"   ✓ Python packages: {len(metadata['requirements']['python_packages'])}")

if __name__ == '__main__':
    main()
