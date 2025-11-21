#!/usr/bin/env node

/**
 * Migration Script: Add frontmatter to module README.md files
 * 
 * This script migrates module metadata to README.md frontmatter
 * making it the single source of truth.
 * 
 * Priority for metadata:
 * 1. module.yaml (if exists)
 * 2. Extract from workshop README.md
 * 3. Parse from module README.md content
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

const workshopsDir = path.join(__dirname, 'workshops');

// Parse frontmatter from content
function parseFrontmatter(content) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (match) {
        try {
            const frontmatter = yaml.load(match[1]);
            return { frontmatter, content: match[2] };
        } catch (error) {
            console.warn('Failed to parse frontmatter:', error.message);
        }
    }
    
    return { frontmatter: null, content };
}

// Build frontmatter YAML string
function buildFrontmatter(frontmatter) {
    try {
        const yamlContent = yaml.dump(frontmatter, {
            lineWidth: -1,
            noRefs: true
        });
        return yamlContent;
    } catch (error) {
        throw new Error(`Failed to build frontmatter YAML: ${error.message}`);
    }
}

// Extract metadata from module content (fallback)
function extractMetadataFromContent(content) {
    const metadata = {
        title: null,
        duration: null,
        difficulty: 'intermediate',
        type: 'hands-on'
    };
    
    // Extract title from first H1
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
        metadata.title = titleMatch[1]
            .replace(/^Module \d+[A-Z]?:\s*/i, '')
            .trim();
    }
    
    // Extract duration
    const durationMatch = content.match(/\*\*Duration:\*\*\s*(\d+)\s*minutes?/i);
    if (durationMatch) {
        metadata.duration = `${durationMatch[1]} minutes`;
    }
    
    // Extract level/difficulty
    const levelMatch = content.match(/\*\*Level:\*\*\s*(\w+)/i);
    if (levelMatch) {
        const level = levelMatch[1].toLowerCase();
        if (['beginner', 'intermediate', 'advanced'].includes(level)) {
            metadata.difficulty = level;
        } else if (level === 'foundation') {
            metadata.difficulty = 'beginner';
        }
    }
    
    // Extract format/type
    const formatMatch = content.match(/\*\*Format:\*\*\s*([^*\n]+)/i);
    if (formatMatch) {
        const format = formatMatch[1].toLowerCase();
        if (format.includes('lab') || format.includes('practical')) {
            metadata.type = 'hands-on';
        } else if (format.includes('theory') || format.includes('lecture')) {
            metadata.type = 'lecture';
        }
    }
    
    return metadata;
}

// Get module metadata from workshop README
async function getModuleMetadataFromWorkshop(workshopPath, moduleDir) {
    try {
        const readmePath = path.join(workshopPath, 'README.md');
        const content = await fs.readFile(readmePath, 'utf-8');
        const { frontmatter } = parseFrontmatter(content);
        
        if (frontmatter && frontmatter.modules) {
            for (const mod of frontmatter.modules) {
                const moduleRef = mod.moduleRef || mod.name;
                if (moduleRef && moduleRef.includes(moduleDir)) {
                    return {
                        title: mod.name || mod.title,
                        description: mod.description,
                        duration: typeof mod.duration === 'number' ? `${mod.duration} minutes` : mod.duration,
                        difficulty: mod.difficulty,
                        type: mod.type
                    };
                }
            }
        }
    } catch (error) {
        console.warn(`Could not read workshop metadata: ${error.message}`);
    }
    
    return null;
}

