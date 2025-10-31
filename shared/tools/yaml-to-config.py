#!/usr/bin/env python3
import sys
import json
import yaml
from datetime import datetime

def main():
    if len(sys.argv) != 2:
        print("Usage: yaml-to-config.py <yaml_file>", file=sys.stderr)
        sys.exit(1)
    
    with open(sys.argv[1]) as f:
        data = yaml.safe_load(f)
    
    if not data:
        print("Error: Empty or invalid YAML", file=sys.stderr)
        sys.exit(1)
    
    # Check required fields - ONLY essentials
    required_fields = ['workshopId', 'title', 'description', 'duration', 'difficulty']
    for field in required_fields:
        if not data.get(field):
            print(f"Error: Missing required field: {field}", file=sys.stderr)
            sys.exit(1)
    
    # Validate workshopId format (no spaces, lowercase, hyphens only)
    workshop_id = data['workshopId']
    if ' ' in workshop_id:
        print(f"Error: workshopId cannot contain spaces. Use hyphens instead: '{workshop_id}' → '{workshop_id.replace(' ', '-')}'", file=sys.stderr)
        sys.exit(1)
    
    if workshop_id != workshop_id.lower():
        print(f"Error: workshopId must be lowercase: '{workshop_id}' → '{workshop_id.lower()}'", file=sys.stderr)
        sys.exit(1)
    
    # Check for invalid characters (only lowercase letters, numbers, hyphens)
    import re
    if not re.match(r'^[a-z0-9-]+$', workshop_id):
        print(f"Error: workshopId can only contain lowercase letters, numbers, and hyphens: '{workshop_id}'", file=sys.stderr)
        sys.exit(1)
    
    # Check for valid difficulty
    valid_difficulties = ['beginner', 'intermediate', 'advanced']
    if data['difficulty'].lower() not in valid_difficulties:
        print(f"Error: difficulty must be one of: {', '.join(valid_difficulties)}", file=sys.stderr)
        sys.exit(1)
    
    # Process chapters from simple comma-separated list
    # Format: "chapter1, chapter2, chapter3" or "chapter1"
    chapters = []
    chapters_str = data.get('chapters', '')
    
    if chapters_str:
        # Split by comma and clean up
        chapter_refs = [ref.strip() for ref in chapters_str.split(',') if ref.strip()]
        
        for idx, chapter_ref in enumerate(chapter_refs):
            # All chapters are required by default in simple format
            chapter_type = 'shared' if chapter_ref.startswith('shared/') else 'workshop-specific'
            
            chapters.append({
                'order': idx + 1,
                'chapterRef': chapter_ref,
                'required': True,  # All chapters required in simple format
                'type': chapter_type
            })
    
    # Auto-generate repository URL from workshopId
    workshop_id = data['workshopId']
    repository_url = f'https://github.com/tfindelkind-redis/redis-workshops/tree/main/workshops/{workshop_id}'
    
    # Auto-generate tags from title and difficulty
    auto_tags = ['redis', 'workshop', data['difficulty']]
    # Add words from title (lowercase, filter common words)
    title_words = [w.lower() for w in data['title'].split() if len(w) > 3 and w.lower() not in ['workshop', 'redis', 'the', 'and', 'for']]
    auto_tags.extend(title_words[:3])  # Add up to 3 meaningful words from title
    
    # Build config
    config = {
        'workshopId': data['workshopId'],
        'version': data.get('version', '1.0.0'),  # Default to 1.0.0 if not specified
        'title': data['title'],
        'description': data['description'],
        'duration': data['duration'],
        'difficulty': data['difficulty'],
        'tags': auto_tags,  # Auto-generated
        'chapters': chapters,
        'prerequisites': [],  # Removed - can be in README content instead
        'learningObjectives': [],  # Removed - can be in README content instead
        'author': data.get('author', ''),  # Optional
        'lastUpdated': datetime.now().strftime('%Y-%m-%d'),
        'repository': repository_url  # Auto-generated from workshopId
    }
    
    print(json.dumps(config, indent=2))

if __name__ == '__main__':
    main()
