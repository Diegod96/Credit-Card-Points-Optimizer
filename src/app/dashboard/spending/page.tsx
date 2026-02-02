'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';

const TIMEFRAMES = [
  { value: 30, label: '30 days' },
  { value: 90, label: '3 months' },
  { value: 180, label: '6 months' },
  { value: 365, label: '1 year' },
];

const COLORS = ['#006FCF', '#124A8E', '#D03027', '#056DAE', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

interface CategoryData {
  category: string;
  amount: number;
  pointsEarned: number;
  percentage: number;
}

interface SpendingSummary {
  totalSpend: number;
  totalPoints: number;
  averageTransaction: number;
  byCategory: CategoryData[];
  byCard: Array<{
    cardName: string;
    amount: number;
    pointsEarned: number;
  }>;
}

export default function SpendingPage() {
  const [timeframe, setTimeframe] = useState(90);

  const { data, isLoading } = useQuery<SpendingSummary>({
    queryKey: ['spending-summary', timeframe],
    queryFn: () => fetch(`/api/transactions/summary?days=${timeframe}`).then(r => r.json()),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Spending Analysis</h1>
            <p className="text-gray-500 mt-1">Track your spending and rewards by category</p>
          </div>
          <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeframe === tf.value
                    ? 'bg-white dark:bg-gray-700 shadow'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
            <p className="text-blue-100 text-sm">Total Spending</p>
            <p className="text-3xl font-bold mt-2">
              ${data?.totalSpend?.toLocaleString() || '—'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
            <p className="text-emerald-100 text-sm">Points Earned</p>
            <p className="text-3xl font-bold mt-2">
              {data?.totalPoints?.toLocaleString() || '—'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
            <p className="text-purple-100 text-sm">Avg Transaction</p>
            <p className="text-3xl font-bold mt-2">
              ${data?.averageTransaction?.toFixed(2) || '—'}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Bar Chart */}
          <div className="rounded-xl p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
            <div className="h-64">
              {isLoading ? (
                <div className="animate-pulse h-full bg-gray-100 rounded" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.byCategory || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v: number) => `$${v}`} />
                    <YAxis type="category" dataKey="category" width={100} tickFormatter={(v: string) => v.replace(/_/g, ' ')} />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                    <Bar dataKey="amount" fill="#006FCF" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Category Pie Chart */}
          <div className="rounded-xl p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
            <div className="h-64">
              {isLoading ? (
                <div className="animate-pulse h-full bg-gray-100 rounded" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.byCategory || []}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                    >
                      {(data?.byCategory || []).map((_entry: CategoryData, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold">Category Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">Category</th>
                  <th className="text-right px-5 py-3 text-sm font-medium text-gray-500">Amount</th>
                  <th className="text-right px-5 py-3 text-sm font-medium text-gray-500">% of Total</th>
                  <th className="text-right px-5 py-3 text-sm font-medium text-gray-500">Points Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data?.byCategory?.map((cat: CategoryData) => (
                  <tr key={cat.category} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-5 py-3 font-medium">
                      {cat.category.replace(/_/g, ' ')}
                    </td>
                    <td className="px-5 py-3 text-right">
                      ${cat.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {cat.percentage.toFixed(1)}%
                    </td>
                    <td className="px-5 py-3 text-right text-green-600">
                      +{cat.pointsEarned.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
