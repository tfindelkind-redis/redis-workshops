# Workshop Creation Guide

This guide walks you through creating a new workshop for the Redis Workshops repository.

## 📋 Overview

A workshop is a structured learning experience that guides participants through multiple chapters to achieve specific learning objectives. Workshops combine existing shared chapters and add workshop-specific context and exercises.

## 🎯 Planning Your Workshop

Before creating a workshop, consider:

### 1. Target Audience
- **Skill Level**: Beginner, intermediate, or advanced?
- **Background**: What should participants know beforehand?
- **Goals**: What will they be able to do after completing it?

### 2. Learning Objectives
Define 3-5 clear, measurable objectives:
- ✅ Good: "Build a Redis-powered caching layer for a web application"
- ❌ Bad: "Learn about Redis"

### 3. Duration
- **Short workshops**: 2-3 hours (2-4 chapters)
- **Medium workshops**: 4-6 hours (4-6 chapters)
- **Long workshops**: Full day (6-8 chapters)

### 4. Chapter Selection
- Review available chapters: `./shared/tools/list-chapters.sh`
- Identify gaps and create new chapters as needed
- Ensure logical progression

## 🚀 Creating Your Workshop

### Step 1: Use the Creation Tool

```bash
./shared/tools/create-workshop.sh "Your Workshop Name"
```

This creates:
```
workshops/your-workshop-name/
├── README.md
├── workshop.config.json
├── setup.sh
└── assets/
```

### Step 2: Customize README.md

Edit `workshops/your-workshop-name/README.md`:

1. **Update the header** with duration and difficulty
2. **Write the overview** - What makes this workshop unique?
3. **Define learning objectives** - Be specific and measurable
4. **List prerequisites** - What knowledge/tools are needed?
5. **Add chapter descriptions** - Brief intro for each chapter
6. **Describe the project** - What will participants build?

#### Example Structure

```markdown
# Building a Redis-Powered Chat Application

**Duration:** 4 hours
**Difficulty:** Intermediate
**Prerequisites:** Basic Python, understanding of web applications

## 📋 Overview

Build a real-time chat application using Redis Pub/Sub, Lists, and Hashes...

## 🎯 Learning Objectives

- Implement real-time messaging with Redis Pub/Sub
- Store chat history using Redis Lists
- Manage user sessions with Redis Hashes
- Deploy a Redis-backed application

## 📚 Prerequisites

- Python 3.8+ installed
- Basic understanding of web development
- Familiarity with command-line tools
```

### Step 3: Configure workshop.config.json

Edit `workshops/your-workshop-name/workshop.config.json`:

```json
{
  "workshopId": "redis-chat-app",
  "version": "1.0.0",
  "title": "Building a Redis-Powered Chat Application",
  "description": "Build a real-time chat application using Redis",
  "duration": "4 hours",
  "difficulty": "intermediate",
  "tags": ["redis", "pubsub", "real-time", "python"],
  "chapters": [
    {
      "order": 1,
      "chapterRef": "shared/chapters/chapter-01-getting-started",
      "required": true,
      "customizations": {
        "skipSections": [],
        "additionalNotes": "Focus on Pub/Sub commands"
      }
    },
    {
      "order": 2,
      "chapterRef": "shared/chapters/chapter-05-pubsub",
      "required": true,
      "customizations": {
        "skipSections": ["advanced-patterns"],
        "additionalNotes": "Complete all exercises before moving on"
      }
    }
  ],
  "prerequisites": [
    "Python 3.8+",
    "Basic web development knowledge"
  ],
  "learningObjectives": [
    "Implement real-time messaging with Redis Pub/Sub",
    "Store chat history using Redis Lists",
    "Manage user sessions with Redis Hashes"
  ],
  "workshopSpecificAssets": "assets/",
  "lastUpdated": "2025-10-31",
  "authors": [
    {
      "name": "Your Name",
      "email": "your.email@example.com"
    }
  ],
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2025-10-31",
      "changes": ["Initial release"]
    }
  ]
}
```

#### Configuration Options

