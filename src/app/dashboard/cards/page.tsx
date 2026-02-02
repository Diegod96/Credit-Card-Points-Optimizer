'use client';

import { useQuery } from '@tanstack/react-query';
import { CreditCard, Plus } from 'lucide-react';

interface CardProduct {
  id: string;
  name: string;
  issuer: string;
  currencyType: string;
  pointsCurrency: string | null;
  annualFee: number;
  baseEarnRate: number;
  categoryMultipliers: Record<string, number>;
  signupBonusPoints: number;
}

interface Card {
  id: string;
  lastFour: string | null;
  nickname: string | null;
  isActive: boolean;
  cardProduct: CardProduct | null;
}

interface CardsResponse {
  cards: Card[];
}

export default function MyCardsPage() {
  const { data, isLoading } = useQuery<CardsResponse>({
    queryKey: ['my-cards'],
    queryFn: () => fetch('/api/cards').then(r => r.json()),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Cards</h1>
          <p className="text-gray-500 mt-1">Manage your linked credit cards</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus className="w-4 h-4" />
          Link New Card
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse h-48 bg-gray-100 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data?.cards.map((card: Card) => (
            <CardItem key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}

function CardItem({ card }: { card: Card }) {
  const product = card.cardProduct;
  
  return (
    <div className="rounded-xl p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-8 bg-gradient-to-r from-gray-700 to-gray-900 rounded-md flex items-center justify-center">
            <CreditCard className="w-6 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">
              {product?.name || card.nickname || 'Unknown Card'}
            </h3>
            <p className="text-sm text-gray-500">
              {product?.issuer} •••• {card.lastFour || '****'}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          card.isActive 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-500'
        }`}>
          {card.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {product && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Annual Fee</span>
            <span className="font-medium">${product.annualFee}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Base Earn Rate</span>
            <span className="font-medium">{product.baseEarnRate}x</span>
          </div>

          {product.signupBonusPoints > 0 && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <p className="text-xs font-medium text-green-600 dark:text-green-400">
                Sign-up Bonus
              </p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {product.signupBonusPoints.toLocaleString()} pts
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-500 mb-2">Top Categories</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(product.categoryMultipliers || {})
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([category, rate]) => (
                  <span 
                    key={category} 
                    className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700"
                  >
                    {category.replace(/_/g, ' ')}: <strong>{rate}x</strong>
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
