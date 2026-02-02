import { render, screen } from '@testing-library/react';
import { BestCardWidget } from '@/components/features/best-card-widget';

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

import { useQuery } from '@tanstack/react-query';

const mockedUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

describe('BestCardWidget', () => {
  it('renders loading state', () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<BestCardWidget />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders recommendations', () => {
    mockedUseQuery.mockReturnValue({
      data: {
        recommendations: [
          {
            category: 'DINING',
            categoryLabel: 'Dining',
            cardName: 'Amex Gold',
            multiplier: 4,
            color: '#FFD700',
          },
          {
            category: 'GROCERIES',
            categoryLabel: 'Groceries',
            cardName: 'Amex Gold',
            multiplier: 4,
            color: '#FFD700',
          },
        ],
      },
      isLoading: false,
      error: null,
    } as any);

    render(<BestCardWidget />);
    expect(screen.getByText('Best Card to Use')).toBeInTheDocument();
    expect(screen.getByText(/Dining/)).toBeInTheDocument();
    expect(screen.getByText(/Groceries/)).toBeInTheDocument();
    // Multiple cards may have the same name
    expect(screen.getAllByText('Amex Gold')).toHaveLength(2);
    expect(screen.getAllByText('4x')).toHaveLength(2);
  });
});
