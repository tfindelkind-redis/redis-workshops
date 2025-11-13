#!/usr/bin/env python3
"""
Generate Module Data for GitHub Pages
Scans shared/modules and workshops/*/modules to create module-data.js
"""

import os
import sys
import json
import yaml
from pathlib import Path
from datetime import datetime

const REPO_ROOT = path.join(__dirname, '../..');
const SHARED_MODULES = path.join(REPO_ROOT, 'shared/modules');
const WORKSHOPS_DIR = path.join(REPO_ROOT, 'workshops');
const OUTPUT_FILE = path.join(REPO_ROOT, 'docs/module-data.js');

/**
 * Find all module directories
 */
function findModules() {
    const modules = [];
    
    // Scan canonical modules
    if (fs.existsSync(SHARED_MODULES)) {
        const canonicalDirs = fs.readdirSync(SHARED_MODULES, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory());
        
        for (const dir of canonicalDirs) {
            const modulePath = path.join(SHARED_MODULES, dir.name);
            const moduleYaml = path.join(modulePath, 'module.yaml');
            
            if (fs.existsSync(moduleYaml)) {
                modules.push({
                    type: 'canonical',
                    path: path.relative(REPO_ROOT, modulePath),
                    fullPath: modulePath
                });
            }
        }
    }
    
    // Scan workshop-specific modules
    if (fs.existsSync(WORKSHOPS_DIR)) {
        const workshops = fs.readdirSync(WORKSHOPS_DIR, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory());
        
        for (const workshop of workshops) {
            const modulesDir = path.join(WORKSHOPS_DIR, workshop.name, 'modules');
            
            if (fs.existsSync(modulesDir)) {
                const moduleDirs = fs.readdirSync(modulesDir, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory());
                
                for (const dir of moduleDirs) {
                    const modulePath = path.join(modulesDir, dir.name);
                    const moduleYaml = path.join(modulePath, 'module.yaml');
                    const lineageFile = path.join(modulePath, '.lineage');
                    
                    if (fs.existsSync(moduleYaml) && fs.existsSync(lineageFile)) {
                        modules.push({
                            type: 'customized',
                            workshop: workshop.name,
                            path: path.relative(REPO_ROOT, modulePath),
                            fullPath: modulePath
                        });
                    }
                }
            }
        }
    }
    
    return modules;
}

/**
 * Parse module data
 */
function parseModule(moduleMeta) {
    const moduleYamlPath = path.join(moduleMeta.fullPath, 'module.yaml');
    const moduleData = yaml.load(fs.readFileSync(moduleYamlPath, 'utf8'));
    
    const result = {
        id: moduleData.id,
        name: moduleData.name,
        description: moduleData.description || '',
        type: moduleMeta.type,
        path: moduleMeta.path,
        duration: moduleData.metadata?.duration || 60,
        difficulty: moduleData.metadata?.difficulty || 'beginner',
        tags: moduleData.metadata?.tags || [],
        sections: moduleData.sections?.length || 0,
        exercises: moduleData.exercises?.length || 0,
        lastUpdated: moduleData.last_updated || new Date().toISOString().split('T')[0]
    };
    
    // Add lineage info for canonical modules
    if (moduleMeta.type === 'canonical') {
        result.children = moduleData.lineage?.children || [];
    }
    
    // Add parent info for customized modules
    if (moduleMeta.type === 'customized') {
        const lineagePath = path.join(moduleMeta.fullPath, '.lineage');
        const lineageData = yaml.load(fs.readFileSync(lineagePath, 'utf8'));
        
        result.parent = lineageData.parent_module;
        result.workshop = moduleMeta.workshop;
        
        // Count customizations
        const files = lineageData.files || {};
        result.customizations = {
            files_customized: Object.values(files).filter(f => f.status === 'customized').length,
            files_inherited: Object.values(files).filter(f => f.status === 'inherited').length,
            files_new: Object.values(files).filter(f => f.status === 'new').length
        };
    }
    
    return result;
}

/**
 * Build version tree
 */
function buildVersionTree(modules) {
    const moduleMap = new Map(modules.map(m => [m.id, m]));
    const trees = [];
    
    // Find canonical modules (roots)
    const canonicalModules = modules.filter(m => m.type === 'canonical');
    
    for (const canonical of canonicalModules) {
        const tree = {
            ...canonical,
            versions: []
        };
        
        // Find direct children
        const children = modules.filter(m => m.parent === canonical.id);
        
        for (const child of children) {
            tree.versions.push({
                ...child,
                children: findDescendants(child.id, modules)
            });
        }
        
        trees.push(tree);
    }
    
    return trees;
}

/**
 * Find descendants recursively
 */
function findDescendants(parentId, allModules) {
    const children = allModules.filter(m => m.parent === parentId);
    
    return children.map(child => ({
        ...child,
        children: findDescendants(child.id, allModules)
    }));
}

/**
 * Generate JavaScript file
 */
function generateJavaScript(modules, versionTrees) {
    const timestamp = new Date().toISOString();
    
    return `// Module Data for GitHub Pages
// This file is auto-generated by shared/tools/generate-module-data.js
// Generated on: ${timestamp}

const modulesData = ${JSON.stringify(modules, null, 4)};

const moduleVersionTrees = ${JSON.stringify(versionTrees, null, 4)};

// Helper functions
function findModuleById(id) {
    return modulesData.find(m => m.id === id);
}

function findCanonicalModules() {
    return modulesData.filter(m => m.type === 'canonical');
}

function findCustomizedModules() {
    return modulesData.filter(m => m.type === 'customized');
}

function findModulesByWorkshop(workshopName) {
    return modulesData.filter(m => m.workshop === workshopName);
}

function getVersionTree(moduleNameOrId) {
    return moduleVersionTrees.find(tree => 
        tree.id === moduleNameOrId || 
        tree.name.toLowerCase().includes(moduleNameOrId.toLowerCase())
    );
}

function searchModules(query) {
    const lowerQuery = query.toLowerCase();
    return modulesData.filter(m =>
        m.name.toLowerCase().includes(lowerQuery) ||
        m.description.toLowerCase().includes(lowerQuery) ||
        m.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
}
`;
}

/**
 * Main function
 */
function main() {
    console.log('🔍 Scanning for modules...');
    
    const moduleMetas = findModules();
    console.log(`   Found ${moduleMetas.length} modules`);
    
    console.log('📊 Parsing module data...');
    const modules = moduleMetas.map(parseModule);
    
    const canonicalCount = modules.filter(m => m.type === 'canonical').length;
    const customizedCount = modules.filter(m => m.type === 'customized').length;
    console.log(`   Canonical: ${canonicalCount}, Customized: ${customizedCount}`);
    
    console.log('🌳 Building version trees...');
    const versionTrees = buildVersionTree(modules);
    console.log(`   Created ${versionTrees.length} version trees`);
    
    console.log('📝 Generating JavaScript...');
    const jsContent = generateJavaScript(modules, versionTrees);
    
    fs.writeFileSync(OUTPUT_FILE, jsContent, 'utf8');
    console.log(`✅ Generated ${OUTPUT_FILE}`);
    
    // Print summary
    console.log('\n📋 Summary:');
    console.log(`   Total modules: ${modules.length}`);
    console.log(`   Canonical modules: ${canonicalCount}`);
    console.log(`   Customized modules: ${customizedCount}`);
    console.log(`   Version trees: ${versionTrees.length}`);
    console.log('\n✨ Module data ready for GitHub Pages!');
}

// Run if called directly
if (require.main === module) {
    try {
        main();
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

module.exports = { findModules, parseModule, buildVersionTree };
