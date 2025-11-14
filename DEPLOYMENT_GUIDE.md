# Workshop Deployment Guide

## Overview

This guide explains how to deploy your built workshops to various hosting platforms. After building your workshop with the `workshop-builder.py build` command, you'll have a static site ready for deployment.

## Quick Start

```bash
# 1. Build your workshop
python3 shared/tools/workshop-builder.py build --workshop my-workshop

# 2. Your deployment-ready files are in:
#    workshops/my-workshop/build/

# 3. Deploy to your preferred platform (see below)
```

## Deployment Options

### Option 1: GitHub Pages (Recommended)

GitHub Pages is the easiest and most integrated option for this repository.

#### Method A: Deploy from `docs/` Directory

This is the simplest approach for deploying directly from the main branch.

**Steps:**

1. **Build your workshop**:
   ```bash
   python3 shared/tools/workshop-builder.py build --workshop my-workshop
   ```

2. **Copy build output to `docs/` directory**:
   ```bash
   # Create docs directory if it doesn't exist
   mkdir -p docs/workshops/my-workshop
   
   # Copy built workshop
   cp -r workshops/my-workshop/build/* docs/workshops/my-workshop/
   ```

3. **Commit and push**:
   ```bash
   git add docs/
   git commit -m "deploy: Add my-workshop to GitHub Pages"
   git push origin main
   ```

4. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under "Build and deployment":
     - Source: **Deploy from a branch**
     - Branch: **main**
     - Folder: **/docs**
   - Click **Save**

5. **Access your workshop**:
   ```
   https://[username].github.io/[repository]/workshops/my-workshop/
   ```

**Pros:**
- ✅ Simple one-time setup
- ✅ Deploys directly from main branch
- ✅ No separate branch to manage
- ✅ Automatic deployment on push

**Cons:**
- ⚠️ Build files committed to repository
- ⚠️ Larger repository size

#### Method B: Deploy from `gh-pages` Branch

This keeps your main branch clean by deploying from a separate branch.

**Steps:**

1. **Build your workshop**:
   ```bash
   python3 shared/tools/workshop-builder.py build --workshop my-workshop
   ```

2. **Create/update `gh-pages` branch**:
   ```bash
   # Create gh-pages branch if it doesn't exist
   git checkout --orphan gh-pages
   git rm -rf .
   
   # Or switch to existing gh-pages branch
   git checkout gh-pages
   ```

3. **Copy build output**:
   ```bash
   cp -r workshops/my-workshop/build/* .
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "deploy: Deploy my-workshop"
   git push origin gh-pages
   ```

5. **Enable GitHub Pages**:
   - Go to **Settings** → **Pages**
   - Source: **Deploy from a branch**
   - Branch: **gh-pages**
   - Folder: **/ (root)**

**Pros:**
- ✅ Clean main branch
- ✅ Separate deployment history
- ✅ Only built files in gh-pages branch

**Cons:**
- ⚠️ Need to manage separate branch
- ⚠️ Manual deployment process

#### Method C: GitHub Actions (Automated)

Automate deployment with GitHub Actions.

**Steps:**

1. **Create `.github/workflows/deploy.yml`**:
   ```yaml
   name: Deploy Workshop
   
   on:
     push:
       branches: [ main ]
       paths:
         - 'workshops/**'
         - 'shared/modules/**'
         - 'shared/tools/**'
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       
       steps:
         - uses: actions/checkout@v3
         
         - name: Set up Python
           uses: actions/setup-python@v4
           with:
             python-version: '3.11'
         
         - name: Build workshop
           run: |
             python3 shared/tools/workshop-builder.py build --workshop my-workshop
         
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./workshops/my-workshop/build
             destination_dir: workshops/my-workshop
   ```

2. **Commit and push**:
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "ci: Add GitHub Actions deployment"
   git push origin main
   ```

**Pros:**
- ✅ Fully automated
- ✅ Builds on push
- ✅ No manual deployment steps
- ✅ Clean repository

**Cons:**
- ⚠️ Requires GitHub Actions setup
- ⚠️ Slightly more complex

### Option 2: Netlify

Netlify offers continuous deployment with a simple setup.

**Steps:**

1. **Build your workshop** (locally or in Netlify):
   ```bash
   python3 shared/tools/workshop-builder.py build --workshop my-workshop
   ```

2. **Deploy via Netlify CLI**:
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login
   netlify login
   
   # Deploy
   cd workshops/my-workshop/build
   netlify deploy --prod
   ```

