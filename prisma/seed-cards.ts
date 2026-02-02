import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CardProductData {
  name: string;
  issuer: string;
  currencyType: 'points' | 'cashback';
  pointsCurrency?: string;
  annualFee: number;
  baseEarnRate: number;
  categoryMultipliers: Record<string, number>;
  signupBonusPoints: number;
  signupSpendRequirement: number;
  signupTimeMonths: number;
}

export const CARD_PRODUCTS: CardProductData[] = [
  {
    name: 'American Express Gold Card',
    issuer: 'American Express',
    currencyType: 'points',
    pointsCurrency: 'Amex Membership Rewards',
    annualFee: 325,
    baseEarnRate: 1,
    categoryMultipliers: {
      dining: 4,
      groceries: 4,
      travel: 3,
      airfare: 3,
    },
    signupBonusPoints: 60000,
    signupSpendRequirement: 4000,
    signupTimeMonths: 6,
  },
  {
    name: 'Chase Sapphire Preferred',
    issuer: 'Chase',
    currencyType: 'points',
    pointsCurrency: 'Chase Ultimate Rewards',
    annualFee: 95,
    baseEarnRate: 1,
    categoryMultipliers: {
      dining: 3,
      travel: 2,
      streaming: 3,
      groceries: 3,
    },
    signupBonusPoints: 60000,
    signupSpendRequirement: 4000,
    signupTimeMonths: 3,
  },
  {
    name: 'Chase Sapphire Reserve',
    issuer: 'Chase',
    currencyType: 'points',
    pointsCurrency: 'Chase Ultimate Rewards',
    annualFee: 550,
    baseEarnRate: 1,
    categoryMultipliers: {
      dining: 3,
      travel: 3,
      airfare: 5,
      hotels: 10,
    },
    signupBonusPoints: 60000,
    signupSpendRequirement: 4000,
    signupTimeMonths: 3,
  },
  {
    name: 'Capital One Venture X',
    issuer: 'Capital One',
    currencyType: 'points',
    pointsCurrency: 'Capital One Miles',
    annualFee: 395,
    baseEarnRate: 2,
    categoryMultipliers: {
      airfare: 5,
      hotels: 10,
      car_rental: 10,
    },
    signupBonusPoints: 75000,
    signupSpendRequirement: 4000,
    signupTimeMonths: 3,
  },
  {
    name: 'Citi Double Cash',
    issuer: 'Citi',
    currencyType: 'cashback',
    annualFee: 0,
    baseEarnRate: 2,
    categoryMultipliers: {},
    signupBonusPoints: 0,
    signupSpendRequirement: 0,
    signupTimeMonths: 0,
  },
  {
    name: 'Amex Blue Cash Preferred',
    issuer: 'American Express',
    currencyType: 'cashback',
    annualFee: 95,
    baseEarnRate: 1,
    categoryMultipliers: {
      groceries: 6,
      gas: 3,
      transit: 3,
      streaming: 6,
    },
    signupBonusPoints: 300,
    signupSpendRequirement: 3000,
    signupTimeMonths: 6,
  },
  {
    name: 'Chase Freedom Flex',
    issuer: 'Chase',
    currencyType: 'cashback',
    annualFee: 0,
    baseEarnRate: 1,
    categoryMultipliers: {
      rotating: 5,
      travel_chase: 5,
      dining: 3,
      drugstores: 3,
    },
    signupBonusPoints: 200,
    signupSpendRequirement: 500,
    signupTimeMonths: 3,
  },
  {
    name: 'Discover it Cash Back',
    issuer: 'Discover',
    currencyType: 'cashback',
    annualFee: 0,
    baseEarnRate: 1,
    categoryMultipliers: {
      rotating: 5,
    },
    signupBonusPoints: 0,
    signupSpendRequirement: 0,
    signupTimeMonths: 12,
  },
  {
    name: 'Capital One Savor',
    issuer: 'Capital One',
    currencyType: 'cashback',
    annualFee: 95,
    baseEarnRate: 1,
    categoryMultipliers: {
      dining: 4,
      entertainment: 4,
      streaming: 4,
      groceries: 3,
    },
    signupBonusPoints: 300,
    signupSpendRequirement: 3000,
    signupTimeMonths: 3,
  },
  {
    name: 'Chase Freedom Unlimited',
    issuer: 'Chase',
    currencyType: 'cashback',
    annualFee: 0,
    baseEarnRate: 1.5,
    categoryMultipliers: {
      travel_chase: 5,
      dining: 3,
      drugstores: 3,
    },
    signupBonusPoints: 200,
    signupSpendRequirement: 500,
    signupTimeMonths: 3,
  },
];

export async function seedCardProducts(): Promise<void> {
  console.log('Seeding card products...');

  for (const card of CARD_PRODUCTS) {
    const existing = await prisma.cardProduct.findFirst({
      where: { name: card.name },
    });

    if (existing) {
      await prisma.cardProduct.update({
        where: { id: existing.id },
        data: {
          issuer: card.issuer,
          currencyType: card.currencyType,
          pointsCurrency: card.pointsCurrency,
          annualFee: card.annualFee,
          baseEarnRate: card.baseEarnRate,
          categoryMultipliers: card.categoryMultipliers,
          signupBonusPoints: card.signupBonusPoints,
          signupSpendRequirement: card.signupSpendRequirement,
          signupTimeMonths: card.signupTimeMonths,
        },
      });
    } else {
      await prisma.cardProduct.create({
        data: {
          name: card.name,
          issuer: card.issuer,
          currencyType: card.currencyType,
          pointsCurrency: card.pointsCurrency,
          annualFee: card.annualFee,
          baseEarnRate: card.baseEarnRate,
          categoryMultipliers: card.categoryMultipliers,
          signupBonusPoints: card.signupBonusPoints,
          signupSpendRequirement: card.signupSpendRequirement,
          signupTimeMonths: card.signupTimeMonths,
        },
      });
    }

    console.log(`Seeded: ${card.name}`);
  }

  console.log('Card products seeded successfully');
}
