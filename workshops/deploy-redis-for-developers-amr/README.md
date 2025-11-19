---
workshopId: deploy-redis-for-developers-amr
title: Deploy Redis for Developers - Azure Managed Redis
description: Deploy Redis for Developers - Azure Managed Redis
duration: 120
difficulty: intermediate
modules:
  - order: 1
    name: Redis Fundamentals
    description: Establish foundational understanding of Redis as an in-memory data store, covering core data structures, common use cases, and essential tools.
    duration: 60
    difficulty: beginner
    type: lecture
    moduleRef: custom/redis-fundamentals
    required: true
  - order: 2
    name: Azure Managed Redis Architecture
    description: Understand Azure Managed Redis offerings, SKU selection, architecture patterns, and security fundamentals.
    duration: 60
    difficulty: intermediate
    type: lecture
    moduleRef: custom/azure-managed-redis-architecture
    required: true
---

# Deploy Redis for Developers - Azure Managed Redis

**Duration:** 120  
**Difficulty:** intermediate

## 📋 Overview

Deploy Redis for Developers - Azure Managed Redis

## 🎯 Learning Objectives

By the end of this workshop, you will be able to:
- Understand Redis fundamentals and architecture
- Deploy and configure Redis on Azure
- Implement best practices for security and performance
- Build production-ready Redis applications

## 📚 Prerequisites

Before starting this workshop, you should have:
- Basic understanding of databases and caching concepts
- Familiarity with command-line interfaces
- An Azure account (free tier is sufficient)
- Basic knowledge of cloud computing concepts

## 🛠️ Setup

### Required Tools
- GitHub account (for forking)
- Web browser
- Azure account

### Getting Started

**⚠️ Important:** This workshop uses GitHub Codespaces - no local installation needed!

1. **Fork the repository**
   - Visit [redis-workshops on GitHub](https://github.com/tfindelkind-redis/redis-workshops)
   - Click the "Fork" button to create your personal copy

2. **Open in GitHub Codespaces**
   - Go to your forked repository
   - Click "Code" → "Codespaces" → "Create codespace on main"
   - Wait ~1 minute while the environment sets up

3. **Navigate to this workshop**
   ```bash
   cd workshops/deploy-redis-for-developers-amr
   ```

## 📖 Workshop Modules

**Total Duration:** 2h 0m | **Modules:** 2

Complete the modules in order for the best learning experience:

| # | Module | Duration | Difficulty | Type | Required |
|---|--------|----------|------------|------|----------|
| 1 | [Redis Fundamentals](module-01-redis-fundamentals/README.md) | 60m | beginner | lecture | ✅ Yes |
| 2 | [Azure Managed Redis Architecture](module-02-azure-managed-redis-architecture/README.md) | 60m | intermediate | lecture | ✅ Yes |

---

### Module 1: Redis Fundamentals

📂 **[Go to Module](module-01-redis-fundamentals/README.md)**

**Duration:** 60 minutes | **Difficulty:** beginner | **Type:** lecture

Establish foundational understanding of Redis as an in-memory data store, covering core data structures, common use cases, and essential tools.

> ✅ **Required Module** - Essential for workshop completion

---

### Module 2: Azure Managed Redis Architecture

📂 **[Go to Module](module-02-azure-managed-redis-architecture/README.md)**

**Duration:** 60 minutes | **Difficulty:** intermediate | **Type:** lecture

Understand Azure Managed Redis offerings, SKU selection, architecture patterns, and security fundamentals.

> ✅ **Required Module** - Essential for workshop completion

---



## 🏗️ Workshop Project

Throughout this workshop, you'll:
- Set up a Redis instance on Azure
- Implement caching patterns
- Configure security and monitoring
- Deploy a production-ready application

## ✅ Completion Checklist

Track your progress through the workshop:

- [ ] Completed all required modules
- [ ] Set up Azure Managed Redis instance
- [ ] Implemented caching in sample application
- [ ] Configured security (Private Endpoint, Entra ID)
- [ ] Set up monitoring and alerts
- [ ] Completed hands-on exercises

## 🎓 Next Steps

After completing this workshop:
- Explore advanced Redis features (Streams, JSON, Search)
- Learn about Redis clustering and scaling strategies
- Implement Redis in your own applications
- Join the Redis community and share your experience

## 📚 Additional Resources

- [Azure Cache for Redis Documentation](https://docs.microsoft.com/azure/azure-cache-for-redis/)
- [Redis Official Documentation](https://redis.io/docs/)
- [Redis University](https://university.redis.com/)
- [Azure Well-Architected Framework](https://docs.microsoft.com/azure/architecture/framework/)

---

**Need Help?** 
- Check the module README files for detailed instructions
- Review the troubleshooting sections in each module
- Open an issue in the GitHub repository


## 📚 Workshop Modules

### [Module 1: Redis Fundamentals](module-01-redis-fundamentals/README.md)

**Duration:** 60 minutes | **Difficulty:** beginner | **Type:** lecture

Establish foundational understanding of Redis as an in-memory data store, covering core data structures, common use cases, and essential tools.

### [Module 2: Azure Managed Redis Architecture](module-02-azure-managed-redis-architecture/README.md)

**Duration:** 60 minutes | **Difficulty:** intermediate | **Type:** lecture

Understand Azure Managed Redis offerings, SKU selection, architecture patterns, and security fundamentals.

