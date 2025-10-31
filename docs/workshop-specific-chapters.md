# Workshop-Specific Chapters Guide

This guide explains how to create chapters that exist only within a specific workshop, rather than in the shared chapters library.

## 📋 When to Use Workshop-Specific Chapters

Use workshop-specific chapters when:

- ✅ Content is highly specific to this workshop's narrative
- ✅ Building a unique project that won't be reused
- ✅ Experimenting with content before promoting to shared
- ✅ The chapter tightly couples with workshop-specific code/assets
- ✅ Content is too niche for general reuse

Use **shared chapters** when:

- ✅ Content teaches general Redis concepts
- ✅ Multiple workshops could benefit from it
- ✅ Content is standalone and reusable
- ✅ You want centralized updates across workshops

## 📁 Structure

Workshop-specific chapters live in the workshop's `chapters/` directory:

```
workshops/your-workshop/
├── README.md
├── workshop.config.json
├── setup.sh
├── chapters/                          # Workshop-specific chapters
│   ├── workshop-chapter-01/
│   │   ├── README.md
│   │   ├── scripts/
│   │   │   ├── setup.sh
│   │   │   ├── cleanup.sh
│   │   │   └── solutions/
│   │   └── assets/
│   └── workshop-chapter-02/
│       └── ...
└── assets/                            # Workshop-level assets
```

## 🚀 Creating a Workshop-Specific Chapter

### Option 1: Manual Creation

1. **Create the chapter directory**:
   ```bash
   mkdir -p workshops/your-workshop/chapters/workshop-chapter-name
   cd workshops/your-workshop/chapters/workshop-chapter-name
   ```

2. **Copy the template**:
   ```bash
   cp -r ../../../../shared/templates/chapter-template/* .
   ```

3. **Customize the chapter** (edit README.md, scripts, etc.)

### Option 2: Use the Creation Script (Enhanced)

```bash
# Create a workshop-specific chapter
./shared/tools/create-chapter.sh "Chapter Name" --workshop="your-workshop"
```

> Note: The enhanced script (see below) will create the chapter in the workshop folder

## ⚙️ Referencing Workshop-Specific Chapters

Update your `workshop.config.json` to reference both shared and workshop-specific chapters:

```json
{
  "workshopId": "your-workshop",
  "chapters": [
    {
      "order": 1,
      "chapterRef": "shared/chapters/chapter-01-getting-started",
      "required": true,
      "type": "shared"
    },
    {
      "order": 2,
      "chapterRef": "workshops/your-workshop/chapters/workshop-chapter-name",
      "required": true,
      "type": "workshop-specific"
    },
    {
      "order": 3,
      "chapterRef": "shared/chapters/chapter-03-advanced",
      "required": true,
      "type": "shared"
    }
  ]
}
```

## 🎯 Best Practices

### Naming Convention

- **Shared chapters**: `chapter-XX-descriptive-name`
- **Workshop-specific**: `workshop-chapter-descriptive-name` or just `chapter-name`

### When to Promote to Shared

Consider promoting a workshop-specific chapter to shared when:

1. Another workshop could use it
2. The content is general enough
3. It's well-tested and polished
4. Community feedback is positive

### Promotion Process

```bash
# 1. Move the chapter
mv workshops/your-workshop/chapters/chapter-name \
   shared/chapters/chapter-XX-new-name

# 2. Update workshop.config.json
# Change: "workshops/your-workshop/chapters/chapter-name"
# To: "shared/chapters/chapter-XX-new-name"

# 3. Update chapter metadata
# Add proper versioning, tags, etc.

# 4. Test in original workshop

# 5. Document in shared chapters
```

## 📊 Hybrid Workshop Example

Here's a complete example of a workshop mixing shared and workshop-specific chapters:

```json
{
  "workshopId": "redis-chat-app",
  "title": "Building a Redis Chat Application",
  "chapters": [
    {
      "order": 1,
      "chapterRef": "shared/chapters/chapter-01-getting-started",
      "required": true,
      "type": "shared",
      "customizations": {
        "additionalNotes": "Focus on basic commands"
      }
    },
    {
      "order": 2,
      "chapterRef": "shared/chapters/chapter-05-pubsub",
      "required": true,
      "type": "shared"
    },
    {
      "order": 3,
      "chapterRef": "workshops/redis-chat-app/chapters/building-chat-backend",
      "required": true,
      "type": "workshop-specific",
      "customizations": {
        "additionalNotes": "This chapter builds the core chat functionality"
      }
    },
    {
      "order": 4,
      "chapterRef": "workshops/redis-chat-app/chapters/adding-frontend",
      "required": true,
      "type": "workshop-specific"
    },
    {
      "order": 5,
      "chapterRef": "shared/chapters/chapter-12-deployment",
      "required": false,
      "type": "shared"
    }
  ]
}
```

## ✅ Validation

The `validate-workshop.sh` tool checks both shared and workshop-specific chapter references:

```bash
./shared/tools/validate-workshop.sh workshops/your-workshop
```

Output will show:
```
✅ Shared chapter exists: shared/chapters/chapter-01-getting-started
✅ Workshop chapter exists: workshops/your-workshop/chapters/workshop-chapter-name
```

## 🔄 Migration Strategy

If you have existing workshop content to migrate:

1. **Identify chapters** that should remain workshop-specific
2. **Create chapter directories** in `workshops/your-workshop/chapters/`
3. **Move content** to appropriate chapter folders
4. **Update references** in `workshop.config.json`
5. **Test** the complete workshop flow

## 📝 Documentation

When creating workshop-specific chapters:

- Document why the chapter is workshop-specific (in README)
- Note if it might be promoted to shared later
- Keep the same quality standards as shared chapters
- Include proper setup/cleanup scripts

## 🎓 Summary

You can now:
- ✅ Create chapters specific to one workshop
- ✅ Mix shared and workshop-specific chapters
- ✅ Reference both types in workshop.config.json
- ✅ Promote workshop chapters to shared when appropriate
- ✅ Validate both types of chapter references

This gives you maximum flexibility while maintaining the benefits of shared, centralized chapters!

---

**Last Updated:** 2025-10-31
