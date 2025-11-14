# Workshop Builder GUI

A visual interface for creating and managing Redis workshops without command-line tools.

## 🎯 Overview

The Workshop Builder GUI provides an intuitive web interface for:
- Creating workshop configurations
- Adding and ordering modules
- Previewing workshop structure
- Managing navigation flow
- Exporting configuration files

**No command line required!** Perfect for workshop creators who prefer visual tools.

## 🚀 Getting Started

### Opening the GUI

```bash
# Open directly in your browser
open shared/tools/workshop-builder-gui.html

# Or double-click the file in Finder/Explorer
```

The GUI runs entirely in your browser - no server required!

## 📖 Features

### 1. Workshop Details (Sidebar)

Create or edit your workshop's basic information:

#### Required Fields
- **Workshop ID** - Unique identifier (lowercase-with-hyphens-only)
- **Title** - Human-readable workshop name
- **Description** - Brief workshop overview
- **Duration** - Estimated time (e.g., "4 hours")
- **Difficulty** - Beginner, Intermediate, or Advanced

#### Optional Fields
- **Author** - Your name or team name

### 2. Modules Tab

#### Workshop Summary
Real-time statistics showing:
- Total number of modules
- Combined duration (in minutes)
- Count of canonical modules
- Count of customized modules

#### Add Modules
1. Click **"Add Module"** button
2. Browse available modules
3. Search by name or tags
4. Filter by type (canonical/customized)
5. Click a module to add it

#### Manage Modules
Each module card shows:
- Order number (drag to reorder)
- Module name and ID
- Description
- Duration and difficulty
- Type badge (canonical/customized)

Actions available:
- **↑/↓** - Move module up/down
- **Remove** - Delete from workshop
- **Clear All** - Remove all modules

#### Drag and Drop
- Click and drag module cards to reorder
- Changes are reflected immediately
- Order numbers update automatically

### 3. Navigation Tab

Visual preview of the workshop navigation flow:
- See how learners will move between modules
- Preview navigation buttons (Previous, Home, Next)
- Understand module sequence
- Verify navigation structure

Shows for each module:
- Position in workshop (Module X of Y)
- Module name and metadata
- Available navigation options
- Whether it's first or last module

### 4. Preview Tab

See your workshop as learners will experience it:
- Complete workshop homepage layout
- All modules listed with descriptions
- Duration calculations
- Difficulty indicators
- Module sequencing

Perfect for:
- Reviewing workshop flow
- Checking duration balance
- Verifying module order
- Presenting to stakeholders

### 5. Export Tab

Generate the `workshop.config.json` file:

#### Copy to Clipboard
Click **"Copy to Clipboard"** to copy the JSON configuration

#### Download File
Click **"Download File"** to save as `workshop.config.json`

The exported configuration includes:
- All workshop metadata
- Module references and order
- Auto-generated tags
- Repository URLs
- Timestamps

## 💾 Saving and Loading

### Save Workshop
1. Fill in workshop details
2. Add modules
3. Click **"Save Workshop"**
4. Workshop saved to browser storage

### Load Workshop
1. Click **"Load Existing Workshop"**
2. Enter workshop ID
3. Workshop loaded from browser storage

**Note:** Workshops are saved in your browser's localStorage. To share with others, use the Export tab.

## 🎨 Module Browser

When adding modules, you can:

### Search
Type in the search box to filter by:
- Module name
- Description text
- Tags

### Filter by Type
- **All Modules** - Show everything
- **Canonical Only** - Reusable core modules
- **Customized Only** - Workshop-specific modules

### Module Information
Each module shows:
- Name with type badge
- Full description
- Duration in minutes
- Difficulty level
- Tags for categorization

## 📋 Example Workflow

### Create a New Workshop

1. **Enter Basic Details**
   ```
   Workshop ID: redis-caching-patterns
   Title: Redis Caching Patterns
   Description: Learn advanced caching strategies with Redis
   Duration: 4 hours
   Difficulty: Intermediate
   Author: Your Name
   ```

2. **Add Modules**
   - Click "Add Module"
   - Select "Redis Fundamentals" (60 min)
   - Select "Redis Performance" (90 min)
   - Select "Redis Clustering" (75 min)

3. **Arrange Order**
   - Fundamentals → Performance → Clustering
   - Use ↑/↓ buttons or drag-and-drop
   - Verify in Navigation tab

4. **Preview Workshop**
   - Switch to Preview tab
   - Review complete structure
   - Check total duration (225 minutes = 3.75 hours)

5. **Export Configuration**
   - Switch to Export tab
   - Click "Copy to Clipboard"
   - Save as `workshops/redis-caching-patterns/workshop.config.json`

6. **Build Workshop**
   ```bash
   ./shared/tools/workshop-builder.py build \
     --workshop redis-caching-patterns \
     --output-dir docs/workshops/redis-caching-patterns
   ```

## 🎯 Use Cases

### For Workshop Creators
- Quickly prototype workshop structures
- Experiment with module combinations
- Calculate total durations
- Share configurations with team

### For Content Managers
- Review workshop proposals
- Verify module sequences
- Ensure difficulty progression
- Approve workshop structures

### For Instructors
- Preview workshop flow
- Understand time allocations
- Plan delivery schedule
- Customize existing workshops

## 🔄 Integration with CLI Tools

The GUI generates standard `workshop.config.json` files that work with:

