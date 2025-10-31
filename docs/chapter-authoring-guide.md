# Chapter Authoring Guide

This guide provides detailed instructions for creating high-quality, reusable chapter content for Redis workshops.

## 📋 Overview

Chapters are the building blocks of workshops. A well-written chapter:
- Is **self-contained** and can work independently
- Is **reusable** across multiple workshops
- Provides **hands-on learning** through exercises
- Includes **comprehensive resources** (scripts, solutions, assets)

## 🎯 Chapter Planning

### 1. Define the Scope

Ask yourself:
- **What specific topic** does this chapter cover?
- **What will learners be able to do** after completing it?
- **How long** should it realistically take? (30-90 minutes)
- **What skill level** is required?

### 2. Determine Prerequisites

List what learners should know or have:
- Previous chapters (if any)
- Technical knowledge
- Tools or software
- Access to Redis instance

### 3. Create Learning Objectives

Write 3-5 specific, measurable objectives:

✅ Good objectives:
- "Execute basic Redis string operations (SET, GET, DEL)"
- "Implement data expiration using TTL and EXPIRE"
- "Design a simple caching strategy"

❌ Vague objectives:
- "Understand Redis"
- "Learn about data types"

## 🚀 Creating Your Chapter

### Step 1: Use the Creation Tool

```bash
./shared/tools/create-chapter.sh "Your Chapter Name"
```

This automatically:
- Assigns the next chapter number
- Creates the directory structure
- Copies template files
- Sets up scripts

### Step 2: Structure Your README.md

A chapter README should follow this structure:

```markdown
# Chapter XX: [Title]

**Estimated Time:** XX minutes
**Difficulty:** Beginner | Intermediate | Advanced
**Version:** 1.0.0
**Last Updated:** YYYY-MM-DD

## 📋 Overview
Brief 2-3 sentence description

## 🎯 Learning Objectives
- Objective 1
- Objective 2
- Objective 3

## 📚 Prerequisites
- Prerequisite 1
- Prerequisite 2

## 🛠️ Setup
Setup instructions and script usage

## 📖 Chapter Content
Main teaching content with sections

## 🧪 Practice Exercises
Hands-on exercises

## ✅ Knowledge Check
Quiz questions

## 🔗 Resources
Scripts, links, assets

## 🐛 Troubleshooting
Common issues and solutions

## 🎓 Summary
Key takeaways

## ➡️ Next Steps
What to do next

## 📝 Changelog
Version history
```

### Step 3: Write Engaging Content

#### Overview Section
- Start with the "why" - why is this topic important?
- Provide context - how does it fit into the bigger picture?
- Keep it brief but motivating

#### Teaching Sections
For each concept:

1. **Explain the concept** clearly
2. **Show an example** with code
3. **Explain the example** line by line if complex
4. **Provide expected output**
5. **Add context** on when to use it

Example:

```markdown
### Section 1: Understanding Redis Lists

Redis Lists are ordered collections of strings. They're perfect for:
- Message queues
- Activity feeds
- Recent items lists

#### Adding Items to a List

Use LPUSH to add items to the left (head) of the list:

\`\`\`bash
# Add items to a task queue
redis-cli LPUSH tasks "Send email"
redis-cli LPUSH tasks "Process payment"
redis-cli LPUSH tasks "Update inventory"
\`\`\`

**Expected Output:**
\`\`\`
(integer) 1
(integer) 2
(integer) 3
\`\`\`

The numbers indicate the current length of the list.
```

#### Hands-On Exercises

Create exercises that:
- Reinforce concepts just learned
- Build on each other
- Have clear instructions
- Include solutions

Example:

```markdown
### Exercise 1: User Activity Feed

**Objective:** Build an activity feed using Redis Lists

**Instructions:**
1. Create a list for user activities with key `user:100:activities`
2. Add three activities: "logged in", "viewed profile", "updated settings"
3. Retrieve the 2 most recent activities
4. Check the total number of activities

**Hints:**
- Use LPUSH to add items
- Use LRANGE to retrieve items
- Use LLEN to count items

**Solution:** See `scripts/solutions/exercise-1.sh`
```

### Step 4: Create Supporting Scripts

#### setup.sh

```bash
#!/bin/bash

set -e

CHAPTER_NAME="Your Chapter Name"
echo "🚀 Setting up environment for: $CHAPTER_NAME"

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v redis-cli &> /dev/null; then
    echo "❌ redis-cli not found"
    exit 1
fi

# Verify Redis connection
if ! redis-cli ping &> /dev/null; then
    echo "❌ Cannot connect to Redis"
    exit 1
fi

# Create working directory
mkdir -p ./workspace

# Initialize data if needed
redis-cli SET chapter:setup "complete"

echo "✅ Setup complete!"
```

#### cleanup.sh

```bash
#!/bin/bash

set -e

echo "🧹 Cleaning up resources..."

# Remove workspace
rm -rf ./workspace

# Clean Redis data
redis-cli DEL chapter:setup
# Add pattern-based cleanup as needed

echo "✅ Cleanup complete!"
```

#### demo.sh

Create a script that demonstrates key concepts:

```bash
#!/bin/bash

set -e

echo "🎬 Demonstration: Redis Lists"
echo ""

echo "Step 1: Create a list"
redis-cli LPUSH demo:list "item1"
redis-cli LPUSH demo:list "item2"
redis-cli LPUSH demo:list "item3"

echo ""
echo "Step 2: View the list"
redis-cli LRANGE demo:list 0 -1

echo ""
echo "Step 3: Get list length"
redis-cli LLEN demo:list

# Cleanup
redis-cli DEL demo:list
```