// Migrate a single module
async function migrateModule(modulePath, workshopPath) {
    const moduleDir = path.basename(modulePath);
    const readmePath = path.join(modulePath, 'README.md');
    const yamlPath = path.join(modulePath, 'module.yaml');
    
    console.log(`\n📝 Migrating: ${moduleDir}`);
    
    try {
        // Check if README exists
        const readmeContent = await fs.readFile(readmePath, 'utf-8');
        const { frontmatter, content } = parseFrontmatter(readmeContent);
        
        // Skip if already has frontmatter
        if (frontmatter && frontmatter.title) {
            console.log('   ✓ Already has frontmatter - skipping');
            return { status: 'skipped', reason: 'has_frontmatter' };
        }
        
        // Gather metadata from different sources
        let metadata = {};
        
        // 1. Try module.yaml
        try {
            const yamlContent = await fs.readFile(yamlPath, 'utf-8');
            const moduleYaml = yaml.load(yamlContent);
            if (moduleYaml) {
                metadata = {
                    title: moduleYaml.title,
                    description: moduleYaml.description,
                    duration: typeof moduleYaml.duration === 'number' 
                        ? `${moduleYaml.duration} minutes` 
                        : moduleYaml.duration,
                    difficulty: moduleYaml.difficulty,
                    type: moduleYaml.type
                };
                console.log('   → Found metadata in module.yaml');
            }
        } catch (e) {
            // No module.yaml, that's fine
        }
        
        // 2. Try workshop README
        if (!metadata.title) {
            const workshopMetadata = await getModuleMetadataFromWorkshop(workshopPath, moduleDir);
            if (workshopMetadata && workshopMetadata.title) {
                metadata = { ...metadata, ...workshopMetadata };
                console.log('   → Found metadata in workshop README');
            }
        }
        
        // 3. Extract from module content
        if (!metadata.title) {
            const extractedMetadata = extractMetadataFromContent(content);
            metadata = { ...metadata, ...extractedMetadata };
            console.log('   → Extracted metadata from content');
        }
        
        // Ensure we have at least a title
        if (!metadata.title) {
            metadata.title = moduleDir
                .replace(/^module-\d+-/, '')
                .replace(/-/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
            console.log('   → Generated title from directory name');
        }
        
        // Set defaults for missing fields
        metadata.description = metadata.description || '';
        metadata.duration = metadata.duration || '30 minutes';
        metadata.difficulty = metadata.difficulty || 'intermediate';
        metadata.type = metadata.type || 'hands-on';
        
        // Build new frontmatter
        const newFrontmatter = {
            title: metadata.title,
            description: metadata.description,
            duration: metadata.duration,
            difficulty: metadata.difficulty,
            type: metadata.type
        };
        
        // Create new README with frontmatter
        const frontmatterBlock = buildFrontmatter(newFrontmatter);
        const newReadmeContent = `---\n${frontmatterBlock}---\n\n${content}`;
        
        // Write back to README
        await fs.writeFile(readmePath, newReadmeContent, 'utf-8');
        
        console.log(`   ✅ Added frontmatter: ${metadata.title}`);
        return { status: 'migrated', metadata };
        
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        return { status: 'error', error: error.message };
    }
}

// Migrate all modules in a workshop
async function migrateWorkshop(workshopPath) {
    const workshopName = path.basename(workshopPath);
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🏗️  Workshop: ${workshopName}`);
    console.log('='.repeat(60));
    
    const entries = await fs.readdir(workshopPath, { withFileTypes: true });
    const results = {
        migrated: 0,
        skipped: 0,
        errors: 0
    };
    
    for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith('module-')) {
            const modulePath = path.join(workshopPath, entry.name);
            const result = await migrateModule(modulePath, workshopPath);
            
            if (result.status === 'migrated') results.migrated++;
            else if (result.status === 'skipped') results.skipped++;
            else if (result.status === 'error') results.errors++;
        }
    }
    
    return results;
}

// Main migration function
async function migrateAllModules() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 Module Migration: Add Frontmatter to README.md');
    console.log('='.repeat(60));
    
    const workshops = ['deploy-redis-for-developers-amr', 'deploy-redis-for-developers-amr-4h'];
    const totalResults = {
        migrated: 0,
        skipped: 0,
        errors: 0
    };
    
    for (const workshop of workshops) {
        const workshopPath = path.join(workshopsDir, workshop);
        
        try {
            await fs.access(workshopPath);
            const results = await migrateWorkshop(workshopPath);
            totalResults.migrated += results.migrated;
            totalResults.skipped += results.skipped;
            totalResults.errors += results.errors;
        } catch (error) {
            console.log(`\n⚠️  Workshop ${workshop} not found - skipping`);
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));
    console.log(`✅ Migrated: ${totalResults.migrated}`);
    console.log(`⏭️  Skipped:  ${totalResults.skipped}`);
    console.log(`❌ Errors:   ${totalResults.errors}`);
    console.log('='.repeat(60));
    
    if (totalResults.migrated > 0) {
        console.log('\n✨ Migration complete! All modules now have README.md frontmatter.');
        console.log('📝 Next steps:');
        console.log('   1. Review the changes: git diff');
        console.log('   2. Test the workshop builder');
        console.log('   3. Commit the changes if everything looks good');
    }
}

// Run migration
migrateAllModules().catch(error => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
});
