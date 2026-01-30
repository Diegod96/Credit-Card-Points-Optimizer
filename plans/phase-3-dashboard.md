# Phase 3: Dashboard & Analytics

**Duration:** Weeks 5-6  
**Goal:** Build main dashboard with points overview, spending analytics, and projections

---

## Week 5: Dashboard & Cards Views

### Tasks

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Build dashboard home page | P0 | 6h | ☐ |
| Create PointsBalanceCard component (per ecosystem) | P0 | 3h | ☐ |
| Build total rewards value card | P0 | 2h | ☐ |
| Create "Best Card to Use" widget | P0 | 4h | ☐ |
| Build recent transactions list | P0 | 3h | ☐ |
| Create My Cards page | P0 | 4h | ☐ |
| Build card detail view with stats | P1 | 4h | ☐ |
| Implement earning rates comparison table | P0 | 3h | ☐ |
| Create "Link New Card" flow | P0 | 3h | ☐ |

### Dashboard Components

```typescript
// src/components/features/points-balance-card.tsx

'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PointsBalanceCardProps {
  ecosystem: string;
  points: number;
  value: number;
  color: string;
  trend: number;
  showBalance?: boolean;
}

export function PointsBalanceCard({
  ecosystem,
  points,
  value,
  color,
  trend,
  showBalance = true,
}: PointsBalanceCardProps) {
  return (
    <div className="rounded-xl p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{ecosystem}</span>
        <div className={`flex items-center gap-1 text-xs ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">
          {showBalance ? points.toLocaleString() : '••••'}
        </span>
        <span className="text-sm text-gray-500">pts</span>
      </div>
      <div className="mt-1 text-sm text-gray-500">
        ≈ ${showBalance ? value.toLocaleString() : '••••'} value
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div 
          className="h-full rounded-full" 
          style={{ width: '65%', backgroundColor: color }} 
        />
      </div>
    </div>
  );
}
```

```typescript
// src/components/features/best-card-widget.tsx

'use client';

import { useQuery } from '@tanstack/react-query';

const CATEGORY_ICONS: Record<string, string> = {
  DINING: '🍽️',
  GROCERIES: '🛒',
  TRAVEL_AIR: '✈️',
  GAS: '⛽',
  STREAMING: '📺',
};

