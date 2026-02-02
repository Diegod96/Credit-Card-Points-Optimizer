import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const DEFAULT_VALUATIONS: Record<string, number> = {
  AMEX_MR: 2.0,
  CHASE_UR: 2.0,
  CAPITAL_ONE: 1.7,
  CITI_TYP: 1.7,
  CASHBACK: 1.0,
};

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get valuations from database (if any custom valuations exist)
    const dbValuations = await prisma.pointsValuation.findMany({
      where: { source: 'USER' },
    });

    // Merge default with database valuations
    const valuations = { ...DEFAULT_VALUATIONS };
    
    for (const v of dbValuations) {
      valuations[v.ecosystem] = Number(v.cpp);
    }

    return Response.json({ valuations });
  } catch (error) {
    console.error('Failed to fetch valuations:', error);
    // Return defaults on error
    return Response.json({ valuations: DEFAULT_VALUATIONS });
  }
}
