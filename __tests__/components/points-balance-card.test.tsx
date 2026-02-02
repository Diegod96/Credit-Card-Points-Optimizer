import { render, screen } from '@testing-library/react';
import { PointsBalanceCard } from '@/components/features/points-balance-card';

describe('PointsBalanceCard', () => {
  const defaultProps = {
    ecosystem: 'AMEX_MR',
    ecosystemLabel: 'American Express MR',
    points: 125000,
    value: 2500,
    color: '#006FCF',
    trend: 15,
    showBalance: true,
  };

  it('renders ecosystem label', () => {
    render(<PointsBalanceCard {...defaultProps} />);
    expect(screen.getByText('American Express MR')).toBeInTheDocument();
  });

  it('displays points with correct formatting', () => {
    render(<PointsBalanceCard {...defaultProps} />);
    expect(screen.getByText('125,000')).toBeInTheDocument();
    expect(screen.getByText('pts')).toBeInTheDocument();
  });

  it('displays value with correct formatting', () => {
    render(<PointsBalanceCard {...defaultProps} />);
    expect(screen.getByText(/2,500/)).toBeInTheDocument();
  });

  it('shows positive trend with arrow', () => {
    render(<PointsBalanceCard {...defaultProps} trend={15} />);
    expect(screen.getByText('15%')).toBeInTheDocument();
  });

  it('shows negative trend with arrow', () => {
    render(<PointsBalanceCard {...defaultProps} trend={-5} />);
    expect(screen.getByText('5%')).toBeInTheDocument();
  });

  it('hides balance when showBalance is false', () => {
    render(<PointsBalanceCard {...defaultProps} showBalance={false} />);
    expect(screen.getByText('••••')).toBeInTheDocument();
  });
});
