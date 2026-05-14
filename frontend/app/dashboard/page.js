'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { plaidAPI, transactionAPI } from '@/lib/api';
import PlaidLinkButton from '@/components/PlaidLinkButton';
import SpendingChart from '@/components/SpendingChart';
import TransactionList from '@/components/TransactionList';

function chartStartDate() {
  const date = new Date();
  date.setMonth(date.getMonth() - 24);
  date.setDate(1);
  return date.toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
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
      const [accountsRes, transactionsRes] = await Promise.all([
        plaidAPI.getAccounts(),
        transactionAPI.getTransactions({ limit: 5000, startDate: chartStartDate() }),
      ]);

      setAccounts(accountsRes.data.accounts);
      setTransactions(transactionsRes.data.transactions);
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
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Spending Trends</h2>
              <p className="text-sm text-gray-600">
                Compare transaction types month by month.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {accounts.length > 0 && (
                <button
                  onClick={async () => {
                    await plaidAPI.syncTransactions();
                    await loadData();
                  }}
                  className="text-sm bg-white border border-gray-200 px-4 py-2 rounded font-semibold text-gray-800 hover:bg-gray-100"
                >
                  Sync
                </button>
              )}
              <PlaidLinkButton onSuccess={loadData} />
            </div>
          </div>

          {transactions.length > 0 ? (
            <>
              <SpendingChart transactions={transactions} />

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Transactions</h3>
                <TransactionList transactions={transactions} onRefresh={loadData} />
              </div>
            </>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow">
              <p className="text-gray-600">
                No transactions yet. Connect or sync an account to populate the chart.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
