# Phase 2: Core Data Layer

**Duration:** Weeks 3-4  
**Goal:** Integrate Plaid for account aggregation, build database schema, implement transaction syncing and points calculation

---

## Week 3: Plaid Integration & Database

### Tasks

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Set up Plaid sandbox environment | P0 | 2h | ☐ |
| Create Prisma schema (linked_accounts, cards, transactions) | P0 | 4h | ☐ |
| Run database migrations | P0 | 1h | ☐ |
| Build Plaid Link token endpoint (`/api/plaid/link-token`) | P0 | 3h | ☐ |
| Implement Plaid token exchange (`/api/plaid/exchange-token`) | P0 | 4h | ☐ |
| Create PlaidLink React component | P0 | 3h | ☐ |
| Build linked accounts API routes (list, delete) | P0 | 4h | ☐ |
| Implement Plaid webhook handler | P1 | 4h | ☐ |
| Create card_products seed data (top 50 cards) | P0 | 4h | ☐ |

### Install Dependencies

```bash
# Plaid SDK
npm install plaid

# Background jobs
npm install inngest
```

### Database Schema

```prisma
// Add to prisma/schema.prisma

model LinkedAccount {
  id               String   @id @default(uuid())
  userId           String   @map("user_id")
  plaidItemId      String   @unique @map("plaid_item_id")
  plaidAccessToken String   @map("plaid_access_token")
  institutionId    String   @map("institution_id")
  institutionName  String   @map("institution_name")
  status           String   @default("active") // active, error, disconnected
  errorCode        String?  @map("error_code")
  lastSyncAt       DateTime? @map("last_sync_at")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  cards Card[]

  @@index([userId, status])
  @@map("linked_accounts")
}

model Card {
  id              String   @id @default(uuid())
  linkedAccountId String   @map("linked_account_id")
  cardProductId   String?  @map("card_product_id")
  plaidAccountId  String   @unique @map("plaid_account_id")
  lastFour        String?  @map("last_four")
  nickname        String?
  isActive        Boolean  @default(true) @map("is_active")
  openedDate      DateTime? @map("opened_date")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  linkedAccount LinkedAccount @relation(fields: [linkedAccountId], references: [id], onDelete: Cascade)
  cardProduct   CardProduct?  @relation(fields: [cardProductId], references: [id])
  transactions  Transaction[]

  @@index([linkedAccountId])
  @@map("cards")
}

model CardProduct {
  id                    String   @id @default(uuid())
  name                  String
  issuer                String   // AMEX, CHASE, CAPITAL_ONE, CITI, DISCOVER, etc.
  currencyType          String   @map("currency_type") // POINTS, CASHBACK
  pointsCurrency        String?  @map("points_currency") // MR, UR, CAPITAL_ONE, TYP
  annualFee             Decimal  @default(0) @map("annual_fee")
  baseEarnRate          Decimal  @default(1.0) @map("base_earn_rate")
  categoryMultipliers   Json     @map("category_multipliers")
  signupBonusPoints     Int      @default(0) @map("signup_bonus_points")
  signupSpendRequirement Decimal @default(0) @map("signup_spend_requirement")
  signupTimeMonths      Int      @default(3) @map("signup_time_months")
  isActive              Boolean  @default(true) @map("is_active")
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  cards Card[]

  @@map("card_products")
}

model Transaction {
  id                 String   @id @default(uuid())
  cardId             String   @map("card_id")
  plaidTransactionId String   @unique @map("plaid_transaction_id")
  amount             Decimal
  merchantName       String?  @map("merchant_name")
  mccCode            String?  @map("mcc_code")
  category           String
  transactionDate    DateTime @map("transaction_date")
  pointsEarned       Decimal? @map("points_earned")
  multiplierApplied  Decimal? @map("multiplier_applied")
  isPending          Boolean  @default(false) @map("is_pending")
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")

  card Card @relation(fields: [cardId], references: [id], onDelete: Cascade)

  @@index([cardId, transactionDate(sort: Desc)])
  @@index([cardId, category])
  @@map("transactions")
}

model PointsBalance {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  ecosystem       String   // AMEX_MR, CHASE_UR, CAPITAL_ONE, CITI_TYP, CASHBACK
  balance         Decimal  @default(0)
  earnedThisMonth Decimal  @default(0) @map("earned_this_month")
  earnedThisYear  Decimal  @default(0) @map("earned_this_year")
  lastUpdated     DateTime @default(now()) @map("last_updated")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, ecosystem])
  @@map("points_balances")
}
```

