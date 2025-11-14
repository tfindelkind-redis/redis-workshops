// Main application logic
let filteredWorkshops = [...workshopsData];
let filteredChapters = [...chaptersData];
let filteredLearningUnits = [...learningUnitsData];
let currentModuleFilter = 'all';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    renderWorkshops();
    renderChapters();
    renderLearningUnits();
    updateStats();
    initializeEventListeners();
    initializeModuleListeners();
});

// Render workshops
function renderWorkshops() {
    const grid = document.getElementById('workshop-grid');
    const noResults = document.getElementById('no-results');
    
    if (filteredWorkshops.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    noResults.style.display = 'none';
    
    grid.innerHTML = filteredWorkshops.map(workshop => `
        <div class="workshop-card">
            <h3>${workshop.title}</h3>
            <div class="workshop-meta">
                <span class="badge difficulty ${workshop.difficulty}">${capitalizeFirst(workshop.difficulty)}</span>
                <span class="badge duration">⏱️ ${workshop.duration}</span>
                ${workshop.hasBuiltVersion ? '<span class="badge success">✨ Built Version Available</span>' : ''}
            </div>
            <p class="workshop-description">${workshop.description}</p>
            <p class="workshop-chapters">📚 ${workshop.modulesCount} module${workshop.modulesCount !== 1 ? 's' : ''}</p>
            <div class="workshop-footer">
                <span class="workshop-tags">${workshop.tags.map(tag => `#${tag}`).slice(0, 3).join(' ')}</span>
                <div class="workshop-links">
                    ${workshop.hasBuiltVersion ? 
                        `<a href="${workshop.builtPath}/README.md" class="workshop-link primary">📖 View Workshop →</a>` : 
                        ''
                    }
                    <a href="https://github.com/tfindelkind-redis/redis-workshops/tree/main/${workshop.path}" 
                       class="workshop-link secondary" 
                       target="_blank">
                        GitHub Source →
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

// Render chapters
function renderChapters() {
    const list = document.getElementById('chapters-list');
    
    list.innerHTML = filteredChapters.map(chapter => `
        <div class="chapter-card">
            <h4>${chapter.title}</h4>
            <p>${chapter.description}</p>
            <div class="chapter-meta">
                <span class="badge difficulty ${chapter.difficulty}">${capitalizeFirst(chapter.difficulty)}</span>
                <span>⏱️ ${chapter.estimatedMinutes} min</span>
                ${chapter.workshopSpecific ? `<span>🔒 Workshop-specific</span>` : `<span>🔄 Shared</span>`}
            </div>
            ${chapter.workshopSpecific ? 
                `<p style="font-size: 0.85rem; color: var(--text-light); margin-top: 0.5rem;">
                    Part of: <a href="https://github.com/tfindelkind-redis/redis-workshops/tree/main/workshops/${chapter.workshop}" target="_blank">${chapter.workshop}</a>
                </p>` : 
                ''
            }
        </div>
    `).join('');
}

// Update statistics
function updateStats() {
    document.getElementById('workshop-count').textContent = workshopsData.length;
    document.getElementById('learning-unit-count').textContent = learningUnitsData.length;
    const moduleCount = learningUnitsData.filter(u => u.type === 'module').length;
    document.getElementById('module-count').textContent = moduleCount;
}

// Initialize event listeners
function initializeEventListeners() {
    // Workshop search
    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        filterWorkshops(query);
    });
    
    // Chapter search
    const chapterSearch = document.getElementById('chapter-search');
    chapterSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        filterChapters(query);
    });
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            applyDifficultyFilter(filter);
        });
    });
    
    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Filter workshops by search query
