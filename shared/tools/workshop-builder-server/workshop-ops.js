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
        
        // Parse modules/chapters into array
        let modules = [];
        
        console.log(`[getWorkshop] ${workshopId} - frontmatter.modules:`, frontmatter.modules);
        console.log(`[getWorkshop] ${workshopId} - frontmatter.chapters:`, frontmatter.chapters);
        
        // Priority: modules (array) > chapters (array) > chapters (string)
        if (frontmatter.modules) {
            console.log(`[getWorkshop] ${workshopId} - Found modules, type: ${typeof frontmatter.modules}, isArray: ${Array.isArray(frontmatter.modules)}`);
            if (Array.isArray(frontmatter.modules)) {
                modules = frontmatter.modules;
            } else if (typeof frontmatter.modules === 'string') {
                modules = frontmatter.modules.split(',').map(m => m.trim()).filter(m => m);
            }
        } else if (frontmatter.chapters) {
            console.log(`[getWorkshop] ${workshopId} - Found chapters, type: ${typeof frontmatter.chapters}, isArray: ${Array.isArray(frontmatter.chapters)}`);
            if (Array.isArray(frontmatter.chapters)) {
                modules = frontmatter.chapters;
            } else if (typeof frontmatter.chapters === 'string') {
                modules = frontmatter.chapters.split(',').map(m => m.trim()).filter(m => m);
            }
        }
        
        console.log(`[getWorkshop] ${workshopId} - Final modules array length:`, modules.length);
        
        return {
            workshopId: frontmatter.workshopId || workshopId,
            title: frontmatter.title || workshopId,
            description: frontmatter.description || '',
            duration: frontmatter.duration || frontmatter.estimatedTime || '',
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
        
        // Keep modules as an array in the frontmatter (modern format)
        // Keep it as-is if it's already provided
        if (updates.modules && Array.isArray(updates.modules)) {
            updatedFrontmatter.modules = updates.modules;
            // Remove old 'chapters' field if it exists
            delete updatedFrontmatter.chapters;
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

/**
 * Generate navigation header for a module
 * @param {object} options - Navigation options
 * @returns {string} Navigation markdown
 */
function generateModuleNavigation(options) {
    const { workshopTitle, workshopId, moduleName, moduleIndex, totalModules, prevModule, nextModule } = options;
    
    const progress = Math.round(((moduleIndex + 1) / totalModules) * 100);
    const progressBar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));
    
    let nav = `<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->\n\n`;
    
    // Top navigation bar with prev/next links
    nav += `<table width="100%">\n`;
    nav += `  <tr>\n`;
    nav += `    <td align="left" width="33%">\n`;
    
    if (prevModule) {
        nav += `      <a href="../${prevModule.folder}/README.md">⬅️ Previous<br/><small>${prevModule.name}</small></a>\n`;
    } else {
        nav += `      \n`;
    }
    
    nav += `    </td>\n`;
    nav += `    <td align="center" width="33%">\n`;
    nav += `      <a href="../README.md">🏠 Workshop Home</a>\n`;
    nav += `    </td>\n`;
    nav += `    <td align="right" width="33%">\n`;
    
    if (nextModule) {
        nav += `      <a href="../${nextModule.folder}/README.md">Next ➡️<br/><small>${nextModule.name}</small></a>\n`;
    } else {
        nav += `      \n`;
    }
    
    nav += `    </td>\n`;
    nav += `  </tr>\n`;
    nav += `</table>\n\n`;
    
    // Breadcrumb and progress
    nav += `[🏠 Workshop Home](../README.md) > **Module ${moduleIndex + 1} of ${totalModules}**\n\n`;
    nav += `### ${workshopTitle}\n\n`;
    nav += `**Progress:** \`${progressBar}\` ${progress}%\n\n`;
    nav += `---\n\n`;
    nav += `<!-- ✏️ EDIT YOUR CONTENT BELOW THIS LINE ✏️ -->\n\n`;
    
    return nav;
}

/**
 * Generate navigation footer for a module
 * @param {object} options - Navigation options
 * @returns {string} Navigation markdown
 */
