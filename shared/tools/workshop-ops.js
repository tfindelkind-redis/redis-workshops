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
        const yamlPath = path.join(workshopPath, 'workshop.yaml');
        
        // Check if directory exists
        try {
            await fs.access(workshopPath);
        } catch {
            throw new Error(`Workshop directory not found: ${workshopId}`);
        }
        
        let frontmatter;
        let markdownContent = '';
        
        // Try to read workshop.yaml first (for test workshops)
        try {
            const yamlContent = await fs.readFile(yamlPath, 'utf-8');
            frontmatter = yaml.load(yamlContent);
        } catch {
            // workshop.yaml doesn't exist, try README.md
            try {
                const content = await fs.readFile(readmePath, 'utf-8');
                const parsed = parseFrontmatter(content);
                frontmatter = parsed.frontmatter;
                markdownContent = parsed.content;
            } catch {
                throw new Error(`Neither workshop.yaml nor README.md found in workshop: ${workshopId}`);
            }
        }
        
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
        
        // Enrich module references with metadata from their README.md files
        // This makes README.md the single source of truth for module metadata
        const enrichedModules = await enrichModulesWithMetadata(modules);
        
        console.log(`[getWorkshop] ${workshopId} - Enriched modules:`, enrichedModules.length);
        
        return {
            workshopId: frontmatter.workshopId || workshopId,
            title: frontmatter.title || workshopId,
            description: frontmatter.description || '',
            duration: frontmatter.duration || frontmatter.estimatedTime || '',
            difficulty: frontmatter.difficulty || 'intermediate',
            modules: enrichedModules,
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
        console.log(`[updateWorkshop] START - workshopId: ${workshopId}, has modules: ${!!updates.modules}, module count: ${updates.modules?.length}`);
        
        const workshopPath = path.join(workshopsDir, workshopId);
        const readmePath = path.join(workshopPath, 'README.md');
        
        // Check if workshop directory exists, create if not
        try {
            await fs.access(workshopPath);
        } catch (error) {
            // Workshop doesn't exist, create it first
            console.log(`Workshop ${workshopId} doesn't exist, creating it...`);
            return await createWorkshop({ workshopId, ...updates });
        }
        
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
            // Convert to minimal format: only store {order, moduleRef, required}
            // Module metadata lives in each module's README.md (single source of truth)
            const minimalModules = updates.modules.map((mod, index) => {
                if (typeof mod === 'string') {
                    // Old format: string path
                    return {
                        order: index + 1,
                        moduleRef: mod,
                        required: true
                    };
                } else {
                    // New format: object with potential full metadata
                    // Extract only the minimal fields we need
                    return {
                        order: mod.order || index + 1,
                        moduleRef: mod.moduleRef || mod.name,
                        required: mod.required !== undefined ? mod.required : true
                    };
                }
            });
            
            console.log('[updateWorkshop] Converting to minimal format:', JSON.stringify(minimalModules, null, 2));
            updatedFrontmatter.modules = minimalModules;
            
            // Remove old 'chapters' field if it exists
            delete updatedFrontmatter.chapters;
            
            // Enrich modules with metadata from README.md for table of contents
            const enrichedModules = await enrichModulesWithMetadata(updatedFrontmatter.modules);
            
            // Regenerate the entire README with updated modules table of contents
            const newFrontmatterString = buildFrontmatter(updatedFrontmatter);
            const modulesTableOfContents = generateModulesTableOfContents(workshopId, enrichedModules);
            
            const newContent = `${newFrontmatterString}
# ${updatedFrontmatter.title}

**Duration:** ${updatedFrontmatter.duration} | **Difficulty:** ${updatedFrontmatter.difficulty}

## 📋 Overview

${updatedFrontmatter.description}

${modulesTableOfContents}

---

**Ready to start?** Click on Module 1 above to begin your learning journey!
`;
            
            await fs.writeFile(readmePath, newContent, 'utf-8');
            
            // Check for removed modules and delete their folders
            // This works for both local modules AND inherited modules that have folders in this workshop
            if (frontmatter.modules && Array.isArray(frontmatter.modules)) {
                // Get all module folders that currently exist in the workshop directory
                const workshopModuleFolders = new Set();
                try {
                    const entries = await fs.readdir(workshopPath, { withFileTypes: true });
                    for (const entry of entries) {
                        if (entry.isDirectory() && entry.name.startsWith('module-')) {
                            workshopModuleFolders.add(entry.name);
                        }
                    }
                } catch (error) {
                    console.warn(`⚠️  Failed to read workshop directory: ${error.message}`);
                }
                
                // Get folder names that should exist (from new module list)
                const expectedFolders = new Set();
                for (const mod of updatedFrontmatter.modules) {
                    const moduleRef = mod.moduleRef;
                    if (moduleRef && moduleRef.startsWith(`workshops/${workshopId}/`)) {
                        // Local module - use folder name from moduleRef
                        expectedFolders.add(path.basename(moduleRef));
                    } else {
                        // Inherited module - generate expected folder name
                        const order = mod.order || (updatedFrontmatter.modules.indexOf(mod) + 1);
                        const nameSlug = moduleRef ? path.basename(moduleRef).replace(/^module-\d+-/, '') : 'untitled';
                        expectedFolders.add(`module-${String(order).padStart(2, '0')}-${nameSlug}`);
                    }
                }
                
                // Find folders that exist but shouldn't (removed modules)
                const foldersToDelete = Array.from(workshopModuleFolders).filter(folder => !expectedFolders.has(folder));
                
                // Delete removed module folders
                for (const folder of foldersToDelete) {
                    const folderPath = path.join(workshopPath, folder);
                    try {
                        await fs.rm(folderPath, { recursive: true, force: true });
                        console.log(`🗑️  Deleted removed module folder: ${folder}`);
                    } catch (error) {
                        console.warn(`⚠️  Failed to delete ${folder}: ${error.message}`);
                    }
                }
                
                // Update navigation in all remaining modules after changes
                // This handles: deletion, reordering, or adding new modules
                const hasModuleChanges = foldersToDelete.length > 0 || 
                    !frontmatter.modules || 
                    frontmatter.modules.length !== updatedFrontmatter.modules.length;
                
                if (hasModuleChanges) {
                    console.log(`🔄 Updating navigation after module changes (deleted: ${foldersToDelete.length}, total: ${updatedFrontmatter.modules.length})...`);
                    try {
                        await updateModuleNavigation(workshopId);
                        console.log(`✅ Navigation updated for all modules`);
                    } catch (navError) {
                        console.warn(`⚠️  Failed to update navigation: ${navError.message}`);
                    }
                }
            }
        } else {
            // Just update frontmatter, keep existing content
            const newFrontmatterString = buildFrontmatter(updatedFrontmatter);
            const newContent = newFrontmatterString + markdownContent;
            await fs.writeFile(readmePath, newContent, 'utf-8');
        }
        
        // Return updated workshop
        return await getWorkshop(workshopId);
    } catch (error) {
        throw new Error(`Failed to update workshop ${workshopId}: ${error.message}`);
    }
}

/**
 * Generate table of contents for workshop modules
 * @param {string} workshopId - Workshop ID to extract folder names from moduleRef
 * @param {Array} modules - Array of module objects
 * @returns {string} Formatted markdown table of contents
 */