export function BestCardWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['best-cards'],
    queryFn: () => fetch('/api/cards/best-by-category').then(r => r.json()),
  });

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-gray-100 rounded-xl" />;
  }

  return (
    <div className="rounded-xl p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Best Card to Use</h3>
      <div className="space-y-3">
        {data?.recommendations.map((rec: any) => (
          <div 
            key={rec.category} 
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
          >
            <span className="font-medium flex items-center gap-2">
              {CATEGORY_ICONS[rec.category]} {rec.categoryLabel}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{rec.cardName}</span>
              <span 
                className="px-2 py-1 text-xs font-bold rounded-full text-white"
                style={{ backgroundColor: rec.color }}
              >
                {rec.multiplier}x
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

```typescript
// src/components/features/recent-transactions.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

export function RecentTransactions() {
  const { data, isLoading } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => fetch('/api/transactions?limit=5').then(r => r.json()),
  });

  if (isLoading) {
    return <div className="animate-pulse space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-14 bg-gray-100 rounded-lg" />
      ))}
    </div>;
  }

  return (
    <div className="rounded-xl p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Earnings</h3>
        <a href="/transactions" className="text-sm font-medium text-indigo-600">
          View All
        </a>
      </div>
      <div className="space-y-3">
        {data?.transactions.map((tx: any) => (
          <div 
            key={tx.id} 
            className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
          >
            <div className="flex-1">
              <p className="font-medium text-sm">{tx.merchantName}</p>
              <p className="text-xs text-gray-500">
                {tx.cardName} • {formatDistanceToNow(new Date(tx.transactionDate), { addSuffix: true })}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-sm">${tx.amount.toFixed(2)}</p>
              <p className="text-xs text-green-500">+{tx.pointsEarned.toLocaleString()} pts</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Dashboard Page

```typescript
// src/app/(dashboard)/page.tsx

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { PointsBalanceCard } from '@/components/features/points-balance-card';
import { BestCardWidget } from '@/components/features/best-card-widget';
import { RecentTransactions } from '@/components/features/recent-transactions';
import { SpendingChart } from '@/components/features/spending-chart';

const ECOSYSTEM_COLORS: Record<string, string> = {
  AMEX_MR: '#006FCF',
  CHASE_UR: '#124A8E',
  CAPITAL_ONE: '#D03027',
  CITI_TYP: '#056DAE',
  CASHBACK: '#10B981',
};

export default function DashboardPage() {
  const [showBalances, setShowBalances] = useState(true);

  const { data: balances, isLoading } = useQuery({
    queryKey: ['points-balances'],
    queryFn: () => fetch('/api/points/balances').then(r => r.json()),
  });

  const { data: valuations } = useQuery({
    queryKey: ['valuations'],
    queryFn: () => fetch('/api/valuations').then(r => r.json()),
  });

  const totalValue = balances?.balances.reduce((acc: number, b: any) => {
    const cpp = valuations?.valuations[b.ecosystem] || 1;
    return acc + (b.balance * cpp / 100);
  }, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-gray-500 mt-1">Here's your rewards overview</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus className="w-4 h-4" />
          Link Card
        </button>
      </div>

      {/* Total Value Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <span className="text-indigo-100">Total Rewards Value</span>
          <button 
            onClick={() => setShowBalances(!showBalances)} 
            className="p-2 hover:bg-white/10 rounded-lg"
          >
            {showBalances ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-bold">
            {showBalances ? `$${totalValue.toLocaleString()}` : '••••'}
          </span>
          <span className="text-indigo-200">across all ecosystems</span>
        </div>
      </div>

      {/* Points Balances Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Points by Ecosystem</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {balances?.balances.map((balance: any) => (
            <PointsBalanceCard
              key={balance.ecosystem}
              ecosystem={balance.ecosystemLabel}
              points={balance.balance}
              value={balance.balance * (valuations?.valuations[balance.ecosystem] || 1) / 100}
              color={ECOSYSTEM_COLORS[balance.ecosystem] || '#6B7280'}
              trend={balance.monthOverMonthChange || 0}
              showBalance={showBalances}
            />
          ))}
        </div>
      </div>

      {/* Best Card & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BestCardWidget />
        <RecentTransactions />
      </div>

      {/* Spending Chart */}
      <SpendingChart />
    </div>
  );
}
```

---

## Week 6: Spending & Projections

### Tasks

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Build spending analysis page | P0 | 4h | ☐ |
| Create spending by category chart (Recharts) | P0 | 4h | ☐ |
| Build spending by card breakdown | P0 | 3h | ☐ |
| Create transaction history table with filters | P0 | 4h | ☐ |
| Build projections API endpoint | P0 | 6h | ☐ |
| Create projections page UI | P0 | 4h | ☐ |
| Build cumulative points chart | P0 | 4h | ☐ |
| Implement timeframe selector (3mo, 6mo, 12mo, 24mo) | P1 | 2h | ☐ |
| Create monthly breakdown table | P1 | 3h | ☐ |

### Projections API

```typescript
// src/app/api/projections/route.ts

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const months = parseInt(searchParams.get('months') || '6');

  // Get historical spending by category (last 3 months)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const transactions = await prisma.transaction.findMany({
    where: {
      card: {
        linkedAccount: {
          userId: session.user.id,
        },
      },
      transactionDate: { gte: threeMonthsAgo },
      isPending: false,
    },
    include: {
      card: {
        include: { cardProduct: true },
      },
    },
  });

  // Calculate average monthly spend by category
  const spendByCategory: Record<string, number> = {};
  for (const tx of transactions) {
    spendByCategory[tx.category] = (spendByCategory[tx.category] || 0) + Number(tx.amount);
  }
  
  // Convert to monthly average
  Object.keys(spendByCategory).forEach(cat => {
    spendByCategory[cat] = spendByCategory[cat] / 3;
  });

  // Get user's cards with products
  const cards = await prisma.card.findMany({
    where: {
      linkedAccount: {
        userId: session.user.id,
        status: 'active',
      },
      isActive: true,
    },
    include: { cardProduct: true },
  });

  // Project points for each month
  const projections = [];
  const cumulativeByEcosystem: Record<string, number> = {};

  for (let m = 1; m <= months; m++) {
    const monthData: Record<string, number> = {};
    
    for (const [category, monthlySpend] of Object.entries(spendByCategory)) {
      // Find best card for this category
      let bestPoints = 0;
      let bestEcosystem = 'OTHER';

      for (const card of cards) {
        if (!card.cardProduct) continue;
        
        const multipliers = card.cardProduct.categoryMultipliers as Record<string, number>;
        const multiplier = multipliers[category] || Number(card.cardProduct.baseEarnRate);
        const points = monthlySpend * multiplier;

        if (points > bestPoints) {
          bestPoints = points;
          bestEcosystem = card.cardProduct.pointsCurrency || 'CASHBACK';
        }
      }

      cumulativeByEcosystem[bestEcosystem] = (cumulativeByEcosystem[bestEcosystem] || 0) + bestPoints;
    }

    projections.push({
      month: m,
      ...Object.fromEntries(
        Object.entries(cumulativeByEcosystem).map(([eco, pts]) => [eco, Math.round(pts)])
      ),
    });
  }

  return Response.json({
    projections,
    monthlySpend: spendByCategory,
    totalProjectedValue: Object.values(cumulativeByEcosystem).reduce((a, b) => a + b, 0),
  });
}
```

### Projections Page

```typescript
// src/app/(dashboard)/projections/page.tsx

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

const TIMEFRAMES = [
  { value: 3, label: '3mo' },
  { value: 6, label: '6mo' },
  { value: 12, label: '12mo' },
  { value: 24, label: '24mo' },
];

const ECOSYSTEM_COLORS: Record<string, string> = {
  MR: '#006FCF',
  UR: '#124A8E',
  CAPITAL_ONE: '#D03027',
  TYP: '#056DAE',
  CASHBACK: '#10B981',
};

export default function ProjectionsPage() {
  const [timeframe, setTimeframe] = useState(6);

  const { data, isLoading } = useQuery({
    queryKey: ['projections', timeframe],
    queryFn: () => fetch(`/api/projections?months=${timeframe}`).then(r => r.json()),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Points Projections</h1>
          <p className="text-gray-500 mt-1">
            Forecast your rewards based on spending patterns
          </p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeframe === tf.value
                  ? 'bg-white dark:bg-gray-700 shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 text-white">
          <p className="text-indigo-100 text-sm">Projected Points ({timeframe} mo)</p>
          <p className="text-3xl font-bold mt-2">
            {data?.totalProjectedValue?.toLocaleString() || '—'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
          <p className="text-emerald-100 text-sm">Estimated Value</p>
          <p className="text-3xl font-bold mt-2">
            ${((data?.totalProjectedValue || 0) * 0.02).toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <p className="text-purple-100 text-sm">Monthly Average</p>
          <p className="text-3xl font-bold mt-2">
            {Math.round((data?.totalProjectedValue || 0) / timeframe).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Projection Chart */}
      <div className="rounded-xl p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Cumulative Points by Ecosystem</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.projections || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(m) => `Month ${m}`}
              />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => v.toLocaleString()} />
              <Legend />
              {Object.keys(ECOSYSTEM_COLORS).map((eco) => (
                <Area
                  key={eco}
                  type="monotone"
                  dataKey={eco}
                  stackId="1"
                  stroke={ECOSYSTEM_COLORS[eco]}
                  fill={ECOSYSTEM_COLORS[eco]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
```

---

## Deliverables

- [ ] Fully functional dashboard with real data
- [ ] Points balances by ecosystem
- [ ] Best card recommendations by category
- [ ] Spending analytics with charts
- [ ] Points projections for 3-24 months
- [ ] My Cards page with earning rates comparison
- [ ] Transaction history with filtering

---

## Testing Checklist

- [ ] Dashboard component rendering tests
- [ ] Chart data formatting tests
- [ ] Projections calculation accuracy tests
- [ ] API response format validation
- [ ] Empty state handling tests
- [ ] Loading state tests
- [ ] Error boundary tests

---

## API Endpoints Created

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/points/balances` | Points by ecosystem |
| GET | `/api/cards/best-by-category` | Best card recommendations |
| GET | `/api/transactions` | Transaction list with filters |
| GET | `/api/transactions/summary` | Spending summary by category |
| GET | `/api/projections` | Points projections |
