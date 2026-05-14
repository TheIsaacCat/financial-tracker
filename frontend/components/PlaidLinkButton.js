'use client';

import { plaidAPI } from '@/lib/api';
import { useState } from 'react';

export default function PlaidLinkButton({ onSuccess }) {
  const [loading, setLoading] = useState(false);

  const onSuccess_ = async (publicToken, metadata) => {
    setLoading(true);
    try {
      await plaidAPI.exchangeToken(publicToken);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to exchange token:', error);
    } finally {
      setLoading(false);
    }
  };

  // For now, we'll use a simple button that creates a link token first
  const handleClick = async () => {
    setLoading(true);
    try {
      const response = await plaidAPI.createLinkToken();
      const linkToken = response.data.linkToken;
      
      // Open Plaid Link with the token
      const script = document.createElement('script');
      script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
      script.onload = () => {
        window.Plaid.create({
          token: linkToken,
          onSuccess: onSuccess_,
          onExit: () => setLoading(false),
        }).open();
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('Failed to create link token:', error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="btn-primary"
    >
      {loading ? 'Loading...' : 'Connect Bank Account'}
    </button>
  );
}
