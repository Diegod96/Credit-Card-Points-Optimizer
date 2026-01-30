# Phase 5: Post-MVP Enhancements

**Duration:** Weeks 9-12  
**Goal:** Add premium features, implement subscriptions, expand card database, add AI features

---

## Overview

After MVP launch, focus shifts to monetization, retention features, and advanced functionality.

---

## Week 9: Subscription System

### Tasks

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Set up Stripe account and products | P0 | 2h | ☐ |
| Implement Stripe Checkout integration | P0 | 4h | ☐ |
| Create subscription webhook handler | P0 | 4h | ☐ |
| Build subscription management UI | P0 | 4h | ☐ |
| Implement feature gates by tier | P0 | 4h | ☐ |
| Add CSV export feature (premium) | P1 | 3h | ☐ |
| Create upgrade prompts throughout app | P1 | 2h | ☐ |

### Subscription Tiers

| Feature | Free | Premium ($5/mo) | Pro ($12/mo) |
|---------|------|-----------------|--------------|
| Linked Cards | 3 | 10 | Unlimited |
| Transaction History | 6 months | 12 months | 24 months |
| Projections | 6 months | 12 months | 24 months |
| Simulations | 3/month | Unlimited | Unlimited |
| CSV Export | ❌ | ✅ | ✅ |
| AI Recommendations | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ✅ | ✅ |

### Stripe Integration

```typescript
// src/lib/stripe.ts

import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: {
      maxCards: 3,
      historyMonths: 6,
      projectionMonths: 6,
      simulationsPerMonth: 3,
      csvExport: false,
      aiRecommendations: false,
    },
  },
  premium: {
    name: 'Premium',
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    price: 5,
    features: {
      maxCards: 10,
      historyMonths: 12,
      projectionMonths: 12,
      simulationsPerMonth: -1, // unlimited
      csvExport: true,
      aiRecommendations: false,
    },
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 12,
    features: {
      maxCards: -1, // unlimited
      historyMonths: 24,
      projectionMonths: 24,
      simulationsPerMonth: -1,
      csvExport: true,
      aiRecommendations: true,
    },
  },
};
```

```typescript
// src/app/api/stripe/checkout/route.ts

import { auth } from '@/lib/auth';
import { stripe, PLANS } from '@/lib/stripe';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { plan } = await request.json();
  const planConfig = PLANS[plan as keyof typeof PLANS];

  if (!planConfig || !('priceId' in planConfig)) {
    return Response.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: session.user.email!,
    mode: 'subscription',
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/settings?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/settings?canceled=true`,
    metadata: {
      userId: session.user.id,
    },
  });

  return Response.json({ url: checkoutSession.url });
}
```

```typescript
// src/app/api/stripe/webhook/route.ts

import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return Response.json({ error: 'Webhook signature failed' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionTier: session.metadata?.plan || 'premium',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      
      await prisma.user.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { subscriptionTier: 'free' },
      });
      break;
    }
  }

  return Response.json({ received: true });
}
```

### Feature Gate Hook

```typescript
// src/hooks/use-feature-gate.ts

import { useQuery } from '@tanstack/react-query';
import { PLANS } from '@/lib/stripe';

export function useFeatureGate() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => fetch('/api/user').then(r => r.json()),
  });

  const tier = user?.subscriptionTier || 'free';
  const features = PLANS[tier as keyof typeof PLANS]?.features || PLANS.free.features;

  return {
    tier,
    features,
    canUseFeature: (feature: keyof typeof features) => {
      const value = features[feature];
      return value === true || value === -1 || (typeof value === 'number' && value > 0);
    },
    isAtLimit: (feature: 'maxCards' | 'simulationsPerMonth', current: number) => {
      const limit = features[feature];
      return limit !== -1 && current >= limit;
    },
  };
}
```

---

## Week 10: Engagement Features

### Tasks

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Build sign-up bonus tracker | P1 | 6h | ☐ |
| Create spending milestone alerts | P2 | 4h | ☐ |
| Implement email notifications (weekly summary) | P2 | 4h | ☐ |
| Add push notification support | P3 | 4h | ☐ |
| Build rewards optimization tips | P2 | 3h | ☐ |
| Create achievement badges system | P3 | 4h | ☐ |

### Sign-up Bonus Tracker

```typescript
// src/components/features/signup-bonus-tracker.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import { Gift, TrendingUp, Calendar } from 'lucide-react';

