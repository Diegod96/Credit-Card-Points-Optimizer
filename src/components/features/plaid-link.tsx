'use client';

import { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';

interface PlaidLinkProps {
  onSuccess: (publicToken: string) => void;
  buttonText?: string;
}

export function PlaidLink({ onSuccess, buttonText = 'Link Account' }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/plaid/link-token', {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch link token');
        }

        const data = await response.json();
        setLinkToken(data.link_token);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkToken();
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token) => {
      onSuccess(public_token);
    },
    onExit: (err) => {
      if (err != null) {
        console.error('Plaid Link exited with error:', err);
        setError(err.display_message || 'Link failed');
      }
    },
  });

  if (isLoading) {
    return (
      <button disabled className="btn btn-loading">
        Loading...
      </button>
    );
  }

  if (error) {
    return (
      <div>
        <button disabled className="btn btn-error">
          Error
        </button>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <button
      onClick={() => open()}
      disabled={!ready}
      className="btn btn-primary"
    >
      {buttonText}
    </button>
  );
}
