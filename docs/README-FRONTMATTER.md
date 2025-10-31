# Workshop Configuration from README Frontmatter

## Overview

**Good news!** You don't need to manually edit JSON files anymore! The workshop system now supports **automatic configuration generation** from YAML frontmatter in your `README.md`.

## ✨ Why This is Better

### Before (Manual JSON)
```json
{
  "workshopId": "my-workshop",
  "version": "1.0.0",
  "title": "My Workshop",
  // ... lots of JSON to manually edit and validate
}
```
❌ Manual JSON editing  
❌ Easy to make syntax errors  
❌ Duplicates metadata from README  
❌ Need to run validator separately  

### After (Frontmatter)
```yaml
---
workshopId: my-workshop
version: 1.0.0
title: My Workshop
description: "Learn amazing things"
duration: 4 hours
difficulty: intermediate
tags:
  - redis
  - workshop
chapters:
  - chapter: shared/chapters/chapter-01-getting-started
    required: true
---

# My Workshop

Content starts here...
```
✅ Write in user-friendly YAML  
✅ Auto-validates and converts to JSON  
✅ Single source of truth (README.md)  
✅ Auto-syncs when you run the script  

## 📖 How It Works

### 1. Add Frontmatter to README.md

At the very top of your workshop's `README.md`, add YAML frontmatter between `---` markers:

```markdown
---
workshopId: redis-advanced-patterns
version: 1.0.0
title: "Redis Advanced Patterns"
description: "Master advanced Redis patterns for production"
duration: 6 hours
difficulty: advanced
tags:
  - redis
  - advanced
  - patterns
prerequisites:
  - Basic Redis knowledge
  - Command line proficiency
learningObjectives:
  - Implement advanced caching patterns
  - Design scalable Redis architectures
chapters:
  - chapter: shared/chapters/chapter-01-getting-started
    required: true
  - chapter: workshops/redis-advanced-patterns/chapters/caching-strategies
    required: false
author: Your Name
---

# Redis Advanced Patterns

Your workshop content starts here...
```

### 2. Run the Sync Script

```bash
./shared/tools/sync-workshop-config.sh workshops/your-workshop
```

That's it! The script will:
- Extract the frontmatter
- Validate all required fields
- Generate `workshop.config.json`
- Back up any existing config
- Show you a summary

## 📝 Frontmatter Fields

### Required Fields
- `workshopId` - Unique identifier (lowercase-with-dashes)
- `version` - Semantic version (e.g., "1.0.0")
- `title` - Workshop title
- `description` - Brief description (use quotes if multi-line)
- `duration` - Estimated time (e.g., "4 hours")
- `difficulty` - One of: beginner, intermediate, advanced

### Optional Fields
- `tags` - List of keywords for searchability
- `prerequisites` - List of what participants need to know
- `learningObjectives` - List of what they'll learn
- `chapters` - List of chapters (ref and required status)
- `author` - Your name or team name
- `repository` - GitHub repository URL

### Chapter Format
```yaml
chapters:
  - chapter: shared/chapters/chapter-01-getting-started
    required: true
  - chapter: workshops/my-workshop/chapters/custom-chapter
    required: false
```

The script automatically detects:
- **Shared chapters** - start with `shared/`
- **Workshop-specific chapters** - start with `workshops/`

## 🔄 Workflow

### Creating a New Workshop

1. Create workshop using the tool:
   ```bash
   ./shared/tools/create-workshop.sh "My Workshop"
   ```

2. The tool automatically generates an initial `workshop.config.json` from the template's frontmatter

3. Edit the frontmatter in `README.md` to customize your workshop

4. Sync whenever you make changes:
   ```bash
   ./shared/tools/sync-workshop-config.sh workshops/my-workshop
   ```

### Updating an Existing Workshop

1. Edit frontmatter in `README.md`
2. Run sync script
3. Done! Your `workshop.config.json` is updated

## 💡 Tips

### Quote Multi-line or Special Strings
```yaml
title: "Redis: The Complete Guide"  # Has colon, needs quotes
description: "This is a long description
that spans multiple lines"  # Multi-line, needs quotes
```

### Use Lists for Arrays
```yaml
tags:
  - redis
  - caching
  - beginner

prerequisites:
  - Basic command line knowledge
  - Docker installed
```

### Preserve Backup Files
The script creates `workshop.config.json.backup` before overwriting. Keep these for safety until you verify the new config works.

### Validate After Syncing
The sync script generates JSON, but always validate your workshop:
```bash
./shared/tools/validate-workshop.sh workshops/my-workshop
```

## 🎯 Example: Full Workflow

```bash
# 1. Create workshop
./shared/tools/create-workshop.sh "Redis Caching Patterns"

# 2. Edit README.md frontmatter
cd workshops/redis-caching-patterns
# Edit the file to add your metadata

# 3. Sync config from README
cd ../..
./shared/tools/sync-workshop-config.sh workshops/redis-caching-patterns

# 4. Validate
./shared/tools/validate-workshop.sh workshops/redis-caching-patterns

# 5. Add workshop content
# Edit workshops/redis-caching-patterns/README.md below the frontmatter

# 6. Update frontmatter as needed and re-sync
./shared/tools/sync-workshop-config.sh workshops/redis-caching-patterns
```

## 🚀 Benefits

1. **Single Source of Truth** - README.md contains all metadata
2. **User-Friendly** - YAML is easier than JSON
3. **Auto-Validation** - Script checks required fields
4. **Safe** - Backs up existing config automatically
5. **Consistent** - All workshops use the same format
6. **Updatable** - Easy to modify and re-generate

## 🔧 Troubleshooting

### "No frontmatter found"
Make sure your README.md starts with `---` and has a closing `---`:
```markdown
---
workshopId: my-id
...
---

# Workshop Title
```

### "Missing required field"
Check that you have all required fields:
- workshopId, version, title, description, duration, difficulty

### YAML Syntax Errors
- Use quotes around strings with special characters
- Ensure proper indentation (2 spaces)
- Don't use tabs
- Validate YAML online if needed

### Config Not Updating
- Check that frontmatter is properly formatted
- Ensure you're running the script from repo root
- Look for error messages in the output

## 📚 See Also

- [Workshop Creation Guide](workshop-creation-guide.md)
- [Chapter Authoring Guide](chapter-authoring-guide.md)
- [YAML Specification](https://yaml.org/spec/1.2.2/)