### Plaid Configuration

```typescript
// src/lib/plaid.ts

import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);
```

### API Routes

```typescript
// src/app/api/plaid/link-token/route.ts

import { auth } from '@/lib/auth';
import { plaidClient } from '@/lib/plaid';
import { CountryCode, Products } from 'plaid';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: session.user.id },
    client_name: 'CardStack',
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: 'en',
  });

  return Response.json({ link_token: response.data.link_token });
}
```

```typescript
// src/app/api/plaid/exchange-token/route.ts

import { auth } from '@/lib/auth';
import { plaidClient } from '@/lib/plaid';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { public_token } = await request.json();

  // Exchange public token for access token
  const exchangeResponse = await plaidClient.itemPublicTokenExchange({
    public_token,
  });

  const { access_token, item_id } = exchangeResponse.data;

  // Get institution info
  const itemResponse = await plaidClient.itemGet({ access_token });
  const institutionId = itemResponse.data.item.institution_id!;
  
  const instResponse = await plaidClient.institutionsGetById({
    institution_id: institutionId,
    country_codes: [CountryCode.Us],
  });

  // Save linked account
  const linkedAccount = await prisma.linkedAccount.create({
    data: {
      userId: session.user.id,
      plaidItemId: item_id,
      plaidAccessToken: access_token, // TODO: Encrypt this
      institutionId,
      institutionName: instResponse.data.institution.name,
    },
  });

  // Trigger initial sync
  await syncTransactions(linkedAccount.id);

  return Response.json({ success: true, accountId: linkedAccount.id });
}
```

---

## Week 4: Transaction Sync & Processing

### Tasks

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Build transaction sync service | P0 | 6h | ☐ |
| Implement MCC code to category mapping | P0 | 4h | ☐ |
| Create points calculation engine | P0 | 6h | ☐ |
| Build transactions API routes (list, summary) | P0 | 4h | ☐ |
| Implement card detection/matching logic | P1 | 4h | ☐ |
| Set up Inngest for background job processing | P1 | 3h | ☐ |
| Create scheduled sync job (daily) | P1 | 2h | ☐ |
| Build points_balances aggregation logic | P0 | 4h | ☐ |
| Create points_valuations table and scraper | P1 | 4h | ☐ |
| Build merchant categorization service | P1 | 4h | ☐ |
| Seed merchant overrides (100+ merchants) | P1 | 3h | ☐ |

### Transaction Sync Service

