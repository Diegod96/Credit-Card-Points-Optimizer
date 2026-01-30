import { CardProduct } from '@prisma/client';
import { SpendCategory, categorizeByMCC } from '../mcc-mapping';

export interface PointsCalculation {
  points: number;
  multiplier: number;
  currencyType: 'CASHBACK' | 'POINTS';
  pointsCurrency: string | null;
}

export interface OptimalCardResult {
  cardId: string;
  cardProduct: CardProduct;
  pointsCalculation: PointsCalculation;
}

export function calculatePoints(
  amount: number,
  category: SpendCategory,
  cardProduct: CardProduct
): PointsCalculation {
  const categoryMultipliers = cardProduct.categoryMultipliers as Record<string, number>;
  const multiplier = categoryMultipliers[category] ?? Number(cardProduct.baseEarnRate);
  
  const points = Math.floor(amount * multiplier);
  
  return {
    points,
    multiplier,
    currencyType: cardProduct.currencyType as 'CASHBACK' | 'POINTS',
    pointsCurrency: cardProduct.pointsCurrency,
  };
}

export function calculateOptimalCard(
  amount: number,
  category: SpendCategory,
  userCards: Array<{
    id: string;
    cardProduct: CardProduct | null;
  }>
): OptimalCardResult | null {
  let bestCard: OptimalCardResult | null = null;
  let maxPoints = -1;

  for (const card of userCards) {
    if (!card.cardProduct) continue;
    
    const calculation = calculatePoints(amount, category, card.cardProduct);
    
    if (calculation.points > maxPoints) {
      maxPoints = calculation.points;
      bestCard = {
        cardId: card.id,
        cardProduct: card.cardProduct,
        pointsCalculation: calculation,
      };
    }
  }

  return bestCard;
}
