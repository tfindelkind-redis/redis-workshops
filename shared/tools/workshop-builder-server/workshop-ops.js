/**
 * Workshop File Operations Module
 * Handles reading/writing workshop files and parsing frontmatter
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { repoRoot } = require('./git-ops');

const workshopsDir = path.join(repoRoot, 'workshops');

/**
 * Parse frontmatter from markdown content
 * @param {string} content - Markdown content with frontmatter
 * @returns {object} { frontmatter: object, content: string }
 */
function parseFrontmatter(content) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
        return { frontmatter: null, content };
    }
    
    try {
        const frontmatter = yaml.load(match[1]);
        const markdownContent = match[2];
        return { frontmatter, content: markdownContent };
    } catch (error) {
        throw new Error(`Failed to parse frontmatter YAML: ${error.message}`);
    }
}

/**
 * Build frontmatter string from object
 * @param {object} frontmatter - Frontmatter object
 * @returns {string} YAML frontmatter string with delimiters
 */
function buildFrontmatter(frontmatter) {
    try {
        const yamlContent = yaml.dump(frontmatter, {
            lineWidth: -1, // Don't wrap lines
            noRefs: true   // Don't use references
        });
        return `---\n${yamlContent}---\n`;
    } catch (error) {
        throw new Error(`Failed to build frontmatter YAML: ${error.message}`);
    }
}

/**
 * List all workshops in the workshops directory
 * @returns {Promise<Array>} Array of workshop objects
 */
async function listWorkshops() {
    try {
        const entries = await fs.readdir(workshopsDir, { withFileTypes: true });
        const workshops = [];
        
        for (const entry of entries) {
            if (entry.isDirectory() && !entry.name.startsWith('.')) {
                try {
                    const workshop = await getWorkshop(entry.name);
                    workshops.push(workshop);
                } catch (error) {
                    console.warn(`Skipping workshop ${entry.name}: ${error.message}`);
                }
            }
        }
        
        return workshops;
    } catch (error) {
        throw new Error(`Failed to list workshops: ${error.message}`);
    }
}

/**
 * Get a specific workshop by ID
 * @param {string} workshopId - Workshop ID (directory name)
 * @returns {Promise<object>} Workshop object with frontmatter and metadata
 */
async function getWorkshop(workshopId) {
    try {
        const workshopPath = path.join(workshopsDir, workshopId);
        const readmePath = path.join(workshopPath, 'README.md');
        
        // Check if directory exists
        try {
            await fs.access(workshopPath);
        } catch {
            throw new Error(`Workshop directory not found: ${workshopId}`);
        }
        
        // Read README.md
        let content;
        try {
            content = await fs.readFile(readmePath, 'utf-8');
        } catch {
            throw new Error(`README.md not found in workshop: ${workshopId}`);
        }
        
        // Parse frontmatter
        const { frontmatter, content: markdownContent } = parseFrontmatter(content);
        
        if (!frontmatter) {
            throw new Error(`No frontmatter found in workshop: ${workshopId}`);
        }
        
        // Parse chapters into array
        let modules = [];
        if (frontmatter.chapters) {
            if (Array.isArray(frontmatter.chapters)) {
                modules = frontmatter.chapters;
            } else {
                modules = frontmatter.chapters.split(',').map(m => m.trim()).filter(m => m);
            }
        }
        
        return {
            workshopId: frontmatter.workshopId || workshopId,
            title: frontmatter.title || workshopId,
            description: frontmatter.description || '',
            duration: frontmatter.duration || '',
            difficulty: frontmatter.difficulty || 'intermediate',
            modules,
            frontmatter,
            path: workshopPath
        };
    } catch (error) {
        throw new Error(`Failed to get workshop ${workshopId}: ${error.message}`);
    }
}

/**
 * Update a workshop's frontmatter
 * @param {string} workshopId - Workshop ID
 * @param {object} updates - Updated frontmatter fields
 * @returns {Promise<object>} Updated workshop object
 */
async function updateWorkshop(workshopId, updates) {
    try {
        const workshopPath = path.join(workshopsDir, workshopId);
        const readmePath = path.join(workshopPath, 'README.md');
        
        // Read current content
        const content = await fs.readFile(readmePath, 'utf-8');
        const { frontmatter, content: markdownContent } = parseFrontmatter(content);
        
        if (!frontmatter) {
            throw new Error(`No frontmatter found in workshop: ${workshopId}`);
        }
        
        // Merge updates
        const updatedFrontmatter = { ...frontmatter, ...updates };
        
        // Convert modules array to chapters string if modules provided
        if (updates.modules && Array.isArray(updates.modules)) {
            updatedFrontmatter.chapters = updates.modules.join(',');
            delete updatedFrontmatter.modules; // Don't store 'modules' in frontmatter
        }
        
        // Build new content
        const newFrontmatterString = buildFrontmatter(updatedFrontmatter);
        const newContent = newFrontmatterString + markdownContent;
        
        // Write back to file
        await fs.writeFile(readmePath, newContent, 'utf-8');
        
        // Return updated workshop
        return await getWorkshop(workshopId);
    } catch (error) {
        throw new Error(`Failed to update workshop ${workshopId}: ${error.message}`);
    }
}

