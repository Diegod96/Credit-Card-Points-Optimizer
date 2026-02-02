'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Eye, EyeOff } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { PointsBalanceCard } from '@/components/features/points-balance-card';
import { BestCardWidget } from '@/components/features/best-card-widget';
import { RecentTransactions } from '@/components/features/recent-transactions';

interface PointsBalance {
  ecosystem: string;
  ecosystemLabel: string;
  balance: number;
  monthOverMonthChange: number;
}

interface PointsBalancesResponse {
  balances: PointsBalance[];
}

interface ValuationsResponse {
  valuations: Record<string, number>;
}

const ECOSYSTEM_COLORS: Record<string, string> = {
  AMEX_MR: '#006FCF',
  CHASE_UR: '#124A8E',
  CAPITAL_ONE: '#D03027',
  CITI_TYP: '#056DAE',
  CASHBACK: '#10B981',
};

export default function DashboardPage() {
  const [showBalances, setShowBalances] = useState(true);

  const { data: balances, isLoading: balancesLoading } = useQuery<PointsBalancesResponse>({
    queryKey: ['points-balances'],
    queryFn: () => fetch('/api/points/balances').then(r => r.json()),
  });

  const { data: valuations } = useQuery<ValuationsResponse>({
    queryKey: ['valuations'],
    queryFn: () => fetch('/api/valuations').then(r => r.json()),
  });

  const totalValue = balances?.balances.reduce((acc: number, b: PointsBalance) => {
    const cpp = valuations?.valuations[b.ecosystem] || 1;
    return acc + (b.balance * cpp / 100);
  }, 0) || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-gray-500 mt-1">Here&apos;s your rewards overview</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <Plus className="w-4 h-4" />
            Link Card
          </button>
        </div>

        {/* Total Value Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <span className="text-indigo-100">Total Rewards Value</span>
            <button 
              onClick={() => setShowBalances(!showBalances)} 
              className="p-2 hover:bg-white/10 rounded-lg"
            >
              {showBalances ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              {showBalances ? `$${totalValue.toLocaleString()}` : '••••'}
            </span>
            <span className="text-indigo-200">across all ecosystems</span>
          </div>
        </div>

        {/* Points Balances Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Points by Ecosystem</h2>
          {balancesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse h-32 bg-gray-100 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {balances?.balances.map((balance: PointsBalance) => (
                <PointsBalanceCard
                  key={balance.ecosystem}
                  ecosystem={balance.ecosystem}
                  ecosystemLabel={balance.ecosystemLabel}
                  points={balance.balance}
                  value={balance.balance * (valuations?.valuations[balance.ecosystem] || 1) / 100}
                  color={ECOSYSTEM_COLORS[balance.ecosystem] || '#6B7280'}
                  trend={balance.monthOverMonthChange || 0}
                  showBalance={showBalances}
                />
              ))}
            </div>
          )}
        </div>

        {/* Best Card & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BestCardWidget />
          <RecentTransactions />
        </div>
      </div>
    </DashboardLayout>
  );
}
