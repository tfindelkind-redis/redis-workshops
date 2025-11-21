#!/usr/bin/env node

/**
 * Migration Script: Convert all workshops to sequential module numbering
 * 
 * Usage:
 *   node migrate-all-workshops.js [--dry-run] [--workshop=WORKSHOP_ID]
 */

const workshopOps = require('./shared/tools/workshop-ops');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose');
const specificWorkshop = args.find(arg => arg.startsWith('--workshop='))?.split('=')[1];

async function migrateWorkshop(workshopId) {
    try {
        const workshop = await workshopOps.getWorkshop(workshopId);
        if (!workshop) {
            console.log(`   ❌ Workshop not found: ${workshopId}`);
            return { workshopId, success: false, error: 'Not found' };
        }

        console.log(`\n📦 ${workshop.title || workshopId}`);
        console.log(`   ID: ${workshopId}`);
        console.log(`   Modules: ${workshop.modules.length}`);

        if (isDryRun) {
            // Dry run - just show what would be renamed
            const workshopPath = path.join(process.cwd(), 'workshops', workshopId);
            const fs = require('fs').promises;
            
            const entries = await fs.readdir(workshopPath, { withFileTypes: true });
            const moduleDirectories = entries
                .filter(entry => entry.isDirectory() && entry.name.startsWith('module-'))
                .map(entry => entry.name)
                .sort();

            const changes = [];
            for (let i = 0; i < workshop.modules.length; i++) {
                const module = workshop.modules[i];
                const actualDir = moduleDirectories[i];
                const expectedDir = workshopOps.generateModuleDirName(i + 1, module, module.isCustomized);
                
                if (actualDir !== expectedDir) {
                    changes.push({ from: actualDir, to: expectedDir });
                }
            }

            if (changes.length > 0) {
                console.log(`   🔄 Would rename ${changes.length} module(s):`);
                changes.forEach(change => {
                    console.log(`      ${change.from} → ${change.to}`);
                });
            } else {
                console.log(`   ✅ Already correctly numbered`);
            }

            return { workshopId, success: true, changes: changes.length, dryRun: true };
        } else {
            // Real migration
            const renames = await workshopOps.renumberModuleDirectories(workshopId);
            
            if (renames.length > 0) {
                console.log(`   ✅ Renamed ${renames.length} module(s)`);
                if (isVerbose) {
                    renames.forEach(r => {
                        console.log(`      ${path.basename(r.oldDir)} → ${path.basename(r.newDir)}`);
                    });
                }
            } else {
                console.log(`   ✅ Already correctly numbered`);
            }

            return { workshopId, success: true, changes: renames.length };
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        if (isVerbose) {
            console.error(error);
        }
        return { workshopId, success: false, error: error.message };
    }
}

async function migrateAllWorkshops() {
    console.log('🚀 Workshop Migration: Sequential Module Numbering\n');
    console.log('='.repeat(60));
    
    if (isDryRun) {
        console.log('🔍 DRY RUN MODE - No changes will be made');
    }
    if (specificWorkshop) {
        console.log(`🎯 Targeting specific workshop: ${specificWorkshop}`);
    }
    console.log('='.repeat(60));

    try {
        let workshopsToMigrate;
        
        if (specificWorkshop) {
            workshopsToMigrate = [{ workshopId: specificWorkshop }];
        } else {
            workshopsToMigrate = await workshopOps.listWorkshops();
            console.log(`\n📋 Found ${workshopsToMigrate.length} workshop(s)\n`);
        }

        const results = [];
        for (const workshop of workshopsToMigrate) {
            const result = await migrateWorkshop(workshop.workshopId);
            results.push(result);
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 MIGRATION SUMMARY');
        console.log('='.repeat(60));

        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        const withChanges = successful.filter(r => r.changes > 0);

        console.log(`\n✅ Successful: ${successful.length}/${results.length}`);
        console.log(`   📝 With changes: ${withChanges.length}`);
        
        if (failed.length > 0) {
            console.log(`\n❌ Failed: ${failed.length}`);
            failed.forEach(f => {
                console.log(`   - ${f.workshopId}: ${f.error}`);
            });
        }

        const totalChanges = withChanges.reduce((sum, r) => sum + r.changes, 0);
        console.log(`\n📦 Total modules ${isDryRun ? 'to be renamed' : 'renamed'}: ${totalChanges}`);

        if (isDryRun) {
            console.log('\n💡 Run without --dry-run to apply changes');
        }

        console.log('\n' + '='.repeat(60));

        if (failed.length > 0) {
            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        if (isVerbose) {
            console.error(error);
        }
        process.exit(1);
    }
}

// Run migration
migrateAllWorkshops().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
});