```typescript
// src/lib/services/transaction-sync.ts

import { plaidClient } from '@/lib/plaid';
import { prisma } from '@/lib/prisma';
import { categorizeMerchant } from './merchant-categorization';
import { calculatePoints } from './points-calculator';

export async function syncTransactions(linkedAccountId: string) {
  const linkedAccount = await prisma.linkedAccount.findUnique({
    where: { id: linkedAccountId },
    include: { cards: { include: { cardProduct: true } } },
  });

  if (!linkedAccount) {
    throw new Error('Linked account not found');
  }

  // Fetch transactions from Plaid
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const response = await plaidClient.transactionsGet({
    access_token: linkedAccount.plaidAccessToken,
    start_date: thirtyDaysAgo.toISOString().split('T')[0],
    end_date: now.toISOString().split('T')[0],
  });

  const { transactions, accounts } = response.data;

  // Ensure cards exist for each account
  for (const account of accounts) {
    const existingCard = linkedAccount.cards.find(
      (c) => c.plaidAccountId === account.account_id
    );

    if (!existingCard) {
      await prisma.card.create({
        data: {
          linkedAccountId: linkedAccount.id,
          plaidAccountId: account.account_id,
          lastFour: account.mask,
        },
      });
    }
  }

  // Refresh cards with products
  const cards = await prisma.card.findMany({
    where: { linkedAccountId: linkedAccount.id },
    include: { cardProduct: true },
  });

  // Process transactions
  for (const txn of transactions) {
    const card = cards.find((c) => c.plaidAccountId === txn.account_id);
    if (!card) continue;

    // Categorize merchant
    const categorization = await categorizeMerchant(
      txn.merchant_name || txn.name,
      txn.merchant_entity_id || '',
      linkedAccount.userId
    );

    // Calculate points
    const pointsEarned = card.cardProduct
      ? calculatePoints(txn.amount, categorization.category, card.cardProduct)
      : 0;

    // Upsert transaction
    await prisma.transaction.upsert({
      where: { plaidTransactionId: txn.transaction_id },
      update: {
        amount: Math.abs(txn.amount),
        merchantName: txn.merchant_name || txn.name,
        mccCode: txn.merchant_entity_id,
        category: categorization.category,
        pointsEarned,
        multiplierApplied: card.cardProduct?.categoryMultipliers?.[categorization.category] 
          || card.cardProduct?.baseEarnRate 
          || 1,
        isPending: txn.pending,
      },
      create: {
        cardId: card.id,
        plaidTransactionId: txn.transaction_id,
        amount: Math.abs(txn.amount),
        merchantName: txn.merchant_name || txn.name,
        mccCode: txn.merchant_entity_id,
        category: categorization.category,
        transactionDate: new Date(txn.date),
        pointsEarned,
        multiplierApplied: card.cardProduct?.categoryMultipliers?.[categorization.category]
          || card.cardProduct?.baseEarnRate
          || 1,
        isPending: txn.pending,
      },
    });
  }

  // Update sync timestamp
  await prisma.linkedAccount.update({
    where: { id: linkedAccountId },
    data: { lastSyncAt: new Date() },
  });

  // Update points balances
  await updatePointsBalances(linkedAccount.userId);
}
```

### Points Calculation Engine

```typescript
// src/lib/services/points-calculator.ts

import { CardProduct } from '@prisma/client';
import { SpendCategory } from '@/lib/mcc-mapping';

export function calculatePoints(
  amount: number,
  category: SpendCategory,
  cardProduct: CardProduct
): number {
  const multipliers = cardProduct.categoryMultipliers as Record<string, number>;
  const multiplier = multipliers[category] || Number(cardProduct.baseEarnRate);

  if (cardProduct.currencyType === 'CASHBACK') {
    // Cashback: multiplier is a percentage (e.g., 2 = 2%)
    return amount * (multiplier / 100);
  }

  // Points: multiplier is points per dollar
  return amount * multiplier;
}

export function calculateOptimalCard(
  amount: number,
  category: SpendCategory,
  cards: Array<{ cardProduct: CardProduct | null }>
): { card: typeof cards[0]; points: number } | null {
  let bestCard = null;
  let bestPoints = 0;

  for (const card of cards) {
    if (!card.cardProduct) continue;

    const points = calculatePoints(amount, category, card.cardProduct);
    if (points > bestPoints) {
      bestPoints = points;
      bestCard = card;
    }
  }

  return bestCard ? { card: bestCard, points: bestPoints } : null;
}
```

### Inngest Background Jobs

```typescript
// src/inngest/client.ts

import { Inngest } from 'inngest';

export const inngest = new Inngest({ id: 'cardstack' });
```

```typescript
// src/inngest/functions/sync-transactions.ts

import { inngest } from '../client';
import { syncTransactions } from '@/lib/services/transaction-sync';
import { prisma } from '@/lib/prisma';

// Scheduled daily sync
export const scheduledSync = inngest.createFunction(
  { id: 'scheduled-transaction-sync' },
  { cron: '0 6 * * *' }, // 6 AM daily
  async ({ step }) => {
    const accounts = await step.run('get-active-accounts', async () => {
      return prisma.linkedAccount.findMany({
        where: { status: 'active' },
        select: { id: true },
      });
    });

    for (const account of accounts) {
      await step.run(`sync-${account.id}`, async () => {
        await syncTransactions(account.id);
      });
    }

    return { synced: accounts.length };
  }
);

// Webhook-triggered sync
export const webhookSync = inngest.createFunction(
  { id: 'webhook-transaction-sync' },
  { event: 'plaid/transactions.sync' },
  async ({ event, step }) => {
    await step.run('sync-transactions', async () => {
      await syncTransactions(event.data.linkedAccountId);
    });
  }
);
```

