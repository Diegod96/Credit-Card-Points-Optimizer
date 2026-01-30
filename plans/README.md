# CardStack Development Plan

## Overview

CardStack is a credit card points and cashback optimization platform that helps users maximize their rewards across multiple card ecosystems.

**Target MVP Launch:** 8 weeks from project start  
**Tech Stack:** Next.js 14, TypeScript, Prisma, Neon, Upstash, NextAuth.js, Vercel

---

## Plan Documents

| Document | Description |
|----------|-------------|
| [Phase 1: Foundation](./phase-1-foundation.md) | Project setup, auth, base UI (Weeks 1-2) |
| [Phase 2: Core Data](./phase-2-core-data.md) | Plaid integration, transactions, points engine (Weeks 3-4) |
| [Phase 3: Dashboard](./phase-3-dashboard.md) | Main UI, spending analytics, projections (Weeks 5-6) |
| [Phase 4: Simulator](./phase-4-simulator.md) | Card explorer, what-if simulator, launch (Weeks 7-8) |
| [Phase 5: Post-MVP](./phase-5-post-mvp.md) | Premium features, subscriptions, AI (Weeks 9-12) |
| [Testing Strategy](./testing-strategy.md) | Test pyramid, tools, coverage targets |
| [Git Flow](./git-flow.md) | Branch strategy, commits, PR process |
| [Dynamic Valuations](./dynamic-valuations.md) | Points valuation scraping system |
| [Merchant Categorization](./merchant-categorization.md) | Dynamic MCC mapping & corrections |
| [MCC Reference](./mcc-reference.md) | Complete MCC code mapping |

---

## Timeline Overview

```
Week 1-2   ████████░░░░░░░░░░░░░░░░  Phase 1: Foundation
Week 3-4   ░░░░░░░░████████░░░░░░░░  Phase 2: Core Data
Week 5-6   ░░░░░░░░░░░░░░░░████████  Phase 3: Dashboard
Week 7-8   ░░░░░░░░░░░░░░░░░░░░░░██  Phase 4: Simulator & Launch
Week 9-12  ░░░░░░░░░░░░░░░░░░░░░░░░  Phase 5: Post-MVP
```

---

## Milestones

| Milestone | Target | Success Criteria |
|-----------|--------|------------------|
| **M1: Foundation** | End of Week 2 | Auth working, CI pipeline green |
| **M2: Data Layer** | End of Week 4 | Plaid connected, transactions syncing |
| **M3: Dashboard** | End of Week 6 | Full dashboard with charts, projections |
| **M4: MVP Launch** | End of Week 8 | All features complete, production deployed |
| **M5: Premium** | End of Week 12 | Subscriptions, AI features |

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript, TailwindCSS |
| Backend | Next.js API Routes, Prisma ORM |
| Database | Neon (serverless PostgreSQL) |
| Cache | Upstash Redis |
| Auth | NextAuth.js |
| Email | Resend |
| Jobs | Inngest |
| Hosting | Vercel |
| Monitoring | Sentry, Vercel Analytics |

---

## Cost Projections

| Stage | Users | Monthly Cost |
|-------|-------|--------------|
| MVP | 0-1K | **$0** |
| Growth | 1K-10K | $50-75 |
| Scale | 10K-50K | $150-250 |
| Mature | 50K-100K | $300-500 |

---

## Quick Links

- [Development Setup](#development-setup)
- [Environment Variables](./phase-1-foundation.md#environment-variables)
- [Database Schema](./phase-2-core-data.md#database-schema)
- [API Endpoints](./phase-2-core-data.md#api-endpoints)

---

## Development Setup

```bash
# Clone repository
git clone https://github.com/your-org/cardstack.git
cd cardstack

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Set up database
npx prisma generate
npx prisma db push

# Start dev server
npm run dev
```

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Plaid API changes | Low | High | Pin API version, monitor changelog |
| Card data inaccuracy | Medium | Medium | Community reporting, regular audits |
| Neon downtime | Low | High | Connection pooling, retry logic |
| Scope creep | High | Medium | Strict phase gates, MVP focus |
| Auth security issues | Low | Critical | NextAuth.js best practices, security audit |
