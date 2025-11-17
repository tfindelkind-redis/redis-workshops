// Redis Workshops - GitHub Pages Application
// Simplified version focusing only on workshops

let allWorkshops = [];
let filteredWorkshops = [];
let currentFilter = 'all';

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadWorkshops();
    renderWorkshops();
    updateStats();
    initializeEventListeners();
});

// Load workshops from the backend API or static data
async function loadWorkshops() {
    try {
        // Try to load from API if available (for development)
        const response = await fetch('/api/workshops');
        const data = await response.json();
        
        if (data.success && data.workshops) {
            allWorkshops = data.workshops.map(ws => ({
                workshopId: ws.workshopId,
                title: ws.title || ws.workshopId,
                description: ws.description || 'No description available',
                difficulty: ws.difficulty || 'intermediate',
                duration: ws.duration || 'N/A',
                modulesCount: ws.modules ? ws.modules.length : 0,
                tags: ws.tags || [],
                path: `workshops/${ws.workshopId}`,
                lastUpdated: ws.lastUpdated || 'Unknown'
            }));
        }
    } catch (error) {
        console.log('API not available, using static workshop list');
        // Fallback to manually defined workshops
        allWorkshops = getStaticWorkshops();
    }
    
    filteredWorkshops = [...allWorkshops];
}

// Static workshop list (fallback when API is not available)
function getStaticWorkshops() {
    return [
        {
            workshopId: 'deploy-redis-for-developers-amr',
            title: 'Deploy Redis for Developers',
            description: 'Learn how to deploy and configure Redis for production use',
            difficulty: 'intermediate',
            duration: '4 hours',
            modulesCount: 5,
            tags: ['deployment', 'production', 'configuration'],
            path: 'workshops/deploy-redis-for-developers-amr'
        },
        {
            workshopId: 'redis-fundamentals',
            title: 'Redis Fundamentals',
            description: 'Master the core concepts and data structures of Redis',
            difficulty: 'beginner',
            duration: '6 hours',
            modulesCount: 8,
            tags: ['fundamentals', 'data-structures', 'basics'],
            path: 'workshops/redis-fundamentals'
        }
    ];
}

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
        <div class="workshop-card ${workshop.difficulty}">
            <div class="workshop-header">
                <h3>${workshop.title}</h3>
                <span class="badge difficulty ${workshop.difficulty}">${capitalizeFirst(workshop.difficulty)}</span>
            </div>
            <p class="workshop-description">${workshop.description}</p>
            <div class="workshop-meta">
                <div class="meta-item">
                    <span class="icon">⏱️</span>
                    <span>${workshop.duration}</span>
                </div>
                <div class="meta-item">
                    <span class="icon">📚</span>
                    <span>${workshop.modulesCount} module${workshop.modulesCount !== 1 ? 's' : ''}</span>
                </div>
            </div>
            ${workshop.tags && workshop.tags.length > 0 ? `
                <div class="workshop-tags">
                    ${workshop.tags.slice(0, 4).map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
            ` : ''}
            <div class="workshop-actions">
                <a href="https://github.com/tfindelkind-redis/redis-workshops/tree/main/${workshop.path}" 
                   class="btn btn-primary" 
                   target="_blank">
                    📖 View Workshop →
                </a>
            </div>
        </div>
    `).join('');
}

// Update statistics
function updateStats() {
    const workshopCount = allWorkshops.length;
    const totalModules = allWorkshops.reduce((sum, ws) => sum + (ws.modulesCount || 0), 0);
    
    // Calculate total duration (rough estimate)
    const totalHours = allWorkshops.reduce((sum, ws) => {
        const duration = ws.duration || '0 hours';
        const hours = parseInt(duration.match(/\d+/)?.[0] || '0');
        return sum + hours;
    }, 0);
    
    document.getElementById('workshop-count').textContent = workshopCount;
    document.getElementById('total-modules').textContent = totalModules;
    document.getElementById('total-duration').textContent = `${totalHours}h`;
}

// Initialize event listeners
function initializeEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Apply filter
            const filter = button.getAttribute('data-filter');
            currentFilter = filter;
            applyFilters();
        });
    });
}

// Apply filters
function applyFilters() {
    if (currentFilter === 'all') {
        filteredWorkshops = [...allWorkshops];
    } else {
        filteredWorkshops = allWorkshops.filter(ws => ws.difficulty === currentFilter);
    }
    
    renderWorkshops();
}

// Utility function
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
