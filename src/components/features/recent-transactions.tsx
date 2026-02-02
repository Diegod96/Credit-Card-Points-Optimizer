'use client';

import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

interface Transaction {
  id: string;
  merchantName: string;
  cardName: string;
  amount: number;
  pointsEarned: number;
  transactionDate: string;
}

interface TransactionsResponse {
  transactions: Transaction[];
}

export function RecentTransactions() {
  const { data, isLoading } = useQuery<TransactionsResponse>({
    queryKey: ['recent-transactions'],
    queryFn: () => fetch('/api/transactions?limit=5').then(r => r.json()),
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Earnings</h3>
        <a href="/transactions" className="text-sm font-medium text-indigo-600">
          View All
        </a>
      </div>
      <div className="space-y-3">
        {data?.transactions.map((tx: Transaction) => (
          <div 
            key={tx.id} 
            className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
          >
            <div className="flex-1">
              <p className="font-medium text-sm">{tx.merchantName}</p>
              <p className="text-xs text-gray-500">
                {tx.cardName} • {formatDistanceToNow(new Date(tx.transactionDate), { addSuffix: true })}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-sm">${tx.amount.toFixed(2)}</p>
              <p className="text-xs text-green-500">+{tx.pointsEarned.toLocaleString()} pts</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
