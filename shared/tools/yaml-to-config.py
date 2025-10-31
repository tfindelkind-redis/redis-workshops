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
    
    # Check required fields
    required_fields = ['workshopId', 'version', 'title', 'description', 'duration', 'difficulty']
    for field in required_fields:
        if not data.get(field):
            print(f"Error: Missing required field: {field}", file=sys.stderr)
            sys.exit(1)
    
    # Process chapters
    chapters = []
    for idx, chapter in enumerate(data.get('chapters', [])):
        chapter_ref = chapter.get('chapter', '')
        required = chapter.get('required', True)
        chapter_type = 'shared' if chapter_ref.startswith('shared/') else 'workshop-specific'
        
        chapters.append({
            'order': idx + 1,
            'chapterRef': chapter_ref,
            'required': required,
            'type': chapter_type
        })
    
    # Build config
    config = {
        'workshopId': data['workshopId'],
        'version': data['version'],
        'title': data['title'],
        'description': data['description'],
        'duration': data['duration'],
        'difficulty': data['difficulty'],
        'tags': data.get('tags', []),
        'chapters': chapters,
        'prerequisites': data.get('prerequisites', []),
        'learningObjectives': data.get('learningObjectives', []),
        'author': data.get('author', ''),
        'lastUpdated': datetime.now().strftime('%Y-%m-%d'),
        'repository': data.get('repository', 'https://github.com/tfindelkind-redis/redis-workshops')
    }
    
    print(json.dumps(config, indent=2))

if __name__ == '__main__':
    main()
