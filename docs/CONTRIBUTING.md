# Contributing to Redis Workshops

Thank you for your interest in contributing to the Redis Workshops repository! This document provides guidelines for contributing new workshops, modules, and improvements.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Creating Workshops](#creating-workshops)
- [Creating Modules](#creating-modules)
- [Updating Existing Content](#updating-existing-content)
- [Submitting Changes](#submitting-changes)
- [Style Guidelines](#style-guidelines)

## 🤝 Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## 🚀 How to Contribute

There are several ways to contribute:

1. **Create new workshops** - Design complete learning experiences
2. **Create new modules** - Add reusable learning units
3. **Improve existing content** - Fix errors, clarify instructions, add examples
4. **Report issues** - Point out bugs, unclear instructions, or errors
5. **Suggest enhancements** - Propose new features or improvements

## 🎨 Creating Workshops

### Quick Start

Use our automation tool that **automatically creates a new branch** for your workshop:

```bash
./shared/tools/create-workshop.sh "Your Workshop Name"
```

**What this does:**
- ✅ Creates a new branch: `workshop/your-workshop-name`
- ✅ Generates workshop structure from template
- ✅ Sets up initial README.md with frontmatter
- ✅ Auto-generates workshop.config.json

**Important:** You are now on a new branch! All your workshop work should be done on this branch before creating a Pull Request.

### Workshop Development Workflow

1. **Create workshop** (automatically creates branch)
   ```bash
   ./shared/tools/create-workshop.sh "Your Workshop Name"
   ```

2. **Edit workshop content**
   ```bash
   cd workshops/your-workshop-name
   # Edit README.md frontmatter and content
   ```

3. **Sync configuration**
   ```bash
   ./shared/tools/sync-workshop-config.sh workshops/your-workshop-name
   ```

4. **Validate workshop**
   ```bash
   ./shared/tools/validate-workshop.sh workshops/your-workshop-name
   ```

5. **Commit changes**
   ```bash
   git add workshops/your-workshop-name
   git commit -m "Add Your Workshop Name workshop"
   ```

6. **Push and create Pull Request**
   ```bash
   git push -u origin workshop/your-workshop-name
   # Then create a PR on GitHub to merge into main
   ```

### Workshop Structure

A workshop should include:

```
workshops/your-workshop/
├── README.md                    # Main workshop guide
├── workshop.config.json         # Workshop configuration
├── setup.sh                     # Setup script
└── assets/                      # Workshop-specific resources
```

### Workshop Guidelines

1. **Clear Learning Path**: Define clear objectives and prerequisites
2. **Appropriate Duration**: Aim for 2-6 hours total
3. **Hands-On Focus**: Include practical exercises
4. **Progressive Difficulty**: Build from simple to complex
5. **Reuse Modules**: Reference existing modules when possible

See [Workshop Creation Guide](workshop-creation-guide.md) for detailed instructions.

## 📚 Creating Modules

### Quick Start

Use our automation tool:

```bash
./shared/tools/create-module.sh "Your Module Name"
```

This creates a module structure from the template.

### Module Structure

A module should include:

```
shared/modules/module-name/
├── module.yaml                        # Module metadata
├── content/
│   └── module-name.md                # Module content
├── scripts/
│   ├── setup.sh                      # Setup script
│   ├── cleanup.sh                    # Cleanup script
│   ├── demo.sh                       # Demo script
│   └── solutions/
│       └── exercise-*.sh             # Exercise solutions
├── assets/                           # Images, diagrams
└── answers.md                        # Knowledge check answers
```

### Module Guidelines

1. **Self-Contained**: Each module should work independently
2. **Clear Objectives**: State what learners will achieve
3. **Estimated Time**: Provide realistic time estimates (30-90 minutes)
4. **Hands-On Exercises**: Include at least 2-3 practical exercises
5. **Knowledge Checks**: Add quiz questions to reinforce learning
6. **Versioning**: Update version and changelog for changes

See [Module Authoring Guide](module-authoring-guide.md) for detailed instructions.

## 🔄 Updating Existing Content

### Module Updates

When updating a shared module:

1. **Update version number** in `module.yaml`
2. **Add changelog entry** with date and changes
3. **Test thoroughly** - modules are used by multiple workshops
4. **Update last_updated** field
5. **Consider backward compatibility**

### Workshop Updates

When updating a workshop:

1. Update version in `workshop.config.json`
2. Add changelog entry
3. Test the entire workshop flow
4. Update any module references if needed

## 📤 Submitting Changes

### Pull Request Process

**For New Workshops:**

The `create-workshop.sh` script automatically creates a branch for you:

```bash
./shared/tools/create-workshop.sh "Your Workshop Name"
# Automatically creates branch: workshop/your-workshop-name
```

Then follow the workflow:

1. **Develop your workshop** on the created branch
2. **Edit README.md** frontmatter and content
3. **Sync configuration**
   ```bash
   ./shared/tools/sync-workshop-config.sh workshops/your-workshop-name
   ```
4. **Validate workshop**
   ```bash
   ./shared/tools/validate-workshop.sh workshops/your-workshop-name
   ```
5. **Commit changes**
   ```bash
   git add workshops/your-workshop-name
   git commit -m "Add Your Workshop Name workshop"
   ```
6. **Push to GitHub**
   ```bash
   git push -u origin workshop/your-workshop-name
   ```
7. **Create Pull Request** on GitHub
   - Title: `Add workshop: Your Workshop Name`
   - Description: Workshop overview, objectives, target audience
   - Complete the PR checklist

**For Modules, Updates, or Fixes:**

1. **Create a branch** for your changes
   ```bash
   git checkout -b module/your-module-name
   # or
   git checkout -b fix/description
   ```
2. **Make your changes** following our guidelines
3. **Test thoroughly**
   ```bash
   ./shared/tools/validate-workshop.sh workshops/affected-workshop
   ```
4. **Commit with clear messages**
   ```bash
   git commit -m "Add module: Redis Streams basics"
   ```
5. **Push to GitHub**
   ```bash
   git push -u origin module/your-module-name
   ```
6. **Open a Pull Request** with:
   - Clear description of changes
   - Why the changes are needed
   - Any testing performed

### Branch Naming Convention

- **New Workshops:** `workshop/workshop-id` (auto-created by script)
- **New Chapters:** `chapter/chapter-name`
- **Updates:** `update/workshop-or-chapter-name`
- **Fixes:** `fix/brief-description`
- **Features:** `feature/brief-description`

### PR Title Format

- **New Workshop:** `Add workshop: Workshop Name`
- **New Chapter:** `Add chapter: Chapter Name`
- **Update:** `Update: Workshop/Chapter Name - Description`
- **Fix:** `Fix: Brief description of issue`

### PR Checklist

Before submitting, ensure:

- [ ] README.md frontmatter is complete
- [ ] All chapters listed in frontmatter (comma-separated)
- [ ] Ran sync script: `./shared/tools/sync-workshop-config.sh`
- [ ] Ran validation: `./shared/tools/validate-workshop.sh`
- [ ] Navigation links work correctly
- [ ] All scripts tested and executable
- [ ] No sensitive data committed
- [ ] Markdown properly formatted
- [ ] No broken links

### Review Process

- Maintainers will review your PR within 2-3 business days
- Address any feedback or requested changes
- Once approved, your contribution will be merged to `main`
- Your workshop will automatically deploy to GitHub Pages

## 📝 Style Guidelines

### Markdown Style

- Use proper heading hierarchy (h1 → h2 → h3)
- Include code examples with language tags
- Use emojis consistently for section headers
- Keep line length reasonable for readability

### Code Style

**Shell Scripts:**
- Use `#!/bin/bash` shebang
- Include `set -e` for error handling
- Add comments explaining complex logic
- Use descriptive variable names
- Make scripts executable (`chmod +x`)

**Redis Commands:**
- Use UPPERCASE for Redis commands
- Include expected output
- Add explanatory comments

### Content Guidelines

1. **Clear and Concise**: Write clearly, avoid jargon
2. **Inclusive Language**: Use welcoming, inclusive language
3. **Code Examples**: Test all code examples
4. **Error Handling**: Include troubleshooting sections
5. **Resources**: Link to official documentation

### File Naming

- Workshops: `workshop-name` (lowercase, hyphens)
- Chapters: `chapter-XX-descriptive-name` (numbered, lowercase, hyphens)
- Scripts: `descriptive-name.sh` (lowercase, hyphens)

## ✅ Quality Checklist

Before submitting, verify:

- [ ] All code examples work correctly
- [ ] Scripts are tested and executable
- [ ] Links are valid and work
- [ ] Spelling and grammar checked
- [ ] Metadata files updated (version, changelog)
- [ ] README includes all required sections
- [ ] Workshop/chapter validated with tools
- [ ] Assets (images, diagrams) are included
- [ ] Solutions provided for exercises

## 🐛 Reporting Issues

When reporting issues:

1. Use the issue template
2. Provide clear reproduction steps
3. Include environment details (OS, Redis version)
4. Add screenshots if helpful

## 💡 Suggesting Features

Feature suggestions are welcome! Please:

1. Check existing issues first
2. Describe the use case
3. Explain the benefits
4. Consider implementation complexity

## 📧 Questions?

If you have questions about contributing:

- Open an issue for discussion
- Review existing documentation
- Contact the maintainers

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for helping make Redis learning more accessible! 🎓