function filterWorkshops(query) {
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    
    filteredWorkshops = workshopsData.filter(workshop => {
        const matchesSearch = query === '' || 
            workshop.title.toLowerCase().includes(query) ||
            workshop.description.toLowerCase().includes(query) ||
            workshop.tags.some(tag => tag.toLowerCase().includes(query));
        
        const matchesDifficulty = activeFilter === 'all' || workshop.difficulty === activeFilter;
        
        return matchesSearch && matchesDifficulty;
    });
    
    renderWorkshops();
}

// Filter chapters by search query
function filterChapters(query) {
    filteredChapters = chaptersData.filter(chapter => {
        return query === '' || 
            chapter.title.toLowerCase().includes(query) ||
            chapter.description.toLowerCase().includes(query) ||
            chapter.tags.some(tag => tag.toLowerCase().includes(query));
    });
    
    renderChapters();
}

// Apply difficulty filter
function applyDifficultyFilter(difficulty) {
    const searchQuery = document.getElementById('search').value.toLowerCase();
    
    filteredWorkshops = workshopsData.filter(workshop => {
        const matchesSearch = searchQuery === '' || 
            workshop.title.toLowerCase().includes(searchQuery) ||
            workshop.description.toLowerCase().includes(searchQuery) ||
            workshop.tags.some(tag => tag.toLowerCase().includes(searchQuery));
        
        const matchesDifficulty = difficulty === 'all' || workshop.difficulty === difficulty;
        
        return matchesSearch && matchesDifficulty;
    });
    
    renderWorkshops();
}

// Utility function to capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===== LEARNING UNITS (MODULES + CHAPTERS) =====

