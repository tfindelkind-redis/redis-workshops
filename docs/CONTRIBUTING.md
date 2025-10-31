# Contributing to Redis Workshops

Thank you for your interest in contributing to the Redis Workshops repository! This document provides guidelines for contributing new workshops, chapters, and improvements.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Creating Workshops](#creating-workshops)
- [Creating Chapters](#creating-chapters)
- [Updating Existing Content](#updating-existing-content)
- [Submitting Changes](#submitting-changes)
- [Style Guidelines](#style-guidelines)

## 🤝 Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## 🚀 How to Contribute

There are several ways to contribute:

1. **Create new workshops** - Design complete learning experiences
2. **Create new chapters** - Add reusable learning modules
3. **Improve existing content** - Fix errors, clarify instructions, add examples
4. **Report issues** - Point out bugs, unclear instructions, or errors
5. **Suggest enhancements** - Propose new features or improvements

## 🎨 Creating Workshops

### Quick Start

Use our automation tool:

```bash
./shared/tools/create-workshop.sh "Your Workshop Name"
```

This creates a workshop structure from the template.

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
5. **Reuse Chapters**: Reference existing chapters when possible

See [Workshop Creation Guide](workshop-creation-guide.md) for detailed instructions.

## 📚 Creating Chapters

### Quick Start

Use our automation tool:

```bash
./shared/tools/create-chapter.sh "Your Chapter Name"
```

This creates a chapter structure from the template.

### Chapter Structure

A chapter should include:

```
shared/chapters/chapter-XX-name/
├── README.md                           # Chapter content
├── .chapter-metadata.json              # Metadata
├── scripts/
│   ├── setup.sh                       # Setup script
│   ├── cleanup.sh                     # Cleanup script
│   ├── demo.sh                        # Demo script
│   └── solutions/
│       └── exercise-*.sh              # Exercise solutions
├── assets/                            # Images, diagrams
└── answers.md                         # Knowledge check answers
```

### Chapter Guidelines

1. **Self-Contained**: Each chapter should work independently
2. **Clear Objectives**: State what learners will achieve
3. **Estimated Time**: Provide realistic time estimates (30-90 minutes)
4. **Hands-On Exercises**: Include at least 2-3 practical exercises
5. **Knowledge Checks**: Add quiz questions to reinforce learning
6. **Versioning**: Update version and changelog for changes

See [Chapter Authoring Guide](chapter-authoring-guide.md) for detailed instructions.

## 🔄 Updating Existing Content

### Chapter Updates

When updating a shared chapter:

1. **Update version number** in `.chapter-metadata.json`
2. **Add changelog entry** with date and changes
3. **Test thoroughly** - chapters are used by multiple workshops
4. **Update lastUpdated** field
5. **Consider backward compatibility**

### Workshop Updates

When updating a workshop:

1. Update version in `workshop.config.json`
2. Add changelog entry
3. Test the entire workshop flow
4. Update any chapter references if needed

## 📤 Submitting Changes

### Pull Request Process

1. **Fork** the repository
2. **Create a branch** for your changes
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following our guidelines
4. **Test thoroughly**
   ```bash
   ./shared/tools/validate-workshop.sh workshops/your-workshop
   ```
5. **Commit with clear messages**
   ```bash
   git commit -m "Add chapter on Redis Streams"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request** with:
   - Clear description of changes
   - Why the changes are needed
   - Any testing performed

### Review Process

- Maintainers will review your PR
- Address any feedback or requested changes
- Once approved, your contribution will be merged

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
