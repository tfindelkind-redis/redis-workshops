/**
 * GitHub Operations Module
 * Handles GitHub API operations like creating Pull Requests
 */

const { Octokit } = require('@octokit/rest');
const gitOps = require('./git-ops');

// Initialize Octokit with GitHub token from environment
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

/**
 * Parse GitHub repository URL to get owner and repo
 * @returns {Promise<{owner: string, repo: string}>}
 */
async function getRepoInfo() {
    try {
        const simpleGit = require('simple-git');
        const git = simpleGit(gitOps.repoRoot);
        
        // Get remote URL
        const remotes = await git.getRemotes(true);
        const origin = remotes.find(r => r.name === 'origin');
        
        if (!origin) {
            throw new Error('No origin remote found');
        }
        
        // Parse URL (supports both SSH and HTTPS)
        // SSH: git@github.com:owner/repo.git
        // HTTPS: https://github.com/owner/repo.git
        let match;
        if (origin.refs.fetch.includes('github.com')) {
            // Extract owner/repo from URL
            match = origin.refs.fetch.match(/github\.com[/:]([\w-]+)\/([\w-]+)(\.git)?$/);
            if (match) {
                return {
                    owner: match[1],
                    repo: match[2]
                };
            }
        }
        
        throw new Error('Could not parse GitHub repository from remote URL');
    } catch (error) {
        throw new Error(`Failed to get repository info: ${error.message}`);
    }
}

/**
 * Check if GitHub token is configured
 * @returns {boolean}
 */
function hasGitHubToken() {
    return !!process.env.GITHUB_TOKEN;
}

/**
 * Push current branch to GitHub
 * @param {string} branchName - Branch to push
 * @returns {Promise<void>}
 */
async function pushBranch(branchName) {
    try {
        const simpleGit = require('simple-git');
        const git = simpleGit(gitOps.repoRoot);
        
        // Push branch to origin
        await git.push('origin', branchName, ['--set-upstream']);
        
        console.log(`[github-ops] Pushed branch ${branchName} to origin`);
    } catch (error) {
        throw new Error(`Failed to push branch: ${error.message}`);
    }
}

/**
 * Create a Pull Request on GitHub
 * @param {object} options - PR options
 * @param {string} options.title - PR title
 * @param {string} options.body - PR description
 * @param {string} options.head - Source branch
 * @param {string} options.base - Target branch (default: main)
 * @returns {Promise<object>} PR information
 */
async function createPullRequest(options) {
    try {
        if (!hasGitHubToken()) {
            throw new Error('GitHub token not configured. Set GITHUB_TOKEN environment variable.');
        }
        
        const { title, body, head, base = 'main' } = options;
        
        if (!title || !head) {
            throw new Error('Title and head branch are required');
        }
        
        // Get repository info
        const { owner, repo } = await getRepoInfo();
        
        console.log(`[github-ops] Creating PR: ${owner}/${repo} - ${head} -> ${base}`);
        
        // Push branch first
        await pushBranch(head);
        
        // Create pull request
        const response = await octokit.pulls.create({
            owner,
            repo,
            title,
            body,
            head,
            base
        });
        
        console.log(`[github-ops] Created PR #${response.data.number}`);
        
        return {
            success: true,
            number: response.data.number,
            url: response.data.html_url,
            state: response.data.state,
            title: response.data.title
        };
    } catch (error) {
        // Check for specific GitHub API errors
        if (error.status === 422) {
            // PR might already exist or no changes
            throw new Error('Pull request already exists or no changes to create PR');
        }
        throw new Error(`Failed to create pull request: ${error.message}`);
    }
}

/**
 * Check if a PR already exists for the current branch
 * @param {string} branchName - Branch to check
 * @returns {Promise<object|null>} Existing PR or null
 */
async function getExistingPR(branchName) {
    try {
        if (!hasGitHubToken()) {
            return null;
        }
        
        const { owner, repo } = await getRepoInfo();
        
        // List open PRs for this branch
        const response = await octokit.pulls.list({
            owner,
            repo,
            head: `${owner}:${branchName}`,
            state: 'open'
        });
        
        if (response.data.length > 0) {
            const pr = response.data[0];
            return {
                number: pr.number,
                url: pr.html_url,
                state: pr.state,
                title: pr.title
            };
        }
        
        return null;
    } catch (error) {
        console.error('[github-ops] Failed to check existing PR:', error.message);
        return null;
    }
}

/**
 * Get repository and PR status
 * @returns {Promise<object>} Status information
 */
async function getStatus() {
    try {
        const hasToken = hasGitHubToken();
        
        if (!hasToken) {
            return {
                configured: false,
                message: 'GitHub token not configured'
            };
        }
        
        const repoInfo = await getRepoInfo();
        const currentBranch = await gitOps.getCurrentBranch();
        const existingPR = await getExistingPR(currentBranch);
        
        return {
            configured: true,
            repository: repoInfo,
            currentBranch,
            existingPR
        };
    } catch (error) {
        return {
            configured: hasGitHubToken(),
            error: error.message
        };
    }
}

module.exports = {
    hasGitHubToken,
    getRepoInfo,
    pushBranch,
    createPullRequest,
    getExistingPR,
    getStatus
};
