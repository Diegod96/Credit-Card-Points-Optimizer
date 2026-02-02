import { render, screen } from '@testing-library/react';
import { RecentTransactions } from '@/components/features/recent-transactions';

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('date-fns', () => ({
  formatDistanceToNow: () => '2 days ago',
}));

import { useQuery } from '@tanstack/react-query';

const mockedUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

describe('RecentTransactions', () => {
  it('renders loading state', () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<RecentTransactions />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders transactions', () => {
    mockedUseQuery.mockReturnValue({
      data: {
        transactions: [
          {
            id: '1',
            merchantName: 'Starbucks',
            cardName: 'Amex Gold',
            amount: 5.67,
            pointsEarned: 23,
            transactionDate: '2024-01-15',
          },
          {
            id: '2',
            merchantName: 'Whole Foods',
            cardName: 'Amex Gold',
            amount: 127.43,
            pointsEarned: 510,
            transactionDate: '2024-01-14',
          },
        ],
      },
      isLoading: false,
      error: null,
    } as any);

    render(<RecentTransactions />);
    expect(screen.getByText('Recent Earnings')).toBeInTheDocument();
    expect(screen.getByText('Starbucks')).toBeInTheDocument();
    expect(screen.getByText('$5.67')).toBeInTheDocument();
    expect(screen.getByText('+23 pts')).toBeInTheDocument();
  });
});
