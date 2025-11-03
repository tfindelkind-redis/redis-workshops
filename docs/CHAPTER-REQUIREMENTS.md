# Chapter Requirements System

## Overview

The chapter requirements system makes it easy for creators to specify what prerequisites are needed for a chapter to run successfully. Requirements are automatically validated before the chapter starts.

## For Chapter Creators

### 1. Add Requirements to Chapter README

Simply add a `requirements` section to your chapter's frontmatter:

```markdown
---
title: My Chapter Title
description: Chapter description
difficulty: beginner
estimatedMinutes: 45
requirements:
  redis: true
  environment:
    - REDIS_HOST
    - REDIS_PORT
    - REDIS_PASSWORD (optional, secret)
  tools:
    - redis-cli
    - python>=3.8
  packages:
    - redis>=5.0.0
---
```

### 2. Generate Metadata

Run the metadata generator:

```bash
./shared/tools/generate-chapter-metadata.py shared/chapters/my-chapter
```

This creates `.chapter-metadata.json` with full requirement definitions.

### 3. Test Validation

Test that requirements are checked correctly:

```bash
./shared/tools/validate-chapter-requirements.sh shared/chapters/my-chapter
```

## Requirement Types

### Connection Requirements

Specify which Redis instance type is needed:

```yaml
requirements:
  redis: true           # Any Redis instance
  # OR
  azure-redis: true     # Specifically Azure Managed Redis
```

###Environment Variables

List required and optional environment variables:

```yaml
requirements:
  environment:
    - REDIS_HOST                      # Required, not secret
    - REDIS_PORT                      # Required, not secret  
    - REDIS_PASSWORD (optional, secret)  # Optional AND secret
    - API_KEY (secret)                # Required AND secret
    - CUSTOM_VAR (optional)           # Optional, not secret
```

**Syntax:**
- `VAR_NAME` - Required, not secret
- `VAR_NAME (optional)` - Optional, not secret
- `VAR_NAME (secret)` - Required, is secret
- `VAR_NAME (optional, secret)` - Optional, is secret

### Tool Requirements

Specify required command-line tools:

```yaml
requirements:
  tools:
    - redis-cli          # Just name
    - python>=3.8        # With minimum version
    - terraform
    - azure-cli
```

**Supported Tools** (with auto-validation):
- `redis-cli` - Redis command-line interface
- `python` - Python interpreter
- `terraform` - Infrastructure as Code
- `azure-cli` - Azure command-line tools

### Python Package Requirements

List required Python packages (pip installable):

```yaml
requirements:
  packages:
    - redis>=5.0.0
    - jupyter>=1.0.0
    - pandas
    - matplotlib
```

## Pre-defined Templates

The system includes templates for common requirements:

### Environment Variables

- `REDIS_HOST` - Redis hostname (default: localhost)
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_PASSWORD` - Redis password (optional, secret)
- `AZURE_SUBSCRIPTION_ID` - Azure subscription
- `AZURE_RESOURCE_GROUP` - Azure resource group

### Tools

- `redis-cli` - Redis CLI
- `python` - Python (>= 3.8)
- `terraform` - Terraform
- `azure-cli` - Azure CLI (az command)

### Connection Types

- `redis` - Generic Redis connection
- `azure-redis` - Azure Managed Redis

## Complete Example

Here's a full example for an Azure Managed Redis chapter:

```markdown
---
title: Azure Redis Performance Tuning
description: Optimize Azure Managed Redis for production workloads
difficulty: advanced
estimatedMinutes: 90
tags:
  - azure
  - redis
  - performance
requirements:
  azure-redis: true
  environment:
    - REDIS_HOST
    - REDIS_PORT
    - REDIS_PASSWORD (secret)
    - AZURE_SUBSCRIPTION_ID
    - AZURE_RESOURCE_GROUP
  tools:
    - redis-cli
    - python>=3.9
    - azure-cli
  packages:
    - redis>=5.0.0
    - azure-mgmt-redis
    - jupyter>=1.0.0
---

# Azure Redis Performance Tuning

... chapter content ...
```

## Validation Output

When users run the validation, they see:

```
🔍 Validating chapter requirements...

Chapter: Azure Redis Performance Tuning

Checking Redis connection...
✓ Redis connection successful

Checking required tools...
✓ redis-cli
✓ python
✓ az

Checking environment variables...
✓ REDIS_HOST = my-redis.redis.cache.windows.net
✓ REDIS_PORT = 6380
✓ REDIS_PASSWORD is set (secret)
✓ AZURE_SUBSCRIPTION_ID = abc123...
✓ AZURE_RESOURCE_GROUP = my-rg

Checking Python packages...
✓ redis>=5.0.0
✓ azure-mgmt-redis
✓ jupyter>=1.0.0

✅ All requirements met! You're ready to start this chapter.
```

## Integration with Workshops

Workshops reference chapters in their frontmatter:

```yaml
---
workshopId: azure-managed-redis
title: Azure Managed Redis Workshop
chapters: shared/chapters/redis-basics, shared/chapters/azure-redis-advanced
---
```

The workshop README can include a validation step:

```bash
# Validate all chapters
for chapter in shared/chapters/redis-basics shared/chapters/azure-redis-advanced; do
    ./shared/tools/validate-chapter-requirements.sh "$chapter"
done
```

## Adding Custom Requirements

To add new requirement templates, edit `shared/tools/generate-chapter-metadata.py`:

```python
# Add to REQUIREMENT_TEMPLATES for new connection types
REQUIREMENT_TEMPLATES = {
    "my-service": {
        "type": "connection",
        "description": "My custom service",
        "validation": "my-cli ping",
        "helpUrl": "https://example.com/docs"
    }
}

# Add to ENV_VAR_TEMPLATES for new environment variables
ENV_VAR_TEMPLATES = {
    "MY_CUSTOM_VAR": {
        "description": "My custom variable",
        "required": True,
        "secret": False
    }
}

# Add to TOOL_TEMPLATES for new tools
TOOL_TEMPLATES = {
    "my-tool": {
        "name": "my-tool",
        "validation": "which my-tool",
        "installUrl": "https://example.com/install"
    }
}
```

## Best Practices

1. **Be Specific**: List all actual requirements, even if they seem obvious
2. **Mark Secrets**: Always mark passwords and API keys as secret
3. **Provide Defaults**: Use common defaults (localhost:6379) when possible
4. **Test Validation**: Run validation yourself before committing
5. **Document Clearly**: Explain what each requirement is for in the chapter README
6. **Keep It Simple**: Only require what's absolutely necessary

## For Workshop Participants

When you start a chapter with requirements, simply run:

```bash
# Navigate to the chapter
cd shared/chapters/my-chapter

# Validate requirements
../../tools/validate-chapter-requirements.sh .

# If validation passes, start the chapter!
jupyter notebook notebook.ipynb
```

If validation fails, you'll get clear instructions on what to fix.