### Workshop Builder CLI
```bash
# Preview
./shared/tools/workshop-builder.py preview --workshop my-workshop

# Build
./shared/tools/workshop-builder.py build --workshop my-workshop
```

### Module Manager CLI
```bash
# List modules
./shared/tools/module-manager.py list

# View module details
./shared/tools/module-manager.py info --module core.redis-fundamentals.v1
```

## 📊 Workshop Summary Statistics

The GUI automatically calculates:

- **Total Modules** - Count of all modules
- **Total Duration** - Sum of all module durations
- **Canonical Count** - Reusable modules from core
- **Customized Count** - Workshop-specific modules

Use these to:
- Balance workshop length
- Mix canonical and custom content
- Meet time constraints
- Plan workshop delivery

## 🎨 Visual Design

### Color-Coded Elements

- **Red (Primary)** - Workshop branding, primary actions
- **Blue badges** - Canonical modules
- **Yellow badges** - Customized modules
- **Green badges** - Beginner difficulty
- **Yellow badges** - Intermediate difficulty
- **Red badges** - Advanced difficulty

### Module Cards

Each module card features:
- Order badge (numbered circle)
- Module name and ID
- Type indicator
- Duration and difficulty
- Action buttons

### Responsive Layout

- Desktop: Sidebar + main content
- Tablet/Mobile: Stacked layout
- Touch-friendly buttons
- Scrollable module lists

## 💡 Tips and Best Practices

### Workshop Creation
1. **Start with fundamentals** - Begin with easier modules
2. **Progressive difficulty** - Gradually increase complexity
3. **Balanced duration** - Aim for modules of similar length
4. **Clear progression** - Logical topic flow

### Module Selection
1. **Reuse canonical modules** - Don't reinvent the wheel
2. **Customize when needed** - Fork for specific requirements
3. **Mix difficulty levels** - Keep learners engaged
4. **Consider prerequisites** - Build knowledge progressively

### Navigation Planning
1. **Test the flow** - Use Navigation tab
2. **Check transitions** - Ensure logical progression
3. **Verify endpoints** - First and last modules matter
4. **Consider breaks** - Plan natural stopping points

### Export and Build
1. **Save frequently** - Use browser storage
2. **Export for backup** - Download JSON files
3. **Version control** - Commit to git
4. **Build and test** - Verify actual output

## 🐛 Troubleshooting

### Workshop Won't Save
- Check all required fields are filled
- Verify Workshop ID format (lowercase-with-hyphens)
- Check browser console for errors

### Module Not Appearing
- Verify module exists in available modules list
- Check if already added to workshop
- Refresh browser and try again

### Can't Reorder Modules
- Use ↑/↓ buttons instead of drag-and-drop
- Refresh browser if drag-and-drop fails
- Check module cards are not overlapping

### Export Issues
- Check JSON syntax in Export tab
- Verify all required fields present
- Test with JSON validator

## 🔮 Future Enhancements

Planned features:
- [ ] Real-time collaboration
- [ ] Template library
- [ ] Duration calculator improvements
- [ ] Custom module creation
- [ ] Prerequisites validation
- [ ] Learning objectives editor
- [ ] Tags management
- [ ] Bulk operations
- [ ] Workshop cloning
- [ ] Version history

## 🤝 Integration Points

### With Existing Tools

The GUI complements existing CLI tools:

```bash
# Generate module data for GUI
./shared/tools/generate-module-data.py

# Build workshop from GUI config
./shared/tools/workshop-builder.py build --workshop <workshop-id>

# Generate GitHub Pages data
./shared/tools/generate-workshop-data.py
```

### With GitHub Pages

Workshops created in the GUI can be:
1. Built using workshop-builder.py
2. Published to docs/workshops/
3. Discovered via GitHub Pages
4. Accessed by learners

## 📚 Related Documentation

- [Workshop Creator Guide](../../WORKSHOP_CREATOR_GUIDE.md)
- [Quick Start Guide](../../QUICK_START.md)
- [Module Inheritance](../../MODULE_INHERITANCE.md)
- [Navigation Design](../../NAVIGATION_DESIGN.md)
- [Deployment Guide](../../DEPLOYMENT_GUIDE.md)

## 🎓 Learning Resources

### Video Tutorials (Coming Soon)
- Creating Your First Workshop
- Adding and Ordering Modules
- Using the Navigation Preview
- Exporting and Building

### Example Workshops
- `test-workshop` - Simple 2-module workshop
- `redis-production-workshop` - Full-day workshop
- `redis-fundamentals` - Beginner workshop

## 🌟 Best of Both Worlds

The GUI is designed to work seamlessly with CLI tools:

### Use GUI For:
- ✅ Initial workshop creation
- ✅ Quick prototyping
- ✅ Visual preview
- ✅ Stakeholder presentations
- ✅ Module experimentation

### Use CLI For:
- ✅ Automation and scripting
- ✅ CI/CD integration
- ✅ Bulk operations
- ✅ Version control workflows
- ✅ Advanced customization

## 🚀 Getting Help

If you need assistance:

1. **Check this documentation** - Most questions answered here
2. **Review examples** - See test-workshop for reference
3. **GitHub Issues** - Report bugs or request features
4. **Discord/Slack** - Join community discussions

## 📄 License

Part of the Redis Workshops project.
Same license as parent repository.

---

**Happy Workshop Building! 🎓**

Create amazing Redis learning experiences with visual tools.