function generateModuleFooter(options) {
    const { workshopId, moduleIndex, totalModules, prevModule, nextModule } = options;
    
    let footer = `\n\n<!-- ✏️ EDIT YOUR CONTENT ABOVE THIS LINE ✏️ -->\n\n`;
    footer += `---\n\n`;
    footer += `<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->\n\n`;
    footer += `## Navigation\n\n`;
    footer += `<table width="100%">\n`;
    footer += `  <tr>\n`;
    footer += `    <td align="left" width="33%">\n`;
    
    if (prevModule) {
        footer += `      <a href="../${prevModule.folder}/README.md">⬅️ Previous<br/>${prevModule.name}</a>\n`;
    } else {
        footer += `      \n`;
    }
    
    footer += `    </td>\n`;
    footer += `    <td align="center" width="33%">\n`;
    footer += `      <a href="../README.md">🏠 Workshop Home</a>\n`;
    footer += `    </td>\n`;
    footer += `    <td align="right" width="33%">\n`;
    
    if (nextModule) {
        footer += `      <a href="../${nextModule.folder}/README.md">Next ➡️<br/>${nextModule.name}</a>\n`;
    } else {
        footer += `      ✅ Workshop Complete!\n`;
    }
    
    footer += `    </td>\n`;
    footer += `  </tr>\n`;
    footer += `</table>\n\n`;
    footer += `---\n\n`;
    footer += `*Module ${moduleIndex + 1} of ${totalModules}*\n`;
    
    return footer;
}

/**
 * Create module directory with README
 * @param {string} workshopId - Workshop ID
 * @param {object} moduleData - Module data
 * @param {number} moduleIndex - Module index (0-based)
 * @param {number} totalModules - Total number of modules
 * @param {object} navOptions - Navigation options
 * @returns {Promise<void>}
 */
async function createModuleDirectory(workshopId, moduleData, moduleIndex, totalModules, navOptions) {
    try {
        const workshopPath = path.join(workshopsDir, workshopId);
        const folderName = `module-${String(moduleIndex + 1).padStart(2, '0')}-${moduleData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
        const modulePath = path.join(workshopPath, folderName);
        
        // Create module directory
        await fs.mkdir(modulePath, { recursive: true });
        
        // Generate navigation
        const header = generateModuleNavigation({
            ...navOptions,
            moduleName: moduleData.name,
            moduleIndex,
            totalModules
        });
        
        const footer = generateModuleFooter({
            workshopId,
            moduleIndex,
            totalModules,
            prevModule: navOptions.prevModule,
            nextModule: navOptions.nextModule
        });
        
        // Create module content
        const content = `${header}# ${moduleData.name}

**Duration:** ${moduleData.duration} minutes  
**Difficulty:** ${moduleData.difficulty}  
**Type:** ${moduleData.type}

## Overview

${moduleData.description}

## Learning Objectives

By the end of this module, you will be able to:
- Objective 1
- Objective 2
- Objective 3

## Content

Add your module content here...

### Section 1

Content for section 1...

### Section 2

Content for section 2...

## Hands-On Exercise

Add exercises here...

## Summary

Key takeaways from this module...

${footer}`;
        
        // Write README.md
        const readmePath = path.join(modulePath, 'README.md');
        await fs.writeFile(readmePath, content, 'utf-8');
        
        return { folderName, path: modulePath };
    } catch (error) {
        throw new Error(`Failed to create module directory: ${error.message}`);
    }
}

/**
 * Generate all module directories for a workshop
 * @param {string} workshopId - Workshop ID
 * @param {string} workshopTitle - Workshop title
 * @param {Array} modules - Array of module objects
 * @returns {Promise<Array>} Array of created module info
 */
async function generateModuleStructure(workshopId, workshopTitle, modules) {
    try {
        const createdModules = [];
        
        for (let i = 0; i < modules.length; i++) {
            const moduleData = modules[i];
            
            // Prepare navigation options
            const prevModule = i > 0 ? {
                name: modules[i - 1].name,
                folder: `module-${String(i).padStart(2, '0')}-${modules[i - 1].name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
            } : null;
            
            const nextModule = i < modules.length - 1 ? {
                name: modules[i + 1].name,
                folder: `module-${String(i + 2).padStart(2, '0')}-${modules[i + 1].name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
            } : null;
            
            const navOptions = {
                workshopTitle,
                workshopId,
                prevModule,
                nextModule
            };
            
            const moduleInfo = await createModuleDirectory(
                workshopId,
                moduleData,
                i,
                modules.length,
                navOptions
            );
            
            createdModules.push(moduleInfo);
        }
        
        return createdModules;
    } catch (error) {
        throw new Error(`Failed to generate module structure: ${error.message}`);
    }
}

/**
 * Update workshop README with module links
 * @param {string} workshopId - Workshop ID
 * @param {Array} modules - Array of module objects with folder names
 * @returns {Promise<void>}
 */
async function updateWorkshopWithModuleLinks(workshopId, modulesWithFolders) {
    try {
        const workshopPath = path.join(workshopsDir, workshopId);
        const readmePath = path.join(workshopPath, 'README.md');
        
        // Read current content
        const content = await fs.readFile(readmePath, 'utf-8');
        const { frontmatter, content: markdownContent } = parseFrontmatter(content);
        
        // Build module links section
        let moduleLinks = '\n\n## 📚 Workshop Modules\n\n';
        modulesWithFolders.forEach((module, index) => {
            moduleLinks += `### [Module ${index + 1}: ${module.name}](${module.folder}/README.md)\n\n`;
            moduleLinks += `**Duration:** ${module.duration} minutes | **Difficulty:** ${module.difficulty} | **Type:** ${module.type}\n\n`;
            moduleLinks += `${module.description}\n\n`;
        });
        
        // Update content
        const frontmatterString = buildFrontmatter(frontmatter);
        const newContent = frontmatterString + markdownContent + moduleLinks;
        
        await fs.writeFile(readmePath, newContent, 'utf-8');
    } catch (error) {
        throw new Error(`Failed to update workshop with module links: ${error.message}`);
    }
}

