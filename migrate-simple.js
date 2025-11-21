const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

const workshopsDir = '/repo/workshops';

function parseFrontmatter(content) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    if (match) {
        try {
            return { frontmatter: yaml.load(match[1]), content: match[2] };
        } catch (error) {
            return { frontmatter: null, content };
        }
    }
    return { frontmatter: null, content };
}

function extractMetadataFromContent(content) {
    const metadata = { title: null, duration: null, difficulty: 'intermediate', type: 'hands-on' };
    
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
        metadata.title = titleMatch[1].replace(/^Module \d+[A-Z]?:\s*/i, '').trim();
    }
    
    const durationMatch = content.match(/\*\*Duration:\*\*\s*(\d+)\s*minutes?/i);
    if (durationMatch) {
        metadata.duration = `${durationMatch[1]} minutes`;
    }
    
    return metadata;
}

async function migrateModule(modulePath) {
    const moduleDir = path.basename(modulePath);
    const readmePath = path.join(modulePath, 'README.md');
    const yamlPath = path.join(modulePath, 'module.yaml');
    
    console.log(`\n📝 ${moduleDir}`);
    
    try {
        const readmeContent = await fs.readFile(readmePath, 'utf-8');
        const { frontmatter, content } = parseFrontmatter(readmeContent);
        
        if (frontmatter && frontmatter.title) {
            console.log('   ✓ Has frontmatter - skipping');
            return 'skipped';
        }
        
        let metadata = {};
        
        // Try module.yaml first
        try {
            const yamlContent = await fs.readFile(yamlPath, 'utf-8');
            const moduleYaml = yaml.load(yamlContent);
            if (moduleYaml) {
                metadata = {
                    title: moduleYaml.title,
                    description: moduleYaml.description || '',
                    duration: typeof moduleYaml.duration === 'number' ? `${moduleYaml.duration} minutes` : (moduleYaml.duration || '30 minutes'),
                    difficulty: moduleYaml.difficulty || 'intermediate',
                    type: moduleYaml.type || 'hands-on'
                };
                console.log('   → From module.yaml');
            }
        } catch (e) {}
        
        // Extract from content if no module.yaml
        if (!metadata.title) {
            const extracted = extractMetadataFromContent(content);
            metadata = {
                title: extracted.title || moduleDir.replace(/^module-\d+-/, '').replace(/-/g, ' '),
                description: '',
                duration: extracted.duration || '30 minutes',
                difficulty: extracted.difficulty,
                type: extracted.type
            };
            console.log('   → From content');
        }
        
        const frontmatterYaml = yaml.dump({
            title: metadata.title,
            description: metadata.description,
            duration: metadata.duration,
            difficulty: metadata.difficulty,
            type: metadata.type
        }, { lineWidth: -1, noRefs: true });
        
        const newContent = `---\n${frontmatterYaml}---\n\n${content}`;
        await fs.writeFile(readmePath, newContent, 'utf-8');
        
        console.log(`   ✅ ${metadata.title}`);
        return 'migrated';
    } catch (error) {
        console.error(`   ❌ ${error.message}`);
        return 'error';
    }
}

async function main() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 Adding Frontmatter to Module README Files');
    console.log('='.repeat(60));
    
    const results = { migrated: 0, skipped: 0, errors: 0 };
    const workshops = ['deploy-redis-for-developers-amr', 'deploy-redis-for-developers-amr-4h'];
    
    for (const workshop of workshops) {
        const workshopPath = path.join(workshopsDir, workshop);
        console.log(`\n📁 Workshop: ${workshop}`);
        
        try {
            const entries = await fs.readdir(workshopPath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory() && entry.name.startsWith('module-')) {
                    const result = await migrateModule(path.join(workshopPath, entry.name));
                    results[result]++;
                }
            }
        } catch (e) {
            console.log(`   ⚠️  Not found`);
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Migrated: ${results.migrated} | ⏭️  Skipped: ${results.skipped} | ❌ Errors: ${results.errors}`);
    console.log('='.repeat(60) + '\n');
}

main();