function generateModulesTableOfContents(workshopId, modules) {
    if (!modules || modules.length === 0) {
        return `## 📖 Workshop Modules

*No modules added yet. Use the Workshop Builder GUI to add modules.*
`;
    }

    // Calculate total duration
    const totalMinutes = modules.reduce((sum, mod) => sum + (parseInt(mod.duration) || 0), 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const totalDuration = totalHours > 0 
        ? `${totalHours}h ${remainingMinutes}m` 
        : `${remainingMinutes}m`;

    let toc = `## 📖 Workshop Modules

**Total Duration:** ${totalDuration} | **Modules:** ${modules.length}

Complete the modules in order for the best learning experience:

| # | Module | Duration | Difficulty | Type | Required |
|---|--------|----------|------------|------|----------|
`;

    modules.forEach((module, index) => {
        const order = module.order || (index + 1);
        const moduleName = module.name || 'Untitled Module';
        const duration = module.duration ? `${module.duration}m` : 'N/A';
        const difficulty = module.difficulty || 'intermediate';
        const type = module.type || 'lecture';
        const required = module.required ? '✅ Yes' : '⚪ Optional';
        
        // Get module directory name - use actual folder from moduleRef if it exists in this workshop
        let moduleDir;
        if (module.moduleRef && module.moduleRef.startsWith(`workshops/${workshopId}/`)) {
            // Extract actual folder name from moduleRef (for customized modules)
            moduleDir = path.basename(module.moduleRef);
        } else {
            // Generate directory name from order and name (for inherited modules)
            moduleDir = `module-${String(order).padStart(2, '0')}-${moduleName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        }
        const moduleLink = `[${moduleName}](${moduleDir}/README.md)`;
        
        toc += `| ${order} | ${moduleLink} | ${duration} | ${difficulty} | ${type} | ${required} |\n`;
    });

    toc += '\n';

    // Add detailed module sections
    toc += '---\n\n';
    
    modules.forEach((module, index) => {
        const order = module.order || (index + 1);
        const moduleName = module.name || 'Untitled Module';
        const description = module.description || 'No description available.';
        const duration = module.duration ? `${module.duration} minutes` : 'Duration not specified';
        const difficulty = module.difficulty || 'intermediate';
        const type = module.type || 'lecture';
        
        // Get module directory name - use actual folder from moduleRef if it exists in this workshop
        let moduleDir;
        if (module.moduleRef && module.moduleRef.startsWith(`workshops/${workshopId}/`)) {
            // Extract actual folder name from moduleRef (for customized modules)
            moduleDir = path.basename(module.moduleRef);
        } else {
            // Generate directory name from order and name (for inherited modules)
            moduleDir = `module-${String(order).padStart(2, '0')}-${moduleName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        }
        
        toc += `### Module ${order}: ${moduleName}\n\n`;
        toc += `📂 **[Go to Module](${moduleDir}/README.md)**\n\n`;
        toc += `**Duration:** ${duration} | **Difficulty:** ${difficulty} | **Type:** ${type}\n\n`;
        toc += `${description}\n\n`;
        
        if (module.required) {
            toc += `> ✅ **Required Module** - Essential for workshop completion\n\n`;
        }
        
        toc += '---\n\n';
    });

    return toc;
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
        
        // Build frontmatter
        const frontmatter = {
            workshopId,
            title: title || workshopId,
            description: description || 'Workshop description',
            duration: duration || '4 hours',
            difficulty: difficulty || 'intermediate'
        };
        
        // Build README content with modules table of contents
        const frontmatterString = buildFrontmatter(frontmatter);
        const modulesTableOfContents = generateModulesTableOfContents(workshopId, modules || []);
        
        const template = `${frontmatterString}
# ${frontmatter.title}

**Duration:** ${frontmatter.duration} | **Difficulty:** ${frontmatter.difficulty}

## 📋 Overview

${frontmatter.description}

${modulesTableOfContents}

---

**Ready to start?** Click on Module 1 above to begin your learning journey!
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
    
    // Top navigation bar with prev/next links using Markdown tables
    nav += `| Previous | Home | Next |\n`;
    nav += `|----------|:----:|------:|\n`;
    nav += `| `;
    
    if (prevModule) {
        nav += `[⬅️ Previous: ${prevModule.name}](../${prevModule.folder}/README.md)`;
    }
    
    nav += ` | [🏠 Workshop Home](../README.md) | `;
    
    if (nextModule) {
        nav += `[Next: ${nextModule.name} ➡️](../${nextModule.folder}/README.md)`;
    }
    
    nav += ` |\n\n`;
    
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
    
    // Bottom navigation using Markdown table
    footer += `| Previous | Home | Next |\n`;
    footer += `|----------|:----:|------:|\n`;
    footer += `| `;
    
    if (prevModule) {
        footer += `[⬅️ Previous: ${prevModule.name}](../${prevModule.folder}/README.md)`;
    }
    
    footer += ` | [🏠 Workshop Home](../README.md) | `;
    
    if (nextModule) {
        footer += `[Next: ${nextModule.name} ➡️](../${nextModule.folder}/README.md)`;
    } else {
        footer += `✅ **Workshop Complete!**`;
    }
    
    footer += ` |\n\n`;
    footer += `---\n\n`;
    footer += `*Module ${moduleIndex + 1} of ${totalModules}*\n`;
    
    return footer;
}

/**
 * Copy all files from source module to destination
 * @param {string} sourcePath - Source module path
 * @param {string} destPath - Destination module path
 * @returns {Promise<void>}
 */
async function copyModuleFiles(sourcePath, destPath) {
    try {
        // Create destination directory
        await fs.mkdir(destPath, { recursive: true });
        
        // Read all files in source
        const entries = await fs.readdir(sourcePath, { withFileTypes: true });
        
        for (const entry of entries) {
            const srcFile = path.join(sourcePath, entry.name);
            const destFile = path.join(destPath, entry.name);
            
            if (entry.isDirectory()) {
                // Recursively copy subdirectories
                await copyModuleFiles(srcFile, destFile);
            } else {
                // Copy file
                await fs.copyFile(srcFile, destFile);
            }
        }
    } catch (error) {
        throw new Error(`Failed to copy module files: ${error.message}`);
    }
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
        
        // Check if this module already exists in THIS workshop (it's a customized/local module)
        if (moduleData.moduleRef && moduleData.moduleRef.startsWith(`workshops/${workshopId}/`)) {
            const currentFolderName = path.basename(moduleData.moduleRef);
            const currentModulePath = path.join(repoRoot, moduleData.moduleRef);
            
            try {
                await fs.access(currentModulePath);
                
                // Extract the name slug from the EXISTING folder (preserve it, only change order)
                const currentOrder = currentFolderName.match(/^module-(\d+)-/);
                const nameSlug = currentFolderName.replace(/^module-\d+-/, ''); // Keep existing slug!
                
                // Generate expected folder name with new order but SAME name slug
                const expectedOrder = String(moduleIndex + 1).padStart(2, '0');
                const expectedFolderName = `module-${expectedOrder}-${nameSlug}`;
                const expectedModulePath = path.join(workshopPath, expectedFolderName);
                
                // Check if the folder name needs to change (order changed)
                if (currentFolderName !== expectedFolderName) {
                    console.log(`🔄 Renaming module: ${currentFolderName} → ${expectedFolderName}`);
                    await fs.rename(currentModulePath, expectedModulePath);
                    return { folderName: expectedFolderName, path: expectedModulePath, existed: true, renamed: true, oldFolderName: currentFolderName, skipNavUpdate: false };
                }
                
                console.log(`✅ Module already exists with correct name: ${currentFolderName}`);
                return { folderName: currentFolderName, path: currentModulePath, existed: true, skipNavUpdate: false };
            } catch {
                console.error(`❌ Module path doesn't exist: ${moduleData.moduleRef}`);
                throw new Error(`Module path not found: ${moduleData.moduleRef}`);
            }
        }
        
        // For NEW modules (not yet in this workshop), generate slug from module name
        const moduleName = moduleData.name || 'Untitled Module';
        const nameSlug = moduleName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const expectedOrder = String(moduleIndex + 1).padStart(2, '0');
        const expectedFolderName = `module-${expectedOrder}-${nameSlug}`;
        const expectedModulePath = path.join(workshopPath, expectedFolderName);
        
        // Check if a module with the expected name already exists (was previously created)
        try {
            await fs.access(expectedModulePath);
            console.log(`✅ Module already exists: ${expectedFolderName}`);
            return { folderName: expectedFolderName, path: expectedModulePath, existed: true, skipNavUpdate: false };
        } catch {
            // Doesn't exist yet, continue with creation
        }
        
        // At this point, module doesn't exist yet - need to create it
        // Check if this module inherits from ANOTHER workshop
        if (moduleData.moduleRef && !moduleData.moduleRef.startsWith(`workshops/${workshopId}/`)) {
            const parentPath = path.join(repoRoot, moduleData.moduleRef);
            
            // Check if parent exists
            try {
                await fs.access(parentPath);
                
                // Copy ALL files from parent module
                console.log(`📦 Copying module from: ${moduleData.moduleRef}`);
                await copyModuleFiles(parentPath, expectedModulePath);
                
                // Ensure README.md has frontmatter
                const readmePath = path.join(expectedModulePath, 'README.md');
                try {
                    const content = await fs.readFile(readmePath, 'utf8');
                    const { frontmatter, content: markdownContent } = parseFrontmatter(content);
                    
                    // If no frontmatter exists, create it
                    if (!frontmatter || Object.keys(frontmatter).length === 0) {
                        console.log(`📝 Creating frontmatter for inherited module: ${expectedFolderName}`);
                        const newFrontmatter = {
                            title: moduleName,
                            description: moduleData.description || '',
                            duration: moduleData.duration || 60,
                            difficulty: moduleData.difficulty || 'intermediate',
                            type: moduleData.type || 'hands-on'
                        };
                        const newContent = buildFrontmatter(newFrontmatter) + '\n' + markdownContent;
                        await fs.writeFile(readmePath, newContent, 'utf8');
                    }
                } catch (error) {
                    console.warn(`⚠️  Could not update README frontmatter: ${error.message}`);
                }
                
                // Create module.yaml with inheritance info
                const moduleYaml = {
                    id: expectedFolderName,
                    title: moduleName,
                    description: moduleData.description || '',
                    duration: moduleData.duration || 60,
                    inheritance: {
                        parentPath: moduleData.moduleRef,
                        inheritedAt: new Date().toISOString()
                    }
                };
                
                const moduleYamlPath = path.join(expectedModulePath, 'module.yaml');
                await fs.writeFile(moduleYamlPath, yaml.dump(moduleYaml), 'utf-8');
                
                console.log(`✅ Copied module with inheritance: ${expectedFolderName}`);
                return { folderName: expectedFolderName, path: expectedModulePath, inherited: true, parentPath: moduleData.moduleRef };
            } catch (error) {
                console.warn(`⚠️  Parent module not found: ${moduleData.moduleRef}, creating template instead`);
                // Fall through to create template
            }
        }
        
        // Create module directory
        await fs.mkdir(expectedModulePath, { recursive: true });
        
        // Generate navigation
        const header = generateModuleNavigation({
            ...navOptions,
            moduleName: moduleName,
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
        
        // Check if README already exists
        const readmePath = path.join(expectedModulePath, 'README.md');
        let content;
        
        try {
            // Try to read existing README
            const existingContent = await fs.readFile(readmePath, 'utf-8');
            
            // Extract user content (between edit markers)
            let userContent = existingContent;
            
            // Remove existing navigation header if present
            const headerMatch = existingContent.match(/<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->.*?<!-- ✏️ EDIT YOUR CONTENT BELOW THIS LINE ✏️ -->\n\n/s);
            if (headerMatch) {
                userContent = existingContent.substring(headerMatch[0].length);
            }
            
            // Remove existing navigation footer if present
            const footerMatch = userContent.match(/\n\n<!-- ✏️ EDIT YOUR CONTENT ABOVE THIS LINE ✏️ -->.*$/s);
            if (footerMatch) {
                userContent = userContent.substring(0, userContent.length - footerMatch[0].length);
            }
            
            // Preserve existing content with new navigation
            content = header + userContent.trim() + footer;
            
            console.log(`ℹ️  Preserved existing content for: ${expectedFolderName}`);
        } catch (error) {
            // README doesn't exist, create new with template
            content = `${header}# ${moduleName}

**Duration:** ${moduleData.duration || 60} minutes  
**Difficulty:** ${moduleData.difficulty || 'intermediate'}  
**Type:** ${moduleData.type || 'lecture'}

## Overview

${moduleData.description || 'Module description goes here.'}

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
            
            console.log(`✨ Created new README for: ${expectedFolderName}`);
        }
        
        // Write README.md
        await fs.writeFile(readmePath, content, 'utf-8');
        
        return { folderName: expectedFolderName, path: expectedModulePath };
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
            
            // Prepare navigation options (still needed for NEW modules)
            const prevModule = i > 0 && modules[i - 1].name ? {
                name: modules[i - 1].name,
                folder: `module-${String(i).padStart(2, '0')}-${modules[i - 1].name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
            } : null;
            
            const nextModule = i < modules.length - 1 && modules[i + 1].name ? {
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
        
        // Clean up orphaned module directories (folders that don't match current modules)
        // This handles reordering where old module-XX folders need to be deleted
        // BUT: Don't delete folders that were renamed (they already moved)
        const workshopPath = path.join(workshopsDir, workshopId);
        const expectedFolders = new Set(createdModules.map(m => m.folderName));
        const renamedOldFolders = new Set(
            createdModules.filter(m => m.renamed && m.oldFolderName).map(m => m.oldFolderName)
        );
        
        try {
            const allEntries = await fs.readdir(workshopPath, { withFileTypes: true });
            const moduleFolders = allEntries
                .filter(entry => entry.isDirectory() && entry.name.startsWith('module-'))
                .map(entry => entry.name);
            
            for (const folder of moduleFolders) {
                // Don't delete if it's expected OR if it was already renamed (already gone)
                if (!expectedFolders.has(folder) && !renamedOldFolders.has(folder)) {
                    const orphanedPath = path.join(workshopPath, folder);
                    console.log(`🗑️ Deleting orphaned module folder: ${folder}`);
                    await fs.rm(orphanedPath, { recursive: true, force: true });
                }
            }
        } catch (error) {
            console.warn(`⚠️ Failed to clean up orphaned folders: ${error.message}`);
        }
        
        // After all modules are created/verified, update navigation for ALL modules
        // This updates ONLY the navigation header/footer in README.md, not module.yaml or other files
        console.log('🔄 Updating navigation for all modules...');
        await updateModuleNavigation(workshopId);
        
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
 * Check if a child module is in sync with its parent
 * @param {string} childModulePath - Relative path to child module (e.g., "workshops/ws-1/module-01")
 * @param {string} parentModulePath - Relative path to parent module (e.g., "workshops/ws-2/module-02")
 * @returns {Promise<string>} Sync status: 'in-sync', 'out-of-sync', or 'unknown'
 */
async function checkModuleSyncStatus(childModulePath, parentModulePath) {
    const crypto = require('crypto');
    const fsSync = require('fs');
    
    try {
        const childFullPath = path.join(repoRoot, childModulePath);
        const parentFullPath = path.join(repoRoot, parentModulePath);
        
        // Check if both paths exist
        if (!fsSync.existsSync(childFullPath) || !fsSync.existsSync(parentFullPath)) {
            return 'unknown';
        }
        
        // Get list of files in both directories (excluding module.yaml which tracks inheritance)
        const childFiles = await getFileList(childFullPath, childFullPath);
        const parentFiles = await getFileList(parentFullPath, parentFullPath);
        
        // Compare file contents using checksums
        const filesToCompare = new Set([...childFiles.map(f => f.relativePath), ...parentFiles.map(f => f.relativePath)]);
        
        for (const relPath of filesToCompare) {
            // Skip module.yaml as it's expected to differ (contains inheritance info)
            if (relPath === 'module.yaml') continue;
            
            const childFilePath = path.join(childFullPath, relPath);
            const parentFilePath = path.join(parentFullPath, relPath);
            
            // Check if file exists in both
            const childExists = fsSync.existsSync(childFilePath);
            const parentExists = fsSync.existsSync(parentFilePath);
            
            if (childExists !== parentExists) {
                // File exists in one but not the other
                return 'out-of-sync';
            }
            
            if (childExists && parentExists) {
                // Compare file contents via checksum
                const childContent = await fs.readFile(childFilePath, 'utf-8');
                const parentContent = await fs.readFile(parentFilePath, 'utf-8');
                
                const childHash = crypto.createHash('md5').update(childContent).digest('hex');
                const parentHash = crypto.createHash('md5').update(parentContent).digest('hex');
                
                if (childHash !== parentHash) {
                    return 'out-of-sync';
                }
            }
        }
        
        // All files match
        return 'in-sync';
    } catch (error) {
        console.warn(`Error checking sync status: ${error.message}`);
        return 'unknown';
    }
}

/**
 * Recursively get list of files in a directory
 * @param {string} dirPath - Full path to directory
 * @param {string} basePath - Base path for calculating relative paths
 * @returns {Promise<Array>} Array of objects with relativePath
 */
async function getFileList(dirPath, basePath) {
    const files = [];
    
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            const relativePath = path.relative(basePath, fullPath);
            
            if (entry.isDirectory()) {
                // Recursively get files from subdirectories
                const subFiles = await getFileList(fullPath, basePath);
                files.push(...subFiles);
            } else {
                files.push({ relativePath });
            }
        }
    } catch (error) {
        console.warn(`Error reading directory ${dirPath}: ${error.message}`);
    }
    
    return files;
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
                    // Match module directories: module-XX-name, module-XX, or test-*
                    if (entry.isDirectory() && (entry.name.match(/^module-\d{2}/) || entry.name.match(/^test-/))) {
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
                            
                            // Read README.md frontmatter and/or markdown content
                            let moduleInfo = {
                                title: entry.name,
                                description: '',
                                duration: ''
                            };
                            
                            try {
                                const readmeContent = await fs.readFile(moduleReadmePath, 'utf-8');
                                
                                // First try frontmatter
                                const { frontmatter } = parseFrontmatter(readmeContent);
                                if (frontmatter) {
                                    moduleInfo.title = frontmatter.title || entry.name;
                                    moduleInfo.description = frontmatter.description || frontmatter.summary || '';
                                    moduleInfo.duration = frontmatter.duration || frontmatter.estimatedTime || '';
                                }
                                
                                // If no title from frontmatter, extract from markdown heading
                                if (moduleInfo.title === entry.name) {
                                    // Look for first H1 heading after the edit marker
                                    const editMarkerIndex = readmeContent.indexOf('✏️ EDIT YOUR CONTENT BELOW THIS LINE');
                                    const contentAfterMarker = editMarkerIndex >= 0 
                                        ? readmeContent.substring(editMarkerIndex) 
                                        : readmeContent;
                                    
                                    const h1Match = contentAfterMarker.match(/^#\s+(?:Module\s+\d+:\s+)?(.+?)$/m);
                                    if (h1Match) {
                                        moduleInfo.title = h1Match[1].trim();
                                    }
                                }
                                
                                // Extract duration if not found in frontmatter
                                if (!moduleInfo.duration) {
                                    const durationMatch = readmeContent.match(/\*\*Duration:\*\*\s*(\d+)\s*min/i);
                                    if (durationMatch) {
                                        moduleInfo.duration = `${durationMatch[1]} minutes`;
                                    }
                                }
                                
                                // Extract description from "Module Overview" or first paragraph
                                if (!moduleInfo.description) {
                                    const overviewMatch = readmeContent.match(/##\s+Module\s+Overview\s*\n\s*\*\*Objective:\*\*\s*(.+?)(?:\n|$)/i);
                                    if (overviewMatch) {
                                        moduleInfo.description = overviewMatch[1].trim();
                                    }
                                }
                            } catch {
                                // README.md doesn't exist or can't be parsed
                            }
                            
                            // Merge module.yaml values with README values, prioritizing module.yaml
                            const finalModuleInfo = {
                                title: moduleYaml?.title || moduleInfo.title,
                                description: moduleYaml?.description || moduleInfo.description,
                                duration: moduleYaml?.duration 
                                    ? (typeof moduleYaml.duration === 'number' ? `${moduleYaml.duration} minutes` : moduleYaml.duration)
                                    : moduleInfo.duration
                            };
                            
                            allModules.push({
                                workshopId: workshop.workshopId,
                                workshopTitle: workshop.title,
                                moduleDir: entry.name,
                                modulePath: path.relative(repoRoot, modulePath),
                                ...finalModuleInfo,
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
        
        // Add children count and list to each module
        for (const module of allModules) {
            const modulePath = module.modulePath;
            const children = allModules.filter(m => 
                m.inheritance?.parentPath === modulePath
            );
            
            module.childrenCount = children.length;
            if (children.length > 0) {
                module.children = children.map(c => ({
                    workshopId: c.workshopId,
                    moduleDir: c.moduleDir,
                    title: c.title,
                    modulePath: c.modulePath
                }));
            }
        }
        
        // Add sync status for child modules
        for (const module of allModules) {
            if (module.inheritance?.parentPath) {
                try {
                    const syncStatus = await checkModuleSyncStatus(module.modulePath, module.inheritance.parentPath);
                    module.syncStatus = syncStatus;
                } catch (error) {
                    console.warn(`Failed to check sync status for ${module.modulePath}: ${error.message}`);
                    module.syncStatus = 'unknown';
                }
            }
        }
        
        return allModules;
    } catch (error) {
        throw new Error(`Failed to find all modules: ${error.message}`);
    }
}

/**
 * Find root (parent) modules - modules that have children
 * @returns {Promise<Array>} Array of root module objects with children
 */
async function findRootModules() {
    try {
        const allModules = await findAllModules();
        
        // Find modules that are parents (have children) and are not from test workshops
        const parentModules = [];
        
        for (const module of allModules) {
            // Skip test workshops
            if (module.workshopId.startsWith('test-')) {
                continue;
            }
            
            const modulePath = module.modulePath;
            
            // Count children
            const children = allModules.filter(m => 
                m.inheritance?.parentPath === modulePath
            );
            
            if (children.length > 0) {
                parentModules.push({
                    ...module,
                    childrenCount: children.length,
                    children: children.map(c => ({
                        workshopId: c.workshopId,
                        moduleDir: c.moduleDir,
                        title: c.title,
                        modulePath: c.modulePath
                    }))
                });
            }
        }
        
        return parentModules;
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
        
        // Filter out test workshops
        const nonTestModules = allModules.filter(module => 
            !module.workshopId.startsWith('test-')
        );
        
        // Group modules by normalized name (remove module-XX- prefix)
        const groups = {};
        
        for (const module of nonTestModules) {
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
 * Link a child module to a parent module (supports multi-level inheritance)
 * @param {string} childModulePath - Relative path to child module
 * @param {string} parentModulePath - Relative path to parent module
 * @returns {Promise<object>} Result object
 */
async function linkModuleToParent(childModulePath, parentModulePath) {
    try {
        // 1. Check for circular dependency FIRST
        const circularCheck = await checkCircularDependency(childModulePath, parentModulePath);
        if (circularCheck.isCircular) {
            return {
                success: false,
                error: 'CIRCULAR_DEPENDENCY',
                message: circularCheck.message
            };
        }
        
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
        
        // Update inheritance (REMOVED isRoot flag - now dynamic)
        childYaml.inheritance = childYaml.inheritance || {};
        childYaml.inheritance.parentPath = parentModulePath;
        childYaml.inheritance.inheritedAt = new Date().toISOString();
        
        // Preserve existing children if any
        if (!childYaml.inheritance.children) {
            childYaml.inheritance.children = childYaml.inheritance.children || [];
        }
        
        // Preserve customizations if any
        childYaml.inheritance.customizations = childYaml.inheritance.customizations || [];
        
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
        
        // Ensure parent has inheritance.children array (REMOVED isRoot flag)
        if (!parentYaml.inheritance) {
            parentYaml.inheritance = {};
        }
        
        if (!parentYaml.inheritance.children) {
            parentYaml.inheritance.children = [];
        }
        
        // Extract workshop from child path
        const childWorkshopMatch = childModulePath.match(/workshops\/([^\/]+)\//);
        const childWorkshop = childWorkshopMatch ? childWorkshopMatch[1] : 'unknown';
        
        // Add child to children array if not already present
        const existingEntry = parentYaml.inheritance.children.find(
            entry => entry.modulePath === childModulePath
        );
        
        if (!existingEntry) {
            parentYaml.inheritance.children.push({
                workshop: childWorkshop,
                modulePath: childModulePath,
                linkedAt: new Date().toISOString()
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

/**
 * Get all top-level modules (modules with no parent)
 * These are the entry points in the hierarchy
 * @returns {Promise<Array>} Array of top-level module objects
 */
async function getTopLevelModules() {
    try {
        const allModules = await findAllModules();
        
        // Top-level modules have no parentPath and are not from test workshops
        const topLevel = allModules.filter(module => {
            const isTopLevel = !module.inheritance || !module.inheritance.parentPath;
            const isNotTestWorkshop = !module.workshopId.startsWith('test-');
            return isTopLevel && isNotTestWorkshop;
        });
        
        // Add child counts for each top-level module
        for (const module of topLevel) {
            const childInfo = await getDescendantInfo(module.path);
            module.childCount = childInfo.total;
            module.directChildCount = childInfo.direct;
        }
        
        return topLevel;
    } catch (error) {
        throw new Error(`Failed to get top-level modules: ${error.message}`);
    }
}

/**
 * Get direct children of a module
 * @param {string} modulePath - Relative path to parent module (e.g., "workshops/workshop-a/module-01-intro")
 * @returns {Promise<Array>} Array of child module objects
 */
async function getChildrenOfModule(modulePath) {
    try {
        const allModules = await findAllModules();
        
        // Find modules that have this as their parent
        const children = allModules.filter(module =>
            module.inheritance && 
            module.inheritance.parentPath === modulePath
        );
        
        // Add metadata for each child
        for (const child of children) {
            const childInfo = await getDescendantInfo(child.path);
            child.childCount = childInfo.total;
            child.directChildCount = childInfo.direct;
            child.level = await getModuleDepth(child.path);
        }
        
        return children;
    } catch (error) {
        throw new Error(`Failed to get children of module: ${error.message}`);
    }
}

/**
 * Get descendant count info (direct and total)
 * @param {string} modulePath - Relative path to module
 * @returns {Promise<Object>} Object with direct and total counts
 */
async function getDescendantInfo(modulePath) {
    try {
        const children = await getChildrenOfModule(modulePath);
        
        let totalCount = children.length; // Direct children
        
        // Recursively count all descendants
        for (const child of children) {
            const childInfo = await getDescendantInfo(child.path);
            totalCount += childInfo.total;
        }
        
        return {
            direct: children.length,
            total: totalCount
        };
    } catch (error) {
        // If error (likely module not found), return zero counts
        return { direct: 0, total: 0 };
    }
}

/**
 * Get all ancestors of a module (for circular dependency check and breadcrumb)
 * @param {string} modulePath - Relative path to module
 * @returns {Promise<Array>} Array of ancestor paths from immediate parent to top-level
 */
async function getModuleAncestors(modulePath) {
    try {
        const ancestors = [];
        let currentPath = modulePath;
        const visited = new Set();
        const maxDepth = 50; // Safety limit
        
        while (currentPath && ancestors.length < maxDepth) {
            // Detect circular dependency
            if (visited.has(currentPath)) {
                throw new Error(`Circular dependency detected at ${currentPath}`);
            }
            visited.add(currentPath);
            
            // Read module.yaml
            const moduleYamlPath = path.join(repoRoot, currentPath, 'module.yaml');
            
            let moduleYaml;
            try {
                const yamlContent = await fs.readFile(moduleYamlPath, 'utf-8');
                moduleYaml = yaml.load(yamlContent);
            } catch (err) {
                // Module.yaml doesn't exist or can't be read
                break;
            }
            
            // Check if it has a parent
            if (moduleYaml && moduleYaml.inheritance && moduleYaml.inheritance.parentPath) {
                const parentPath = moduleYaml.inheritance.parentPath;
                ancestors.push(parentPath);
                currentPath = parentPath;
            } else {
                // Reached top-level module
                break;
            }
        }
        
        if (ancestors.length >= maxDepth) {
            throw new Error('Maximum depth exceeded - possible circular dependency');
        }
        
        return ancestors;
    } catch (error) {
        throw new Error(`Failed to get module ancestors: ${error.message}`);
    }
}

/**
 * Get the depth level of a module in the hierarchy (0 = top-level)
 * @param {string} modulePath - Relative path to module
 * @returns {Promise<number>} Depth level
 */
async function getModuleDepth(modulePath) {
    try {
        const ancestors = await getModuleAncestors(modulePath);
        return ancestors.length;
    } catch (error) {
        return 0; // Assume top-level if error
    }
}

/**
 * Check if linking child to parent would create a circular dependency
 * @param {string} childModulePath - Relative path to child module
 * @param {string} parentModulePath - Relative path to parent module
 * @returns {Promise<Object>} Object with isCircular boolean and message
 */
async function checkCircularDependency(childModulePath, parentModulePath) {
    try {
        // Self-reference check
        if (childModulePath === parentModulePath) {
            return {
                isCircular: true,
                message: 'A module cannot be its own parent.'
            };
        }
        
        // Get all ancestors of the proposed parent
        const parentAncestors = await getModuleAncestors(parentModulePath);
        
        // Check if child is in parent's ancestry
        if (parentAncestors.includes(childModulePath)) {
            return {
                isCircular: true,
                message: `Cannot link: ${childModulePath} is an ancestor of ${parentModulePath}. This would create a circular dependency.`
            };
        }
        
        // Get all descendants of the child
        const childDescendants = await getAllDescendants(childModulePath);
        
        // Check if parent is in child's descendants
        if (childDescendants.includes(parentModulePath)) {
            return {
                isCircular: true,
                message: `Cannot link: ${parentModulePath} is a descendant of ${childModulePath}. This would create a circular dependency.`
            };
        }
        
        return {
            isCircular: false,
            message: 'No circular dependency detected.'
        };
    } catch (error) {
        return {
            isCircular: false,
            message: 'Could not verify circular dependency, proceeding with caution.'
        };
    }
}

/**
 * Get all descendants of a module recursively
 * @param {string} modulePath - Relative path to module
 * @returns {Promise<Array>} Array of all descendant paths
 */
async function getAllDescendants(modulePath) {
    try {
        const descendants = [];
        const children = await getChildrenOfModule(modulePath);
        
        for (const child of children) {
            descendants.push(child.path);
            // Recursively get descendants of this child
            const grandchildren = await getAllDescendants(child.path);
            descendants.push(...grandchildren);
        }
        
        return descendants;
    } catch (error) {
        return []; // Return empty array if error
    }
}

/**
 * Copy an existing module with all its files to create a customized version
 * @param {string} sourceModulePath - Relative path to source module (e.g., "workshops/workshop-id/module-01-name")
 * @param {string} workshopId - Target workshop ID
 * @param {string} newModuleName - New module directory name (e.g., "module-custom-redis-fundamentals")
 * @param {object} newModuleMetadata - Metadata to update in the copied module { title, description, duration, difficulty, type }
 * @returns {Promise<object>} { newModulePath, moduleDir, metadata }
 */
async function copyModule(sourceModulePath, workshopId, newModuleName, newModuleMetadata = {}) {
    const fsSync = require('fs');
    
    try {
        // Resolve full paths
        const sourceFullPath = path.join(repoRoot, sourceModulePath);
        const targetWorkshopPath = path.join(workshopsDir, workshopId);
        const targetModulePath = path.join(targetWorkshopPath, newModuleName);
        const targetModuleRelativePath = path.join('workshops', workshopId, newModuleName);
        
        // Validate source module exists
        if (!fsSync.existsSync(sourceFullPath)) {
            throw new Error(`Source module not found: ${sourceModulePath}`);
        }
        
        // Validate target workshop exists
        if (!fsSync.existsSync(targetWorkshopPath)) {
            throw new Error(`Target workshop not found: ${workshopId}`);
        }
        
        // Check if target module already exists
        if (fsSync.existsSync(targetModulePath)) {
            throw new Error(`Module already exists: ${newModuleName}`);
        }
        
        // Recursively copy directory
        await copyDirectory(sourceFullPath, targetModulePath);
        
        console.log(`✓ Copied module from ${sourceModulePath} to ${targetModuleRelativePath}`);
        
        // Determine if metadata was customized
        const hasMetadataCustomization = 
            newModuleMetadata.title || 
            newModuleMetadata.description || 
            newModuleMetadata.duration || 
            newModuleMetadata.difficulty || 
            newModuleMetadata.type;
        
        // Create or update module.yaml with inheritance info
        const moduleYamlPath = path.join(targetModulePath, 'module.yaml');
        const moduleYamlData = {
            inheritance: {
                parentPath: sourceModulePath,
                inheritedAt: new Date().toISOString(),
                ...(hasMetadataCustomization && {
                    customized: true,
                    customizationReason: 'Metadata customized when copied',
                    customizedAt: new Date().toISOString()
                })
            }
        };
        await fs.writeFile(moduleYamlPath, yaml.dump(moduleYamlData), 'utf8');
        console.log(`✓ Created module.yaml with inheritance tracking`);
        
        // Update the module's README.md with new metadata if provided
        const readmePath = path.join(targetModulePath, 'README.md');
        if (hasMetadataCustomization && fsSync.existsSync(readmePath)) {
            const content = await fs.readFile(readmePath, 'utf8');
            const { frontmatter, content: markdownContent } = parseFrontmatter(content);
            
            // Prepare metadata object
            const metadataToWrite = {
                title: newModuleMetadata.title,
                description: newModuleMetadata.description,
                duration: newModuleMetadata.duration,
                difficulty: newModuleMetadata.difficulty || 'intermediate',
                type: newModuleMetadata.type || 'hands-on'
            };
            
            if (frontmatter) {
                // Update existing frontmatter with new metadata
                const updatedFrontmatter = {
                    ...frontmatter,
                    ...metadataToWrite
                };
                
                // Rebuild file with updated frontmatter
                const newContent = buildFrontmatter(updatedFrontmatter) + markdownContent;
                await fs.writeFile(readmePath, newContent, 'utf8');
                
                console.log(`✓ Updated module metadata in README.md`);
                
                return {
                    newModulePath: targetModuleRelativePath,
                    moduleDir: newModuleName,
                    metadata: updatedFrontmatter,
                    isCustomized: hasMetadataCustomization
                };
            } else {
                // No frontmatter exists - CREATE IT!
                console.log(`📝 Creating new frontmatter for module`);
                
                const newFrontmatter = metadataToWrite;
                const newContent = buildFrontmatter(newFrontmatter) + '\n' + content;
                await fs.writeFile(readmePath, newContent, 'utf8');
                
                console.log(`✓ Created module metadata in README.md`);
                
                return {
                    newModulePath: targetModuleRelativePath,
                    moduleDir: newModuleName,
                    metadata: newFrontmatter,
                    isCustomized: hasMetadataCustomization
                };
            }
        }
        
        // If no README.md or no frontmatter, just return basic info
        return {
            newModulePath: targetModuleRelativePath,
            moduleDir: newModuleName,
            metadata: newModuleMetadata
        };
        
    } catch (error) {
        throw new Error(`Failed to copy module: ${error.message}`);
    }
}

/**
 * Recursively copy a directory
 * @param {string} src - Source directory path
 * @param {string} dest - Destination directory path
 */
async function copyDirectory(src, dest) {
    const fsSync = require('fs');
    
    // Create destination directory
    await fs.mkdir(dest, { recursive: true });
    
    // Read source directory
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            // Recursively copy subdirectory
            await copyDirectory(srcPath, destPath);
        } else {
            // Copy file
            await fs.copyFile(srcPath, destPath);
        }
    }
}

/**
 * Update module navigation while preserving content
 * @param {string} workshopId - Workshop ID
 * @returns {Promise<object>} Result with updated modules count
 */
async function updateModuleNavigation(workshopId) {
    try {
        const workshopPath = path.join(workshopsDir, workshopId);
        
        // Get workshop data
        const workshop = await getWorkshop(workshopId);
        if (!workshop || !workshop.modules || workshop.modules.length === 0) {
            throw new Error('Workshop not found or has no modules');
        }
        
        const modules = workshop.modules;
        const totalModules = modules.length;
        const updatedModules = [];
        
        for (let i = 0; i < modules.length; i++) {
            const moduleData = modules[i];
            const moduleName = moduleData.name || 'Untitled Module';
            
            // Get folder name - use actual folder from moduleRef if it's in this workshop
            let folderName;
            if (moduleData.moduleRef && moduleData.moduleRef.startsWith(`workshops/${workshopId}/`)) {
                // Extract actual folder name from moduleRef (for customized modules)
                folderName = path.basename(moduleData.moduleRef);
            } else {
                // Generate folder name from index and name (for inherited modules)
                folderName = `module-${String(i + 1).padStart(2, '0')}-${moduleName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
            }
            
            const modulePath = path.join(workshopPath, folderName);
            const readmePath = path.join(modulePath, 'README.md');
            
            // Check if module README exists
            try {
                await fs.access(readmePath);
            } catch {
                console.log(`Skipping ${folderName} - README.md not found`);
                continue;
            }
            
            // Read current content
            let content = await fs.readFile(readmePath, 'utf-8');
            
            // CRITICAL: Extract frontmatter FIRST to preserve it
            const { frontmatter, content: contentWithoutFrontmatter } = parseFrontmatter(content);
            
            // Extract user content (between edit markers) from content WITHOUT frontmatter
            let userContent = contentWithoutFrontmatter;
            
            // Remove existing navigation header if present
            const headerMatch = contentWithoutFrontmatter.match(/<!-- ⚠️ AUTO-GENERATED NAVIGATION - DO NOT EDIT BELOW THIS LINE ⚠️ -->.*?<!-- ✏️ EDIT YOUR CONTENT BELOW THIS LINE ✏️ -->\n\n/s);
            if (headerMatch) {
                userContent = contentWithoutFrontmatter.substring(headerMatch[0].length);
            }
            
            // Remove existing navigation footer if present
            const footerMatch = userContent.match(/\n\n<!-- ✏️ EDIT YOUR CONTENT ABOVE THIS LINE ✏️ -->.*$/s);
            if (footerMatch) {
                userContent = userContent.substring(0, userContent.length - footerMatch[0].length);
            }
            
            // Prepare navigation options - use actual folder names
            const prevModule = i > 0 ? {
                name: modules[i - 1].name,
                folder: modules[i - 1].moduleRef && modules[i - 1].moduleRef.startsWith(`workshops/${workshopId}/`) 
                    ? path.basename(modules[i - 1].moduleRef)
                    : `module-${String(i).padStart(2, '0')}-${modules[i - 1].name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
            } : null;
            
            const nextModule = i < modules.length - 1 ? {
                name: modules[i + 1].name,
                folder: modules[i + 1].moduleRef && modules[i + 1].moduleRef.startsWith(`workshops/${workshopId}/`) 
                    ? path.basename(modules[i + 1].moduleRef)
                    : `module-${String(i + 2).padStart(2, '0')}-${modules[i + 1].name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
            } : null;
            
            // Generate new navigation
            const header = generateModuleNavigation({
                workshopTitle: workshop.title,
                workshopId,
                moduleName,
                moduleIndex: i,
                totalModules,
                prevModule,
                nextModule
            });
            
            const footer = generateModuleFooter({
                workshopId,
                moduleIndex: i,
                totalModules,
                prevModule,
                nextModule
            });
            
            // CRITICAL: Rebuild with frontmatter + navigation + user content
            let newContent = '';
            
            // Add frontmatter if it exists
            if (frontmatter && Object.keys(frontmatter).length > 0) {
                newContent = buildFrontmatter(frontmatter) + '\n';
            }
            
            // Add navigation header + user content + footer
            newContent += header + userContent.trim() + footer;
            
            // Write back
            await fs.writeFile(readmePath, newContent, 'utf-8');
            
            updatedModules.push({ folderName, moduleName });
        }
        
        return {
            success: true,
            updated: updatedModules.length,
            modules: updatedModules
        };
    } catch (error) {
        throw new Error(`Failed to update module navigation: ${error.message}`);
    }
}

/**
 * Extract editable content from markdown file (between edit markers)
 * @param {string} content - Full markdown content
 * @param {string} startMarker - Start marker for editable section
 * @param {string} endMarker - End marker for editable section
 * @returns {string} Editable content only, or full content if markers not found
 */
function extractEditableContent(content, startMarker, endMarker) {
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker);
    
    if (startIdx === -1 || endIdx === -1) {
        // No markers found, return full content
        return content;
    }
    
    // Extract content between markers (excluding the markers themselves)
    return content.substring(startIdx + startMarker.length, endIdx).trim();
}

/**
 * Check if a module has diverged from its parent
 * @param {string} modulePath - Relative path to module
 * @returns {Promise<Object>} Object with hasDiverged boolean and details
 */
async function checkModuleDivergence(modulePath) {
    try {
        const fullModulePath = path.join(repoRoot, modulePath);
        const moduleYamlPath = path.join(fullModulePath, 'module.yaml');
        
        // Check if module.yaml exists
        let moduleYaml;
        try {
            const yamlContent = await fs.readFile(moduleYamlPath, 'utf-8');
            moduleYaml = yaml.load(yamlContent);
        } catch {
            // No module.yaml, so not inherited
            return { hasDiverged: false, hasParent: false };
        }
        
        // Check if has inheritance info
        if (!moduleYaml || !moduleYaml.inheritance || !moduleYaml.inheritance.parentPath) {
            return { hasDiverged: false, hasParent: false };
        }
        
        // Check if module is marked as customized (independent from parent)
        if (moduleYaml.inheritance.customized === true) {
            return {
                hasDiverged: false,
                hasParent: true,
                isCustomized: true,
                customizationReason: moduleYaml.inheritance.customizationReason || 'Customized module',
                parentPath: moduleYaml.inheritance.parentPath
            };
        }
        
        const parentPath = path.join(repoRoot, moduleYaml.inheritance.parentPath);
        
        // Check if parent exists
        try {
            await fs.access(parentPath);
        } catch {
            return { 
                hasDiverged: true, 
                hasParent: true,
                reason: 'Parent module not found',
                parentPath: moduleYaml.inheritance.parentPath
            };
        }
        
        // Compare file lists
        const moduleFiles = await getModuleFiles(fullModulePath);
        const parentFiles = await getModuleFiles(parentPath);
        
        // Check if file counts differ (excluding module.yaml)
        const moduleFileSet = new Set(moduleFiles.filter(f => f !== 'module.yaml'));
        const parentFileSet = new Set(parentFiles);
        
        if (moduleFileSet.size !== parentFileSet.size) {
            return {
                hasDiverged: true,
                hasParent: true,
                reason: 'Different number of files',
                parentPath: moduleYaml.inheritance.parentPath,
                moduleFiles: moduleFileSet.size,
                parentFiles: parentFileSet.size
            };
        }
        
        // Check if any files are different
        for (const file of moduleFiles) {
            if (file === 'module.yaml') continue; // Skip module.yaml
            
            const moduleFilePath = path.join(fullModulePath, file);
            const parentFilePath = path.join(parentPath, file);
            
            try {
                // Check if file exists in parent
                await fs.access(parentFilePath);
                
                // Special handling for README.md - only compare editable content
                if (file === 'README.md') {
                    const moduleContent = await fs.readFile(moduleFilePath, 'utf-8');
                    const parentContent = await fs.readFile(parentFilePath, 'utf-8');
                    
                    // Extract editable content (between edit markers)
                    const editStartMarker = '<!-- ✏️ EDIT YOUR CONTENT BELOW THIS LINE ✏️ -->';
                    const editEndMarker = '<!-- ✏️ EDIT YOUR CONTENT ABOVE THIS LINE ✏️ -->';
                    
                    const moduleEditable = extractEditableContent(moduleContent, editStartMarker, editEndMarker);
                    const parentEditable = extractEditableContent(parentContent, editStartMarker, editEndMarker);
                    
                    if (moduleEditable !== parentEditable) {
                        return {
                            hasDiverged: true,
                            hasParent: true,
                            reason: `File modified: ${file}`,
                            parentPath: moduleYaml.inheritance.parentPath,
                            modulePath: modulePath
                        };
                    }
                } else {
                    // For all other files, compare file sizes
                    const moduleStat = await fs.stat(moduleFilePath);
                    const parentStat = await fs.stat(parentFilePath);
                    
                    if (moduleStat.size !== parentStat.size) {
                        return {
                            hasDiverged: true,
                            hasParent: true,
                            reason: `File modified: ${file}`,
                            parentPath: moduleYaml.inheritance.parentPath,
                            modulePath: modulePath
                        };
                    }
                }
            } catch {
                // File doesn't exist in parent
                return {
                    hasDiverged: true,
                    hasParent: true,
                    reason: `Extra file: ${file}`,
                    parentPath: moduleYaml.inheritance.parentPath,
                    modulePath: modulePath
                };
            }
        }
        
        // No divergence detected
        return {
            hasDiverged: false,
            hasParent: true,
            parentPath: moduleYaml.inheritance.parentPath,
            inheritedAt: moduleYaml.inheritance.inheritedAt
        };
    } catch (error) {
        console.error(`Error checking divergence for ${modulePath}:`, error);
        return { hasDiverged: false, hasParent: false, error: error.message };
    }
}

/**
 * Get all files in a module directory (recursive)
 * @param {string} dirPath - Directory path
 * @returns {Promise<Array>} Array of relative file paths
 */
async function getModuleFiles(dirPath) {
    const files = [];
    
    async function scan(currentPath, relativePath = '') {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
            
            if (entry.isDirectory()) {
                await scan(path.join(currentPath, entry.name), relPath);
            } else {
                files.push(relPath);
            }
        }
    }
    
    await scan(dirPath);
    return files;
}

/**
 * Reset module to match its parent (delete and re-copy)
 * @param {string} modulePath - Relative path to module
 * @returns {Promise<Object>} Result of reset operation
 */
async function resetModuleToParent(modulePath) {
    try {
        const fullModulePath = path.join(repoRoot, modulePath);
        const moduleYamlPath = path.join(fullModulePath, 'module.yaml');
        
        // Read module.yaml to get parent path
        const yamlContent = await fs.readFile(moduleYamlPath, 'utf-8');
        const moduleYaml = yaml.load(yamlContent);
        
        if (!moduleYaml || !moduleYaml.inheritance || !moduleYaml.inheritance.parentPath) {
            throw new Error('Module does not have a parent reference');
        }
        
        const parentPath = path.join(repoRoot, moduleYaml.inheritance.parentPath);
        
        // Check if parent exists
        try {
            await fs.access(parentPath);
        } catch {
            throw new Error(`Parent module not found: ${moduleYaml.inheritance.parentPath}`);
        }
        
        // Delete all files except module.yaml (we'll update it)
        const entries = await fs.readdir(fullModulePath, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name === 'module.yaml') continue;
            
            const entryPath = path.join(fullModulePath, entry.name);
            if (entry.isDirectory()) {
                await fs.rm(entryPath, { recursive: true, force: true });
            } else {
                await fs.unlink(entryPath);
            }
        }
        
        // Copy all files from parent (except module.yaml)
        const parentEntries = await fs.readdir(parentPath, { withFileTypes: true });
        for (const entry of parentEntries) {
            if (entry.name === 'module.yaml') continue;
            
            const srcPath = path.join(parentPath, entry.name);
            const destPath = path.join(fullModulePath, entry.name);
            
            if (entry.isDirectory()) {
                await copyModuleFiles(srcPath, destPath);
            } else {
                await fs.copyFile(srcPath, destPath);
            }
        }
        
        // Update module.yaml with new inheritedAt timestamp
        moduleYaml.inheritance.inheritedAt = new Date().toISOString();
        await fs.writeFile(moduleYamlPath, yaml.dump(moduleYaml), 'utf-8');
        
        console.log(`✅ Reset module to parent: ${modulePath}`);
        return {
            success: true,
            message: 'Module reset to parent state',
            parentPath: moduleYaml.inheritance.parentPath,
            resetAt: moduleYaml.inheritance.inheritedAt
        };
    } catch (error) {
        throw new Error(`Failed to reset module: ${error.message}`);
    }
}

/**
 * Update module README.md frontmatter with new metadata
 * Note: Title cannot be changed once set (immutable)
 */
async function updateModuleFrontmatter(modulePath, metadata) {
    const fullPath = path.join(repoRoot, modulePath);
    const readmePath = path.join(fullPath, 'README.md');
    const moduleYamlPath = path.join(fullPath, 'module.yaml');
    
    // Read existing README
    const readmeContent = await fs.readFile(readmePath, 'utf-8');
    
    // Parse existing frontmatter
    const { frontmatter, content } = parseFrontmatter(readmeContent);
    
    // Check if module has inheritance
    let moduleYaml = null;
    let hasInheritance = false;
    try {
        const yamlContent = await fs.readFile(moduleYamlPath, 'utf-8');
        moduleYaml = yaml.load(yamlContent);
        hasInheritance = moduleYaml && moduleYaml.inheritance && moduleYaml.inheritance.parentPath;
    } catch {
        // No module.yaml or no inheritance
    }
    
    // ⚠️ IMPORTANT: Title is immutable once set
    // If frontmatter has a title and user tries to change it, use existing title
    const titleToUse = frontmatter.title || metadata.title;
    
    // Warn if user tried to change title
    if (frontmatter.title && metadata.title && frontmatter.title !== metadata.title) {
        console.warn(`⚠️ Cannot change module title from "${frontmatter.title}" to "${metadata.title}". Title is immutable.`);
    }
    
    // Merge new metadata with existing frontmatter
    const updatedFrontmatter = {
        ...frontmatter,
        title: titleToUse,  // Use existing title if present
        description: metadata.description,
        duration: metadata.duration,
        difficulty: metadata.difficulty || frontmatter.difficulty || 'intermediate',
        type: metadata.type || frontmatter.type || 'hands-on'
    };
    
    // If module has inheritance and is not already marked as customized,
    // check if metadata has changed and mark as customized
    if (hasInheritance && !moduleYaml.inheritance.customized) {
        // Check if any metadata field has changed from original
        const hasMetadataChanges = 
            frontmatter.title !== updatedFrontmatter.title ||
            frontmatter.description !== updatedFrontmatter.description ||
            frontmatter.duration !== updatedFrontmatter.duration ||
            frontmatter.difficulty !== updatedFrontmatter.difficulty ||
            frontmatter.type !== updatedFrontmatter.type;
        
        if (hasMetadataChanges) {
            // Mark as customized in module.yaml
            moduleYaml.inheritance.customized = true;
            moduleYaml.inheritance.customizationReason = 'Metadata customized via Workshop Builder';
            moduleYaml.inheritance.customizedAt = new Date().toISOString();
            
            // Write updated module.yaml
            await fs.writeFile(moduleYamlPath, yaml.dump(moduleYaml), 'utf-8');
            
            console.log(`✏️ Module marked as customized: ${modulePath}`);
        }
    }
    
    // Rebuild README with updated frontmatter
    const newFrontmatterBlock = buildFrontmatter(updatedFrontmatter);
    const newReadmeContent = `---\n${newFrontmatterBlock}---\n\n${content}`;
    
    // Write back to README
    await fs.writeFile(readmePath, newReadmeContent, 'utf-8');
    
    // Check if title change was attempted
    const titleChangeBlocked = frontmatter.title && metadata.title && frontmatter.title !== metadata.title;
    
    return {
        modulePath,
        updatedMetadata: updatedFrontmatter,
        markedAsCustomized: hasInheritance && moduleYaml?.inheritance?.customized,
        titleChangeBlocked,
        message: titleChangeBlocked 
            ? `Metadata updated. Note: Title cannot be changed (kept as "${titleToUse}")`
            : 'Metadata updated successfully'
    };
}

/**
 * Migrate workshop modules - add metadata to module README.md frontmatter if missing
 * @param {string} workshopId - Workshop ID
 * @param {Array} modules - Array of module objects with full metadata
 * @returns {Promise<void>}
 */
async function migrateModulesToFrontmatter(workshopId, modules) {
    if (!modules || !Array.isArray(modules)) {
        return;
    }
    
    console.log(`[Migration] Checking ${modules.length} modules for ${workshopId}...`);
    
    for (const module of modules) {
        const moduleRef = module.moduleRef || module.name;
        if (!moduleRef) continue;
        
        try {
            const modulePath = path.join(repoRoot, moduleRef);
            const readmePath = path.join(modulePath, 'README.md');
            
            // Read existing README
            const readmeContent = await fs.readFile(readmePath, 'utf-8');
            const { frontmatter, content } = parseFrontmatter(readmeContent);
            
            // Check if frontmatter already has metadata
            if (frontmatter && frontmatter.title) {
                console.log(`[Migration] ✓ ${moduleRef} already has frontmatter`);
                continue;
            }
            
            // Module needs migration - add frontmatter from workshop.yaml metadata
            console.log(`[Migration] ⚠️  Migrating ${moduleRef} - adding frontmatter from workshop.yaml`);
            
            const newFrontmatter = {
                title: module.name || module.title || moduleRef,
                description: module.description || '',
                duration: module.duration || '30 minutes',
                difficulty: module.difficulty || 'intermediate',
                type: module.type || 'hands-on'
            };
            
            const newFrontmatterBlock = buildFrontmatter(newFrontmatter);
            const newReadmeContent = `---\n${newFrontmatterBlock}---\n\n${content}`;
            
            await fs.writeFile(readmePath, newReadmeContent, 'utf-8');
            console.log(`[Migration] ✅ Migrated ${moduleRef}`);
            
        } catch (error) {
            console.warn(`[Migration] ❌ Failed to migrate ${moduleRef}:`, error.message);
        }
    }
    
    console.log(`[Migration] Complete for ${workshopId}`);
}

/**
 * Enrich module references with metadata from their README.md files
 * @param {Array} moduleRefs - Array of module references (minimal objects with moduleRef, order, required)
 * @returns {Promise<Array>} Array of modules with full metadata from README.md
 */
async function enrichModulesWithMetadata(moduleRefs) {
    if (!moduleRefs || !Array.isArray(moduleRefs)) {
        return [];
    }
    
    const enrichedModules = await Promise.all(moduleRefs.map(async (ref, index) => {
        // Handle different formats
        let moduleRef, order, required, existingMetadata = null;
        
        if (typeof ref === 'string') {
            // Old format: just a string path
            moduleRef = ref;
            order = index + 1;
            required = true;
        } else if (typeof ref === 'object') {
            // Could be minimal format OR old format with full metadata
            moduleRef = ref.moduleRef || ref.name;
            order = ref.order || index + 1;
            required = ref.required !== undefined ? ref.required : true;
            
            // Store existing metadata if present (for migration fallback)
            if (ref.name || ref.title || ref.description || ref.duration) {
                existingMetadata = {
                    name: ref.name || ref.title,
                    title: ref.title || ref.name,
                    description: ref.description,
                    duration: ref.duration,
                    difficulty: ref.difficulty,
                    type: ref.type
                };
            }
        }
        
        if (!moduleRef) {
            console.warn(`Module reference missing moduleRef at index ${index}:`, ref);
            return null;
        }
        
        // Read metadata from module's README.md
        try {
            const modulePath = path.join(repoRoot, moduleRef);
            const readmePath = path.join(modulePath, 'README.md');
            const readmeContent = await fs.readFile(readmePath, 'utf-8');
            const { frontmatter } = parseFrontmatter(readmeContent);
            
            // Also check for module.yaml for inheritance AND metadata
            let inheritance = null;
            let moduleYamlMetadata = null;
            try {
                const yamlPath = path.join(modulePath, 'module.yaml');
                const yamlContent = await fs.readFile(yamlPath, 'utf-8');
                const moduleYaml = yaml.load(yamlContent);
                inheritance = moduleYaml.inheritance || null;
                
                // Extract metadata from module.yaml (fallback source)
                if (moduleYaml) {
                    moduleYamlMetadata = {
                        title: moduleYaml.title,
                        description: moduleYaml.description,
                        duration: moduleYaml.duration 
                            ? (typeof moduleYaml.duration === 'number' ? `${moduleYaml.duration} minutes` : moduleYaml.duration)
                            : null,
                        difficulty: moduleYaml.difficulty,
                        type: moduleYaml.type
                    };
                }
            } catch (e) {
                // No module.yaml - that's fine
            }
            
            // Priority: README.md frontmatter > module.yaml > workshop.yaml (existingMetadata)
            let metadata = null;
            if (frontmatter && frontmatter.title) {
                metadata = frontmatter; // Single source of truth
            } else if (moduleYamlMetadata && moduleYamlMetadata.title) {
                metadata = moduleYamlMetadata; // Fallback to module.yaml
            } else if (existingMetadata) {
                metadata = existingMetadata; // Fallback to workshop.yaml (migration scenario)
            }
            
            if (!metadata || !metadata.title) {
                console.warn(`[Enrichment] ⚠️  No metadata for ${moduleRef} - needs migration!`);
            }
            
            return {
                order,
                moduleRef,
                required,
                name: metadata?.title || metadata?.name || moduleRef,
                title: metadata?.title || metadata?.name || moduleRef,
                description: metadata?.description || '',
                duration: metadata?.duration || '30 minutes',
                difficulty: metadata?.difficulty || 'intermediate',
                type: metadata?.type || 'hands-on',
                inheritance
            };
        } catch (error) {
            console.warn(`Failed to read metadata for module ${moduleRef}:`, error.message);
            
            // Fallback to existing metadata if available
            if (existingMetadata) {
                return {
                    order,
                    moduleRef,
                    required,
                    ...existingMetadata,
                    inheritance: null
                };
            }
            
            // Last resort: return minimal data
            return {
                order,
                moduleRef,
                required,
                name: moduleRef,
                title: moduleRef,
                description: 'Module metadata not found',
                duration: '30 minutes',
                difficulty: 'intermediate',
                type: 'hands-on',
                inheritance: null
            };
        }
    }));
    
    return enrichedModules.filter(m => m !== null);
}

// ============================================================================
// MODULE DELETION WITH INHERITANCE CHAIN MANAGEMENT
// ============================================================================

/**
 * Find all child modules that reference a specific parent module
 * @param {string} parentPath - Path to the parent module
 * @returns {Array} Array of child module info objects
 */
async function findChildrenOfModule(parentPath) {
    const allModules = await findAllModules();
    const children = [];
    
    for (const module of allModules) {
        if (module.inheritance && module.inheritance.parentPath === parentPath) {
            children.push({
                path: module.path,
                workshopId: module.workshopId,
                inheritance: module.inheritance,
                metadata: module.metadata
            });
        }
    }
    
    return children;
}

/**
 * Analyze the impact of deleting a module
 * @param {string} modulePath - Path to the module to delete
 * @returns {Object} Analysis results with affected modules
 */
async function analyzeModuleDeletion(modulePath) {
    const fullPath = path.join(repoRoot, modulePath);
    
    // Check if module exists
    try {
        await fs.access(fullPath);
    } catch {
        throw new Error(`Module not found: ${modulePath}`);
    }
    
    // Load module info
    const moduleYamlPath = path.join(fullPath, 'module.yaml');
    const readmePath = path.join(fullPath, 'README.md');
    
    let moduleYaml = null;
    let hasParent = false;
    let parentPath = null;
    let grandparentPath = null;
    
    try {
        const yamlContent = await fs.readFile(moduleYamlPath, 'utf-8');
        moduleYaml = yaml.load(yamlContent);
        hasParent = moduleYaml?.inheritance?.parentPath ? true : false;
        parentPath = moduleYaml?.inheritance?.parentPath || null;
        
        // Find grandparent if parent exists
        if (parentPath) {
            const parentYamlPath = path.join(repoRoot, parentPath, 'module.yaml');
            try {
                const parentYamlContent = await fs.readFile(parentYamlPath, 'utf-8');
                const parentYaml = yaml.load(parentYamlContent);
                grandparentPath = parentYaml?.inheritance?.parentPath || null;
            } catch {
                // Parent has no module.yaml or no inheritance
            }
        }
    } catch {
        // No module.yaml means no inheritance
    }
    
    // Find all children
    const children = await findChildrenOfModule(modulePath);
    const hasChildren = children.length > 0;
    
    // Determine deletion scenario
    let scenario;
    let action;
    let affectedModules = [];
    
    if (!hasParent && !hasChildren) {
        scenario = 'standalone';
        action = 'delete_simple';
    } else if (!hasParent && hasChildren) {
        scenario = 'parent_with_children';
        action = 'delete_parent_orphan_children';
        affectedModules = children.map(child => ({
            path: child.path,
            action: 'orphan',
            oldState: child.inheritance.customized ? 'Customized' : 'Synced',
            newState: 'Modified',
            reason: 'Parent deleted with no grandparent'
        }));
    } else if (hasParent && hasChildren) {
        scenario = 'middle_of_chain';
        if (grandparentPath) {
            action = 'delete_middle_relink_to_grandparent';
            affectedModules = children.map(child => ({
                path: child.path,
                action: 'reparent',
                oldParent: modulePath,
                newParent: grandparentPath,
                reason: 'Re-parented to grandparent'
            }));
        } else {
            action = 'delete_middle_orphan_children';
            affectedModules = children.map(child => ({
                path: child.path,
                action: 'orphan',
                oldState: child.inheritance.customized ? 'Customized' : 'Synced',
                newState: 'Modified',
                reason: 'Parent deleted, no grandparent available'
            }));
        }
    } else if (hasParent && !hasChildren) {
        scenario = 'leaf_node';
        action = 'delete_simple';
    }
    
    // Get module metadata for warnings
    let metadata = {};
    try {
        const readmeContent = await fs.readFile(readmePath, 'utf-8');
        const { frontmatter } = parseFrontmatter(readmeContent);
        metadata = frontmatter || {};
    } catch {
        // No README or can't parse
    }
    
    return {
        modulePath,
        exists: true,
        scenario,
        action,
        hasParent,
        parentPath,
        grandparentPath,
        hasChildren,
        childrenCount: children.length,
        children,
        affectedModules,
        metadata,
        warnings: generateDeletionWarnings(scenario, children.length, metadata)
    };
}

/**
 * Generate warnings for module deletion
 */
function generateDeletionWarnings(scenario, childrenCount, metadata) {
    const warnings = [];
    
    if (childrenCount > 0) {
        warnings.push({
            type: 'children',
            severity: 'high',
            message: `This module has ${childrenCount} child module(s) that will be affected`
        });
    }
    
    if (metadata.customized || metadata.diverged) {
        warnings.push({
            type: 'customized_content',
            severity: 'medium',
            message: 'This module has customized content that will be permanently deleted'
        });
    }
    
    if (scenario === 'parent_with_children') {
        warnings.push({
            type: 'orphan_children',
            severity: 'high',
            message: 'Child modules will become standalone (orphaned) - no parent available'
        });
    }
    
    return warnings;
}

/**
 * Orphan child modules (remove parent reference, convert to Modified state)
 * @param {Array} children - Array of child module info objects
 */
async function orphanChildren(children) {
    const results = [];
    
    for (const child of children) {
        try {
            const childYamlPath = path.join(repoRoot, child.path, 'module.yaml');
            
            // Read existing module.yaml
            const yamlContent = await fs.readFile(childYamlPath, 'utf-8');
            const moduleYaml = yaml.load(yamlContent);
            
            const oldState = moduleYaml.inheritance.customized ? 'Customized' : 'Synced';
            
            // Remove inheritance entirely - module becomes standalone (Modified)
            delete moduleYaml.inheritance;
            
            // Write updated module.yaml
            await fs.writeFile(childYamlPath, yaml.dump(moduleYaml), 'utf-8');
            
            results.push({
                path: child.path,
                success: true,
                oldState,
                newState: 'Modified',
                action: 'orphaned'
            });
            
            console.log(`✓ Orphaned module: ${child.path} (${oldState} → Modified)`);
        } catch (error) {
            results.push({
                path: child.path,
                success: false,
                error: error.message
            });
            console.error(`✗ Failed to orphan module: ${child.path}`, error);
        }
    }
    
    return results;
}

/**
 * Re-parent child modules to a new parent (usually grandparent)
 * @param {Array} children - Array of child module info objects
 * @param {string} newParentPath - Path to the new parent module
 */
async function reparentChildren(children, newParentPath) {
    const results = [];
    
    for (const child of children) {
        try {
            const childYamlPath = path.join(repoRoot, child.path, 'module.yaml');
            
            // Read existing module.yaml
            const yamlContent = await fs.readFile(childYamlPath, 'utf-8');
            const moduleYaml = yaml.load(yamlContent);
            
            const oldParent = moduleYaml.inheritance.parentPath;
            
            // Update parent reference
            moduleYaml.inheritance.parentPath = newParentPath;
            moduleYaml.inheritance.lastSyncedAt = new Date().toISOString();
            moduleYaml.inheritance.reparentedFrom = oldParent;
            moduleYaml.inheritance.reparentedAt = new Date().toISOString();
            
            // Write updated module.yaml
            await fs.writeFile(childYamlPath, yaml.dump(moduleYaml), 'utf-8');
            
            results.push({
                path: child.path,
                success: true,
                oldParent,
                newParent: newParentPath,
                action: 'reparented'
            });
            
            console.log(`✓ Re-parented module: ${child.path}`);
            console.log(`  ${oldParent} → ${newParentPath}`);
        } catch (error) {
            results.push({
                path: child.path,
                success: false,
                error: error.message
            });
            console.error(`✗ Failed to re-parent module: ${child.path}`, error);
        }
    }
    
    return results;
}

/**
 * Delete a module and handle inheritance chain
 * @param {string} modulePath - Path to the module to delete
 * @param {Object} options - Deletion options
 * @returns {Object} Deletion results
 */
async function deleteModule(modulePath, options = {}) {
    const {
        force = false,
        removeFromWorkshops = true
    } = options;
    
    console.log(`\n🗑️ Deleting module: ${modulePath}`);
    
    // Step 1: Analyze deletion impact
    const analysis = await analyzeModuleDeletion(modulePath);
    
    // Step 2: Check for blocking conditions
    if (!force && analysis.warnings.some(w => w.severity === 'high')) {
        return {
            success: false,
            blocked: true,
            reason: 'Module has high-severity warnings. Use force=true to override.',
            analysis
        };
    }
    
    // Step 3: Handle children based on scenario
    let childResults = [];
    
    if (analysis.action === 'delete_parent_orphan_children' || 
        analysis.action === 'delete_middle_orphan_children') {
        // Orphan children (remove parent reference)
        childResults = await orphanChildren(analysis.children);
    } else if (analysis.action === 'delete_middle_relink_to_grandparent') {
        // Re-parent children to grandparent
        childResults = await reparentChildren(analysis.children, analysis.grandparentPath);
    }
    
    // Step 4: Remove module from workshops if requested
    const workshopsUpdated = [];
    if (removeFromWorkshops) {
        const workshops = await listWorkshops();
        for (const workshop of workshops) {
            const hasModule = workshop.modules?.some(m => m.moduleRef === modulePath);
            if (hasModule) {
                // Remove module from workshop
                workshop.modules = workshop.modules.filter(m => m.moduleRef !== modulePath);
                // Renumber remaining modules
                workshop.modules.forEach((m, index) => m.order = index + 1);
                
                // Update workshop file
                await updateWorkshop(workshop.id, { modules: workshop.modules });
                workshopsUpdated.push(workshop.id);
                console.log(`✓ Removed from workshop: ${workshop.id}`);
            }
        }
    }
    
    // Step 5: Delete the physical module directory
    const fullPath = path.join(repoRoot, modulePath);
    try {
        await fs.rm(fullPath, { recursive: true, force: true });
        console.log(`✓ Deleted module directory: ${modulePath}`);
    } catch (error) {
        console.error(`✗ Failed to delete module directory: ${modulePath}`, error);
        return {
            success: false,
            error: `Failed to delete module directory: ${error.message}`,
            analysis,
            childResults
        };
    }
    
    // Step 6: Return comprehensive results
    return {
        success: true,
        deleted: {
            modulePath,
            scenario: analysis.scenario,
            action: analysis.action,
            hadParent: analysis.hasParent,
            parentPath: analysis.parentPath,
            hadChildren: analysis.hasChildren,
            childrenCount: analysis.childrenCount
        },
        affected: {
            orphanedModules: childResults.filter(r => r.action === 'orphaned'),
            reparentedModules: childResults.filter(r => r.action === 'reparented'),
            workshopsUpdated
        },
        message: `Module deleted successfully. ${childResults.length} module(s) affected.`
    };
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
    updateModuleNavigation,
    updateModuleFrontmatter,
    enrichModulesWithMetadata,
    migrateModulesToFrontmatter,
    // Module discovery and linking
    findAllModules,
    findRootModules,
    findSimilarModules,
    linkModuleToParent,
    promoteToRoot,
    checkModuleSyncStatus,
    // Multi-level hierarchy support
    getTopLevelModules,
    getChildrenOfModule,
    getDescendantInfo,
    getModuleAncestors,
    getModuleDepth,
    checkCircularDependency,
    getAllDescendants,
    // Module copying
    copyModule,
    // Module divergence checking and reset
    checkModuleDivergence,
    resetModuleToParent,
    // Module deletion with inheritance chain handling
    deleteModule,
    analyzeModuleDeletion,
    findChildrenOfModule,
    orphanChildren,
    reparentChildren
};
