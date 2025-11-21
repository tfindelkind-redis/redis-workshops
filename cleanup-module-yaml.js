#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * Clean up module.yaml files - remove metadata, keep only inheritance
 */
async function cleanupModuleYaml() {
    const workshopsDir = '/repo/workshops';
    
    // Find all module.yaml files
    const moduleYamlFiles = [];
    
    async function findModuleYaml(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                await findModuleYaml(fullPath);
            } else if (entry.name === 'module.yaml') {
                moduleYamlFiles.push(fullPath);
            }
        }
    }
    
    await findModuleYaml(workshopsDir);
    
    console.log(`Found ${moduleYamlFiles.length} module.yaml files`);
    
    let cleaned = 0;
    let deleted = 0;
    let skipped = 0;
    
    for (const yamlPath of moduleYamlFiles) {
        try {
            const content = await fs.readFile(yamlPath, 'utf-8');
            const data = yaml.load(content);
            
            if (!data) {
                console.log(`⚠️  Empty file: ${yamlPath}`);
                skipped++;
                continue;
            }
            
            // Check if it has inheritance
            if (data.inheritance) {
                // Keep ONLY inheritance
                const cleanData = {
                    inheritance: data.inheritance
                };
                
                // Write back the cleaned version
                const cleanYaml = yaml.dump(cleanData, {
                    lineWidth: -1,
                    noRefs: true
                });
                
                await fs.writeFile(yamlPath, cleanYaml, 'utf-8');
                console.log(`✅ Cleaned: ${yamlPath} (kept inheritance only)`);
                cleaned++;
            } else {
                // No inheritance - delete the file (it's no longer needed)
                await fs.unlink(yamlPath);
                console.log(`🗑️  Deleted: ${yamlPath} (no inheritance data)`);
                deleted++;
            }
        } catch (error) {
            console.error(`❌ Error processing ${yamlPath}:`, error.message);
            skipped++;
        }
    }
    
    console.log('\n=== Cleanup Complete ===');
    console.log(`✅ Cleaned: ${cleaned} files (removed metadata, kept inheritance)`);
    console.log(`🗑️  Deleted: ${deleted} files (no inheritance data)`);
    console.log(`⚠️  Skipped: ${skipped} files (errors or empty)`);
    console.log(`📊 Total: ${moduleYamlFiles.length} files processed`);
}

cleanupModuleYaml().catch(console.error);
