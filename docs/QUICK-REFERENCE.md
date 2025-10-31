# Redis Workshops - Quick Reference

Quick reference for common tasks in the Redis Workshops repository.

## 🚀 Quick Start

### For Workshop Participants

```bash
# List available workshops
./shared/tools/list-workshops.sh

# Start a workshop
cd workshops/redis-fundamentals
./setup.sh

# Follow the README.md for the workshop
```

### For Workshop Authors

```bash
# Create a new workshop
./shared/tools/create-workshop.sh "My Workshop Name"

# Create a new chapter
./shared/tools/create-chapter.sh "Chapter Topic"

# List available chapters
./shared/tools/list-chapters.sh

# Validate a workshop
./shared/tools/validate-workshop.sh workshops/my-workshop
```

## 📁 Repository Structure

```
redis-workshops/
├── README.md                       # Main repository overview
├── workshops/                      # Individual workshops
│   └── workshop-name/
│       ├── README.md              # Workshop guide
│       ├── workshop.config.json   # Configuration
│       ├── setup.sh               # Setup script
│       └── assets/                # Workshop assets
├── shared/
│   ├── chapters/                  # Reusable chapters
│   │   └── chapter-XX-name/
│   │       ├── README.md         # Chapter content
│   │       ├── scripts/          # Setup, demo, solutions
│   │       ├── assets/           # Images, diagrams
│   │       └── .chapter-metadata.json
│   ├── tools/                     # Automation scripts
│   │   ├── create-workshop.sh
│   │   ├── create-chapter.sh
│   │   ├── validate-workshop.sh
│   │   ├── list-workshops.sh
│   │   └── list-chapters.sh
│   └── templates/                 # Templates
│       ├── workshop-template/
│       └── chapter-template/
└── docs/                          # Documentation
    ├── CONTRIBUTING.md
    ├── workshop-creation-guide.md
    └── chapter-authoring-guide.md
```

## 🛠️ Common Commands

### Workshop Management

```bash
# Create workshop
./shared/tools/create-workshop.sh "Workshop Name"

# Validate workshop
./shared/tools/validate-workshop.sh workshops/workshop-name

# List all workshops
./shared/tools/list-workshops.sh
```

### Chapter Management

```bash
# Create shared chapter
./shared/tools/create-chapter.sh "Chapter Name"

# Create workshop-specific chapter
./shared/tools/create-chapter.sh "Chapter Name" --workshop="workshop-name"

# List all chapters
./shared/tools/list-chapters.sh

# Test chapter scripts
cd shared/chapters/chapter-XX-name
./scripts/setup.sh
./scripts/demo.sh
./scripts/cleanup.sh
```

### Running Workshops

```bash
# Setup workshop environment
cd workshops/workshop-name
./setup.sh

# Run chapter setup
cd ../../shared/chapters/chapter-XX-name
./scripts/setup.sh

# Complete exercises
./scripts/solutions/exercise-1.sh

# Clean up after chapter
./scripts/cleanup.sh
```

## 📝 File Templates

### workshop.config.json

```json
{
  "workshopId": "workshop-name",
  "version": "1.0.0",
  "title": "Workshop Title",
  "description": "Brief description",
  "duration": "X hours",
  "difficulty": "beginner|intermediate|advanced",
  "chapters": [
    {
      "order": 1,
      "chapterRef": "shared/chapters/chapter-XX-name",
      "required": true,
      "customizations": {
        "skipSections": [],
        "additionalNotes": ""
      }
    }
  ],
  "prerequisites": [],
  "learningObjectives": [],
  "workshopSpecificAssets": "assets/",
  "lastUpdated": "YYYY-MM-DD",
  "authors": [{"name": "Name", "email": "email"}],
  "changelog": [{"version": "1.0.0", "date": "YYYY-MM-DD", "changes": []}]
}
```

### .chapter-metadata.json

```json
{
  "chapterId": "chapter-XX-name",
  "version": "1.0.0",
  "title": "Chapter Title",
  "description": "Brief description",
  "estimatedMinutes": 60,
  "difficulty": "beginner|intermediate|advanced",
  "tags": ["redis", "topic"],
  "prerequisites": [],
  "lastUpdated": "YYYY-MM-DD",
  "authors": [{"name": "Name", "email": "email"}],
  "changelog": [{"version": "1.0.0", "date": "YYYY-MM-DD", "changes": []}]
}
```

## 🎯 Best Practices

### Chapter Design
- ✅ Keep chapters 30-90 minutes
- ✅ Make them self-contained
- ✅ Include hands-on exercises
- ✅ Provide solutions
- ✅ Add troubleshooting sections

### Workshop Design
- ✅ Define clear objectives
- ✅ Estimate time realistically
- ✅ Reuse existing chapters
- ✅ Build progressively
- ✅ Include final project

### Content Quality
- ✅ Test all code examples
- ✅ Provide expected outputs
- ✅ Include troubleshooting
- ✅ Link to documentation
- ✅ Add visual aids

## 🔧 Troubleshooting

### Scripts not executable
```bash
chmod +x script-name.sh
```

### Redis not running
```bash
# Start Redis
redis-server

# Or as background process
redis-server --daemonize yes

# Verify
redis-cli ping
```

### JSON validation failed
```bash
# Validate JSON with jq
jq empty file.json

# Pretty print
jq . file.json
```

## 📚 Resources

### Documentation
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [workshop-creation-guide.md](workshop-creation-guide.md) - Workshop authoring
- [chapter-authoring-guide.md](chapter-authoring-guide.md) - Chapter authoring
- [workshop-specific-chapters.md](workshop-specific-chapters.md) - Workshop-specific chapters

### External Links
- [Redis Documentation](https://redis.io/docs/)
- [Redis Commands](https://redis.io/commands/)
- [Redis University](https://university.redis.com/)

## 🤝 Getting Help

1. Check the documentation in `docs/`
2. Review existing workshops and chapters
3. Run validation tools
4. Open an issue for questions

## 📧 Contact

[Add contact information or community links]

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-31
