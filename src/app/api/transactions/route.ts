import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const category = searchParams.get('category');
    const cardId = searchParams.get('cardId');

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

    if (category) {
      where.category = category;
    }

    if (cardId) {
      where.cardId = cardId;
    }

    const [transactions, total, totalPoints] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          card: {
            include: {
              cardProduct: true,
              linkedAccount: {
                select: {
                  institutionName: true,
                },
              },
            },
          },
        },
        orderBy: {
          transactionDate: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.transaction.count({ where }),
      prisma.transaction.aggregate({
        where,
        _sum: {
          pointsEarned: true,
        },
      }),
    ]);

    return Response.json({
      data: transactions,
      meta: {
        total,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
        offset,
      },
      summary: {
        totalPoints: totalPoints._sum.pointsEarned || 0,
        transactionCount: total,
      },
    });
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return Response.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