/**
 * Find all modules across all workshops
 * @returns {Promise<Array>} Array of module objects with metadata
 */
async function findAllModules() {
    try {
        const workshops = await listWorkshops();
        const allModules = [];
        
        for (const workshop of workshops) {
            const workshopPath = path.join(workshopsDir, workshop.workshopId);
            
            try {
                const entries = await fs.readdir(workshopPath, { withFileTypes: true });
                
                for (const entry of entries) {
                    // Match module directories: module-XX-name or module-XX
                    if (entry.isDirectory() && entry.name.match(/^module-\d{2}/)) {
                        const modulePath = path.join(workshopPath, entry.name);
                        const moduleYamlPath = path.join(modulePath, 'module.yaml');
                        const moduleReadmePath = path.join(modulePath, 'README.md');
                        
                        try {
                            // Read module.yaml if it exists
                            let moduleYaml = null;
                            try {
                                const yamlContent = await fs.readFile(moduleYamlPath, 'utf-8');
                                moduleYaml = yaml.load(yamlContent);
                            } catch {
                                // module.yaml doesn't exist, that's okay
                            }
                            
                            // Read README.md frontmatter
                            let moduleInfo = {
                                title: entry.name,
                                description: ''
                            };
                            
                            try {
                                const readmeContent = await fs.readFile(moduleReadmePath, 'utf-8');
                                const { frontmatter } = parseFrontmatter(readmeContent);
                                if (frontmatter) {
                                    moduleInfo.title = frontmatter.title || entry.name;
                                    moduleInfo.description = frontmatter.description || frontmatter.summary || '';
                                    moduleInfo.duration = frontmatter.duration || frontmatter.estimatedTime || '';
                                }
                            } catch {
                                // README.md doesn't exist or no frontmatter
                            }
                            
                            allModules.push({
                                workshopId: workshop.workshopId,
                                workshopTitle: workshop.title,
                                moduleDir: entry.name,
                                modulePath: path.relative(repoRoot, modulePath),
                                ...moduleInfo,
                                inheritance: moduleYaml?.inheritance || null,
                                hasYaml: moduleYaml !== null
                            });
                        } catch (error) {
                            console.warn(`Error reading module ${entry.name} in ${workshop.workshopId}: ${error.message}`);
                        }
                    }
                }
            } catch (error) {
                console.warn(`Error reading workshop ${workshop.workshopId}: ${error.message}`);
            }
        }
        
        return allModules;
    } catch (error) {
        throw new Error(`Failed to find all modules: ${error.message}`);
    }
}

