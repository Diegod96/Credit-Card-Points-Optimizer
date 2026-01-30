import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { plaidClient } from '@/lib/plaid';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const accounts = await prisma.linkedAccount.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { cards: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedAccounts = accounts.map((account) => ({
      id: account.id,
      institutionName: account.institutionName,
      institutionId: account.institutionId,
      status: account.status,
      lastSyncAt: account.lastSyncAt,
      cardsCount: account._count.cards,
      createdAt: account.createdAt,
    }));

    return Response.json({ accounts: formattedAccounts });
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
    return Response.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get('id');

  if (!accountId) {
    return Response.json(
      { error: 'Missing account ID' },
      { status: 400 }
    );
  }

  try {
    const account = await prisma.linkedAccount.findFirst({
      where: {
        id: accountId,
        userId: session.user.id,
      },
    });

    if (!account) {
      return Response.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    try {
      await plaidClient.itemRemove({
        access_token: account.plaidAccessToken,
      });
    } catch (plaidError) {
      console.warn('Plaid item removal failed (may already be removed):', plaidError);
    }

    await prisma.linkedAccount.delete({
      where: { id: accountId },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Failed to delete account:', error);
    return Response.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
