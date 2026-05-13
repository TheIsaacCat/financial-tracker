'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { plaidAPI, transactionAPI, recommendationsAPI } from '@/lib/api';
import PlaidLinkButton from '@/components/PlaidLinkButton';
import TransactionList from '@/components/TransactionList';
import RecommendationsPanel from '@/components/RecommendationsPanel';
import SpendingChart from '@/components/SpendingChart';

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsRes, transactionsRes, statsRes, recommendationsRes] = await Promise.all([
        plaidAPI.getAccounts(),
        transactionAPI.getTransactions({ limit: 50 }),
        transactionAPI.getStats(),
        recommendationsAPI.getRecommendations(),
      ]);

      setAccounts(accountsRes.data.accounts);
      setTransactions(transactionsRes.data.transactions);
      setStats(statsRes.data.stats);
      setRecommendations(recommendationsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Financial Tracker</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{user?.email}</span>
            <Link href="/statements" className="text-blue-600 font-semibold">
              Statements
            </Link>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Total Spent (30d)</p>
              <p className="text-3xl font-bold text-blue-600">${stats.totalSpent.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Transactions</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalTransactions}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Average</p>
              <p className="text-3xl font-bold text-blue-600">${stats.averageTransaction.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Labeled</p>
              <p className="text-3xl font-bold text-blue-600">{stats.labeledCount}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Connect Account */}
            {accounts.length === 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Get Started</h2>
                <p className="text-gray-600 mb-4">
                  Connect your bank account to start tracking your transactions.
                </p>
                <PlaidLinkButton onSuccess={loadData} />
              </div>
            )}

            {/* Spending Chart */}
            {transactions.length > 0 && (
              <SpendingChart transactions={transactions} />
            )}

            {/* Transactions */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
              {transactions.length > 0 ? (
                <TransactionList transactions={transactions} onRefresh={loadData} />
              ) : (
                <p className="text-gray-600">No transactions yet. Sync with Plaid to get started.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Connected Accounts */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Connected Accounts</h2>
                {accounts.length > 0 && (
                  <button
                    onClick={async () => {
                      await plaidAPI.syncTransactions();
                      await loadData();
                    }}
                    className="text-sm bg-gray-100 px-3 py-1 rounded font-semibold"
                  >
                    Sync
                  </button>
                )}
              </div>
              {accounts.length > 0 ? (
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div key={account.id} className="border-l-4 border-blue-600 pl-4">
                      <p className="font-semibold">{account.accountName}</p>
                      <p className="text-sm text-gray-600">{account.accountType}</p>
                      <p className="text-xs text-gray-500">{account.mask ? `***${account.mask}` : 'Account'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No accounts connected</p>
              )}
              <PlaidLinkButton onSuccess={loadData} />
            </div>

            {/* Recommendations */}
            {recommendations && (
              <RecommendationsPanel recommendations={recommendations} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
