'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaidLink } from 'react-plaid-link';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlaidLinkButtonProps {
  onSuccess?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export function PlaidLinkButton({
  onSuccess,
  variant = 'default',
  size = 'default',
  className,
  children,
}: PlaidLinkButtonProps) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onPlaidSuccess = async (publicToken: string) => {
    try {
      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token: publicToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange token');
      }

      const data = await response.json();
      
      if (data.success) {
        onSuccess?.();
        router.refresh();
      }
    } catch (error) {
      console.error('Error linking account:', error);
    }
  };

  const { open, ready } = usePlaidLink({
    token: token || '',
    onSuccess: onPlaidSuccess,
    onExit: () => {
      setIsLoading(false);
    },
  });

  const handleClick = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/plaid/link-token', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create link token');
      }

      const data = await response.json();
      setToken(data.link_token);
      
      // Wait for Plaid Link to be ready
      setTimeout(() => {
        if (ready) {
          open();
        }
      }, 100);
    } catch (error) {
      console.error('Error creating link token:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Plus className="mr-2 h-4 w-4" />
      )}
      {children || 'Link Card'}
    </Button>
  );
}
