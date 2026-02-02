import { GET as getPointsBalances } from '@/app/api/points/balances/route';
import { GET as getBestCards } from '@/app/api/cards/best-by-category/route';
import { GET as getCards } from '@/app/api/cards/route';
import { GET as getValuations } from '@/app/api/valuations/route';
import { GET as getProjections } from '@/app/api/projections/route';

// Mock auth and prisma
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    pointsBalance: {
      findMany: jest.fn(),
    },
    card: {
      findMany: jest.fn(),
    },
    pointsValuation: {
      findMany: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
    },
  },
}));

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const mockedAuth = auth as unknown as jest.Mock;
const mockedPrisma = prisma as unknown as {
  pointsBalance: { findMany: jest.Mock };
  card: { findMany: jest.Mock };
  pointsValuation: { findMany: jest.Mock };
};

describe('Dashboard API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/points/balances', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockedAuth.mockResolvedValue(null);

      const response = await getPointsBalances();
      expect(response.status).toBe(401);
    });

    it('returns points balances for authenticated user', async () => {
      mockedAuth.mockResolvedValue({ user: { id: 'user-1' } } as any);
      mockedPrisma.pointsBalance.findMany.mockResolvedValue([
        { ecosystem: 'AMEX_MR', balance: 125000, earnedThisMonth: 5000, earnedThisYear: 25000, userId: 'user-1', id: '1', lastUpdated: new Date() },
        { ecosystem: 'CHASE_UR', balance: 75000, earnedThisMonth: 3000, earnedThisYear: 15000, userId: 'user-1', id: '2', lastUpdated: new Date() },
      ]);

      const response = await getPointsBalances();
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.balances).toHaveLength(2);
      expect(data.balances[0].ecosystem).toBe('AMEX_MR');
      expect(data.balances[0].balance).toBe(125000);
    });
  });

  describe('GET /api/cards', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockedAuth.mockResolvedValue(null);

      const response = await getCards();
      expect(response.status).toBe(401);
    });

    it('returns cards for authenticated user', async () => {
      mockedAuth.mockResolvedValue({ user: { id: 'user-1' } } as any);
      mockedPrisma.card.findMany.mockResolvedValue([
        {
          id: 'card-1',
          lastFour: '1234',
          nickname: 'My Amex',
          isActive: true,
          createdAt: new Date(),
          cardProduct: {
            id: 'product-1',
            name: 'Amex Gold',
            issuer: 'AMEX',
            currencyType: 'POINTS',
            pointsCurrency: 'AMEX_MR',
            annualFee: 250,
            baseEarnRate: 1,
            categoryMultipliers: { DINING: 4, GROCERIES: 4 },
            signupBonusPoints: 60000,
          },
          linkedAccount: { institutionName: 'American Express' },
        },
      ]);

      const response = await getCards();
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.cards).toHaveLength(1);
      expect(data.cards[0].cardProduct.name).toBe('Amex Gold');
    });
  });

  describe('GET /api/valuations', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockedAuth.mockResolvedValue(null);

      const response = await getValuations();
      expect(response.status).toBe(401);
    });

    it('returns default valuations for authenticated user', async () => {
      mockedAuth.mockResolvedValue({ user: { id: 'user-1' } } as any);
      mockedPrisma.pointsValuation.findMany.mockResolvedValue([]);

      const response = await getValuations();
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.valuations.AMEX_MR).toBe(2.0);
      expect(data.valuations.CHASE_UR).toBe(2.0);
      expect(data.valuations.CASHBACK).toBe(1.0);
    });
  });
});
