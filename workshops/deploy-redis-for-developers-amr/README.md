---
workshopId: deploy-redis-for-developers-amr
title: Deploy Redis for Developers - Azure Managed Redis
description: Learn to deploy, configure, and manage Redis using Azure Managed Redis (AMR) with hands-on exercises and best practices
difficulty: intermediate
estimatedTime: 240
tags:
  - redis
  - azure
  - cloud
  - deployment
  - managed-service
prerequisites:
  - Basic understanding of Redis concepts
  - Azure account with active subscription
  - Familiarity with Azure Portal or Azure CLI
  - Basic networking knowledge
learningObjectives:
  - Understand Azure Managed Redis capabilities and tiers
  - Deploy and configure Redis on Azure
  - Master Redis data structures in a cloud context
  - Implement monitoring and security best practices
  - Scale Redis deployments on Azure
modules:
  - order: 1
    name: Redis Data Structures
    description: Hands-on exploration of Strings, Lists, Sets, Hashes, and Sorted Sets
    duration: 75
    difficulty: beginner
    type: hands-on
    moduleRef: Redis Data Structures
    required: true
  - order: 2
    name: Introduction to Redis
    description: Learn what Redis is, its key features, and when to use it
    duration: 45
    difficulty: beginner
    type: lecture
    moduleRef: Introduction to Redis
    required: true
  - order: 3
    name: Redis Use Cases
    description: Explore common patterns - caching, session management, pub/sub, and leaderboards
    duration: 50
    difficulty: intermediate
    type: hands-on
    moduleRef: Redis Use Cases
    required: true
  - order: 4
    name: Azure Managed Redis Deployment
    description: Deploy and configure Redis using Azure Managed Redis service
    duration: 60
    difficulty: intermediate
    type: hands-on
    moduleRef: Azure Managed Redis Deployment
    required: true
  - order: 5
    name: RedisJSON
    description: Using Redis as a JSON document store
    duration: 45
    difficulty: beginner
    type: canonical
    moduleRef: core.redis-json.v1
    required: true
duration: 275
---

# Deploy Redis for Developers - Azure Managed Redis

Welcome to the Azure Managed Redis workshop! This workshop will guide you through deploying, configuring, and managing Redis on Azure using Azure Managed Redis (AMR).

## Workshop Overview

Azure Managed Redis provides a fully managed Redis service with high availability, automatic patching, and integrated monitoring. In this workshop, you'll learn:

- Redis fundamentals and data structures
- Azure Managed Redis features and tiers
- Deployment and configuration
- Security and networking
- Monitoring and performance optimization

## Modules

### Module 1: Introduction to Redis (45 minutes)
Learn Redis fundamentals before diving into Azure deployment.

**Topics Covered:**
- What is Redis?
- Redis architecture and features
- When to use Redis
- Redis vs other caching solutions

### Module 2: Redis Data Structures (75 minutes)
Master Redis data structures with practical exercises.

**Topics Covered:**
- Strings: Key-value operations
- Lists: Message queues and timelines
- Sets: Unique collections and relationships
- Hashes: Object storage
- Sorted Sets: Leaderboards and rankings

### Module 3: Redis Use Cases (60 minutes)
Apply Redis to solve real-world problems.

**Topics Covered:**
- Caching strategies and patterns
- Session state management
- Real-time messaging with Pub/Sub
- Leaderboards and counters
- Rate limiting and throttling

### Module 4: Azure Managed Redis Deployment (60 minutes)
Deploy and manage Redis on Azure.

**Topics Covered:**
- Azure Managed Redis tiers (Basic, Standard, Premium)
- Deployment using Azure Portal and Azure CLI
- Configuration and scaling
- Network security and private endpoints
- Monitoring with Azure Monitor
- Backup and disaster recovery

## Prerequisites

