# Workshop Builder Server

Backend server for the Workshop Builder GUI, providing filesystem and Git integration for workshop management.

## 🎯 Purpose

This server enables the Workshop Builder GUI to:
- Work directly with workshop files in the repository
- Automatically create and manage Git branches
- Load and save workshops to/from README.md frontmatter
- Commit changes with descriptive messages
- Never modify workshop content, only metadata and navigation

## 🚀 Quick Start

### Installation

```bash
cd shared/tools/workshop-builder-server
npm install
```

### Start Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### Development Mode (Auto-reload)

```bash
npm run dev
```

## 📡 API Endpoints

### Git Operations

#### Initialize Git
```http
GET /api/git/init
```
Creates a new branch if currently on `main`, otherwise returns current branch.

**Response:**
```json
{
  "success": true,
  "branch": "workshop-builder-2025-11-14T10-30-00",
  "created": true
}
```

#### Get Current Branch
```http
GET /api/git/branch/current
```

**Response:**
```json
{
  "success": true,
  "branch": "workshop-builder-2025-11-14T10-30-00"
}
```

#### Create Branch
```http
POST /api/git/branch/create
```

**Response:**
```json
{
  "success": true,
  "branch": "workshop-builder-2025-11-14T10-35-00"
}
```

#### Switch Branch
```http
POST /api/git/branch/switch
Content-Type: application/json

{
  "branch": "main"
}
```

#### List Branches
```http
GET /api/git/branches
```

**Response:**
```json
{
  "success": true,
  "current": "workshop-builder-2025-11-14T10-30-00",
  "all": ["main", "workshop-builder-2025-11-14T10-30-00"],
  "branches": { ... }
}
```

#### Commit Changes
```http
POST /api/git/commit
Content-Type: application/json

{
  "files": ["workshops/my-workshop/README.md"],
  "message": "Update workshop metadata"
}
```

#### Get Status
```http
GET /api/git/status
```

**Response:**
```json
{
  "success": true,
  "current": "workshop-builder-2025-11-14T10-30-00",
  "modified": ["workshops/test-workshop/README.md"],
  "staged": [],
  "created": [],
  "deleted": []
}
```

### Workshop Operations

#### List All Workshops
```http
GET /api/workshops
```

**Response:**
```json
{
  "success": true,
  "workshops": [
    {
      "workshopId": "redis-fundamentals",
      "title": "Redis Fundamentals",
      "description": "Learn Redis basics",
      "duration": "4 hours",
      "difficulty": "beginner",
      "modules": ["core.redis-fundamentals.v1", "..."],
      "path": "/path/to/workshops/redis-fundamentals"
    }
  ],
  "count": 5
}
```

#### Get Specific Workshop
```http
GET /api/workshops/redis-fundamentals
```

**Response:**
```json
{
  "success": true,
  "workshop": {
    "workshopId": "redis-fundamentals",
    "title": "Redis Fundamentals",
    "description": "Learn Redis basics",
    "duration": "4 hours",
    "difficulty": "beginner",
    "modules": ["core.redis-fundamentals.v1"],
    "frontmatter": { ... },
    "path": "/path/to/workshops/redis-fundamentals"
  }
}
```

#### Create New Workshop
```http
POST /api/workshops
Content-Type: application/json

{
  "workshopId": "my-new-workshop",
  "title": "My New Workshop",
  "description": "A great workshop",
  "duration": "3 hours",
  "difficulty": "intermediate",
  "modules": ["core.redis-fundamentals.v1"]
}
```

**Response:**
```json
{
  "success": true,
  "workshop": { ... },
  "message": "Workshop created successfully"
}
```

#### Update Workshop
```http
PUT /api/workshops/redis-fundamentals
Content-Type: application/json

{
  "title": "Redis Fundamentals - Updated",
  "duration": "5 hours",
  "modules": ["core.redis-fundamentals.v1", "core.azure-redis-options.v1"]
}
```

**Response:**
```json
{
  "success": true,
  "workshop": { ... },
  "message": "Workshop updated successfully"
}
```

#### Delete Workshop
```http
DELETE /api/workshops/my-workshop
```

**Response:**
```json
{
  "success": true,
  "message": "Workshop my-workshop deleted successfully"
}
```

#### Validate Workshop ID
```http
POST /api/workshops/validate/id
Content-Type: application/json

{
  "workshopId": "my-workshop-123"
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "message": "Workshop ID is valid"
}
```

### Health & Info

#### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-11-14T10:30:00.000Z",
  "uptime": 123.456
}
```

#### Server Info
```http
GET /api/info
```

**Response:**
```json
{
  "success": true,
  "server": {
    "version": "1.0.0",
    "node": "v20.0.0",
    "platform": "darwin"
  },
  "git": {
    "branch": "workshop-builder-2025-11-14T10-30-00",
    "modified": 1,
    "staged": 0
  },
  "repository": "/path/to/redis-workshops"
}
```

## 🏗️ Architecture

### Module Structure

```
workshop-builder-server/
├── server.js          # Express server with API routes
├── git-ops.js         # Git operations wrapper
├── workshop-ops.js    # Workshop file operations
├── package.json       # Dependencies
└── README.md          # This file
```

### Dependencies

- **express**: Web server framework
- **cors**: Enable CORS for GUI access
- **simple-git**: Git operations
- **js-yaml**: YAML parsing for frontmatter
- **body-parser**: Parse JSON request bodies

### File Operations

The server operates on workshop files at:
```
workshops/
└── {workshopId}/
    ├── README.md       # Contains frontmatter (metadata)
    └── chapters/       # Workshop-specific content (not modified)
```

### Frontmatter Format

Workshop metadata is stored in YAML frontmatter:

```yaml
---
workshopId: my-workshop
title: My Workshop
description: Workshop description
duration: 4 hours
difficulty: intermediate
chapters: core.redis-fundamentals.v1,core.azure-redis-options.v1
---
```

## 🔒 Safety Features

### What This Server Can Modify
✅ Workshop README.md frontmatter
✅ Workshop metadata (title, description, duration, difficulty)
✅ Module list and order (chapters field)
✅ Workshop directory structure

### What This Server Cannot Modify
❌ Module content files
❌ Canonical module library
❌ Workshop content sections (below frontmatter)
❌ Chapter content files

### Git Safety
- Always creates new branch if on `main`
- Never commits directly to `main`
- Provides status and diff information
- Allows rollback by switching branches

## 🧪 Testing

### Manual Testing

1. **Test Health Check**
```bash
curl http://localhost:3000/api/health
```

2. **Initialize Git**
```bash
curl http://localhost:3000/api/git/init
```

3. **List Workshops**
```bash
curl http://localhost:3000/api/workshops
```

4. **Get Workshop**
```bash
curl http://localhost:3000/api/workshops/redis-fundamentals
```

5. **Create Workshop**
```bash
curl -X POST http://localhost:3000/api/workshops \
  -H "Content-Type: application/json" \
  -d '{
    "workshopId": "test-workshop-api",
    "title": "Test Workshop",
    "description": "Testing the API",
    "duration": "2 hours",
    "difficulty": "beginner",
    "modules": ["core.redis-fundamentals.v1"]
  }'
```

6. **Update Workshop**
```bash
curl -X PUT http://localhost:3000/api/workshops/test-workshop-api \
  -H "Content-Type: application/json" \
  -d '{
    "duration": "3 hours",
    "modules": ["core.redis-fundamentals.v1", "core.azure-redis-options.v1"]
  }'
```

7. **Commit Changes**
```bash
curl -X POST http://localhost:3000/api/git/commit \
  -H "Content-Type: application/json" \
  -d '{
    "files": ["workshops/test-workshop-api/README.md"],
    "message": "Create test workshop via API"
  }'
```

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
PORT=3001 npm start
```

### Git Errors
If you get Git errors, ensure you're in the repository root and Git is initialized:
```bash
git status
```

### Module Not Found
If you get module errors:
```bash
rm -rf node_modules
npm install
```

### CORS Issues
If the GUI can't connect, check CORS is enabled in `server.js` and the GUI is using the correct API URL.

## 🔧 Development

### Adding New Endpoints

1. Add route in `server.js`
2. Add business logic in appropriate module (`git-ops.js` or `workshop-ops.js`)
3. Update this README with endpoint documentation

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## 📝 Logging

The server logs all requests:
```
2025-11-14T10:30:00.000Z - GET /api/workshops
2025-11-14T10:30:05.000Z - PUT /api/workshops/redis-fundamentals
2025-11-14T10:30:10.000Z - POST /api/git/commit
```

## 🚀 Deployment

### Local Development
```bash
npm start
```

### GitHub Codespaces
The server auto-detects Codespaces and works with port forwarding.

### Production
For production deployment:
1. Set `NODE_ENV=production`
2. Configure reverse proxy (nginx)
3. Enable HTTPS
4. Restrict CORS origins

## 📚 Related Documentation

- [Workshop Builder GUI](../workshop-builder-gui.html)
- [Workshop Creator Guide](../../../WORKSHOP_CREATOR_GUIDE.md)
- [Filesystem Integration Plan](../../../GUI_FILESYSTEM_INTEGRATION_PLAN.md)

## 🆘 Support

For issues or questions:
1. Check the logs in the terminal
2. Test endpoints with curl
3. Review this README
4. Check the filesystem integration plan

---

**Version:** 1.0.0  
**Last Updated:** November 14, 2025
