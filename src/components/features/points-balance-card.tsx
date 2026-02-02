'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PointsBalanceCardProps {
  ecosystem: string;
  ecosystemLabel: string;
  points: number;
  value: number;
  color: string;
  trend: number;
  showBalance?: boolean;
}

export function PointsBalanceCard({
  ecosystem,
  ecosystemLabel,
  points,
  value,
  color,
  trend,
  showBalance = true,
}: PointsBalanceCardProps) {
  return (
    <div className="rounded-xl p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{ecosystemLabel}</span>
        <div className={`flex items-center gap-1 text-xs ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">
          {showBalance ? points.toLocaleString() : '••••'}
        </span>
        <span className="text-sm text-gray-500">pts</span>
      </div>
      <div className="mt-1 text-sm text-gray-500">
        ≈ ${showBalance ? value.toLocaleString() : '••••'} value
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div 
          className="h-full rounded-full" 
          style={{ width: '65%', backgroundColor: color }} 
        />
      </div>
    </div>
  );
}
