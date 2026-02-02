import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ECOSYSTEM_LABELS: Record<string, string> = {
  AMEX_MR: 'American Express MR',
  CHASE_UR: 'Chase Ultimate Rewards',
  CAPITAL_ONE: 'Capital One Miles',
  CITI_TYP: 'Citi ThankYou Points',
  CASHBACK: 'Cash Back',
};

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get points balances for user
    const balances = await prisma.pointsBalance.findMany({
      where: { userId: session.user.id },
      orderBy: { balance: 'desc' },
    });

    // Calculate month-over-month change (simplified - would need historical data in production)
    const formattedBalances = balances.map(balance => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      // Mock trend calculation - in production, compare with historical data
      const mockTrend = Math.floor(Math.random() * 20) - 5;
      
      return {
        ecosystem: balance.ecosystem,
        ecosystemLabel: ECOSYSTEM_LABELS[balance.ecosystem] || balance.ecosystem,
        balance: Number(balance.balance),
        monthOverMonthChange: mockTrend,
      };
    });

    return Response.json({ balances: formattedBalances });
  } catch (error) {
    console.error('Failed to fetch points balances:', error);
    return Response.json(
      { error: 'Failed to fetch points balances' },
      { status: 500 }
    );
  }
}
