# Pull Request Workflow for Redis Workshops

This document explains the branch and Pull Request workflow for contributing workshops to the Redis Workshops repository.

## 🌿 Overview

All new workshops and significant changes **must go through a Pull Request** before merging to `main`. This ensures:

- ✅ Code review and quality control
- ✅ Validation before deployment
- ✅ Collaborative feedback
- ✅ Clean commit history
- ✅ Automatic deployment to GitHub Pages

## 🎨 Creating a New Workshop

### Automatic Branch Creation

When you create a new workshop, the script **automatically creates a branch** for you:

```bash
./shared/tools/create-workshop.sh "My Workshop Name"
```

**What happens:**
1. ✅ Creates branch: `workshop/my-workshop-name`
2. ✅ Switches to the new branch
3. ✅ Generates workshop structure
4. ✅ Creates initial files from templates

You are now on a **feature branch** - all your work should be committed here.

### Development Workflow

```bash
# 1. Create workshop (auto-creates branch)
./shared/tools/create-workshop.sh "My Workshop Name"

# 2. You're now on branch: workshop/my-workshop-name
# Edit your workshop content
cd workshops/my-workshop-name
# Edit README.md frontmatter and content

# 3. Sync configuration from frontmatter
./shared/tools/sync-workshop-config.sh workshops/my-workshop-name

# 4. Validate your work
./shared/tools/validate-workshop.sh workshops/my-workshop-name

# 5. Commit changes
git add workshops/my-workshop-name
git commit -m "Add My Workshop Name workshop"

# 6. Push to GitHub
git push -u origin workshop/my-workshop-name

# 7. Create Pull Request on GitHub
# Go to: https://github.com/tfindelkind-redis/redis-workshops
# Click "Compare & pull request"
```

## 📖 Adding Chapters to Your Workshop

### Workshop-Specific Chapters

```bash
# While on your workshop branch
./shared/tools/create-chapter.sh "Chapter Name" --workshop="my-workshop-name"

# Add to frontmatter in README.md
# chapters: ..., workshops/my-workshop-name/chapters/chapter-name

# Sync and commit
./shared/tools/sync-workshop-config.sh workshops/my-workshop-name
git add workshops/my-workshop-name
git commit -m "Add Chapter Name chapter"
git push
```

### Using Shared Chapters

```bash
# Just add to frontmatter (no creation needed)
# chapters: shared/chapters/chapter-01-getting-started, ...

# Sync and commit
./shared/tools/sync-workshop-config.sh workshops/my-workshop-name
git add workshops/my-workshop-name
git commit -m "Add shared chapter to workshop"
git push
```

## 🔍 Pull Request Guidelines

### PR Title Format

```
Add workshop: My Workshop Name
```

### PR Description Template

```markdown
## Workshop Details
- **Name:** My Workshop Name
- **Duration:** 3 hours
- **Difficulty:** Intermediate
- **Workshop ID:** my-workshop-name

## Description
Brief description of what the workshop covers, target audience, and key learning outcomes.

## Changes
- Created new workshop structure
- Added X chapters covering Y topics
- Included hands-on exercises and knowledge checks
- Added navigation between chapters

## Testing
- [x] All chapters tested end-to-end
- [x] Scripts run successfully
- [x] Validation passes
- [x] Navigation links work

## Checklist
- [x] README.md frontmatter complete
- [x] All chapters listed in frontmatter
- [x] workshop.config.json synced
- [x] Validation successful
- [x] Navigation tested
- [x] Scripts executable
- [x] No sensitive data
```

### Pre-Submission Checklist

Before creating your PR:

- [ ] ✅ Frontmatter fields complete and accurate
- [ ] ✅ Chapters added to frontmatter (comma-separated)
- [ ] ✅ Ran sync: `./shared/tools/sync-workshop-config.sh`
- [ ] ✅ Ran validation: `./shared/tools/validate-workshop.sh`
- [ ] ✅ All navigation links work
- [ ] ✅ Code snippets tested
- [ ] ✅ Scripts executable and tested
- [ ] ✅ No broken links
- [ ] ✅ No typos or grammar errors
- [ ] ✅ Assets in correct directories
- [ ] ✅ No sensitive information committed

## 👀 Review Process

### Timeline

- **Initial Review:** 2-3 business days
- **Follow-up Reviews:** 1-2 business days
- **Merge:** After approval from maintainer(s)

### What Reviewers Check

1. **Content Quality**
   - Clear learning objectives
   - Appropriate difficulty level
   - Good structure and pacing
   - Accurate technical information

