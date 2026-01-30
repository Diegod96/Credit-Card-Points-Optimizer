# Dynamic Points Valuation System

**Purpose:** Dynamically fetch and maintain current market valuations from trusted sources, while allowing user overrides

---

## Overview

Instead of hardcoding point valuations, CardStack dynamically fetches and maintains current market valuations from trusted sources like The Points Guy, while allowing users to set personal overrides.

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   TPG / Web     │────▶│  Scraper Job    │────▶│    Database     │
│   Sources       │     │  (Weekly)       │     │  (valuations)   │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User App      │◀────│   API Route     │◀────│  Redis Cache    │
│                 │     │  /api/valuations│     │  (24hr TTL)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │  User Overrides │
                        │  (preferences)  │
                        └─────────────────┘
```

---

## Data Sources

| Source | URL | Update Frequency | Priority |
|--------|-----|------------------|----------|
| The Points Guy | `thepointsguy.com/guide/monthly-valuations` | Monthly | Primary |
| Bankrate | `bankrate.com/finance/credit-cards` | Monthly | Fallback |
| NerdWallet | `nerdwallet.com/article/travel` | Quarterly | Fallback |

---

## Database Schema

```prisma
model PointsValuation {
  id            String   @id @default(uuid())
  currency      String   // AMEX_MR, CHASE_UR, CAPITAL_ONE, CITI_TYP
  valueCpp      Decimal  @map("value_cpp")
  source        String   // tpg, bankrate, manual, default
  effectiveDate DateTime @map("effective_date")
  createdAt     DateTime @default(now()) @map("created_at")

  @@unique([currency, effectiveDate, source])
  @@index([currency, effectiveDate(sort: Desc)])
  @@map("points_valuations")
}
```

---

## Fallback Strategy

```
Priority Order:
1. User override (if set for specific currency)
2. Redis cache (if exists and not expired)
3. Database (latest effective_date)
4. Hardcoded defaults (never fails)
```

This ensures the app **never breaks** even if:
- TPG changes their HTML structure
- Scraper fails repeatedly
- Redis is unavailable
- Database is empty

---

## Default Valuations (Fallback)

| Currency | Value (cpp) | Notes |
|----------|-------------|-------|
| AMEX Membership Rewards | 2.0 | Updated dynamically via TPG |
| Chase Ultimate Rewards | 2.0 | Updated dynamically via TPG |
| Capital One Miles | 1.7 | Updated dynamically via TPG |
| Citi ThankYou Points | 1.7 | Updated dynamically via TPG |
| Cashback | 1.0 | Fixed (always 1 cent = 1 cent) |

---

## Implementation Tasks

| Task | Priority | Estimate |
|------|----------|----------|
| Create points_valuations database table | P1 | 1h |
| Build TPG scraper service | P1 | 4h |
| Implement valuation API endpoint | P1 | 2h |
| Add Redis caching layer for valuations | P1 | 2h |
| Create Inngest job for weekly scraping | P2 | 2h |
| Build user valuation override UI | P2 | 3h |
| Add fallback to hardcoded defaults | P1 | 1h |
| Create admin manual refresh endpoint | P2 | 1h |

---

## API Endpoint

```typescript
// GET /api/valuations

Response:
{
  "valuations": {
    "AMEX_MR": 2.0,
    "CHASE_UR": 2.0,
    "CAPITAL_ONE": 1.7,
    "CITI_TYP": 1.7,
    "CASHBACK": 1.0
  },
  "source": {
    "market": "tpg",
    "userOverrides": ["CHASE_UR"]
  },
  "lastUpdated": "2024-01-15T06:00:00Z"
}
```
