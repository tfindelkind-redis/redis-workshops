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
### After (Frontmatter)
```yaml
---
workshopId: my-workshop
title: My Workshop
description: Learn amazing things
duration: 4 hours
difficulty: intermediate
chapters: shared/chapters/chapter-01-getting-started
---

# My Workshop

Content starts here...
```
✅ Simple key-value pairs (no indentation needed!)  
✅ Auto-validates and converts to JSON  
✅ Single source of truth (README.md)  
✅ Auto-syncs when you run the script  
✅ **Only 5 required fields!**  
✅ Tags, repository URL auto-generated  
✅ **Chapters as comma-separated list**

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
title: Redis Advanced Patterns
description: Master advanced Redis patterns for production
duration: 6 hours
difficulty: advanced
chapters: shared/chapters/chapter-01-getting-started, workshops/redis-advanced-patterns/chapters/caching-strategies
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

### ✅ Required Fields (Only 5!)

#### `workshopId` - Unique identifier
- **Format:** `lowercase-with-hyphens-only`
- **Rules:**
  - ✅ Only lowercase letters (a-z)
  - ✅ Numbers (0-9)
  - ✅ Hyphens (-)
  - ❌ NO spaces
  - ❌ NO uppercase
  - ❌ NO special characters (@, _, !, etc.)
- **Example:** `redis-fundamentals`, `redis-streams-2025`
- **Error if invalid:** The sync script will show helpful error messages

#### `title` - Workshop title
- Human-readable name
- Can contain spaces, capitals, any characters
- **Example:** `Redis Fundamentals Workshop`

#### `description` - Brief description
- One or two sentences describing the workshop
- **Example:** `Introduction to Redis through hands-on exercises`

#### `duration` - Estimated time
- Include unit (hours, minutes, days)
- **Example:** `4 hours`, `90 minutes`, `2 days`

#### `difficulty` - Difficulty level
- **Must be one of:** `beginner`, `intermediate`, `advanced`
- **Case-insensitive** (but use lowercase for consistency)
- **Error if invalid:** Sync script will show valid options

### 📋 Chapters (Simple!)
- `chapters` - Comma-separated list of chapter paths

**Format:** Just list them separated by commas!
```yaml
chapters: shared/chapters/chapter-01, workshops/my-workshop/chapters/custom-chapter
```

Or for a single chapter:
```yaml
chapters: shared/chapters/chapter-01-getting-started
```

### 🔧 Optional Fields
- `version` - Semantic version (defaults to "1.0.0" if not specified)
- `author` - Your name or team name

### 🤖 Auto-Generated Fields
These are automatically created - don't add them to your frontmatter:
- `tags` - Auto-generated from title and difficulty
- `repository` - Auto-generated from workshopId
- `lastUpdated` - Auto-set to current date
- `prerequisites` - Can be written in README content instead
- `learningObjectives` - Can be written in README content instead
- `required` flag for chapters - All chapters are marked as required automatically
- `order` - Automatically numbered based on list order
- `type` - Auto-detected (shared vs workshop-specific)

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

### Minimal Frontmatter
Keep it simple! Only 6 lines needed:
```yaml
---
workshopId: my-workshop
title: My Workshop Title
description: What this workshop teaches
duration: 4 hours
difficulty: beginner
chapters: shared/chapters/chapter-01-getting-started
---
```

### Multiple Chapters
Just separate with commas:
```yaml
chapters: shared/chapters/chapter-01, shared/chapters/chapter-02, workshops/my-workshop/chapters/custom
```

**No spaces in indentation to worry about!** ✨

### Everything Else is Auto-Generated
- **Tags**: Extracted from your title and difficulty
- **Repository URL**: Built from your workshopId
- **Version**: Defaults to 1.0.0 (can override if needed)
- **Last Updated**: Automatically set to current date
- **Chapter Order/Type**: Auto-detected from paths

## ⚠️ Validation & Error Messages

The sync script validates your frontmatter and shows helpful errors:

### Common Validation Errors

**❌ Spaces in workshopId:**
```
Error: workshopId cannot contain spaces. Use hyphens instead: 'my workshop' → 'my-workshop'
```
**Fix:** Use hyphens: `workshopId: my-workshop`

---

**❌ Uppercase in workshopId:**
```
Error: workshopId must be lowercase: 'MyWorkshop' → 'myworkshop'
```
**Fix:** Use lowercase: `workshopId: myworkshop`

---

**❌ Invalid characters:**
```
Error: workshopId can only contain lowercase letters, numbers, and hyphens: 'my_workshop@2025'
```
**Fix:** Only use a-z, 0-9, and hyphens: `workshopId: my-workshop-2025`

---

**❌ Invalid difficulty:**
```
Error: difficulty must be one of: beginner, intermediate, advanced
```
**Fix:** Use one of the valid values: `difficulty: intermediate`

---

**❌ Missing required field:**
```
Error: Missing required field: description
```
**Fix:** Add the missing field to your frontmatter

### Valid Format Example

```yaml
---
workshopId: redis-streams-2025        # ✅ lowercase, hyphens only
title: Redis Streams Workshop         # ✅ any format
description: Learn Redis Streams      # ✅ any text
duration: 3 hours                     # ✅ include unit
difficulty: intermediate              # ✅ one of: beginner/intermediate/advanced
chapters: shared/chapters/chapter-01  # ✅ comma-separated paths
---
```
- **Last Updated**: Always set to today's date
- **Chapter order**: Numbered in the order you list them
- **Chapter type**: Auto-detected from path
- **Required flag**: All chapters marked as required

### Prerequisites & Learning Objectives
Instead of frontmatter, just write them in your README content:
```markdown
## 📚 Prerequisites
- Basic command line knowledge
- Docker installed

## 🎯 Learning Objectives
- Learn Redis basics
- Build a cache
```

This is more readable and easier to maintain!

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
- [Module Authoring Guide](module-authoring-guide.md) (coming soon)
- [YAML Specification](https://yaml.org/spec/1.2.2/)