2. **Technical Correctness**
   - Valid frontmatter syntax
   - Correct chapter paths
   - Working scripts and commands
   - Proper Redis usage

3. **Documentation**
   - Complete README.md
   - Clear instructions
   - Working navigation
   - Troubleshooting sections

4. **Best Practices**
   - Uses templates correctly
   - Auto-sync for configs (no manual JSON)
   - Proper git workflow
   - Clean commits

### Addressing Feedback

When reviewers request changes:

```bash
# Make changes on your branch
# Edit files as requested

# Sync if frontmatter changed
./shared/tools/sync-workshop-config.sh workshops/my-workshop-name

# Re-validate
./shared/tools/validate-workshop.sh workshops/my-workshop-name

# Commit and push
git add .
git commit -m "Address review feedback: description"
git push

# PR updates automatically - no need to create new PR
```

## 🚀 After Merge

Once your PR is merged to `main`:

1. ✅ **Automatic deployment** to GitHub Pages
2. ✅ Workshop appears on website within minutes
3. ✅ Workshop available to all users
4. ✅ You can delete your feature branch

```bash
# Switch back to main
git checkout main
git pull

# Delete your feature branch (optional)
git branch -d workshop/my-workshop-name
git push origin --delete workshop/my-workshop-name
```

## 🔄 Updating Existing Workshops

For updates to existing workshops:

```bash
# Create update branch
git checkout main
git pull
git checkout -b update/workshop-name-description

# Make changes
cd workshops/workshop-name
# Edit files

# Sync and validate
./shared/tools/sync-workshop-config.sh workshops/workshop-name
./shared/tools/validate-workshop.sh workshops/workshop-name

# Commit and push
git add workshops/workshop-name
git commit -m "Update: description of changes"
git push -u origin update/workshop-name-description

# Create PR with title: "Update: Workshop Name - Description"
```

## 🌿 Branch Naming Convention

| Type | Branch Name | Example |
|------|-------------|---------|
| New Workshop | `workshop/{id}` | `workshop/redis-fundamentals` |
| New Chapter | `chapter/{name}` | `chapter/redis-streams` |
| Update | `update/{description}` | `update/fix-chapter-links` |
| Fix | `fix/{description}` | `fix/typo-in-readme` |
| Feature | `feature/{description}` | `feature/search-functionality` |

## ❌ Common Mistakes to Avoid

1. ❌ **Don't commit directly to `main`**
   - Always work on a feature branch
   - The script creates the branch automatically

2. ❌ **Don't manually edit `workshop.config.json`**
   - Edit README.md frontmatter
   - Run sync script to generate config

3. ❌ **Don't forget to sync before committing**
   - Always run sync after frontmatter changes
   - Config file must match frontmatter

4. ❌ **Don't skip validation**
   - Run validation before pushing
   - Fix all issues before creating PR

5. ❌ **Don't create large PRs**
   - One workshop per PR
   - Break large changes into smaller PRs

## 🆘 Getting Help

If you encounter issues:

1. **Check Documentation**
   - `docs/workshop-creation-guide.md`
   - `docs/CONTRIBUTING.md`
   - `docs/README-FRONTMATTER.md`

2. **GitHub Issues**
   - Search existing issues
   - Create new issue if needed

3. **PR Comments**
   - Ask questions in your PR
   - Reviewers will help

## 📋 Quick Reference

```bash
# Complete workflow in one view

# 1. Create workshop (auto-creates branch)
./shared/tools/create-workshop.sh "My Workshop"

# 2. Edit content
cd workshops/my-workshop
# Edit README.md

# 3. Add chapters
./shared/tools/create-chapter.sh "Chapter" --workshop="my-workshop"
# Add to frontmatter: chapters: path1, path2

# 4. Sync & validate
./shared/tools/sync-workshop-config.sh workshops/my-workshop
./shared/tools/validate-workshop.sh workshops/my-workshop

# 5. Commit & push
git add workshops/my-workshop
git commit -m "Add My Workshop"
git push -u origin workshop/my-workshop

# 6. Create PR on GitHub

# 7. Address feedback
# Make changes, sync, commit, push

# 8. After merge
git checkout main
git pull
git branch -d workshop/my-workshop
```

## ✅ Success Criteria

Your PR is ready when:

- ✅ All validation checks pass
- ✅ Navigation works correctly
- ✅ Scripts tested and executable
- ✅ No broken links
- ✅ Frontmatter complete
- ✅ Config synced
- ✅ Clean commit history
- ✅ PR description complete

Thank you for contributing to Redis Workshops! 🎉
