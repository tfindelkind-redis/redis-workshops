# ✨ Introducing: README Frontmatter Auto-Config

## What Changed?

**You asked:** "The part where I need to update the workshop.config.json is really not user friendly. So is there no easy way to write only in the README.md and than let a script make sure the config is valid?"

**Answer:** YES! I've implemented exactly that! 🎉

## What You Get

### Before (Manual JSON Editing)
```bash
# Create workshop
./shared/tools/create-workshop.sh "My Workshop"

# Manually edit JSON (error-prone!)
vi workshops/my-workshop/workshop.config.json

# Hope you got the syntax right...
```

### After (Frontmatter Magic)
```bash
# Create workshop
./shared/tools/create-workshop.sh "My Workshop"

# Edit user-friendly YAML in README.md
vi workshops/my-workshop/README.md

# Auto-generate config
./shared/tools/sync-workshop-config.sh workshops/my-workshop

# Done! Config is perfect and validated ✅
```

## How It Works

### 1. Add Frontmatter to README.md

At the very top of your workshop's `README.md`:

```markdown
---
workshopId: redis-caching
version: 1.0.0
title: "Redis Caching Patterns"
description: "Learn advanced caching patterns"
duration: 4 hours
difficulty: intermediate
tags:
  - redis
  - caching
  - performance
prerequisites:
  - Basic Redis knowledge
  - Command line proficiency
learningObjectives:
  - Implement cache-aside pattern
  - Build read-through caches
  - Master cache invalidation
chapters:
  - chapter: shared/chapters/chapter-01-getting-started
    required: true
  - chapter: workshops/redis-caching/chapters/cache-patterns
    required: false
author: Your Name
---

# Redis Caching Patterns

Your workshop content starts here...
```

### 2. Run Sync Command

```bash
./shared/tools/sync-workshop-config.sh workshops/redis-caching
```

**Output:**
```
ℹ Extracting frontmatter from README.md...
✓ Frontmatter extracted
ℹ Parsing YAML and generating JSON...
✓ Config generated
⚠ Backed up existing config to workshop.config.json.backup
✓ Generated: workshop.config.json

ℹ Workshop Configuration Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Workshop ID: redis-caching
  Title: Redis Caching Patterns
  Version: 1.0.0
  Difficulty: intermediate
  Chapters: 2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Workshop config synchronized successfully!
```

### 3. Perfect JSON Generated

The script creates a perfectly formatted `workshop.config.json`:

```json
{
  "workshopId": "redis-caching",
  "version": "1.0.0",
  "title": "Redis Caching Patterns",
  "description": "Learn advanced caching patterns",
  "duration": "4 hours",
  "difficulty": "intermediate",
  "tags": ["redis", "caching", "performance"],
  "chapters": [
    {
      "order": 1,
      "chapterRef": "shared/chapters/chapter-01-getting-started",
      "required": true,
      "type": "shared"
    },
    {
      "order": 2,
      "chapterRef": "workshops/redis-caching/chapters/cache-patterns",
      "required": false,
      "type": "workshop-specific"
    }
  ],
  "prerequisites": ["Basic Redis knowledge", "Command line proficiency"],
  "learningObjectives": [
    "Implement cache-aside pattern",
    "Build read-through caches",
    "Master cache invalidation"
  ],
  "author": "Your Name",
  "lastUpdated": "2025-10-31",
  "repository": "https://github.com/tfindelkind-redis/redis-workshops"
}
```

## Files Created

### 1. `sync-workshop-config.sh`
**Location:** `shared/tools/sync-workshop-config.sh`

Main script that:
- Extracts YAML frontmatter from README.md
- Validates required fields
- Converts YAML to JSON
- Backs up existing config
- Generates workshop.config.json
- Shows summary

### 2. `yaml-to-config.py`
**Location:** `shared/tools/yaml-to-config.py`

Python helper that:
- Parses YAML safely
- Validates all required fields
- Processes chapters (detects shared vs workshop-specific)
- Generates properly formatted JSON
- Adds auto-calculated fields (lastUpdated, etc.)

### 3. Documentation
**Location:** `docs/README-FRONTMATTER.md`

Complete guide covering:
- Why frontmatter is better
- Required vs optional fields
- YAML syntax examples
- Full workflow examples
- Troubleshooting tips

### 4. Updated Website
**Location:** `docs/create-workshop.html`

Updated the GitHub Pages guide to show:
- New frontmatter-based workflow
- Copy-paste examples
- Simplified step-by-step instructions

## Benefits

✅ **User-Friendly** - YAML is much easier than JSON  
✅ **Single Source** - README.md contains all metadata  
✅ **Auto-Validated** - Script checks required fields  
✅ **Safe** - Auto-backs up existing config  
✅ **Consistent** - Enforces proper structure  
✅ **Up-to-date** - Auto-adds lastUpdated field  
✅ **Type-Safe** - Auto-detects chapter types  

## Example Workflow

```bash
# 1. Create workshop (auto-generates initial config from template)
./shared/tools/create-workshop.sh "Redis Performance Tuning"

# 2. Edit README.md frontmatter
cd workshops/redis-performance-tuning
vi README.md  # Edit YAML frontmatter at top

# 3. Sync config (run from repo root)
cd ../..
./shared/tools/sync-workshop-config.sh workshops/redis-performance-tuning

# 4. Validate everything
./shared/tools/validate-workshop.sh workshops/redis-performance-tuning

# 5. Add more content to README.md, update frontmatter, re-sync
vi workshops/redis-performance-tuning/README.md
./shared/tools/sync-workshop-config.sh workshops/redis-performance-tuning
```

## Integration with Existing Tools

### create-workshop.sh
Updated to automatically run sync after creating workshop, so you get a valid config immediately.

### Workshop Template
Updated `shared/templates/workshop-template/README.md` to include example frontmatter.

### GitHub Pages Website
Updated creation guide to show the new simplified workflow.

## Real Example

I've already updated `workshops/redis-fundamentals/README.md` with frontmatter and generated its config successfully!

```bash
$ ./shared/tools/sync-workshop-config.sh workshops/redis-fundamentals
ℹ Extracting frontmatter from README.md...
✓ Frontmatter extracted
ℹ Parsing YAML and generating JSON...
✓ Config generated
✓ Generated: workshop.config.json
✓ Workshop config synchronized successfully!
```

## Key Points

1. **You never need to manually edit JSON** - just edit YAML in README.md
2. **Config is auto-validated** - script checks all required fields
3. **Safe updates** - existing config is backed up automatically
4. **One command** - `sync-workshop-config.sh` does everything
5. **Works with existing workshops** - add frontmatter to any README.md

## Documentation

- **Full Guide:** `docs/README-FRONTMATTER.md`
- **Tool Help:** `./shared/tools/sync-workshop-config.sh` (no args shows usage)
- **Website Guide:** `docs/create-workshop.html` (updated with new workflow)

---

**Bottom Line:** You asked for a way to avoid manual JSON editing. Now you have it! Just write YAML frontmatter in README.md and run one command. The config file is automatically generated, validated, and formatted perfectly. 🎉