/**
 * Find root (parent) modules
 * @returns {Promise<Array>} Array of root module objects
 */
async function findRootModules() {
    try {
        const allModules = await findAllModules();
        return allModules.filter(module => 
            module.inheritance && module.inheritance.isRoot === true
        );
    } catch (error) {
        throw new Error(`Failed to find root modules: ${error.message}`);
    }
}

/**
 * Find similar modules (potential duplicates) grouped by name pattern
 * @returns {Promise<Array>} Array of module groups with similar names
 */
async function findSimilarModules() {
    try {
        const allModules = await findAllModules();
        
        // Group modules by normalized name (remove module-XX- prefix)
        const groups = {};
        
        for (const module of allModules) {
            // Extract name after module-XX-
            const nameMatch = module.moduleDir.match(/^module-\d{2}-(.+)$/);
            const normalizedName = nameMatch ? nameMatch[1] : module.moduleDir;
            
            if (!groups[normalizedName]) {
                groups[normalizedName] = [];
            }
            
            groups[normalizedName].push(module);
        }
        
        // Filter to only groups with multiple modules
        const duplicateGroups = [];
        
        for (const [name, modules] of Object.entries(groups)) {
            if (modules.length > 1) {
                duplicateGroups.push({
                    name,
                    count: modules.length,
                    modules: modules.sort((a, b) => {
                        // Sort by: root first, then by workshop ID
                        if (a.inheritance?.isRoot && !b.inheritance?.isRoot) return -1;
                        if (!a.inheritance?.isRoot && b.inheritance?.isRoot) return 1;
                        return a.workshopId.localeCompare(b.workshopId);
                    })
                });
            }
        }
        
        return duplicateGroups.sort((a, b) => b.count - a.count);
    } catch (error) {
        throw new Error(`Failed to find similar modules: ${error.message}`);
    }
}

/**
 * Link a child module to a parent module
 * @param {string} childModulePath - Relative path to child module
 * @param {string} parentModulePath - Relative path to parent module
 * @returns {Promise<object>} Result object
 */
