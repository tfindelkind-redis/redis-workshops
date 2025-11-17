# GitHub Pages Website

This directory contains the GitHub Pages website for Redis Workshops.

## 🌐 Live Site

**URL:** https://tfindelkind-redis.github.io/redis-workshops/

## 📁 Files

- **index.html** - Main website page
- **styles.css** - Website styling
- **app.js** - Application logic (search, filtering, rendering)
- **data.js** - Workshop and chapter data (auto-generated)

## 🔄 Updating the Website

The website data is automatically updated when workshops or chapters change via GitHub Actions.

To manually update:

```bash
# Run from repository root
./shared/tools/generate-website-data.sh
```

## 📖 Documentation

- [GitHub Pages Setup Guide](GITHUB-PAGES-SETUP.md) - Complete setup and maintenance guide
- [Contributing Guide](CONTRIBUTING.md) - How to contribute
- [Quick Reference](QUICK-REFERENCE.md) - Command reference

## ✨ Features

- 🔍 **Searchable catalog** of workshops and chapters
- 🏷️ **Filter by difficulty** (beginner, intermediate, advanced)
- 📱 **Mobile responsive** design
- 🔄 **Automatic updates** via GitHub Actions
- 🎯 **Direct navigation** to workshop folders

## 🛠️ Setup

See [GITHUB-PAGES-SETUP.md](GITHUB-PAGES-SETUP.md) for complete setup instructions.

Quick steps:
1. Enable GitHub Pages in repository settings
2. Set source to `main` branch, `/docs` folder
3. Site will be live at the URL above

## 🎨 Customization

Edit the following files to customize the website:

- `index.html` - Structure and content
- `styles.css` - Colors, fonts, layout
- `app.js` - Behavior and functionality

The website uses vanilla JavaScript (no framework required).

## 📊 Data Format

Workshop data (auto-generated from `workshop.config.json`):
```javascript
{
    id: "workshop-id",
    title: "Workshop Title",
    description: "Description",
    difficulty: "beginner|intermediate|advanced",
    duration: "X hours",
    chaptersCount: N,
    tags: ["tag1", "tag2"],
    path: "workshops/workshop-id"
}
```

Chapter data (auto-generated from `.chapter-metadata.json`):
```javascript
{
    id: "chapter-id",
    title: "Chapter Title",
    description: "Description",
    difficulty: "beginner|intermediate|advanced",
    estimatedMinutes: N,
    tags: ["tag1", "tag2"],
    path: "shared/chapters/chapter-id",
    workshopSpecific: false
}
```

## 🐛 Troubleshooting

If the website isn't updating:
1. Check GitHub Actions for errors
2. Validate JSON files: `jq empty file.json`
3. Manually run: `./shared/tools/generate-website-data.sh`
4. Check GitHub Pages settings

## 📝 Other Documentation Files

This directory also contains:
- `CONTRIBUTING.md` - Contribution guidelines
- `workshop-creation-guide.md` - Workshop authoring
- `module-authoring-guide.md` - Module authoring (coming soon)
- `workshop-specific-modules.md` - Workshop-specific modules guide (coming soon)
- `QUICK-REFERENCE.md` - Quick command reference

---

For questions or issues with the website, please open an issue on GitHub.
