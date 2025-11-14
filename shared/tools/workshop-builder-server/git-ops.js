/**
 * Git Operations Module
 * Handles all Git-related operations for the Workshop Builder
 */

const simpleGit = require('simple-git');
const path = require('path');

// Initialize git with the repository root
// In Docker: Use REPO_ROOT env var (mounted volume)
// Outside Docker: Use relative path (3 levels up from this file)
const repoRoot = process.env.REPO_ROOT || path.resolve(__dirname, '../../..');
const git = simpleGit(repoRoot);

console.log(`[git-ops] Repository root: ${repoRoot}`);

/**
 * Get current Git branch
 * @returns {Promise<string>} Current branch name
 */
async function getCurrentBranch() {
    try {
        const status = await git.status();
        return status.current;
    } catch (error) {
        throw new Error(`Failed to get current branch: ${error.message}`);
    }
}

/**
 * Create a new branch with timestamp
 * @returns {Promise<string>} Created branch name
 */
async function createBranch() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const branchName = `workshop-builder-${timestamp}`;
        
        // Check if branch already exists
        const branches = await git.branch();
        if (branches.all.includes(branchName)) {
            throw new Error(`Branch ${branchName} already exists`);
        }
        
        // Create and checkout new branch
        await git.checkoutLocalBranch(branchName);
        
        return branchName;
    } catch (error) {
        throw new Error(`Failed to create branch: ${error.message}`);
    }
}

/**
 * Switch to a specific branch
 * @param {string} branchName - Name of the branch to switch to
 * @returns {Promise<void>}
 */
async function switchBranch(branchName) {
    try {
        await git.checkout(branchName);
    } catch (error) {
        throw new Error(`Failed to switch to branch ${branchName}: ${error.message}`);
    }
}

/**
 * Check if currently on main branch
 * @returns {Promise<boolean>}
 */
async function isOnMainBranch() {
    try {
        const currentBranch = await getCurrentBranch();
        return currentBranch === 'main' || currentBranch === 'master';
    } catch (error) {
        throw new Error(`Failed to check branch: ${error.message}`);
    }
}

/**
 * Initialize: Create branch if on main
 * @returns {Promise<{branch: string, created: boolean}>}
 */
async function initialize() {
    try {
        const onMain = await isOnMainBranch();
        
        if (onMain) {
            const branchName = await createBranch();
            return { branch: branchName, created: true };
        } else {
            const currentBranch = await getCurrentBranch();
            return { branch: currentBranch, created: false };
        }
    } catch (error) {
        throw new Error(`Failed to initialize: ${error.message}`);
    }
}

/**
 * Commit changes with a message
 * @param {string[]} files - Array of file paths to commit
 * @param {string} message - Commit message
 * @returns {Promise<object>} Commit result
 */
async function commitChanges(files, message) {
    try {
        // Stage files
        await git.add(files);
        
        // Commit
        const result = await git.commit(message);
        
        return {
            success: true,
            commit: result.commit,
            summary: result.summary
        };
    } catch (error) {
        throw new Error(`Failed to commit changes: ${error.message}`);
    }
}

/**
 * Get repository status
 * @returns {Promise<object>} Status information
 */
async function getStatus() {
    try {
        const status = await git.status();
        return {
            current: status.current,
            tracking: status.tracking,
            modified: status.modified,
            created: status.created,
            deleted: status.deleted,
            renamed: status.renamed,
            staged: status.staged,
            ahead: status.ahead,
            behind: status.behind
        };
    } catch (error) {
        throw new Error(`Failed to get status: ${error.message}`);
    }
}

/**
 * List all branches
 * @returns {Promise<object>} Branch information
 */
async function listBranches() {
    try {
        const branches = await git.branch();
        return {
            current: branches.current,
            all: branches.all,
            branches: branches.branches
        };
    } catch (error) {
        throw new Error(`Failed to list branches: ${error.message}`);
    }
}

module.exports = {
    getCurrentBranch,
    createBranch,
    switchBranch,
    isOnMainBranch,
    initialize,
    commitChanges,
    getStatus,
    listBranches,
    repoRoot
};
