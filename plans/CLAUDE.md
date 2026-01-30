# CLAUDE.md

> This file provides context for Claude (AI assistant) when working on the CardStack project.

---

## Project Overview

**CardStack** is a credit card points and cashback optimization platform that helps users maximize their rewards across multiple card ecosystems.

### Core Features
- Link credit cards via Plaid
- Track points/cashback across ecosystems (AMEX MR, Chase UR, Capital One, etc.)
- Analyze spending patterns by category
- Project future rewards earnings
- Simulate adding/replacing cards
- Get optimal card recommendations per category

### Tech Stack
- **Frontend:** Next.js 14, React 18, TypeScript, TailwindCSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** Neon (serverless PostgreSQL)
- **Cache:** Upstash Redis
- **Auth:** NextAuth.js
- **Payments:** Stripe (subscriptions)
- **Email:** Resend
- **Jobs:** Inngest
- **Hosting:** Vercel

---

## Project Structure

```
cardstack/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── features/          # Feature-specific components
│   │   └── layouts/           # Layout components
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   ├── redis.ts           # Upstash Redis client
│   │   ├── auth.ts            # NextAuth.js config
│   │   ├── plaid.ts           # Plaid client
│   │   ├── stripe.ts          # Stripe client
│   │   └── services/          # Business logic services
│   ├── hooks/                 # Custom React hooks
│   ├── stores/                # Zustand state stores
│   └── types/                 # TypeScript types
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── inngest/                   # Background job functions
├── e2e/                       # Playwright E2E tests
└── plans/                     # Project documentation
```

---

## Key Concepts

### Points Ecosystems
- **AMEX_MR** - American Express Membership Rewards
- **CHASE_UR** - Chase Ultimate Rewards
- **CAPITAL_ONE** - Capital One Miles
- **CITI_TYP** - Citi ThankYou Points
- **CASHBACK** - Cash back (always 1 cpp)

### Spending Categories
```typescript
type SpendCategory =
  | 'DINING'
  | 'GROCERIES'
  | 'WHOLESALE_CLUB'
  | 'GAS'
  | 'EV_CHARGING'
  | 'TRAVEL_AIR'
  | 'TRAVEL_HOTEL'
  | 'TRAVEL_CAR_RENTAL'
  | 'TRANSIT'
  | 'RIDESHARE'
  | 'ENTERTAINMENT'
  | 'STREAMING'
  | 'PHONE_INTERNET'
  | 'DRUGSTORE'
  | 'HOME_IMPROVEMENT'
  | 'OFFICE_SUPPLY'
  | 'FITNESS'
  | 'OTHER';
```

### Points Calculation
```typescript
// For points cards: amount × multiplier = points
// For cashback cards: amount × (rate/100) = dollars

function calculatePoints(amount: number, category: string, card: CardProduct): number {
  const multiplier = card.categoryMultipliers[category] || card.baseEarnRate;
  
  if (card.currencyType === 'CASHBACK') {
    return amount * (multiplier / 100);
  }
  return amount * multiplier;
}
```

### Points Valuations (cents per point)
| Currency | Default | Source |
|----------|---------|--------|
| AMEX MR | 2.0 cpp | TPG |
| Chase UR | 2.0 cpp | TPG |
| Capital One | 1.7 cpp | TPG |
| Citi TYP | 1.7 cpp | TPG |
| Cashback | 1.0 cpp | Fixed |

---

## Database Models

### Core Tables
- `users` - User accounts
- `linked_accounts` - Plaid-connected bank accounts
- `cards` - User's credit cards
- `card_products` - Card catalog (AMEX Gold, CSP, etc.)
- `transactions` - Transaction history
- `points_balances` - Aggregated points by ecosystem

### Supporting Tables
- `points_valuations` - Dynamic cpp values
- `merchant_overrides` - Global merchant → category mappings
- `user_merchant_overrides` - Per-user category corrections
- `merchant_corrections` - Community correction submissions

---

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Run ESLint
npm run type-check       # TypeScript check

# Database
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema to database
npx prisma studio        # Open Prisma Studio
npm run db:seed          # Seed data

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests

# Background Jobs
npx inngest-cli dev      # Start Inngest dev server
```

---

## API Patterns

### Authentication
All API routes should check authentication:
```typescript
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... rest of handler
}
```

### Error Handling
```typescript
try {
  // ... operation
} catch (error) {
  console.error('Operation failed:', error);
  return Response.json(
    { error: 'Operation failed' },
    { status: 500 }
  );
}
```

### Response Format
```typescript
// Success
return Response.json({
  data: result,
  meta: { page: 1, total: 100 }
});

// Error
return Response.json(
  { error: 'Error message', code: 'ERROR_CODE' },
  { status: 400 }
);
```

---

## Component Patterns

### Data Fetching (React Query)
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['transactions', filters],
  queryFn: () => fetch(`/api/transactions?${params}`).then(r => r.json()),
});
```

### Mutations
```typescript
const mutation = useMutation({
  mutationFn: (data) => fetch('/api/endpoint', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['related-data'] });
  },
});
```

### Feature Gates
```typescript
const { canUseFeature, tier } = useFeatureGate();

if (!canUseFeature('aiRecommendations')) {
  return <UpgradePrompt feature="AI Recommendations" />;
}
```

---

## Environment Variables

```bash
# Required
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
PLAID_CLIENT_ID=
PLAID_SECRET=
PLAID_ENV=sandbox

# Optional
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
OPENAI_API_KEY=
RESEND_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SENTRY_DSN=
```

---

## Code Style Guidelines

### TypeScript
- Use strict mode
- Prefer `interface` over `type` for objects
- Use `const` assertions where appropriate
- Avoid `any` - use `unknown` if type is truly unknown

### React
- Use functional components with hooks
- Prefer named exports
- Co-locate related files
- Use React Query for server state, Zustand for client state

### Naming
- **Files:** kebab-case (`points-calculator.ts`)
- **Components:** PascalCase (`PointsBalanceCard.tsx`)
- **Functions:** camelCase (`calculatePoints`)
- **Constants:** UPPER_SNAKE_CASE (`DEFAULT_VALUATIONS`)
- **Database:** snake_case (`points_balances`)

### Git
- Conventional commits: `feat(scope): description`
- Branch naming: `feature/short-description`
- Squash merge to staging, merge commit to main

---

## Testing Guidelines

### Unit Tests
- Test business logic in isolation
- Mock external dependencies
- Aim for 80%+ coverage on services

### Integration Tests
- Test API routes with mocked auth
- Verify database operations
- Test error handling paths

### E2E Tests
- Cover critical user flows
- Test across browsers
- Run before releases

---

## Performance Considerations

### Database
- Index foreign keys and frequently queried columns
- Use Prisma's `select` to limit returned fields
- Paginate large result sets

### Caching
- Cache expensive calculations in Redis
- Use React Query's cache for API responses
- Invalidate cache on mutations

### Frontend
- Lazy load routes and heavy components
- Memoize expensive computations
- Use virtualization for long lists

---

## Security Checklist

- [ ] Validate all user input
- [ ] Sanitize data before database operations
- [ ] Use parameterized queries (Prisma handles this)
- [ ] Implement rate limiting on sensitive endpoints
- [ ] Never expose Plaid access tokens
- [ ] Log security events
- [ ] Keep dependencies updated

---

## Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Plaid Docs](https://plaid.com/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [React Query Docs](https://tanstack.com/query)
