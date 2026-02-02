import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


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
      },
      include: {
        cardProduct: true,
        linkedAccount: {
          select: {
            institutionName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Response.json({
      cards: cards.map((card: typeof cards[number]) => ({
        id: card.id,
        lastFour: card.lastFour,
        nickname: card.nickname,
        isActive: card.isActive,
        createdAt: card.createdAt,
        cardProduct: card.cardProduct ? {
          id: card.cardProduct.id,
          name: card.cardProduct.name,
          issuer: card.cardProduct.issuer,
          currencyType: card.cardProduct.currencyType,
          pointsCurrency: card.cardProduct.pointsCurrency,
          annualFee: Number(card.cardProduct.annualFee),
          baseEarnRate: Number(card.cardProduct.baseEarnRate),
          categoryMultipliers: card.cardProduct.categoryMultipliers as Record<string, number>,
          signupBonusPoints: card.cardProduct.signupBonusPoints,
        } : null,
        institution: card.linkedAccount?.institutionName,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch cards:', error);
    return Response.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}