/**
 * Create a new workshop
 * @param {object} workshopData - Workshop data
 * @returns {Promise<object>} Created workshop object
 */
async function createWorkshop(workshopData) {
    try {
        const { workshopId, title, description, duration, difficulty, modules } = workshopData;
        
        // Validate workshop ID
        if (!workshopId || !/^[a-z0-9-]+$/.test(workshopId)) {
            throw new Error('Invalid workshop ID. Use only lowercase letters, numbers, and hyphens.');
        }
        
        const workshopPath = path.join(workshopsDir, workshopId);
        
        // Check if workshop already exists
        try {
            await fs.access(workshopPath);
            throw new Error(`Workshop ${workshopId} already exists`);
        } catch (error) {
            if (error.message.includes('already exists')) throw error;
            // Directory doesn't exist, which is what we want
        }
        
        // Create workshop directory
        await fs.mkdir(workshopPath, { recursive: true });
        
        // Create chapters directory
        await fs.mkdir(path.join(workshopPath, 'chapters'), { recursive: true });
        
        // Build frontmatter
        const frontmatter = {
            workshopId,
            title: title || workshopId,
            description: description || 'Workshop description',
            duration: duration || '4 hours',
            difficulty: difficulty || 'intermediate',
            chapters: modules && modules.length > 0 ? modules.join(',') : ''
        };
        
        // Build README content
        const frontmatterString = buildFrontmatter(frontmatter);
        const template = `${frontmatterString}
# ${frontmatter.title}

**Duration:** ${frontmatter.duration}  
**Difficulty:** ${frontmatter.difficulty}

## 📋 Overview

${frontmatter.description}

## 🎯 Learning Objectives

By the end of this workshop, you will be able to:
- Objective 1
- Objective 2
- Objective 3

## 📚 Prerequisites

Before starting this workshop, you should:
- Have a GitHub account
- Have basic knowledge of Redis

## 🛠️ Setup

### Required Tools
- GitHub account (for forking)
- Web browser

### Getting Started

**⚠️ Important:** This workshop uses GitHub Codespaces - no local installation needed!

1. **Fork the repository**
   - Visit [redis-workshops on GitHub](https://github.com/tfindelkind-redis/redis-workshops)
   - Click the "Fork" button to create your personal copy

2. **Open in GitHub Codespaces**
   - Go to your forked repository
   - Click "Code" → "Codespaces" → "Create codespace on main"
   - Wait ~1 minute while the environment sets up

3. **Navigate to this workshop**
   \`\`\`bash
   cd workshops/${workshopId}
   \`\`\`

## 📖 Workshop Chapters

Complete these chapters in order. (Add chapters using the Workshop Builder GUI)

## 🏗️ Workshop Project

Throughout this workshop, you'll build and learn about Redis concepts.

## ✅ Completion Checklist

- [ ] Completed all chapters
- [ ] Built the final project
- [ ] Passed all knowledge checks

## 🎓 Next Steps

Continue your Redis learning journey with more workshops!
`;
        
        // Write README.md
        await fs.writeFile(path.join(workshopPath, 'README.md'), template, 'utf-8');
        
        // Return created workshop
        return await getWorkshop(workshopId);
    } catch (error) {
        throw new Error(`Failed to create workshop: ${error.message}`);
    }
}

/**
 * Delete a workshop
 * @param {string} workshopId - Workshop ID
 * @returns {Promise<void>}
 */
async function deleteWorkshop(workshopId) {
    try {
        const workshopPath = path.join(workshopsDir, workshopId);
        
        // Check if directory exists
        try {
            await fs.access(workshopPath);
        } catch {
            throw new Error(`Workshop not found: ${workshopId}`);
        }
        
        // Delete directory recursively
        await fs.rm(workshopPath, { recursive: true, force: true });
    } catch (error) {
        throw new Error(`Failed to delete workshop ${workshopId}: ${error.message}`);
    }
}

/**
 * Validate workshop ID format
 * @param {string} workshopId - Workshop ID to validate
 * @returns {boolean} True if valid
 */
function validateWorkshopId(workshopId) {
    return /^[a-z0-9-]+$/.test(workshopId);
}

module.exports = {
    listWorkshops,
    getWorkshop,
    updateWorkshop,
    createWorkshop,
    deleteWorkshop,
    validateWorkshopId,
    parseFrontmatter,
    buildFrontmatter
};
