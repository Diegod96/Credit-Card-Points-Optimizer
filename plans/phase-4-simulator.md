# Phase 4: Simulator & Launch

**Duration:** Weeks 7-8  
**Goal:** Build card comparison, what-if simulator, polish UI, and launch MVP

---

## Week 7: Card Explorer & Simulator

### Tasks

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Build card explorer page | P0 | 4h | ☐ |
| Create card search and filter functionality | P0 | 4h | ☐ |
| Build card detail modal/page | P0 | 4h | ☐ |
| Create card comparison view | P1 | 4h | ☐ |
| Build simulator page UI | P0 | 4h | ☐ |
| Implement "Add Card" simulation logic | P0 | 6h | ☐ |
| Implement "Replace Card" simulation logic | P0 | 6h | ☐ |
| Create simulation results display | P0 | 4h | ☐ |
| Build category impact breakdown | P1 | 3h | ☐ |

### Card Explorer Page

```typescript
// src/app/(dashboard)/explorer/page.tsx

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Filter } from 'lucide-react';

const ISSUERS = ['All', 'AMEX', 'CHASE', 'CAPITAL_ONE', 'CITI', 'DISCOVER'];

export default function CardExplorerPage() {
  const [search, setSearch] = useState('');
  const [issuer, setIssuer] = useState('All');
  const [cardType, setCardType] = useState<'all' | 'points' | 'cashback'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['card-products', search, issuer, cardType],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (issuer !== 'All') params.set('issuer', issuer);
      if (cardType !== 'all') params.set('type', cardType);
      return fetch(`/api/card-products?${params}`).then(r => r.json());
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Card Explorer</h1>
        <p className="text-gray-500 mt-1">Browse and compare credit cards</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
        </div>
        <div className="flex gap-2">
          {ISSUERS.map((iss) => (
            <button
              key={iss}
              onClick={() => setIssuer(iss)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                issuer === iss
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {iss}
            </button>
          ))}
        </div>
      </div>

      {/* Card Type Filter */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'All Cards' },
          { value: 'points', label: 'Points Cards' },
          { value: 'cashback', label: 'Cashback Cards' },
        ].map((type) => (
          <button
            key={type.value}
            onClick={() => setCardType(type.value as any)}
            className={`px-3 py-1.5 rounded-full text-sm ${
              cardType === type.value
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.cards.map((card: any) => (
          <CardProductCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

function CardProductCard({ card }: { card: any }) {
  return (
    <div className="rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold">{card.name}</p>
            <p className="text-sm text-gray-500">{card.issuer}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            card.currencyType === 'POINTS'
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
          }`}>
            {card.currencyType === 'POINTS' ? 'Points' : 'Cashback'}
          </span>
        </div>
        
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold">${card.annualFee}</span>
          <span className="text-sm text-gray-500">/year</span>
        </div>
        
        {card.signupBonusPoints > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <p className="text-xs font-medium text-green-600 dark:text-green-400">SIGN-UP BONUS</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {card.currencyType === 'POINTS' 
                ? `${card.signupBonusPoints.toLocaleString()} pts`
                : `$${card.signupBonusPoints}`
              }
            </p>
          </div>
        )}

        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500 mb-2">TOP CATEGORIES</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(card.categoryMultipliers || {}).slice(0, 3).map(([cat, rate]) => (
              <span 
                key={cat} 
                className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700"
              >
                {cat}: <strong>{rate}x</strong>
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <button className="text-sm font-medium text-indigo-600">View Details</button>
        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <Plus className="w-4 h-4" />
          Add to Simulator
        </button>
      </div>
    </div>
  );
}
```

### Simulator Page

```typescript
// src/app/(dashboard)/simulator/page.tsx

'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, RefreshCw, ChevronRight } from 'lucide-react';

type ScenarioType = 'add' | 'replace';

export default function SimulatorPage() {
  const [scenario, setScenario] = useState<ScenarioType>('add');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [replaceCardId, setReplaceCardId] = useState<string | null>(null);

  const { data: userCards } = useQuery({
    queryKey: ['my-cards'],
    queryFn: () => fetch('/api/cards').then(r => r.json()),
  });

  const { data: cardProducts } = useQuery({
    queryKey: ['card-products'],
    queryFn: () => fetch('/api/card-products').then(r => r.json()),
  });

  const simulation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          addCardId: selectedCard,
          replaceCardId: scenario === 'replace' ? replaceCardId : undefined,
        }),
      });
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Card Simulator</h1>
        <p className="text-gray-500 mt-1">
          Model how changes to your wallet would affect rewards
        </p>
      </div>

      {/* Scenario Selection */}
      <div className="flex gap-4">
        {[
          { id: 'add', icon: Plus, label: 'Add a Card', desc: 'See impact of a new card' },
          { id: 'replace', icon: RefreshCw, label: 'Replace a Card', desc: 'Compare upgrade/downgrade' },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setScenario(s.id as ScenarioType)}
            className={`flex-1 p-4 rounded-xl text-center transition-all border-2 ${
              scenario === s.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
          >
            <s.icon className={`w-6 h-6 mx-auto ${
              scenario === s.id ? 'text-indigo-600' : 'text-gray-400'
            }`} />
            <p className="mt-2 font-medium">{s.label}</p>
            <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
          </button>
        ))}
      </div>

      {/* Card Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card to Add */}
        <div className="rounded-xl p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-4">
            {scenario === 'add' ? 'Card to Add' : 'New Card'}
          </h3>
          <select
            value={selectedCard || ''}
            onChange={(e) => setSelectedCard(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <option value="">Select a card...</option>
            {cardProducts?.cards.map((card: any) => (
              <option key={card.id} value={card.id}>
                {card.name} (${card.annualFee}/yr)
              </option>
            ))}
          </select>
        </div>

        {/* Card to Replace (if replacing) */}
        {scenario === 'replace' && (
          <div className="rounded-xl p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-4">Card to Replace</h3>
            <select
              value={replaceCardId || ''}
              onChange={(e) => setReplaceCardId(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="">Select your current card...</option>
              {userCards?.cards.map((card: any) => (
                <option key={card.id} value={card.id}>
                  {card.cardProduct?.name || card.nickname} (•••• {card.lastFour})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Run Simulation Button */}
      <button
        onClick={() => simulation.mutate()}
        disabled={!selectedCard || (scenario === 'replace' && !replaceCardId) || simulation.isPending}
        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-50"
      >
        {simulation.isPending ? 'Calculating...' : 'Run Simulation'}
      </button>

      {/* Results */}
      {simulation.data && (
        <SimulationResults data={simulation.data} />
      )}
    </div>
  );
}

function SimulationResults({ data }: { data: any }) {
  const isPositive = data.netAnnualImpact > 0;

  return (
    <div className="rounded-xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Simulation Results</h3>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <p className="text-sm text-gray-500">Current Annual Value</p>
          <p className="text-2xl font-bold">${data.currentAnnualValue.toLocaleString()}</p>
        </div>
        <div className={`p-4 rounded-lg ${isPositive ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
          <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            Projected Annual Value
          </p>
          <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            ${data.projectedAnnualValue.toLocaleString()}
          </p>
        </div>
        <div className={`p-4 rounded-lg ${isPositive ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
          <p className={`text-sm ${isPositive ? 'text-indigo-600' : 'text-orange-600'}`}>
            Net Improvement
          </p>
          <p className={`text-2xl font-bold ${isPositive ? 'text-indigo-600' : 'text-orange-600'}`}>
            {isPositive ? '+' : ''}${data.netAnnualImpact.toLocaleString()}/yr
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <h4 className="font-medium mb-3">Impact by Category</h4>
      <div className="space-y-3">
        {data.categoryBreakdown.map((item: any) => (
          <div 
            key={item.category} 
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
          >
            <span className="font-medium">{item.categoryLabel}</span>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">{item.currentCard}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span>{item.newCard}</span>
              <span className={`font-medium ${
                item.change > 0 ? 'text-green-500' : item.change < 0 ? 'text-red-500' : 'text-gray-500'
              }`}>
                {item.change > 0 ? '+' : ''}${item.change}/yr
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Break-even Analysis */}
      {data.breakEvenMonths && (
        <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            <strong>Break-even:</strong> The annual fee will be offset in approximately{' '}
            <strong>{data.breakEvenMonths} months</strong> based on your spending patterns.
          </p>
        </div>
      )}
    </div>
  );
}
```

### Simulator API

```typescript
// src/app/api/simulator/route.ts

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculatePoints } from '@/lib/services/points-calculator';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { scenario, addCardId, replaceCardId } = await request.json();

  // Get user's current cards and spending
  const userCards = await prisma.card.findMany({
    where: {
      linkedAccount: { userId: session.user.id, status: 'active' },
      isActive: true,
    },
    include: { cardProduct: true },
  });

  // Get 3-month spending by category
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const transactions = await prisma.transaction.findMany({
    where: {
      card: { linkedAccount: { userId: session.user.id } },
      transactionDate: { gte: threeMonthsAgo },
      isPending: false,
    },
  });

  // Calculate monthly average by category
  const spendByCategory: Record<string, number> = {};
  for (const tx of transactions) {
    spendByCategory[tx.category] = (spendByCategory[tx.category] || 0) + Number(tx.amount) / 3;
  }

  // Get the card to add
  const newCardProduct = await prisma.cardProduct.findUnique({
    where: { id: addCardId },
  });

  if (!newCardProduct) {
    return Response.json({ error: 'Card not found' }, { status: 404 });
  }

  // Calculate current annual value
  let currentAnnualValue = 0;
  const categoryBreakdown = [];

  for (const [category, monthlySpend] of Object.entries(spendByCategory)) {
    // Find best current card for this category
    let bestCurrentPoints = 0;
    let bestCurrentCard = 'None';

    for (const card of userCards) {
      if (!card.cardProduct) continue;
      if (scenario === 'replace' && card.id === replaceCardId) continue;

      const points = calculatePoints(monthlySpend, category as any, card.cardProduct);
      if (points > bestCurrentPoints) {
        bestCurrentPoints = points;
        bestCurrentCard = card.cardProduct.name;
      }
    }

    // Calculate with new card
    const newCardPoints = calculatePoints(monthlySpend, category as any, newCardProduct);
    
    // Determine best option
    const bestNewPoints = Math.max(bestCurrentPoints, newCardPoints);
    const bestNewCard = newCardPoints > bestCurrentPoints ? newCardProduct.name : bestCurrentCard;

    const currentAnnualCategory = bestCurrentPoints * 12 * 0.02; // Assume 2cpp
    const newAnnualCategory = bestNewPoints * 12 * 0.02;

    currentAnnualValue += currentAnnualCategory;

    categoryBreakdown.push({
      category,
      categoryLabel: category.replace(/_/g, ' '),
      currentCard: bestCurrentCard,
      newCard: bestNewCard,
      currentValue: Math.round(currentAnnualCategory),
      newValue: Math.round(newAnnualCategory),
      change: Math.round(newAnnualCategory - currentAnnualCategory),
    });
  }

  // Calculate projected value with new card
  const projectedAnnualValue = categoryBreakdown.reduce((sum, cat) => sum + cat.newValue, 0);

  // Account for annual fees
  let replacedCardFee = 0;
  if (scenario === 'replace' && replaceCardId) {
    const replacedCard = userCards.find(c => c.id === replaceCardId);
    replacedCardFee = Number(replacedCard?.cardProduct?.annualFee || 0);
  }

  const netFeeChange = Number(newCardProduct.annualFee) - replacedCardFee;
  const netAnnualImpact = projectedAnnualValue - currentAnnualValue - netFeeChange;

  // Break-even calculation
  const monthlyBenefit = (projectedAnnualValue - currentAnnualValue) / 12;
  const breakEvenMonths = monthlyBenefit > 0 
    ? Math.ceil(Number(newCardProduct.annualFee) / monthlyBenefit)
    : null;

  return Response.json({
    currentAnnualValue: Math.round(currentAnnualValue),
    projectedAnnualValue: Math.round(projectedAnnualValue),
    netAnnualImpact: Math.round(netAnnualImpact),
    newCardAnnualFee: Number(newCardProduct.annualFee),
    replacedCardAnnualFee: replacedCardFee,
    breakEvenMonths,
    categoryBreakdown: categoryBreakdown.sort((a, b) => b.change - a.change),
  });
}
```

---

## Week 8: Polish & Launch

### Tasks

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Expand card_products database (100+ cards) | P1 | 6h | ☐ |
| Implement settings page | P0 | 4h | ☐ |
| Create custom point valuations feature | P1 | 3h | ☐ |
| Build connected accounts management | P0 | 3h | ☐ |
| Add loading states and skeletons throughout | P0 | 4h | ☐ |
| Implement error boundaries and fallbacks | P0 | 3h | ☐ |
| Mobile responsive polish | P0 | 6h | ☐ |
| Performance optimization (lazy loading, memoization) | P1 | 4h | ☐ |
| Create landing page | P1 | 4h | ☐ |
| Set up production Plaid environment | P0 | 2h | ☐ |
| Final QA and bug fixes | P0 | 8h | ☐ |

### Settings Page

```typescript
// src/app/(dashboard)/settings/page.tsx

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Moon, Sun, Monitor, CreditCard, Bell, Trash2 } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => fetch('/api/user').then(r => r.json()),
  });

  const { data: accounts } = useQuery({
    queryKey: ['linked-accounts'],
    queryFn: () => fetch('/api/accounts').then(r => r.json()),
  });

  const { data: valuations } = useQuery({
    queryKey: ['valuations'],
    queryFn: () => fetch('/api/valuations').then(r => r.json()),
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Account Section */}
      <section className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold">Account</h2>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium">{user?.name || 'User'}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold">Appearance</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', icon: Sun, label: 'Light' },
              { id: 'dark', icon: Moon, label: 'Dark' },
              { id: 'system', icon: Monitor, label: 'System' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setTheme(option.id as any)}
                className={`p-4 rounded-xl text-center transition-all border-2 ${
                  theme === option.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-transparent bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <option.icon className={`w-6 h-6 mx-auto ${
                  theme === option.id ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <p className="text-sm font-medium mt-2">{option.label}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Point Valuations Section */}
      <section className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold">Point Valuations</h2>
          <p className="text-sm text-gray-500 mt-1">
            Customize how points are valued (cents per point)
          </p>
        </div>
        <div className="p-5 space-y-3">
          {Object.entries(valuations?.valuations || {}).map(([currency, value]) => (
            <div 
              key={currency} 
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <span className="font-medium">{currency.replace(/_/g, ' ')}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  defaultValue={value as number}
                  className="w-20 px-3 py-1 rounded border border-gray-200 dark:border-gray-600 text-center"
                />
                <span className="text-sm text-gray-500">cpp</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Connected Accounts Section */}
      <section className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold">Connected Accounts</h2>
        </div>
        <div className="p-5 space-y-3">
          {accounts?.accounts.map((account: any) => (
            <div 
              key={account.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">{account.institutionName}</p>
                  <p className="text-xs text-gray-500">
                    {account.cards?.length || 0} cards • Last synced{' '}
                    {account.lastSyncAt 
                      ? new Date(account.lastSyncAt).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
              </div>
              <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

---

## Launch Checklist

### Pre-Launch
- [ ] All features tested and working
- [ ] Mobile responsive on iOS and Android
- [ ] Error boundaries in place
- [ ] Loading states for all async operations
- [ ] 404 and error pages created
- [ ] SEO meta tags added
- [ ] Analytics tracking (Vercel Analytics)
- [ ] Error tracking (Sentry) configured

### Plaid Production
- [ ] Apply for Plaid production access
- [ ] Update environment variables
- [ ] Test with real bank accounts
- [ ] Webhook endpoint verified

### Deployment
- [ ] Production environment variables set in Vercel
- [ ] Database migrations run on production
- [ ] Seed data (card products) loaded
- [ ] Domain configured (app.cardstack.com)
- [ ] SSL certificate verified

### Post-Launch
- [ ] Monitor error rates in Sentry
- [ ] Watch Vercel Analytics for performance
- [ ] Check Plaid webhook delivery
- [ ] User feedback collection ready

---

## Deliverables

- [ ] Card explorer with search/filter
- [ ] Working simulator for add/replace scenarios
- [ ] Settings page with preferences
- [ ] Connected accounts management
- [ ] Landing page
- [ ] Production-ready application
- [ ] MVP launched! 🚀

---

## Testing Checklist

- [ ] Simulator calculation accuracy tests
- [ ] Card search/filter tests
- [ ] Settings persistence tests
- [ ] E2E tests for critical flows
- [ ] Mobile responsiveness tests
- [ ] Performance benchmarks (<3s load time)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