#### Solution Scripts

Create a solution for each exercise:

```bash
#!/bin/bash
# Solution for Exercise 1: User Activity Feed

set -e

echo "Running Exercise 1 Solution"

# Step 1: Create list
redis-cli LPUSH user:100:activities "logged in"
redis-cli LPUSH user:100:activities "viewed profile"
redis-cli LPUSH user:100:activities "updated settings"

# Step 2: Get recent activities
echo "Most recent activities:"
redis-cli LRANGE user:100:activities 0 1

# Step 3: Count activities
echo "Total activities:"
redis-cli LLEN user:100:activities

echo "✅ Exercise complete!"
```

### Step 5: Add Knowledge Checks

Include 3-5 quiz questions with answers:

```markdown
## ✅ Knowledge Check

1. Which command adds items to the left of a Redis list?
   - [ ] RPUSH
   - [x] LPUSH
   - [ ] LADD
   - [ ] LINSERT

2. What does LRANGE list 0 -1 return?
   - [ ] The first item
   - [ ] The last item
   - [x] All items in the list
   - [ ] Items in reverse order

**Answers:** See `answers.md`
```

Create `answers.md`:

```markdown
# Knowledge Check Answers

## Question 1
**Correct Answer:** LPUSH

**Explanation:** LPUSH adds items to the left (head) of the list. 
RPUSH adds to the right (tail).

## Question 2
**Correct Answer:** All items in the list

**Explanation:** The range 0 to -1 means from the first item 
to the last item, returning the entire list.
```

### Step 6: Update Metadata

Edit `.chapter-metadata.json`:

```json
{
  "chapterId": "chapter-05-lists",
  "version": "1.0.0",
  "title": "Working with Redis Lists",
  "description": "Learn to use Redis Lists for queues, feeds, and collections",
  "estimatedMinutes": 60,
  "difficulty": "intermediate",
  "tags": ["redis", "lists", "data-structures"],
  "prerequisites": ["chapter-01-getting-started"],
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

### Step 7: Add Assets

Create visual aids in `assets/`:
- Architecture diagrams
- Flow charts
- Screenshots
- Reference images

Reference them in your README:

```markdown
![List Operations](assets/list-operations.png)
```

## 📚 Best Practices

### Content Writing

1. **Use active voice**: "You will build..." not "It will be built..."
2. **Be conversational**: Write like you're teaching a friend
3. **Provide context**: Explain the "why" not just the "how"
4. **Use examples**: Real-world scenarios help understanding
5. **Break it down**: Small, digestible sections

### Code Examples

1. **Test everything**: Every command should be tested
2. **Show output**: Include expected results
3. **Add comments**: Explain non-obvious code
4. **Use realistic data**: Meaningful examples stick better
5. **Format consistently**: Use proper syntax highlighting

### Exercises

1. **Progressive difficulty**: Start simple, build complexity
2. **Clear instructions**: Step-by-step, numbered lists
3. **Provide hints**: Not full solutions, but guidance
4. **Create solutions**: Working code in scripts
5. **Verify learning**: Exercises should prove understanding

### Technical Details

1. **Version compatibility**: Note any Redis version requirements
2. **Error handling**: Show how to handle common errors
3. **Best practices**: Teach the right way from the start
4. **Performance notes**: Mention performance implications
5. **Security considerations**: Highlight security best practices

## ✅ Quality Checklist

Before finalizing your chapter:

- [ ] All code examples tested and work
- [ ] Scripts are executable and error-free
- [ ] Estimated time is realistic (test with someone)
- [ ] Prerequisites are clearly listed
- [ ] Learning objectives are specific and measurable
- [ ] Exercises have working solutions
- [ ] Knowledge checks have answer explanations
- [ ] Troubleshooting section addresses common issues
- [ ] Resources section includes useful links
- [ ] Metadata file is complete and accurate
- [ ] Assets are included and properly referenced
- [ ] Changelog is up to date
- [ ] Content is proofread for errors

## 🔄 Updating Chapters

When updating a chapter:

1. **Increment version appropriately**:
   - Patch (1.0.x): Typos, clarifications
   - Minor (1.x.0): New sections, exercises
   - Major (x.0.0): Restructuring, major changes

2. **Update changelog**:
   ```json
   {
     "version": "1.1.0",
     "date": "2025-11-15",
     "changes": [
       "Added exercise on sorted sets",
       "Improved troubleshooting section",
       "Updated Redis 7.0 compatibility notes"
     ]
   }
   ```

3. **Update lastUpdated** date

4. **Test thoroughly** - other workshops depend on this

5. **Consider backward compatibility**

## 🎨 Chapter Templates

### Basic Concept Chapter
- Introduction to a Redis feature
- Core commands and operations
- Simple exercises
- 30-45 minutes

### Hands-On Project Chapter
- Build something functional
- Multiple interconnected exercises
- Real-world application
- 60-90 minutes

### Advanced Patterns Chapter
- Complex use cases
- Performance optimization
- Production considerations
- 60-75 minutes

## 📧 Getting Help

- Review existing chapters for examples
- Check [CONTRIBUTING.md](CONTRIBUTING.md)
- Ask questions in issues
- Request peer review

---

Happy chapter authoring! 📚
