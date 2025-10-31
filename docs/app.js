// Main application logic
let filteredWorkshops = [...workshopsData];
let filteredChapters = [...chaptersData];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    renderWorkshops();
    renderChapters();
    updateStats();
    initializeEventListeners();
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
        <div class="workshop-card" onclick="window.open('https://github.com/tfindelkind-redis/redis-workshops/tree/main/${workshop.path}', '_blank')">
            <h3>${workshop.title}</h3>
            <div class="workshop-meta">
                <span class="badge difficulty ${workshop.difficulty}">${capitalizeFirst(workshop.difficulty)}</span>
                <span class="badge duration">⏱️ ${workshop.duration}</span>
            </div>
            <p class="workshop-description">${workshop.description}</p>
            <p class="workshop-chapters">📚 ${workshop.chaptersCount} chapter${workshop.chaptersCount !== 1 ? 's' : ''}</p>
            <div class="workshop-footer">
                <span class="workshop-tags">${workshop.tags.map(tag => `#${tag}`).slice(0, 3).join(' ')}</span>
                <a href="https://github.com/tfindelkind-redis/redis-workshops/tree/main/${workshop.path}" 
                   class="workshop-link" 
                   onclick="event.stopPropagation()">
                    Start Workshop →
                </a>
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
    document.getElementById('chapter-count').textContent = chaptersData.length;
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
