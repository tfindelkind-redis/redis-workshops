#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const yaml = require('yaml');

const workshopPath = './workshops/deploy-redis-for-developers-amr';

// Module folder mapping
const modules = [
    { order: 1, name: 'Redis Fundamentals', folder: 'module-01-redis-fundamentals' },
    { order: 2, name: 'Azure Managed Redis Architecture', folder: 'module-02-azure-managed-redis-architecture' },
    { order: 3, name: 'Well-Architected Framework Overview', folder: 'module-03-well-architected-framework-overview' },
    { order: 4, name: 'Reliability & Security Deep Dive', folder: 'module-04-reliability--security-deep-dive' },
    { order: 5, name: 'Cost Optimization & Operational Excellence', folder: 'module-05-cost-optimization--operational-excellence' },
    { order: 6, name: 'Performance Efficiency & Data Modeling', folder: 'module-06-performance-efficiency--data-modeling' },
    { order: 7, name: 'Provision & Connect Lab', folder: 'module-07-provision--connect-lab' },
    { order: 8, name: 'Implement Caching Lab', folder: 'module-08-implement-caching-lab' },
    { order: 9, name: 'Monitoring & Alerts Lab', folder: 'module-09-monitoring--alerts-lab' },
    { order: 10, name: 'Troubleshooting & Migration', folder: 'module-10-troubleshooting--migration' },
    { order: 11, name: 'Advanced Features', folder: 'module-11-advanced-features' }
];

const workshopTitle = 'Deploy Redis for Developers - Azure Managed Redis';
const totalModules = modules.length;

function generateModuleNavigation(moduleIndex) {
    const module = modules[moduleIndex];
    const prevModule = moduleIndex > 0 ? modules[moduleIndex - 1] : null;
    const nextModule = moduleIndex < totalModules - 1 ? modules[moduleIndex + 1] : null;
    
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

function generateModuleFooter(moduleIndex) {
    const module = modules[moduleIndex];
    const prevModule = moduleIndex > 0 ? modules[moduleIndex - 1] : null;
    const nextModule = moduleIndex < totalModules - 1 ? modules[moduleIndex + 1] : null;
    
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

async function fixModuleNavigation() {
    console.log('🔧 Fixing module navigation...\n');
    
    for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        const modulePath = path.join(workshopPath, module.folder, 'README.md');
        
        try {
            // Read current content
            let content = await fs.readFile(modulePath, 'utf-8');
            
            // Remove existing navigation markers if present
            content = content.replace(/<!-- ⚠️ AUTO-GENERATED NAVIGATION.*?<!-- ✏️ EDIT YOUR CONTENT BELOW THIS LINE ✏️ -->\n\n/gs, '');
            content = content.replace(/\n\n<!-- ✏️ EDIT YOUR CONTENT ABOVE THIS LINE ✏️ -->.*$/gs, '');
            
            // Generate new navigation
            const header = generateModuleNavigation(i);
            const footer = generateModuleFooter(i);
            
            // Combine
            const newContent = header + content.trim() + footer;
            
            // Write back
            await fs.writeFile(modulePath, newContent, 'utf-8');
            
            console.log(`✅ Fixed: ${module.folder}`);
        } catch (error) {
            console.error(`❌ Error fixing ${module.folder}:`, error.message);
        }
    }
    
    console.log('\n🎉 Done! All module navigation has been fixed.');
}

fixModuleNavigation().catch(console.error);