- **chapterRef**: Path to shared chapter (relative to repo root)
- **required**: Whether chapter must be completed
- **customizations**:
  - `skipSections`: Array of section titles to skip
  - `additionalNotes`: Workshop-specific guidance

### Step 4: Create Setup Script

Edit `workshops/your-workshop-name/setup.sh`:

```bash
#!/bin/bash

set -e

WORKSHOP_NAME="Building a Redis-Powered Chat Application"
echo "🚀 Setting up: $WORKSHOP_NAME"

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found"
    exit 1
fi
echo "✅ Python $(python3 --version)"

# Check Redis
if ! command -v redis-cli &> /dev/null; then
    echo "❌ Redis not found"
    exit 1
fi
echo "✅ Redis found"

# Install Python dependencies
if [ -f "requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    pip3 install -r requirements.txt
fi

echo "✅ Setup complete!"
```

### Step 5: Add Workshop-Specific Assets

Create assets in `workshops/your-workshop-name/assets/`:

- Architecture diagrams
- Reference code
- Configuration files
- Sample data

### Step 6: Test Your Workshop

```bash
# Validate structure
./shared/tools/validate-workshop.sh workshops/your-workshop-name

# Test setup script
cd workshops/your-workshop-name
./setup.sh

# Walk through each chapter
# Complete all exercises
# Verify solutions work
```

## 📚 Best Practices

### 1. Leverage Shared Chapters

- Reuse existing chapters when possible
- Create new chapters for unique content
- Chapters should be reusable by other workshops

### 2. Provide Context

Each chapter reference should include:
- Why this chapter matters for the workshop
- What participants should focus on
- How it connects to the final project

### 3. Progressive Complexity

Structure your workshop to build skills gradually:
1. Foundation concepts
2. Core techniques
3. Advanced patterns
4. Real-world application

### 4. Include Checkpoints

Add verification steps:
- Knowledge checks after each chapter
- Milestone projects
- Code reviews
- Final assessment

### 5. Workshop-Specific Materials

Create supplementary materials:
- Starter code templates
- Reference implementations
- Troubleshooting guides
- Extension challenges

## 🎨 Workshop Patterns

### Pattern 1: Project-Based Workshop

Build a complete application:
- Chapter 1-2: Foundations
- Chapter 3-5: Core features
- Chapter 6-7: Advanced features
- Chapter 8: Deployment

### Pattern 2: Concept-Focused Workshop

Deep dive into specific topics:
- Each chapter covers one concept
- Heavy emphasis on exercises
- Progressive difficulty
- Capstone project

### Pattern 3: Scenario-Based Workshop

Solve real-world problems:
- Introduction to scenario
- Chapters present solutions
- Compare approaches
- Optimize implementation

## ✅ Pre-Release Checklist

Before publishing your workshop:

- [ ] All chapter references are valid
- [ ] README is complete and clear
- [ ] workshop.config.json is properly formatted
- [ ] Setup script works on clean environment
- [ ] All exercises have been tested
- [ ] Solutions are provided and work
- [ ] Estimated times are accurate
- [ ] Assets are included and referenced
- [ ] Workshop validated with tools
- [ ] Peer reviewed (if possible)

## 📝 Updating Workshops

When updating a workshop:

1. Increment version number
2. Add changelog entry
3. Update lastUpdated date
4. Re-test entire workshop
5. Update any dependent documentation

### Version Guidelines

- **Patch (1.0.x)**: Typo fixes, clarifications
- **Minor (1.x.0)**: New content, chapter additions
- **Major (x.0.0)**: Restructuring, major changes

## 🔍 Quality Standards

Your workshop should:

- ✅ Have clear, achievable objectives
- ✅ Include hands-on exercises
- ✅ Provide working code examples
- ✅ Estimate time accurately
- ✅ Include troubleshooting guidance
- ✅ Reference official documentation
- ✅ Be tested end-to-end

## 📧 Getting Help

- Review existing workshops for examples
- Check the [Chapter Authoring Guide](chapter-authoring-guide.md)
- See [CONTRIBUTING.md](CONTRIBUTING.md)
- Open an issue for questions

---

Happy workshop creating! 🎓