function renderLearningUnits() {
    const container = document.getElementById('module-content');
    const noResults = document.getElementById('no-module-results');
    
    if (currentModuleFilter === 'trees') {
        renderVersionTrees(container);
        noResults.style.display = 'none';
        return;
    }
    
    if (filteredLearningUnits.length === 0) {
        container.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    noResults.style.display = 'none';
    
    container.innerHTML = filteredLearningUnits.map(unit => {
        const isModule = unit.type === 'module';
        const isLegacy = unit.legacy === true;
        const isCanonical = unit.style === 'canonical';
        const isCustomized = unit.style === 'customized';
        
        let badgeClass = isCanonical ? 'canonical' : isCustomized ? 'customized' : isLegacy ? 'legacy' : 'shared';
        let badgeText = isCanonical ? 'CANONICAL' : isCustomized ? 'CUSTOMIZED' : isLegacy ? 'LEGACY' : 'SHARED';
        
        return `
            <div class="module-card ${isLegacy ? 'legacy' : ''}">
                <div class="module-header">
                    <h3>${isModule ? '🧩' : '📄'} ${unit.name}</h3>
                    <div class="module-badges">
                        <span class="module-type-badge ${badgeClass}">${badgeText}</span>
                        <span class="badge difficulty ${unit.difficulty}">${capitalizeFirst(unit.difficulty.split('|')[0].trim())}</span>
                    </div>
                </div>
                
                <p class="module-description">${unit.description.substring(0, 150)}${unit.description.length > 150 ? '...' : ''}</p>
                
                <div class="module-meta">
                    ${isModule ? `<span>📝 ID: ${unit.id}</span>` : ''}
                    <span>⏱️ ${unit.duration} min</span>
                    ${unit.parent ? `<span>🔗 Parent: ${unit.parent}</span>` : ''}
                    ${unit.workshop ? `<span>🎓 Workshop: ${unit.workshop}</span>` : ''}
                    ${unit.hasVersioning ? '<span>✅ Versioned</span>' : ''}
                </div>
                
                ${unit.customizations ? `
                    <div class="customization-stats">
                        <div class="stat-item customized">
                            ✏️ Customized: ${unit.customizations.files_customized}
                        </div>
                        <div class="stat-item inherited">
                            📋 Inherited: ${unit.customizations.files_inherited}
                        </div>
                        <div class="stat-item new">
                            ➕ New: ${unit.customizations.files_new}
                        </div>
                    </div>
                ` : ''}
                
                ${isLegacy && unit.canMigrate ? `
                    <div class="migration-suggestion">
                        <span>💡 This chapter can be upgraded to a module for version tracking</span>
                        <button class="btn btn-small" onclick="alert('Migration wizard coming soon!')">Migrate to Module</button>
                    </div>
                ` : ''}
                
                <div class="workshop-footer">
                    <span class="workshop-tags">${(unit.tags || []).map(tag => `#${tag}`).slice(0, 4).join(' ')}</span>
                    <a href="https://github.com/tfindelkind-redis/redis-workshops/tree/main/${unit.path}" 
                       class="workshop-link" 
                       target="_blank">
                        ${isModule ? 'View Module' : 'View Chapter'} →
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

function renderVersionTrees(container) {
    container.style.display = 'grid';
    
    if (!moduleVersionTrees || moduleVersionTrees.length === 0) {
        container.innerHTML = `
            <div class="module-card">
                <p>No version trees available yet. Create customized modules to see version trees!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = moduleVersionTrees.map(tree => `
        <div class="module-card">
            <div class="module-header">
                <h3>🌳 ${tree.name}</h3>
                <span class="module-type-badge canonical">CANONICAL</span>
            </div>
            
            <p class="module-description">${tree.description.substring(0, 150)}...</p>
            
            <div class="module-meta">
                <span>📝 ID: ${tree.id}</span>
                <span>📁 ${tree.path}</span>
                <span>⏱️ ${tree.duration} min</span>
            </div>
            
            ${tree.versions && tree.versions.length > 0 ? `
                <div class="version-tree">
                    <h4>📦 Customized Versions (${tree.versions.length}):</h4>
                    ${renderVersionTreeNodes(tree.versions)}
                </div>
            ` : '<p style="margin-top: 1rem; color: var(--text-light);">💡 No customized versions yet. Fork this module to create a customized version!</p>'}
        </div>
    `).join('');
}

function renderVersionTreeNodes(nodes, depth = 0) {
    return nodes.map(node => `
        <div class="version-node" style="margin-left: ${depth * 1.5}rem">
            <strong>${node.id}</strong>
            <div class="module-meta" style="font-size: 0.85rem; margin-top: 0.25rem;">
                <span>🎓 ${node.workshop}</span>
                <span>⏱️ ${node.duration} min</span>
            </div>
            ${node.customizations ? `
                <div class="customization-stats">
                    <div class="stat-item customized">✏️ ${node.customizations.files_customized}</div>
                    <div class="stat-item inherited">📋 ${node.customizations.files_inherited}</div>
                    <div class="stat-item new">➕ ${node.customizations.files_new}</div>
                </div>
            ` : ''}
            ${node.children && node.children.length > 0 ? renderVersionTreeNodes(node.children, depth + 1) : ''}
        </div>
    `).join('');
}

function initializeModuleListeners() {
    // Module type filter buttons
    const moduleTypeFilters = document.querySelectorAll('.module-type-filters .filter-btn');
    moduleTypeFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            moduleTypeFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentModuleFilter = btn.dataset.filter;
            filterLearningUnits();
        });
    });
    
    // Module search
    const moduleSearch = document.getElementById('module-search');
    if (moduleSearch) {
        moduleSearch.addEventListener('input', (e) => {
            filterLearningUnits(e.target.value.toLowerCase());
        });
    }
}

function filterLearningUnits(searchQuery = '') {
    if (currentModuleFilter === 'trees') {
        renderLearningUnits();
        return;
    }
    
    filteredLearningUnits = filterByType(currentModuleFilter).filter(unit => {
        if (searchQuery === '') return true;
        
        return unit.name.toLowerCase().includes(searchQuery) ||
               unit.description.toLowerCase().includes(searchQuery) ||
               (unit.tags && unit.tags.some(tag => tag.toLowerCase().includes(searchQuery)));
    });
    
    renderLearningUnits();
}

