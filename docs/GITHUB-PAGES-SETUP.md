# GitHub Pages Setup Guide

This guide explains how to set up and maintain the GitHub Pages website for Redis Workshops.

## 🌐 Website Overview

The GitHub Pages site provides:
- **Interactive catalog** of all workshops
- **Searchable interface** for workshops and chapters
- **Filtering by difficulty** (beginner, intermediate, advanced)
- **Direct links** to workshop folders in GitHub
- **Automatic updates** when workshops/chapters change

## 🚀 Initial Setup

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings**
3. Navigate to **Pages** in the left sidebar
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/docs`
5. Click **Save**

Your site will be published at:
```
https://tfindelkind-redis.github.io/redis-workshops/
```

### 2. Verify Deployment

After a few minutes:
1. Visit the URL above
2. You should see the Redis Workshops website
3. The site will automatically update on future commits

## 📁 File Structure

```
docs/
├── index.html          # Main HTML page
├── styles.css          # Styling
├── app.js              # Application logic
├── data.js             # Workshop/chapter data (auto-generated)
├── CONTRIBUTING.md     # (existing documentation)
└── *.md                # (other guides)
```

## 🔄 Updating the Website

### Automatic Updates

The website data is automatically updated when:
- You push changes to `workshops/` or `shared/chapters/`
- GitHub Actions runs the update workflow
- The `data.js` file is regenerated and committed

### Manual Updates

To manually regenerate the data:

```bash
# Run the generation script
./shared/tools/generate-website-data.sh

# Review the changes
git diff docs/data.js

# Commit if looks good
git add docs/data.js
git commit -m "Update website data"
git push
```

## 🎨 Customizing the Website

### Adding Custom Content

Edit these files to customize:

**index.html**: Change structure, sections, or text
```html
<!-- Update hero section -->
<section class="hero">
    <h2>Your Custom Title</h2>
    <p>Your custom description</p>
</section>
```

**styles.css**: Modify colors, fonts, or layout
```css
:root {
    --primary-color: #DC382D;  /* Change to your color */
    --primary-dark: #B82E25;
}
```

**app.js**: Change behavior or add features
```javascript
// Modify filtering, search, or rendering logic
```

### Adding Custom Sections

Add new sections to `index.html`:

```html
<section class="custom-section">
    <div class="container">
        <h2>Your Section Title</h2>
        <p>Your content here</p>
    </div>
</section>
```

## 📊 How Data Generation Works

### Workshop Data

The script scans `workshops/*/workshop.config.json`:

```json
{
  "title": "Workshop Title",
  "description": "Description",
  "difficulty": "beginner",
  "duration": "3 hours",
  "tags": ["tag1", "tag2"]
}
```

Generates:
```javascript
{
    id: "workshop-id",
    title: "Workshop Title",
    description: "Description",
    difficulty: "beginner",
    duration: "3 hours",
    chaptersCount: 2,
    tags: ["tag1", "tag2"],
    path: "workshops/workshop-id"
}
```

### Chapter Data

The script scans:
- `shared/chapters/*/.chapter-metadata.json` (shared)
- `workshops/*/chapters/*/.chapter-metadata.json` (workshop-specific)

```json
{
  "title": "Chapter Title",
  "description": "Description",
  "difficulty": "beginner",
  "estimatedMinutes": 45,
  "tags": ["tag1", "tag2"]
}
```

Generates:
```javascript
{
    id: "chapter-id",
    title: "Chapter Title",
    description: "Description",
    difficulty: "beginner",
    estimatedMinutes: 45,
    tags: ["tag1", "tag2"],
    path: "shared/chapters/chapter-id",
    workshopSpecific: false  // or true for workshop chapters
}
```

## 🔍 Website Features

### Search Functionality

Users can search by:
- Workshop/chapter titles
- Descriptions
- Tags

Search is case-insensitive and real-time.

### Filtering

Workshops can be filtered by difficulty:
- All
- Beginner
- Intermediate
- Advanced

### Direct Navigation

Clicking a workshop card:
- Opens the workshop folder on GitHub
- Users can read the README and start learning

## 🐛 Troubleshooting

### Site Not Showing

1. **Check GitHub Pages settings**
   - Ensure source is set to `main` branch, `/docs` folder
   
2. **Wait for deployment**
   - GitHub Pages can take 5-10 minutes to deploy
   
3. **Check Actions tab**
   - See if the workflow ran successfully

### Data Not Updating

1. **Check workflow runs**
   - Go to Actions tab in GitHub
   - See if "Update GitHub Pages Data" ran
   
2. **Check file changes**
   - Verify workshop.config.json is valid JSON
   - Verify .chapter-metadata.json is valid JSON

3. **Manually trigger**
   - Go to Actions → Update GitHub Pages Data
   - Click "Run workflow"

### Invalid JSON

If the generation script fails:

```bash
# Check JSON validity
jq empty workshops/your-workshop/workshop.config.json

# If error, fix the JSON syntax
```

## 📱 Mobile Responsiveness

The website is fully responsive:
- Desktop: Multi-column grid layout
- Tablet: 2-column layout
- Mobile: Single column, stacked layout

## 🎯 SEO Optimization

The site includes:
- Proper meta tags
- Semantic HTML structure
- Descriptive page title
- Mobile viewport settings

To improve SEO further, edit `index.html`:

```html
<head>
    <meta name="description" content="Your custom description">
    <meta name="keywords" content="redis, workshops, tutorial">
    <!-- Add more meta tags as needed -->
</head>
```

## 🔐 Security

The site is static HTML/CSS/JavaScript:
- No server-side code
- No user data collection
- Safe from most web vulnerabilities
- All links open in new tabs for safety

## 📈 Analytics (Optional)

To add Google Analytics or similar:

1. Get your tracking ID
2. Add to `index.html` before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR-ID');
</script>
```

## 🔄 Workflow

### Normal Workflow

1. Create/update workshop or chapter
2. Commit and push to main
3. GitHub Actions runs automatically
4. data.js is regenerated and committed
5. GitHub Pages redeploys
6. Website is updated (5-10 minutes)

### Manual Workflow

1. Run `./shared/tools/generate-website-data.sh`
2. Review `git diff docs/data.js`
3. Commit and push
4. GitHub Pages redeploys

## 📝 Maintenance

### Regular Tasks

- **Review workshop data**: Ensure descriptions are accurate
- **Check links**: Verify all GitHub links work
- **Update styling**: Keep design fresh and modern
- **Monitor analytics**: See which workshops are popular

### When Adding Content

After adding a new workshop or chapter:

```bash
# Regenerate data
./shared/tools/generate-website-data.sh

# Verify locally (optional - open in browser)
open docs/index.html

# Commit and push
git add docs/data.js
git commit -m "Add new workshop to website"
git push
```

## 🌟 Best Practices

1. **Keep metadata accurate**: Ensure workshop.config.json and .chapter-metadata.json are up-to-date
2. **Use descriptive titles**: Help users find content easily
3. **Add relevant tags**: Improve searchability
4. **Set correct difficulty**: Help users choose appropriate workshops
5. **Estimate time accurately**: Set realistic expectations

## 📧 Support

If you encounter issues:
1. Check this guide
2. Review GitHub Actions logs
3. Validate JSON files with `jq`
4. Open an issue on GitHub

## 🎉 Your Site Is Live!

Once set up, your site will be available at:

**https://tfindelkind-redis.github.io/redis-workshops/**

Share this link with learners to help them discover and navigate your workshops!

---

**Last Updated:** 2025-10-31
