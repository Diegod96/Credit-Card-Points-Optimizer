'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';

const TIMEFRAMES = [
  { value: 3, label: '3mo' },
  { value: 6, label: '6mo' },
  { value: 12, label: '12mo' },
  { value: 24, label: '24mo' },
];

const ECOSYSTEM_COLORS: Record<string, string> = {
  AMEX_MR: '#006FCF',
  CHASE_UR: '#124A8E',
  CAPITAL_ONE: '#D03027',
  CITI_TYP: '#056DAE',
  CASHBACK: '#10B981',
};

interface ProjectionMonth {
  month: number;
  [key: string]: number;
}

interface ProjectionsResponse {
  projections: ProjectionMonth[];
  monthlySpend: Record<string, number>;
  totalProjectedValue: number;
}

export default function ProjectionsPage() {
  const [timeframe, setTimeframe] = useState(6);

  const { data, isLoading } = useQuery<ProjectionsResponse>({
    queryKey: ['projections', timeframe],
    queryFn: () => fetch(`/api/projections?months=${timeframe}`).then(r => r.json()),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Points Projections</h1>
            <p className="text-gray-500 mt-1">
              Forecast your rewards based on spending patterns
            </p>
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
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 text-white">
            <p className="text-indigo-100 text-sm">Projected Points ({timeframe} mo)</p>
            <p className="text-3xl font-bold mt-2">
              {data?.totalProjectedValue?.toLocaleString() || '—'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
            <p className="text-emerald-100 text-sm">Estimated Value</p>
            <p className="text-3xl font-bold mt-2">
              ${((data?.totalProjectedValue || 0) * 0.02).toLocaleString()}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
            <p className="text-purple-100 text-sm">Monthly Average</p>
            <p className="text-3xl font-bold mt-2">
              {Math.round((data?.totalProjectedValue || 0) / timeframe).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Projection Chart */}
        <div className="rounded-xl p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Cumulative Points by Ecosystem</h3>
          <div className="h-80">
            {isLoading ? (
              <div className="animate-pulse h-full bg-gray-100 rounded" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.projections || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(m: number) => `Month ${m}`}
                  />
                  <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => v.toLocaleString()} />
                  <Legend />
                  {Object.keys(ECOSYSTEM_COLORS).map((eco) => (
                    <Area
                      key={eco}
                      type="monotone"
                      dataKey={eco}
                      stackId="1"
                      stroke={ECOSYSTEM_COLORS[eco]}
                      fill={ECOSYSTEM_COLORS[eco]}
                      fillOpacity={0.6}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly Spend Summary */}
        <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold">Average Monthly Spending</h3>
            <p className="text-sm text-gray-500 mt-1">Based on last 3 months</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">Category</th>
                  <th className="text-right px-5 py-3 text-sm font-medium text-gray-500">Monthly Avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {Object.entries(data?.monthlySpend || {})
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([category, amount]) => (
                    <tr key={category} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-5 py-3 font-medium">
                        {category.replace(/_/g, ' ')}
                      </td>
                      <td className="px-5 py-3 text-right">
                        ${(amount as number).toFixed(0)}
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
