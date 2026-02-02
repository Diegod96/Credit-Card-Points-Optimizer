import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const CATEGORIES = [
  'DINING', 'GROCERIES', 'WHOLESALE_CLUB', 'GAS', 'EV_CHARGING',
  'TRAVEL_AIR', 'TRAVEL_HOTEL', 'TRAVEL_CAR_RENTAL', 'TRANSIT',
  'RIDESHARE', 'ENTERTAINMENT', 'STREAMING', 'PHONE_INTERNET',
  'DRUGSTORE', 'HOME_IMPROVEMENT', 'OFFICE_SUPPLY', 'FITNESS', 'OTHER'
] as const;

type Category = typeof CATEGORIES[number];

interface CategoryMultiplier {
  category: Category;
  multiplier: number;
}

interface CardRecommendation {
  category: string;
  bestCard: string;
  cardId: string;
  multiplier: number;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
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
        linkedAccount: {
          select: {
            institutionName: true,
          },
        },
      },
    });

    if (cards.length === 0) {
      return Response.json({
        recommendations: [],
        message: 'No active cards found. Please link and configure your cards first.',
      });
    }

    const recommendations: CardRecommendation[] = [];

    for (const category of CATEGORIES) {
      let bestCard: typeof cards[0] | null = null;
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

      if (bestCard && bestCard.cardProduct) {
        recommendations.push({
          category,
          bestCard: `${bestCard.cardProduct.name}${bestCard.linkedAccount?.institutionName ? ` (${bestCard.linkedAccount.institutionName})` : ''}`,
          cardId: bestCard.id,
          multiplier: bestMultiplier,
        });
      }
    }

    recommendations.sort((a, b) => b.multiplier - a.multiplier);

    return Response.json({
      recommendations,
      cardsAnalyzed: cards.length,
    });
  } catch (error) {
    console.error('Failed to calculate best cards by category:', error);
    return Response.json(
      { error: 'Failed to calculate card recommendations' },
      { status: 500 }
    );
  }
}
