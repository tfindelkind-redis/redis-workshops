/**
 * Workshop Builder Server
 * REST API server for filesystem-integrated Workshop Builder GUI
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const gitOps = require('./git-ops');
const workshopOps = require('./workshop-ops');
const githubOps = require('./github-ops');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============================================================================
// Static Files & GUI
// ============================================================================

/**
 * GET /
 * Serve the Workshop Builder GUI
 */
app.get('/', (req, res) => {
    // GUI is in the repo root under shared/tools/
    const guiPath = path.join('/repo', 'shared', 'tools', 'workshop-builder-gui.html');
    res.sendFile(guiPath);
});

/**
 * Serve static assets if needed
 */
app.use('/static', express.static(path.join(__dirname, '../static')));

// ============================================================================
// Git Endpoints
// ============================================================================

/**
 * GET /api/git/init
 * Initialize: Check current branch, create new branch if on main
 */
app.get('/api/git/init', async (req, res) => {
    try {
        const result = await gitOps.initialize();
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Git init error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/git/branch/current
 * Get current branch name
 */
app.get('/api/git/branch/current', async (req, res) => {
    try {
        const branch = await gitOps.getCurrentBranch();
        res.json({
            success: true,
            branch
        });
    } catch (error) {
        console.error('Get branch error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/git/branch/create
 * Create a new branch
 */
app.post('/api/git/branch/create', async (req, res) => {
    try {
        const branch = await gitOps.createBranch();
        res.json({
            success: true,
            branch
        });
    } catch (error) {
        console.error('Create branch error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/git/branch/switch
 * Switch to a different branch
 * Body: { branch: "branch-name" }
 */
app.post('/api/git/branch/switch', async (req, res) => {
    try {
        const { branch } = req.body;
        if (!branch) {
            return res.status(400).json({
                success: false,
                error: 'Branch name is required'
            });
        }
        
        await gitOps.switchBranch(branch);
        res.json({
            success: true,
            branch
        });
    } catch (error) {
        console.error('Switch branch error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/git/branches
 * List all branches
 */
app.get('/api/git/branches', async (req, res) => {
    try {
        const branches = await gitOps.listBranches();
        res.json({
            success: true,
            ...branches
        });
    } catch (error) {
        console.error('List branches error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/git/commit
 * Commit changes
 * Body: { files: ["path/to/file"], message: "commit message" }
 */
app.post('/api/git/commit', async (req, res) => {
    try {
        const { files, message } = req.body;
        
        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Files array is required'
            });
        }
        
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Commit message is required'
            });
        }
        
        const result = await gitOps.commitChanges(files, message);
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Commit error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/git/status
 * Get repository status
 */
app.get('/api/git/status', async (req, res) => {
    try {
        const status = await gitOps.getStatus();
        res.json({
            success: true,
            ...status
        });
    } catch (error) {
        console.error('Status error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================================
// Workshop Endpoints
// ============================================================================

/**
 * GET /api/workshops
 * List all workshops
 */
app.get('/api/workshops', async (req, res) => {
    try {
        const workshops = await workshopOps.listWorkshops();
        res.json({
            success: true,
            workshops,
            count: workshops.length
        });
    } catch (error) {
        console.error('List workshops error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/workshops/:id
 * Get a specific workshop
 */
app.get('/api/workshops/:id', async (req, res) => {
    try {
        const workshop = await workshopOps.getWorkshop(req.params.id);
        res.json({
            success: true,
            workshop
        });
    } catch (error) {
        console.error('Get workshop error:', error);
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/workshops
 * Create a new workshop
 * Body: { workshopId, title, description, duration, difficulty, modules }
 */
app.post('/api/workshops', async (req, res) => {
    try {
        const workshop = await workshopOps.createWorkshop(req.body);
        res.status(201).json({
            success: true,
            workshop,
            message: 'Workshop created successfully'
        });
    } catch (error) {
        console.error('Create workshop error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PUT /api/workshops/:id
 * Update a workshop's frontmatter
 * Body: { title, description, duration, difficulty, modules }
 */
app.put('/api/workshops/:id', async (req, res) => {
    try {
        const workshop = await workshopOps.updateWorkshop(req.params.id, req.body);
        res.json({
            success: true,
            workshop,
            message: 'Workshop updated successfully'
        });
    } catch (error) {
        console.error('Update workshop error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * DELETE /api/workshops/:id
 * Delete a workshop
 */
app.delete('/api/workshops/:id', async (req, res) => {
    try {
        await workshopOps.deleteWorkshop(req.params.id);
        res.json({
            success: true,
            message: `Workshop ${req.params.id} deleted successfully`
        });
    } catch (error) {
        console.error('Delete workshop error:', error);
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/workshops/:id/validate
 * Validate workshop ID format
 */
app.post('/api/workshops/validate/id', async (req, res) => {
    try {
        const { workshopId } = req.body;
        const isValid = workshopOps.validateWorkshopId(workshopId);
        
        res.json({
            success: true,
            valid: isValid,
            message: isValid 
                ? 'Workshop ID is valid' 
                : 'Invalid workshop ID. Use only lowercase letters, numbers, and hyphens.'
        });
    } catch (error) {
        console.error('Validate error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================================
// Health & Info Endpoints
// ============================================================================

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

/**
 * GET /api/info
 * Server information
 */
app.get('/api/info', async (req, res) => {
    try {
        const branch = await gitOps.getCurrentBranch();
        const status = await gitOps.getStatus();
        
        res.json({
            success: true,
            server: {
                version: '1.0.0',
                node: process.version,
                platform: process.platform
            },
            git: {
                branch,
                modified: status.modified.length,
                staged: status.staged.length
            },
            repository: gitOps.repoRoot
        });
    } catch (error) {
        res.json({
            success: true,
            server: {
                version: '1.0.0',
                node: process.version,
                platform: process.platform
            },
            repository: gitOps.repoRoot
        });
    }
});

/**
 * POST /api/workshops/:id/generate-modules
 * Generate module directories with navigation for a workshop
 */
app.post('/api/workshops/:id/generate-modules', async (req, res) => {
    try {
        const workshopId = req.params.id;
        
        // Get workshop data
        const workshop = await workshopOps.getWorkshop(workshopId);
        if (!workshop) {
            return res.status(404).json({
                success: false,
                error: 'Workshop not found'
            });
        }
        
        // Check if workshop has modules
        if (!workshop.modules || workshop.modules.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Workshop has no modules to generate'
            });
        }
        
        // Generate module structure
        const createdModules = await workshopOps.generateModuleStructure(
            workshopId,
            workshop.title,
            workshop.modules
        );
        
        // Update main README with module links
        const modulesWithFolders = workshop.modules.map((module, index) => ({
            ...module,
            folder: createdModules[index].folderName
        }));
        
        await workshopOps.updateWorkshopWithModuleLinks(workshopId, modulesWithFolders);
        
        res.json({
            success: true,
            message: `Generated ${createdModules.length} module directories`,
            modules: createdModules
        });
    } catch (error) {
        console.error('Generate modules error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================================
// Module Discovery & Linking Endpoints
// ============================================================================

/**
 * GET /api/modules/all
 * Get all modules across all workshops
 */
app.get('/api/modules/all', async (req, res) => {
    try {
        const modules = await workshopOps.findAllModules();
        res.json({
            success: true,
            modules,
            count: modules.length
        });
    } catch (error) {
        console.error('Find all modules error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/modules/roots
 * Get all root (parent) modules
 */
app.get('/api/modules/roots', async (req, res) => {
    try {
        const rootModules = await workshopOps.findRootModules();
        res.json({
            success: true,
            modules: rootModules,
            count: rootModules.length
        });
    } catch (error) {
        console.error('Find root modules error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/modules/similar
 * Find similar modules (potential duplicates) grouped by name
 */
app.get('/api/modules/similar', async (req, res) => {
    try {
        const duplicateGroups = await workshopOps.findSimilarModules();
        res.json({
            success: true,
            groups: duplicateGroups,
            count: duplicateGroups.length,
            totalDuplicates: duplicateGroups.reduce((sum, group) => sum + group.count, 0)
        });
    } catch (error) {
        console.error('Find similar modules error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/modules/link
 * Link a child module to a parent module
 * Body: { childPath: string, parentPath: string }
 */
app.post('/api/modules/link', async (req, res) => {
    try {
        const { childPath, parentPath } = req.body;
        
        if (!childPath || !parentPath) {
            return res.status(400).json({
                success: false,
                error: 'Both childPath and parentPath are required'
            });
        }
        
        const result = await workshopOps.linkModuleToParent(childPath, parentPath);
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Link module error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/modules/promote
 * Promote a module to root (parent) status
 * Body: { modulePath: string }
 */
app.post('/api/modules/promote', async (req, res) => {
    try {
        const { modulePath } = req.body;
        
        if (!modulePath) {
            return res.status(400).json({
                success: false,
                error: 'modulePath is required'
            });
        }
        
        const result = await workshopOps.promoteToRoot(modulePath);
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Promote module error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/modules/top-level
 * Get all top-level modules (modules with no parent)
 */
app.get('/api/modules/top-level', async (req, res) => {
    try {
        const modules = await workshopOps.getTopLevelModules();
        res.json({
            success: true,
            modules,
            count: modules.length
        });
    } catch (error) {
        console.error('Get top-level modules error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/modules/children/:workshopId/:moduleId
 * Get direct children of a specific module
 */
app.get('/api/modules/children/:workshopId/:moduleId', async (req, res) => {
    try {
        const modulePath = `workshops/${req.params.workshopId}/${req.params.moduleId}`;
        const children = await workshopOps.getChildrenOfModule(modulePath);
        res.json({
            success: true,
            children,
            count: children.length,
            parentPath: modulePath
        });
    } catch (error) {
        console.error('Get module children error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/modules/ancestors/:workshopId/:moduleId
 * Get all ancestors of a module (for breadcrumb navigation)
 */
app.get('/api/modules/ancestors/:workshopId/:moduleId', async (req, res) => {
    try {
        const modulePath = `workshops/${req.params.workshopId}/${req.params.moduleId}`;
        const ancestors = await workshopOps.getModuleAncestors(modulePath);
        const depth = await workshopOps.getModuleDepth(modulePath);
        res.json({
            success: true,
            ancestors,
            depth,
            modulePath
        });
    } catch (error) {
        console.error('Get module ancestors error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/modules/check-circular
 * Check if linking child to parent would create circular dependency
 * Body: { childPath: string, parentPath: string }
 */
app.post('/api/modules/check-circular', async (req, res) => {
    try {
        const { childPath, parentPath } = req.body;
        
        if (!childPath || !parentPath) {
            return res.status(400).json({
                success: false,
                error: 'Both childPath and parentPath are required'
            });
        }
        
        const result = await workshopOps.checkCircularDependency(childPath, parentPath);
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Check circular dependency error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/modules/copy
 * Copy an existing module with all its files to create a customized version
 * Body: { 
 *   sourceModulePath: string (e.g., "workshops/deploy-redis-for-developers-amr/module-01-redis-data-structures"),
 *   workshopId: string,
 *   newModuleName: string,
 *   newModuleMetadata: { title, description, duration, difficulty, type }
 * }
 */
app.post('/api/modules/copy', async (req, res) => {
    try {
        const { sourceModulePath, workshopId, newModuleName, newModuleMetadata } = req.body;
        
        if (!sourceModulePath || !workshopId || !newModuleName) {
            return res.status(400).json({
                success: false,
                error: 'sourceModulePath, workshopId, and newModuleName are required'
            });
        }
        
        const result = await workshopOps.copyModule(
            sourceModulePath,
            workshopId,
            newModuleName,
            newModuleMetadata
        );
        
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Copy module error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================================
// GitHub Endpoints
// ============================================================================

/**
 * GET /api/github/status
 * Get GitHub configuration and PR status
 */
app.get('/api/github/status', async (req, res) => {
    try {
        const status = await githubOps.getStatus();
        res.json({
            success: true,
            ...status
        });
    } catch (error) {
        console.error('GitHub status error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/github/pull-request
 * Create a Pull Request on GitHub
 * Body: { title: string, body?: string, base?: string }
 */
app.post('/api/github/pull-request', async (req, res) => {
    try {
        const { title, body, base } = req.body;
        
        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'PR title is required'
            });
        }
        
        // Get current branch
        const currentBranch = await gitOps.getCurrentBranch();
        
        // Check if already on main
        if (currentBranch === 'main' || currentBranch === 'master') {
            return res.status(400).json({
                success: false,
                error: 'Cannot create PR from main branch. Please commit changes first to create a feature branch.'
            });
        }
        
        // Check if PR already exists
        const existingPR = await githubOps.getExistingPR(currentBranch);
        if (existingPR) {
            return res.json({
                success: true,
                exists: true,
                ...existingPR
            });
        }
        
        // Create PR
        const result = await githubOps.createPullRequest({
            title,
            body: body || `Pull request from ${currentBranch}`,
            head: currentBranch,
            base: base || 'main'
        });
        
        res.json({
            success: true,
            exists: false,
            ...result
        });
    } catch (error) {
        console.error('Create PR error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================================
// Error Handling
// ============================================================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

// ============================================================================
// Start Server
// ============================================================================

app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 Workshop Builder Server Started');
    console.log('='.repeat(60));
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log(`📁 Repository: ${gitOps.repoRoot}`);
    console.log(`🌿 Current branch: ${gitOps.getCurrentBranch().catch(() => 'unknown')}`);
    console.log('='.repeat(60));
    console.log('\n📚 Available Endpoints:');
    console.log('  GET  /api/health          - Health check');
    console.log('  GET  /api/info            - Server info');
    console.log('  GET  /api/git/init        - Initialize Git (create branch if on main)');
    console.log('  GET  /api/git/branch/current - Get current branch');
    console.log('  POST /api/git/branch/create  - Create new branch');
    console.log('  POST /api/git/branch/switch  - Switch branch');
    console.log('  GET  /api/git/branches    - List all branches');
    console.log('  POST /api/git/commit      - Commit changes');
    console.log('  GET  /api/git/status      - Get Git status');
    console.log('  GET  /api/workshops       - List all workshops');
    console.log('  GET  /api/workshops/:id   - Get workshop');
    console.log('  POST /api/workshops       - Create workshop');
    console.log('  PUT  /api/workshops/:id   - Update workshop');
    console.log('  DELETE /api/workshops/:id - Delete workshop');
    console.log('  GET  /api/modules/all     - List all modules');
    console.log('  GET  /api/modules/roots   - List root modules');
    console.log('  GET  /api/modules/similar - Find duplicate modules');
    console.log('  POST /api/modules/link    - Link child to parent');
    console.log('  POST /api/modules/promote - Promote module to root');
    console.log('  GET  /api/modules/top-level - List top-level modules (no parent)');
    console.log('  GET  /api/modules/children/:workshopId/:moduleId - Get module children');
    console.log('  GET  /api/modules/ancestors/:workshopId/:moduleId - Get module ancestors');
    console.log('  POST /api/modules/check-circular - Check for circular dependencies');
    console.log('\n✨ Ready to build workshops with multi-level inheritance!\n');
});

module.exports = app;