- Azure subscription ([Free trial available](https://azure.microsoft.com/free/))
- Basic Redis knowledge (or complete Modules 1-3 first)
- Azure CLI or Azure Portal access
- Understanding of virtual networks (helpful but not required)

## Setup Requirements

### Azure Resources
- Active Azure subscription
- Resource group for the workshop
- Appropriate permissions to create Redis instances

### Local Tools
- Azure CLI (version 2.40+) or Azure Portal access
- Redis CLI or RedisInsight
- Optional: Visual Studio Code with Azure extensions

### Estimated Azure Costs
- Basic tier: ~$0.02/hour
- Standard tier: ~$0.04/hour
- Consider using Azure Free Tier credits

## Workshop Architecture

You'll deploy:
1. Azure Managed Redis instance (Standard tier)
2. Virtual Network (optional, for private endpoint)
3. Azure Monitor workspace
4. Sample application to test connectivity

## Resources

- [Azure Managed Redis Documentation](https://docs.microsoft.com/azure/azure-cache-for-redis/)
- [Redis Documentation](https://redis.io/docs/)
- [Azure CLI Reference](https://docs.microsoft.com/cli/azure/redis)
- [Pricing Calculator](https://azure.microsoft.com/pricing/details/cache/)

## Support

For issues or questions:
- Azure Redis support documentation
- Redis community forums
- Azure support portal


## 📚 Workshop Modules

### [Module 1: Redis Data Structures](module-01-redis-data-structures/README.md)

**Duration:** 75 minutes | **Difficulty:** beginner | **Type:** hands-on

Hands-on exploration of Strings, Lists, Sets, Hashes, and Sorted Sets

### [Module 2: Introduction to Redis](module-02-introduction-to-redis/README.md)

**Duration:** 45 minutes | **Difficulty:** beginner | **Type:** lecture

Learn what Redis is, its key features, and when to use it

### [Module 3: Azure Managed Redis Deployment](module-03-azure-managed-redis-deployment/README.md)

**Duration:** 60 minutes | **Difficulty:** intermediate | **Type:** hands-on

Deploy and configure Redis using Azure Managed Redis service

### [Module 4: Redis Use Cases](module-04-redis-use-cases/README.md)

**Duration:** 60 minutes | **Difficulty:** intermediate | **Type:** hands-on

Explore common patterns - caching, session management, pub/sub, and leaderboards

### [Module 5: RedisJSON](module-05-redisjson/README.md)

**Duration:** 45 minutes | **Difficulty:** beginner | **Type:** canonical

Using Redis as a JSON document store



## 📚 Workshop Modules

### [Module 1: Redis Data Structures](module-01-redis-data-structures/README.md)

**Duration:** 75 minutes | **Difficulty:** beginner | **Type:** hands-on

Hands-on exploration of Strings, Lists, Sets, Hashes, and Sorted Sets

### [Module 2: Introduction to Redis](module-02-introduction-to-redis/README.md)

**Duration:** 45 minutes | **Difficulty:** beginner | **Type:** lecture

Learn what Redis is, its key features, and when to use it

### [Module 3: Azure Managed Redis Deployment](module-03-azure-managed-redis-deployment/README.md)

**Duration:** 60 minutes | **Difficulty:** intermediate | **Type:** hands-on

Deploy and configure Redis using Azure Managed Redis service

### [Module 4: Redis Use Cases](module-04-redis-use-cases/README.md)

**Duration:** 50 minutes | **Difficulty:** intermediate | **Type:** hands-on

Explore common patterns - caching, session management, pub/sub, and leaderboards

### [Module 5: RedisJSON](module-05-redisjson/README.md)

**Duration:** 45 minutes | **Difficulty:** beginner | **Type:** canonical

Using Redis as a JSON document store



## 📚 Workshop Modules

### [Module 1: Redis Data Structures](module-01-redis-data-structures/README.md)

**Duration:** 75 minutes | **Difficulty:** beginner | **Type:** hands-on

Hands-on exploration of Strings, Lists, Sets, Hashes, and Sorted Sets

### [Module 2: Introduction to Redis](module-02-introduction-to-redis/README.md)

**Duration:** 45 minutes | **Difficulty:** beginner | **Type:** lecture

Learn what Redis is, its key features, and when to use it

### [Module 3: Redis Use Cases](module-03-redis-use-cases/README.md)

**Duration:** 50 minutes | **Difficulty:** intermediate | **Type:** hands-on

Explore common patterns - caching, session management, pub/sub, and leaderboards

### [Module 4: Azure Managed Redis Deployment](module-04-azure-managed-redis-deployment/README.md)

**Duration:** 60 minutes | **Difficulty:** intermediate | **Type:** hands-on

Deploy and configure Redis using Azure Managed Redis service

### [Module 5: RedisJSON](module-05-redisjson/README.md)

**Duration:** 45 minutes | **Difficulty:** beginner | **Type:** canonical

Using Redis as a JSON document store

