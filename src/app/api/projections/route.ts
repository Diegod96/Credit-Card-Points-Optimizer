import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const CATEGORIES = [
  'DINING', 'GROCERIES', 'WHOLESALE_CLUB', 'GAS', 'EV_CHARGING',
  'TRAVEL_AIR', 'TRAVEL_HOTEL', 'TRAVEL_CAR_RENTAL', 'TRANSIT',
  'RIDESHARE', 'ENTERTAINMENT', 'STREAMING', 'PHONE_INTERNET',
  'DRUGSTORE', 'HOME_IMPROVEMENT', 'OFFICE_SUPPLY', 'FITNESS', 'OTHER'
] as const;

type Category = typeof CATEGORIES[number];

interface SpendingAccumulator {
  amount: number;
  count: number;
}

interface SpendingByCategory {
  category: string;
  amount: number;
  transactions: number;
}

interface MonthlyProjection {
  month: string;
  year: number;
  monthIndex: number;
  ecosystem: string;
  projectedPoints: number;
  cumulativePoints: number;
}

interface EcosystemProjection {
  ecosystem: string;
  monthlyPoints: number;
  cumulativePoints: number;
}

type CardWithProduct = Prisma.CardGetPayload<{
  include: {
    cardProduct: true;
  };
}>;

type TransactionWithCard = Prisma.TransactionGetPayload<{
  include: {
    card: {
      include: {
        cardProduct: true;
      };
    };
  };
}>;

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const monthsToProject = parseInt(searchParams.get('months') || '12', 10);

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    threeMonthsAgo.setHours(0, 0, 0, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        card: {
          linkedAccount: {
            userId: session.user.id,
          },
        },
        transactionDate: {
          gte: threeMonthsAgo,
        },
      },
      include: {
        card: {
          include: {
            cardProduct: true,
          },
        },
      },
    });

    const spendingByCategory = transactions.reduce<Record<string, SpendingAccumulator>>(
      (acc: Record<string, SpendingAccumulator>, transaction: TransactionWithCard) => {
        const category = transaction.category;
        const amount = Number(transaction.amount);
        
        if (!acc[category]) {
          acc[category] = { amount: 0, count: 0 };
        }
        acc[category].amount += amount;
        acc[category].count += 1;
        
        return acc;
      },
      {}
    );

    const averageMonthlySpending: SpendingByCategory[] = Object.entries(spendingByCategory)
      .map(([category, data]) => {
        const typedData = data as SpendingAccumulator;
        return {
          category,
          amount: typedData.amount / 3,
          transactions: Math.round(typedData.count / 3),
        };
      })
      .filter(item => item.amount > 0);

    const cards = await prisma.card.findMany({
      where: {
        linkedAccount: {
          userId: session.user.id,
        },
        isActive: true,
        cardProduct: {
          isNot: null,
        },
      },
      include: {
        cardProduct: true,
      },
    });

    const bestCardByCategory: Record<string, { card: CardWithProduct; multiplier: number }> = {};

    for (const category of CATEGORIES) {
      let bestCard: CardWithProduct | null = null;
      let bestMultiplier = 1;

      for (const card of cards) {
        if (!card.cardProduct) continue;

        const categoryMultipliers = card.cardProduct.categoryMultipliers as Record<string, number> || {};
        const multiplier = categoryMultipliers[category] || Number(card.cardProduct.baseEarnRate) || 1;

        if (multiplier > bestMultiplier) {
          bestMultiplier = multiplier;
          bestCard = card;
        }
      }

      if (bestCard) {
        bestCardByCategory[category] = { card: bestCard, multiplier: bestMultiplier };
      }
    }

    const projections: MonthlyProjection[] = [];
    const ecosystems = [...new Set(cards.map((c: CardWithProduct) => c.cardProduct?.currencyType).filter(Boolean))] as string[];
    const currentDate = new Date();

    for (let i = 0; i < monthsToProject; i++) {
      const projectionDate = new Date(currentDate);
      projectionDate.setMonth(projectionDate.getMonth() + i + 1);

      const monthName = projectionDate.toLocaleDateString('en-US', { month: 'short' });
      const year = projectionDate.getFullYear();

      for (const ecosystem of ecosystems) {
        let monthlyPoints = 0;

        for (const spending of averageMonthlySpending) {
          const bestCardInfo = bestCardByCategory[spending.category];
          
          if (bestCardInfo && bestCardInfo.card.cardProduct?.currencyType === ecosystem) {
            const points = spending.amount * bestCardInfo.multiplier;
            monthlyPoints += points;
          }
        }

        const previousCumulative = projections
          .filter(p => p.ecosystem === ecosystem && p.monthIndex < i)
          .reduce((sum, p) => sum + p.projectedPoints, 0);

        projections.push({
          month: monthName,
          year,
          monthIndex: i,
          ecosystem,
          projectedPoints: Math.round(monthlyPoints * 100) / 100,
          cumulativePoints: Math.round((previousCumulative + monthlyPoints) * 100) / 100,
        });
      }
    }

    const summaryByEcosystem: EcosystemProjection[] = ecosystems.map(ecosystem => {
      const ecosystemProjections = projections.filter(p => p.ecosystem === ecosystem);
      const monthlyPoints = ecosystemProjections.reduce((sum, p) => sum + p.projectedPoints, 0) / monthsToProject;
      const cumulativePoints = ecosystemProjections[ecosystemProjections.length - 1]?.cumulativePoints || 0;

      return {
        ecosystem,
        monthlyPoints: Math.round(monthlyPoints * 100) / 100,
        cumulativePoints,
      };
    });

    return Response.json({
      projections,
      summaryByEcosystem,
      historicalSpending: averageMonthlySpending,
      period: {
        months: monthsToProject,
        startMonth: projections[0]?.month || '',
        endMonth: projections[projections.length - 1]?.month || '',
      },
    });
  } catch (error) {
    console.error('Failed to calculate projections:', error);
    return Response.json(
      { error: 'Failed to calculate points projections' },
      { status: 500 }
    );
  }
}