3. **Or connect to GitHub**:
   - Go to [Netlify](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Configure:
     - **Build command**: `python3 shared/tools/workshop-builder.py build --workshop my-workshop`
     - **Publish directory**: `workshops/my-workshop/build`
   - Click "Deploy site"

**Custom Domain:**
```bash
# Add custom domain via CLI
netlify domains:add my-workshop.example.com
```

**Pros:**
- ✅ Easy continuous deployment
- ✅ Free SSL certificates
- ✅ Custom domains
- ✅ Form handling
- ✅ Redirect rules

**Cons:**
- ⚠️ Requires Netlify account
- ⚠️ Free tier limits (100GB bandwidth/month)

### Option 3: Vercel

Vercel offers fast, global deployment.

**Steps:**

1. **Deploy via Vercel CLI**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login
   vercel login
   
   # Build workshop
   python3 shared/tools/workshop-builder.py build --workshop my-workshop
   
   # Deploy
   cd workshops/my-workshop/build
   vercel --prod
   ```

2. **Or connect to GitHub**:
   - Go to [Vercel](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - **Build Command**: `python3 shared/tools/workshop-builder.py build --workshop my-workshop`
     - **Output Directory**: `workshops/my-workshop/build`
   - Click "Deploy"

**Pros:**
- ✅ Lightning-fast deployments
- ✅ Global CDN
- ✅ Free SSL
- ✅ Custom domains
- ✅ Automatic previews

**Cons:**
- ⚠️ Requires Vercel account
- ⚠️ Free tier limits (100GB bandwidth)

### Option 4: Self-Hosted

Deploy to your own server.

#### Using Nginx

**Steps:**

1. **Build workshop locally**:
   ```bash
   python3 shared/tools/workshop-builder.py build --workshop my-workshop
   ```

2. **Copy to server**:
   ```bash
   rsync -avz workshops/my-workshop/build/ user@server:/var/www/workshops/my-workshop/
   ```

3. **Configure Nginx** (`/etc/nginx/sites-available/workshops`):
   ```nginx
   server {
       listen 80;
       server_name workshops.example.com;
       
       root /var/www/workshops;
       index index.html;
       
       location / {
           try_files $uri $uri/ $uri.html =404;
       }
       
       # Enable gzip compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
   }
   ```

4. **Enable site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/workshops /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

#### Using Apache

**Configure Apache** (`/etc/apache2/sites-available/workshops.conf`):
```apache
<VirtualHost *:80>
    ServerName workshops.example.com
    DocumentRoot /var/www/workshops
    
    <Directory /var/www/workshops>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Enable compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript
    </IfModule>
</VirtualHost>
```

**Pros:**
- ✅ Full control
- ✅ No external dependencies
- ✅ No bandwidth limits
- ✅ Custom configurations

**Cons:**
- ⚠️ Requires server management
- ⚠️ SSL certificate management
- ⚠️ More complex setup

## Workshop Structure After Build

```
build/
├── README.md                          # Workshop home page
├── 01-module-name/
│   ├── README.md                      # Module index with navigation
│   └── content/
│       ├── 01-topic.md
│       ├── 02-topic.md
│       └── 03-topic.md
├── 02-another-module/
│   └── ...
└── assets/                            # (if present)
    └── images/
```

## Custom Domain Setup

### GitHub Pages

1. **Add CNAME file to docs/ or gh-pages branch**:
   ```bash
   echo "workshops.example.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```

2. **Configure DNS** (with your domain provider):
   ```
   Type: CNAME
   Name: workshops (or @)
   Value: [username].github.io
   ```

3. **Enable HTTPS in GitHub Settings** → **Pages** → **Enforce HTTPS**

### Netlify

1. **Via Netlify Dashboard**:
   - Go to Site settings → Domain management
   - Click "Add custom domain"
   - Enter your domain: `workshops.example.com`
   - Follow DNS configuration instructions

2. **Configure DNS**:
   ```
   Type: CNAME
   Name: workshops
   Value: [your-site].netlify.app
   ```

### Vercel

1. **Via Vercel Dashboard**:
   - Go to Project Settings → Domains
   - Add your domain: `workshops.example.com`
   - Follow DNS configuration instructions

2. **Configure DNS**:
   ```
   Type: CNAME
   Name: workshops
   Value: cname.vercel-dns.com
   ```

## SSL/HTTPS

All major platforms provide free SSL certificates:

| Platform | SSL Certificate | Setup |
|----------|----------------|-------|
| **GitHub Pages** | ✅ Free (Let's Encrypt) | Automatic |
| **Netlify** | ✅ Free (Let's Encrypt) | Automatic |
| **Vercel** | ✅ Free (Let's Encrypt) | Automatic |
| **Self-Hosted** | 🔧 Manual (Let's Encrypt) | `certbot` |

### Let's Encrypt (Self-Hosted)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d workshops.example.com

# Auto-renewal is set up automatically
```

## Performance Optimization

### Enable Compression

All platforms automatically enable gzip compression for:
- HTML files (`.html`, `.md`)
- CSS files
- JavaScript files
- JSON files

### CDN and Caching

| Platform | CDN | Caching |
|----------|-----|---------|
| **GitHub Pages** | ✅ Global CDN | Automatic |
| **Netlify** | ✅ Edge network | Automatic |
| **Vercel** | ✅ Edge network | Automatic |

### Custom Cache Headers

For self-hosted deployments, add cache headers:

**Nginx**:
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

**Apache**:
```apache
<FilesMatch "\.(jpg|jpeg|png|gif|ico|css|js)$">
    Header set Cache-Control "max-age=31536000, public"
</FilesMatch>
```

## Monitoring and Analytics

### Google Analytics

Add to each markdown file (in frontmatter or footer):
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Plausible Analytics (Privacy-Friendly)

```html
<script defer data-domain="workshops.example.com" src="https://plausible.io/js/script.js"></script>
```

## Troubleshooting

### Issue: 404 Errors on GitHub Pages

**Solution**: Ensure your files are in the correct directory and branch:
- For `docs/` deployment: files must be in `main` branch under `docs/`
- For `gh-pages` deployment: files must be in `gh-pages` branch at root

### Issue: Links Not Working

**Solution**: All links should be relative:
- ✅ `../01-module/README.md`
- ✅ `../../README.md`
- ❌ `/workshops/my-workshop/README.md` (absolute, will break)

### Issue: Markdown Not Rendering

**Solution**: GitHub Pages supports Jekyll by default. Add `.nojekyll` file:
```bash
touch .nojekyll
git add .nojekyll
git commit -m "Disable Jekyll"
git push
```

### Issue: Build Fails in CI/CD

**Solution**: Ensure Python and dependencies are available:
```yaml
- name: Set up Python
  uses: actions/setup-python@v4
  with:
    python-version: '3.11'

- name: Install dependencies
  run: |
    pip install pyyaml
```

## Best Practices

### 1. Version Your Deployments

Tag releases before deploying:
```bash
git tag -a workshop-v1.0 -m "Release workshop version 1.0"
git push origin workshop-v1.0
```

### 2. Test Locally First

```bash
# Build and test locally
python3 shared/tools/workshop-builder.py build --workshop my-workshop
cd workshops/my-workshop/build
python -m http.server 8000
# Open http://localhost:8000
```

### 3. Use Preview Environments

Most platforms offer preview deployments:
- **Netlify**: Automatic preview for each PR
- **Vercel**: Preview URL for each branch
- **GitHub Pages**: Use a separate branch for staging

### 4. Keep Build Files Out of Main Branch

Use `gh-pages` branch or external hosting to keep your main branch clean.

### 5. Automate Deployments

Set up CI/CD to automatically deploy when:
- Modules are updated
- Workshop configuration changes
- Content is added or modified

## Example: Complete Deployment Workflow

```bash
# 1. Create and build workshop
bash shared/tools/create-workshop.sh production-workshop "Production Workshop" "4 hours"
python3 shared/tools/workshop-builder.py add --workshop production-workshop --module core.redis-fundamentals.v1
python3 shared/tools/workshop-builder.py update-navigation --workshop production-workshop
python3 shared/tools/workshop-builder.py build --workshop production-workshop

# 2. Test locally
cd workshops/production-workshop/build
python -m http.server 8000
# Verify at http://localhost:8000

# 3. Deploy to GitHub Pages
cd ../../..
mkdir -p docs/workshops/production-workshop
cp -r workshops/production-workshop/build/* docs/workshops/production-workshop/
git add docs/
git commit -m "deploy: Add production workshop"
git push origin main

# 4. Access at:
# https://[username].github.io/redis-workshops/workshops/production-workshop/
```

## Support

For deployment issues:
1. Check platform-specific documentation
2. Review workshop build output for errors
3. Verify all links are relative paths
4. Test locally before deploying
5. Check platform logs/dashboard for errors

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/pages)
- [Netlify Documentation](https://docs.netlify.com)
- [Vercel Documentation](https://vercel.com/docs)
- [Let's Encrypt](https://letsencrypt.org)

---

*Last Updated: November 14, 2025*  
*Version: 1.0*