---

## Card Products Seed Data

```typescript
// prisma/seed-cards.ts

const CARD_PRODUCTS = [
  {
    name: 'American Express Gold Card',
    issuer: 'AMEX',
    currencyType: 'POINTS',
    pointsCurrency: 'MR',
    annualFee: 250,
    baseEarnRate: 1,
    categoryMultipliers: {
      DINING: 4,
      GROCERIES: 4,
      TRAVEL_AIR: 3,
    },
    signupBonusPoints: 60000,
    signupSpendRequirement: 6000,
    signupTimeMonths: 6,
  },
  {
    name: 'Chase Sapphire Preferred',
    issuer: 'CHASE',
    currencyType: 'POINTS',
    pointsCurrency: 'UR',
    annualFee: 95,
    baseEarnRate: 1,
    categoryMultipliers: {
      DINING: 3,
      TRAVEL_AIR: 2,
      TRAVEL_HOTEL: 2,
      TRANSIT: 3,
      STREAMING: 3,
    },
    signupBonusPoints: 60000,
    signupSpendRequirement: 4000,
    signupTimeMonths: 3,
  },
  {
    name: 'Chase Sapphire Reserve',
    issuer: 'CHASE',
    currencyType: 'POINTS',
    pointsCurrency: 'UR',
    annualFee: 550,
    baseEarnRate: 1,
    categoryMultipliers: {
      DINING: 3,
      TRAVEL_AIR: 5,
      TRAVEL_HOTEL: 10,
      TRANSIT: 3,
    },
    signupBonusPoints: 60000,
    signupSpendRequirement: 4000,
    signupTimeMonths: 3,
  },
  {
    name: 'Capital One Venture X',
    issuer: 'CAPITAL_ONE',
    currencyType: 'POINTS',
    pointsCurrency: 'CAPITAL_ONE',
    annualFee: 395,
    baseEarnRate: 2,
    categoryMultipliers: {
      TRAVEL_AIR: 5,
      TRAVEL_HOTEL: 10,
    },
    signupBonusPoints: 75000,
    signupSpendRequirement: 4000,
    signupTimeMonths: 3,
  },
  {
    name: 'Citi Double Cash',
    issuer: 'CITI',
    currencyType: 'CASHBACK',
    pointsCurrency: null,
    annualFee: 0,
    baseEarnRate: 2,
    categoryMultipliers: {},
    signupBonusPoints: 20000, // $200 cashback
    signupSpendRequirement: 1500,
    signupTimeMonths: 6,
  },
  // Add 45+ more cards...
];

async function seedCardProducts() {
  for (const card of CARD_PRODUCTS) {
    await prisma.cardProduct.upsert({
      where: { name: card.name },
      update: card,
      create: card,
    });
  }
  console.log(`Seeded ${CARD_PRODUCTS.length} card products`);
}
```

---

## Deliverables

- [ ] Users can link bank accounts via Plaid
- [ ] Transactions sync automatically
- [ ] Points calculated per transaction
- [ ] Card products database seeded (50+ cards)
- [ ] Background sync job running daily
- [ ] Points balances aggregated by ecosystem
- [ ] Merchant categorization with overrides

---

## Testing Checklist

- [ ] Plaid integration tests (mock Plaid API)
- [ ] Points calculation unit tests (all card types)
- [ ] MCC mapping unit tests
- [ ] Transaction sync integration tests
- [ ] API route tests with authenticated requests
- [ ] Merchant categorization fallback chain tests
- [ ] Points aggregation tests

---

## API Endpoints Created

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/plaid/link-token` | Create Plaid Link token |
| POST | `/api/plaid/exchange-token` | Exchange public token |
| POST | `/api/plaid/webhook` | Handle Plaid webhooks |
| GET | `/api/accounts` | List linked accounts |
| DELETE | `/api/accounts/:id` | Unlink account |
| POST | `/api/accounts/:id/sync` | Manual sync trigger |
| GET | `/api/cards` | List user's cards |
| GET | `/api/transactions` | List transactions |
| GET | `/api/transactions/summary` | Spending summary |
| GET | `/api/points/balances` | Points by ecosystem |