async function linkModuleToParent(childModulePath, parentModulePath) {
    try {
        const childFullPath = path.join(repoRoot, childModulePath);
        const childYamlPath = path.join(childFullPath, 'module.yaml');
        
        // Read or create module.yaml for child
        let childYaml = {};
        try {
            const yamlContent = await fs.readFile(childYamlPath, 'utf-8');
            childYaml = yaml.load(yamlContent) || {};
        } catch {
            // File doesn't exist, create new
        }
        
        // Update inheritance
        childYaml.inheritance = {
            isRoot: false,
            parentPath: parentModulePath,
            inheritedAt: new Date().toISOString(),
            customizations: childYaml.inheritance?.customizations || []
        };
        
        // Write child module.yaml
        const childYamlContent = yaml.dump(childYaml, {
            lineWidth: -1,
            noRefs: true
        });
        await fs.writeFile(childYamlPath, childYamlContent, 'utf-8');
        
        // Update parent module.yaml
        const parentFullPath = path.join(repoRoot, parentModulePath);
        const parentYamlPath = path.join(parentFullPath, 'module.yaml');
        
        let parentYaml = {};
        try {
            const yamlContent = await fs.readFile(parentYamlPath, 'utf-8');
            parentYaml = yaml.load(yamlContent) || {};
        } catch {
            // File doesn't exist, create new
        }
        
        // Ensure parent is marked as root
        if (!parentYaml.inheritance) {
            parentYaml.inheritance = {
                isRoot: true,
                usedBy: []
            };
        }
        
        if (!parentYaml.inheritance.usedBy) {
            parentYaml.inheritance.usedBy = [];
        }
        
        // Extract workshop from child path
        const childWorkshopMatch = childModulePath.match(/workshops\/([^\/]+)\//);
        const childWorkshop = childWorkshopMatch ? childWorkshopMatch[1] : 'unknown';
        
        // Add child to usedBy if not already present
        const existingEntry = parentYaml.inheritance.usedBy.find(
            entry => entry.workshop === childWorkshop && entry.modulePath === childModulePath
        );
        
        if (!existingEntry) {
            parentYaml.inheritance.usedBy.push({
                workshop: childWorkshop,
                modulePath: childModulePath
            });
        }
        
        // Write parent module.yaml
        const parentYamlContent = yaml.dump(parentYaml, {
            lineWidth: -1,
            noRefs: true
        });
        await fs.writeFile(parentYamlPath, parentYamlContent, 'utf-8');
        
        return {
            success: true,
            childPath: childModulePath,
            parentPath: parentModulePath,
            message: 'Module linked successfully'
        };
    } catch (error) {
        throw new Error(`Failed to link module: ${error.message}`);
    }
}

/**
 * Promote a module to root (parent) status
 * @param {string} modulePath - Relative path to module
 * @returns {Promise<object>} Result object
 */
async function promoteToRoot(modulePath) {
    try {
        const moduleFullPath = path.join(repoRoot, modulePath);
        const moduleYamlPath = path.join(moduleFullPath, 'module.yaml');
        
        // Read or create module.yaml
        let moduleYaml = {};
        try {
            const yamlContent = await fs.readFile(moduleYamlPath, 'utf-8');
            moduleYaml = yaml.load(yamlContent) || {};
        } catch {
            // File doesn't exist, create new
        }
        
        // If it was a child, we need to handle the old parent
        if (moduleYaml.inheritance && !moduleYaml.inheritance.isRoot) {
            const oldParentPath = moduleYaml.inheritance.parentPath;
            
            if (oldParentPath) {
                // Remove this module from old parent's usedBy list
                const oldParentFullPath = path.join(repoRoot, oldParentPath);
                const oldParentYamlPath = path.join(oldParentFullPath, 'module.yaml');
                
                try {
                    const parentYamlContent = await fs.readFile(oldParentYamlPath, 'utf-8');
                    const parentYaml = yaml.load(parentYamlContent) || {};
                    
                    if (parentYaml.inheritance && parentYaml.inheritance.usedBy) {
                        parentYaml.inheritance.usedBy = parentYaml.inheritance.usedBy.filter(
                            entry => entry.modulePath !== modulePath
                        );
                        
                        const updatedParentYaml = yaml.dump(parentYaml, {
                            lineWidth: -1,
                            noRefs: true
                        });
                        await fs.writeFile(oldParentYamlPath, updatedParentYaml, 'utf-8');
                    }
                } catch (error) {
                    console.warn(`Could not update old parent: ${error.message}`);
                }
            }
        }
        
        // Promote to root
        moduleYaml.inheritance = {
            isRoot: true,
            usedBy: moduleYaml.inheritance?.usedBy || []
        };
        
        // Write module.yaml
        const moduleYamlContent = yaml.dump(moduleYaml, {
            lineWidth: -1,
            noRefs: true
        });
        await fs.writeFile(moduleYamlPath, moduleYamlContent, 'utf-8');
        
        return {
            success: true,
            modulePath,
            message: 'Module promoted to root successfully'
        };
    } catch (error) {
        throw new Error(`Failed to promote module to root: ${error.message}`);
    }
}

module.exports = {
    listWorkshops,
    getWorkshop,
    updateWorkshop,
    createWorkshop,
    deleteWorkshop,
    validateWorkshopId,
    parseFrontmatter,
    buildFrontmatter,
    generateModuleNavigation,
    generateModuleFooter,
    createModuleDirectory,
    generateModuleStructure,
    updateWorkshopWithModuleLinks,
    // Module discovery and linking
    findAllModules,
    findRootModules,
    findSimilarModules,
    linkModuleToParent,
    promoteToRoot
};
