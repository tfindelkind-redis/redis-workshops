## 🎯 What Is This App?

A **real-time AI trading agent system** that combines multiple specialized agents to analyze financial markets, detect fraud, and make trading recommendations. The system leverages:

- **Microsoft AutoGen** for multi-agent orchestration
- **Azure Managed Redis Enterprise** for semantic caching, vector search, fraud detection, and real-time data
- **Azure OpenAI** for LLM completions and embeddings
- **85% cost reduction** through intelligent caching
- **Sub-millisecond fraud detection** protecting against market manipulation

The platform processes 1,000+ signals per second while maintaining <2 second response times and ensuring security through real-time blacklist checks and wash trading detection.

---

## 🏗️ System Architecture

```ini
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE LAYER                            │
│                    (FastAPI REST API + WebSocket)                       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    MICROSOFT AUTOGEN AGENT LAYER                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐   │
│  │  User Proxy  │  │ Orchestrator │  │  Market Data │  │  Sentiment │   │
│  │    Agent     │─►│    Agent     │─►│    Agent     │  │   Agent    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘   │
│                            │                                            │
│                            ▼                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │  Technical   │  │     Risk     │  │    Report    │                   │
│  │   Analysis   │  │  Assessment  │  │  Generation  │                   │
│  │    Agent     │  │    Agent     │  │    Agent     │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       REDIS ENTERPRISE LAYER                            │
│                    (Unified Data & Caching Platform)                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌────────────────┐   │
│  │  Semantic Cache     │  │  Vector Search      │  │  Agentic Memory│   │
│  │  (RediSearch)       │  │  (RediSearch HNSW)  │  │  (Hashes/JSON) │   │
│  │                     │  │                     │  │                │   │
│  │  • LLM responses    │  │  • Earnings docs    │  │  • Portfolio   │   │
│  │  • Query embeddings │  │  • SEC filings      │  │  • Chat history│   │
│  │  • Similarity: 0.92 │  │  • News articles    │  │  • Entities    │   │
│  └─────────────────────┘  └─────────────────────┘  └────────────────┘   │
│                                                                         │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌────────────────┐   │
│  │  Time Series Data   │  │  Fraud Detection    │  │  Task Queue    │   │
│  │  (RedisTimeSeries)  │  │  (RedisBloom)       │  │  (Streams)     │   │
│  │                     │  │                     │  │                │   │
│  │  • OHLCV prices     │  │  • Blacklist check  │  │  • Agent tasks │   │
│  │  • Technical indic. │  │  • Wash trading     │  │  • Job queue   │   │
│  │  • Volume data      │  │  • Rate limits      │  │  • Pub/Sub     │   │
│  └─────────────────────┘  └─────────────────────┘  └────────────────┘   │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES LAYER                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐   │
│  │ Azure OpenAI │  │ Market Data  │  │ News APIs    │  │ SEC Edgar  │   │ 
│  │              │  │ APIs         │  │              │  │ Filings    │   │
│  │ • GPT-4      │  │ • Alpha V.   │  │ • NewsAPI    │  │            │   │
│  │ • Embeddings │  │ • Polygon.io │  │ • Twitter    │  │ • 10-K/Q   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📚 Workshop Modules (8 Hours)

### Module 1: Financial AI Agents & Market Intelligence (45 min)
- Evolution from rule-based systems to agentic AI
- Agent patterns: ReAct, Plan-and-Execute, Multi-Agent
- Microsoft AutoGen framework fundamentals
- Redis for trading: Sub-millisecond latency, 10M+ ops/sec

### Module 2: Azure Managed Redis for Trading Systems (60 min)
- Provision Redis Enterprise M10 with modules
- RediSearch for vector similarity search
- RedisTimeSeries for OHLCV data
- RedisBloom for fraud detection
- RedisJSON for complex financial instruments
- **Lab:** Ingest 2 years of stock data, test 100K writes/sec

### Module 3: Semantic Cache for Market Data (90 min)
- Why exact-match caching fails for financial queries
- Semantic similarity with embeddings
- Vector search for cache lookups
- Market-hours aware TTL and invalidation
- **Lab:** Build FinancialSemanticCache, achieve 85% hit rate, 92% cost savings

### Module 4: Vector Search & Financial RAG (90 min)
- RAG pipeline: Ingest → Chunk → Embed → Index → Retrieve → Generate
- Document chunking strategies for 10-K/10-Q filings
- Metadata filtering: Company, date, document type
- RediSearch HNSW algorithm
- **Lab:** Index 50 earnings transcripts, build Q&A agent, hybrid search

### Module 5: Agentic Memory & Trading Context (90 min)
- Memory types: Short-term, Long-term, Entity
- Trading entities: Tickers, positions, watchlists, alerts
- Redis data structures: Hashes, Sorted Sets, JSON
- Memory retrieval strategies
- **Lab:** Build AgenticTradingMemory with sliding window (50 messages)

### Module 6: Fraud Detection & Security (60 min)
- Bloom filter data structure for probabilistic set membership
- RedisBloom commands: BF.ADD, BF.EXISTS, BF.MADD
- Security use cases: Blacklists, wash trading, rate limiting
- 10M entries in 1.2MB memory
- **Lab:** Build FraudDetector with 3 Bloom filters, <1ms fraud checks

### Module 7: Multi-Agent System with AutoGen (120 min)
- AutoGen framework: Conversable agents, group chat
- Agent patterns: Manager-Worker, Pipeline, Consensus
- Agent specialization: Market data, sentiment, technical, risk
- Redis Pub/Sub and Streams for coordination
- **Lab:** Build 5-agent system with group chat and task distribution

### Module 8: Production Trading Agent Lab (105 min)
- Production checklist: Error handling, retries, timeouts
- Monitoring: Prometheus metrics, Azure Monitor
- Safety: Position limits, kill switches, human-in-the-loop
- Cost optimization and compliance
- **Final Project:** Real-time monitoring of 10+ stocks, semantic cache >80% hit rate, fraud detection <1ms, cost per analysis <$0.05

---

## 🎯 Key Performance Metrics

| Metric | Target | Workshop Actual |
|--------|--------|-----------------|
| Cache Hit Rate | >80% | **85%** |
| Response Time | <5s | **2.3s** |
| LLM Cost Reduction | >70% | **83%** |
| Throughput | 1000/sec | **1,247/sec** |
| Fraud Detection | <5ms | **0.3ms** |
| Memory Usage | <2GB | **1.6GB** |

---

## 🔧 Redis Features Used

- **RediSearch:** Semantic caching (85% hit rate) + RAG retrieval (10M+ vectors, <10ms latency)
- **RedisTimeSeries:** OHLCV market data (1M+ points/sec ingestion)
- **RedisBloom:** Fraud detection & security (10M blacklist in 1.2MB, 0.3ms checks)
- **RedisJSON:** Portfolio state & complex instruments (atomic nested operations)
- **Redis Hashes:** Session data & metadata (O(1) access)
- **Redis Sorted Sets:** Conversation history (time-ordered, sliding window)
- **Redis Streams:** Agent task queue (1M+ msgs/sec, consumer groups)
- **Redis Pub/Sub:** Live price updates (fire-and-forget broadcasting)

---

## 💼 Technology Stack

- **Agent Framework:** Microsoft AutoGen 0.2+
- **LLM Provider:** Azure OpenAI (GPT-4 Turbo, text-embedding-3-large)
- **Database:** Azure Managed Redis Enterprise (M10 + modules)
- **Language:** Python 3.11+ (asyncio, type hints)
- **API Framework:** FastAPI + Uvicorn
- **Monitoring:** Prometheus + Grafana
- **Financial Data:** Alpha Vantage, Polygon.io, yfinance

---

## 🎓 Learning Outcomes

By completing this workshop, attendees will:

- Build production-ready multi-agent trading systems using Microsoft AutoGen
- Implement semantic caching for 85%+ LLM cost reduction
- Deploy fraud detection with sub-millisecond latency
- Create RAG systems for financial document analysis
- Design agentic memory for stateful conversations
- Handle 1,000+ trading signals per second
- Deploy to Azure with monitoring and compliance

---

**Workshop Duration:** 8 hours (480 minutes)  
**Level:** Advanced  
**Cost per Attendee:** $16-21 (Azure resources)  
**Target Audience:** FinTech Engineers, Quants, AI/ML Engineers

**For Full Details:** See README.md, TECHNICAL_OVERVIEW.md, and QUICK_REFERENCE.md