export function SignupBonusTracker() {
  const { data } = useQuery({
    queryKey: ['signup-bonuses'],
    queryFn: () => fetch('/api/cards/signup-bonuses').then(r => r.json()),
  });

  return (
    <div className="rounded-xl p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold">Sign-up Bonus Progress</h3>
      </div>

      <div className="space-y-4">
        {data?.bonuses.map((bonus: any) => {
          const progress = (bonus.currentSpend / bonus.requiredSpend) * 100;
          const daysLeft = Math.ceil(
            (new Date(bonus.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          const isOnTrack = (bonus.currentSpend / bonus.requiredSpend) >= 
            ((bonus.totalDays - daysLeft) / bonus.totalDays);

          return (
            <div key={bonus.cardId} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{bonus.cardName}</span>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  isOnTrack 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                }`}>
                  {isOnTrack ? 'On Track' : 'Behind'}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>${bonus.currentSpend.toLocaleString()} / ${bonus.requiredSpend.toLocaleString()}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {daysLeft} days left
                </span>
              </div>

              <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    progress >= 100 ? 'bg-green-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-purple-600 dark:text-purple-400 font-medium">
                  {bonus.bonusPoints.toLocaleString()} pts bonus
                </span>
                {progress >= 100 && (
                  <span className="text-green-600 dark:text-green-400">🎉 Earned!</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Weekly Email Summary

```typescript
// src/inngest/functions/weekly-summary.ts

import { inngest } from '../client';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { WeeklySummaryEmail } from '@/emails/weekly-summary';

export const sendWeeklySummary = inngest.createFunction(
  { id: 'send-weekly-summary' },
  { cron: '0 9 * * 1' }, // Monday 9 AM
  async ({ step }) => {
    const users = await step.run('get-users', async () => {
      return prisma.user.findMany({
        where: {
          preferences: {
            path: ['emailNotifications', 'weeklySummary'],
            equals: true,
          },
        },
        select: { id: true, email: true, name: true },
      });
    });

    for (const user of users) {
      await step.run(`send-email-${user.id}`, async () => {
        // Get user's weekly stats
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const stats = await prisma.transaction.aggregate({
          where: {
            card: { linkedAccount: { userId: user.id } },
            transactionDate: { gte: weekAgo },
          },
          _sum: { amount: true, pointsEarned: true },
          _count: true,
        });

        await resend.emails.send({
          from: 'CardStack <notifications@cardstack.app>',
          to: user.email,
          subject: 'Your Weekly Rewards Summary',
          react: WeeklySummaryEmail({
            name: user.name || 'there',
            totalSpend: Number(stats._sum.amount) || 0,
            totalPoints: Number(stats._sum.pointsEarned) || 0,
            transactionCount: stats._count,
          }),
        });
      });
    }

    return { sent: users.length };
  }
);
```

---

## Week 11: AI Features

### Tasks

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Set up OpenAI API integration | P1 | 2h | ☐ |
| Build AI card recommendation engine | P1 | 8h | ☐ |
| Create portfolio optimization suggestions | P2 | 6h | ☐ |
| Implement natural language query interface | P3 | 6h | ☐ |
| Add AI spending insights | P2 | 4h | ☐ |

### AI Recommendations

```typescript
// src/lib/services/ai-recommendations.ts

import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface UserContext {
  currentCards: Array<{ name: string; annualFee: number; categories: Record<string, number> }>;
  monthlySpend: Record<string, number>;
  totalMonthlySpend: number;
  goals: string[];
}

export async function getAIRecommendations(userId: string): Promise<string> {
  // Gather user context
  const cards = await prisma.card.findMany({
    where: { linkedAccount: { userId, status: 'active' }, isActive: true },
    include: { cardProduct: true },
  });

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const transactions = await prisma.transaction.findMany({
    where: {
      card: { linkedAccount: { userId } },
      transactionDate: { gte: threeMonthsAgo },
    },
  });

  // Calculate monthly spend by category
  const spendByCategory: Record<string, number> = {};
  for (const tx of transactions) {
    spendByCategory[tx.category] = (spendByCategory[tx.category] || 0) + Number(tx.amount) / 3;
  }

  const context: UserContext = {
    currentCards: cards.map(c => ({
      name: c.cardProduct?.name || 'Unknown',
      annualFee: Number(c.cardProduct?.annualFee || 0),
      categories: c.cardProduct?.categoryMultipliers as Record<string, number> || {},
    })),
    monthlySpend: spendByCategory,
    totalMonthlySpend: Object.values(spendByCategory).reduce((a, b) => a + b, 0),
    goals: ['maximize points', 'minimize fees'], // Could be user-configurable
  };

  const prompt = `You are a credit card rewards optimization expert. Analyze this user's portfolio and spending to provide personalized recommendations.

Current Cards:
${context.currentCards.map(c => `- ${c.name} ($${c.annualFee}/yr): ${Object.entries(c.categories).map(([cat, mult]) => `${cat}: ${mult}x`).join(', ')}`).join('\n')}

Monthly Spending by Category:
${Object.entries(context.monthlySpend).map(([cat, amt]) => `- ${cat}: $${amt.toFixed(0)}`).join('\n')}

Total Monthly Spend: $${context.totalMonthlySpend.toFixed(0)}

Please provide:
1. Analysis of their current portfolio efficiency
2. Specific card recommendations to improve rewards (with estimated annual value increase)
3. Category optimization tips
4. Any cards they should consider canceling

Keep the response concise and actionable.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
  });

  return completion.choices[0].message.content || 'Unable to generate recommendations.';
}
```

### AI Recommendations Component

```typescript
// src/components/features/ai-recommendations.tsx

'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useFeatureGate } from '@/hooks/use-feature-gate';

export function AIRecommendations() {
  const { canUseFeature } = useFeatureGate();
  const [recommendations, setRecommendations] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/ai/recommendations', { method: 'POST' });
      return res.json();
    },
    onSuccess: (data) => {
      setRecommendations(data.recommendations);
    },
  });

  if (!canUseFeature('aiRecommendations')) {
    return (
      <div className="rounded-xl p-6 bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5" />
          <h3 className="text-lg font-semibold">AI Recommendations</h3>
        </div>
        <p className="text-purple-100 mb-4">
          Get personalized card recommendations powered by AI.
        </p>
        <a 
          href="/settings#subscription"
          className="inline-block px-4 py-2 bg-white text-purple-600 rounded-lg font-medium"
        >
          Upgrade to Pro
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold">AI Recommendations</h3>
        </div>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"
        >
          <RefreshCw className={`w-4 h-4 ${mutation.isPending ? 'animate-spin' : ''}`} />
          {mutation.isPending ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      {recommendations ? (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {recommendations.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Click refresh to get personalized AI recommendations</p>
        </div>
      )}
    </div>
  );
}
```

---

## Week 12: Expansion & Polish

### Tasks

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Add Discover card products | P1 | 2h | ☐ |
| Add Wells Fargo card products | P1 | 2h | ☐ |
| Add US Bank card products | P1 | 2h | ☐ |
| Expand card database to 200+ cards | P1 | 8h | ☐ |
| Add hotel loyalty programs | P2 | 4h | ☐ |
| Add airline loyalty programs | P2 | 4h | ☐ |
| Implement card search improvements | P1 | 3h | ☐ |
| Add card comparison feature | P1 | 4h | ☐ |
| Performance audit and optimization | P1 | 4h | ☐ |
| Bug fixes and polish | P0 | 8h | ☐ |

### Extended Card Database

```typescript
// prisma/seed-cards-extended.ts

const DISCOVER_CARDS = [
  {
    name: 'Discover it Cash Back',
    issuer: 'DISCOVER',
    currencyType: 'CASHBACK',
    annualFee: 0,
    baseEarnRate: 1,
    categoryMultipliers: {
      // Rotating 5% categories
      ROTATING: 5,
    },
    signupBonusPoints: 0, // Cashback match first year
  },
  {
    name: 'Discover it Miles',
    issuer: 'DISCOVER',
    currencyType: 'POINTS',
    pointsCurrency: 'DISCOVER',
    annualFee: 0,
    baseEarnRate: 1.5,
    categoryMultipliers: {},
    signupBonusPoints: 0,
  },
];

const WELLS_FARGO_CARDS = [
  {
    name: 'Wells Fargo Active Cash',
    issuer: 'WELLS_FARGO',
    currencyType: 'CASHBACK',
    annualFee: 0,
    baseEarnRate: 2,
    categoryMultipliers: {},
    signupBonusPoints: 20000,
    signupSpendRequirement: 500,
  },
  {
    name: 'Wells Fargo Autograph',
    issuer: 'WELLS_FARGO',
    currencyType: 'POINTS',
    pointsCurrency: 'WF_REWARDS',
    annualFee: 0,
    baseEarnRate: 1,
    categoryMultipliers: {
      DINING: 3,
      TRAVEL_AIR: 3,
      GAS: 3,
      TRANSIT: 3,
      STREAMING: 3,
      PHONE_INTERNET: 3,
    },
    signupBonusPoints: 20000,
    signupSpendRequirement: 1000,
  },
];

const US_BANK_CARDS = [
  {
    name: 'US Bank Altitude Go',
    issuer: 'US_BANK',
    currencyType: 'POINTS',
    pointsCurrency: 'ALTITUDE',
    annualFee: 0,
    baseEarnRate: 1,
    categoryMultipliers: {
      DINING: 4,
      GROCERIES: 2,
      GAS: 2,
      STREAMING: 2,
    },
    signupBonusPoints: 20000,
    signupSpendRequirement: 1000,
  },
  {
    name: 'US Bank Cash+',
    issuer: 'US_BANK',
    currencyType: 'CASHBACK',
    annualFee: 0,
    baseEarnRate: 1,
    categoryMultipliers: {
      // User-selected 5% categories
      SELECTED_1: 5,
      SELECTED_2: 5,
      // User-selected 2% category
      SELECTED_3: 2,
    },
    signupBonusPoints: 20000,
    signupSpendRequirement: 1000,
  },
];
```

---

## Deliverables

- [ ] Stripe subscription system working
- [ ] Feature gates enforced by tier
- [ ] Sign-up bonus tracker
- [ ] Weekly email summaries
- [ ] AI recommendations (Pro tier)
- [ ] 200+ cards in database
- [ ] Hotel/airline loyalty program support
- [ ] Performance optimized

---

## Success Metrics

| Metric | Target (Week 12) |
|--------|------------------|
| Monthly Active Users | 1,000 |
| Paid Subscribers | 50 (5%) |
| Monthly Recurring Revenue | $400 |
| User Retention (30-day) | 40% |
| Average Session Duration | 3 min |
| Cards Linked per User | 2.5 |

---

## Future Roadmap (Post Week 12)

### Q2 Goals
- Mobile app (React Native)
- Bank account aggregation (checking/savings)
- Bill pay optimization
- Partner referral program

### Q3 Goals
- International card support
- Multi-currency support
- Credit score integration
- Card application tracking

### Q4 Goals
- Business card features
- Team/family accounts
- API for third-party integrations
- White-label solution
