# Dynamic Merchant Categorization System

**Purpose:** Combine static MCC mapping with dynamic merchant-level overrides and community corrections for accurate transaction categorization

---

## Overview

While MCC codes are static (defined by Visa/Mastercard), merchants often code incorrectly or inconsistently. This system combines static MCC mapping with dynamic merchant-level overrides and community corrections.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Transaction Processing                         │
└──────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│  1. Check User Override (user_merchant_overrides table)              │
│     - User's personal corrections for this merchant                  │
└──────────────────────────────────────────────────────────────────────┘
                                   │ not found
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│  2. Check Global Merchant Override (merchant_overrides table)        │
│     - Community-approved corrections                                  │
│     - Admin-curated known miscoded merchants                         │
└──────────────────────────────────────────────────────────────────────┘
                                   │ not found
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│  3. Check Merchant Name Patterns (merchant_patterns table)           │
│     - Regex patterns: "UBER EATS*" → DINING                          │
└──────────────────────────────────────────────────────────────────────┘
                                   │ not found
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│  4. Use MCC Code Mapping (static in code)                            │
└──────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│  5. Cache Result in Redis (7-day TTL)                                │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `merchant_overrides` | Global corrections (admin + community approved) |
| `user_merchant_overrides` | Per-user personal corrections |
| `merchant_corrections` | Pending submissions for review |
| `merchant_patterns` | Regex-based pattern rules |

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Instant User Override** | User's correction applies immediately for them |
| **Community Crowdsourcing** | Users submit corrections for review |
| **Auto-Approval** | 10+ users agree → auto-approves |
| **Admin Review Queue** | Dashboard for approving/rejecting |
| **Pattern Matching** | Regex handles variations |
| **Redis Caching** | 7-day TTL, invalidates on correction |

---

## Known Merchant Overrides (Seed Data)

### Rideshare (often miscoded as taxi)
- UBER → RIDESHARE
- LYFT → RIDESHARE

### Food Delivery (often miscoded as rideshare)
- UBER EATS → DINING
- DOORDASH → DINING
- GRUBHUB → DINING
- INSTACART → GROCERIES

### Streaming Services
- NETFLIX → STREAMING
- SPOTIFY → STREAMING
- DISNEY PLUS → STREAMING
- HBO MAX → STREAMING

### Wholesale Clubs
- COSTCO WHSE → WHOLESALE_CLUB
- COSTCO GAS → GAS
- SAMS CLUB → WHOLESALE_CLUB

### EV Charging
- TESLA SUPERCHARGER → EV_CHARGING
- CHARGEPOINT → EV_CHARGING
- ELECTRIFY AMERICA → EV_CHARGING

---

## Implementation Tasks

| Task | Priority | Estimate |
|------|----------|----------|
| Create merchant override database tables | P1 | 1h |
| Build merchant categorization service | P0 | 4h |
| Seed known merchant overrides (100+) | P1 | 3h |
| Add Redis caching for lookups | P1 | 2h |
| Build user category correction UI | P1 | 3h |
| Create correction submission API | P1 | 2h |
| Build admin review queue UI | P2 | 4h |
| Implement auto-approval logic | P2 | 2h |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transactions/:id/category` | Submit correction |
| GET | `/api/admin/corrections` | List pending corrections |
| POST | `/api/admin/corrections/:id/approve` | Approve correction |
| POST | `/api/admin/corrections/:id/reject` | Reject correction |

---

## Analytics (Admin)

| Metric | Description |
|--------|-------------|
| Correction Rate | % of transactions corrected |
| Top Miscoded Merchants | Merchants with most corrections |
| Auto-Approval Rate | % of corrections auto-approved |
| Category Distribution | Breakdown by source |
| Pending Queue Size | Corrections awaiting review |
