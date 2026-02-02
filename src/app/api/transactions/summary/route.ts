import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface Card {
  id: string;
  lastFour: string | null;
  nickname: string | null;
  cardProduct: {
    name: string;
  } | null;
  linkedAccount: {
    institutionName: string;
  } | null;
}

interface CardSummary {
  cardId: string;
  _sum: {
    amount: number | null;
    pointsEarned: number | null;
  };
  _count: {
    id: number;
  };
}

interface CategorySummary {
  category: string;
  _sum: {
    amount: number | null;
    pointsEarned: number | null;
  };
  _count: {
    id: number;
  };
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Prisma.TransactionWhereInput = {
      card: {
        linkedAccount: {
          userId: session.user.id,
        },
      },
    };

    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) {
        where.transactionDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.transactionDate.lte = new Date(endDate);
      }
    }

    const [
      categorySummary,
      cardSummary,
      totalStats,
    ] = await Promise.all([
      prisma.transaction.groupBy({
        by: ['category'],
        where,
        _sum: {
          amount: true,
          pointsEarned: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _sum: {
            amount: 'desc',
          },
        },
      }),
      prisma.transaction.groupBy({
        by: ['cardId'],
        where,
        _sum: {
          amount: true,
          pointsEarned: true,
        },
        _count: {
          id: true,
        },
      }),
      prisma.transaction.aggregate({
        where,
        _sum: {
          amount: true,
          pointsEarned: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    const cards = await prisma.card.findMany({
      where: {
        linkedAccount: {
          userId: session.user.id,
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

    const cardSummaryWithDetails = cardSummary.map((summary: CardSummary) => {
      const card = cards.find((c: Card) => c.id === summary.cardId);
      return {
        cardId: summary.cardId,
        cardName: card?.cardProduct?.name || card?.nickname || 'Unknown Card',
        institution: card?.linkedAccount?.institutionName || 'Unknown',
        lastFour: card?.lastFour,
        totalSpend: summary._sum.amount || 0,
        totalPoints: summary._sum.pointsEarned || 0,
        transactionCount: summary._count.id,
      };
    });

    return Response.json({
      data: {
        byCategory: categorySummary.map((cat: CategorySummary) => ({
          category: cat.category,
          totalSpend: cat._sum.amount || 0,
          totalPoints: cat._sum.pointsEarned || 0,
          transactionCount: cat._count.id,
        })),
        byCard: cardSummaryWithDetails,
        totals: {
          totalSpend: totalStats._sum.amount || 0,
          totalPoints: totalStats._sum.pointsEarned || 0,
          transactionCount: totalStats._count.id,
        },
        period: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch transaction summary:', error);
    return Response.json(
      { error: 'Failed to fetch transaction summary' },
      { status: 500 }
    );
  }
}
