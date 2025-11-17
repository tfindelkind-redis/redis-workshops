#!/usr/bin/env python3
"""
Script to add file browser functionality to workshop-builder-gui.html
"""

# Read the original file
with open('shared/tools/workshop-builder-gui.html', 'r') as f:
    content = f.read()

# 1. Replace the Browse Modules tab HTML
old_browse_section_start = '                    <!-- Browse Modules Sub-Tab (Hierarchical View) -->'
old_browse_section_end = '                    <!-- Find Duplicates Sub-Tab -->'

new_browse_html = '''                    <!-- Browse Modules Sub-Tab (File Browser View) -->
                    <div id="mm-browse-tab" class="tab-content active" style="margin-top: 1rem;">
                        <!-- Action Bar -->
                        <div class="action-bar" style="margin-bottom: 1rem;">
                            <button class="btn btn-primary btn-sm" onclick="loadModuleBrowser()">
                                🔄 Refresh
                            </button>
                            <button class="btn btn-outline btn-sm" onclick="expandAllWorkshops()">
                                📂 Expand All
                            </button>
                            <button class="btn btn-outline btn-sm" onclick="collapseAllWorkshops()">
                                📁 Collapse All
                            </button>
                            <label style="margin-left: auto; display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="show-test-modules" onchange="loadModuleBrowser()">
                                <span>Show test modules</span>
                            </label>
                        </div>

                        <!-- Search Box -->
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <input 
                                type="text" 
                                id="module-search" 
                                placeholder="🔍 Filter by module name, workshop, or path..." 
                                oninput="filterModuleBrowser()"
                                style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-color); border-radius: 6px; font-size: 0.95rem;"
                            >
                        </div>

                        <!-- Statistics Summary -->
                        <div class="workshop-summary" style="margin-bottom: 1.5rem;">
                            <div class="summary-grid">
                                <div class="summary-item">
                                    <div class="summary-value" id="mm-total-count">-</div>
                                    <div class="summary-label">Total Modules</div>
                                </div>
                                <div class="summary-item">
                                    <div class="summary-value" id="mm-workshops-count">-</div>
                                    <div class="summary-label">Workshops</div>
                                </div>
                                <div class="summary-item">
                                    <div class="summary-value" id="mm-parent-count">-</div>
                                    <div class="summary-label">Parents</div>
                                </div>
                                <div class="summary-item">
                                    <div class="summary-value" id="mm-depth-count">-</div>
                                    <div class="summary-label">Max Depth</div>
                                </div>
                            </div>
                        </div>

                        <!-- File Browser Tree View -->
                        <div id="module-browser" style="border: 1px solid var(--border-color); border-radius: 6px; background: white; max-height: 600px; overflow-y: auto;">
                            <div class="empty-state">
                                <div class="empty-state-icon">📁</div>
                                <h3>No Modules Loaded</h3>
                                <p>Click "Refresh" to browse modules organized by workshop</p>
                            </div>
                        </div>
                    </div>

'''

start_idx = content.find(old_browse_section_start)
end_idx = content.find(old_browse_section_end)

if start_idx == -1 or end_idx == -1:
    print("❌ Could not find Browse Modules section")
    exit(1)

# Replace the HTML section
content = content[:start_idx] + new_browse_html + content[end_idx:]
print("✅ Step 1: Replaced Browse Modules HTML")

# Write the updated content
with open('shared/tools/workshop-builder-gui.html', 'w') as f:
    f.write(content)

print("\n✅ Successfully updated workshop-builder-gui.html")
