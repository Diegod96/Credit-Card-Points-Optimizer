'use client';

import { useQuery } from '@tanstack/react-query';

const CATEGORY_ICONS: Record<string, string> = {
  DINING: '🍽️',
  GROCERIES: '🛒',
  TRAVEL_AIR: '✈️',
  GAS: '⛽',
  STREAMING: '📺',
  WHOLESALE_CLUB: '🏪',
  TRAVEL_HOTEL: '🏨',
  TRANSIT: '🚇',
  RIDESHARE: '🚗',
  ENTERTAINMENT: '🎭',
  FITNESS: '💪',
  DRUGSTORE: '💊',
  PHONE_INTERNET: '📱',
  OTHER: '📦',
};

interface Recommendation {
  category: string;
  categoryLabel: string;
  cardName: string;
  multiplier: number;
  color: string;
}

interface BestCardsResponse {
  recommendations: Recommendation[];
}

export function BestCardWidget() {
  const { data, isLoading } = useQuery<BestCardsResponse>({
    queryKey: ['best-cards'],
    queryFn: () => fetch('/api/cards/best-by-category').then(r => r.json()),
  });

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-gray-100 rounded-xl" />;
  }

  return (
    <div className="rounded-xl p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Best Card to Use</h3>
      <div className="space-y-3">
        {data?.recommendations.slice(0, 6).map((rec: Recommendation) => (
          <div 
            key={rec.category} 
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
          >
            <span className="font-medium flex items-center gap-2">
              {CATEGORY_ICONS[rec.category] || '📦'} {rec.categoryLabel}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{rec.cardName}</span>
              <span 
                className="px-2 py-1 text-xs font-bold rounded-full text-white"
                style={{ backgroundColor: rec.color }}
              >
                {rec.multiplier}x
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
