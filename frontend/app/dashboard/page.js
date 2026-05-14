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
      <div className="app-shell flex items-center justify-center">
        <div className="panel px-6 py-4 text-lg font-bold text-[#07131f]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <nav className="app-nav">
        <div className="app-container flex justify-between items-center py-4">
          <h1 className="flex items-center gap-3 text-lg font-black text-[#07131f]">
            <span className="brand-mark">F</span>
            Financial Tracker
          </h1>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm font-semibold text-[#46616b] sm:inline">{user?.email}</span>
            <Link href="/statements" className="text-sm font-bold text-[#0a7282] hover:text-[#07131f]">
              Statements
            </Link>
            <button
              onClick={logout}
              className="btn-secondary border-[#f0b3b3] text-[#9f1d1d] hover:border-[#9f1d1d] hover:bg-[#fff4f4]"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="app-container py-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="eyebrow mb-2">Dashboard</p>
              <h2 className="text-3xl font-black text-[#07131f]">Spending Trends</h2>
              <p className="mt-2 text-sm text-[#46616b]">
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
                  className="btn-secondary"
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

              <div className="panel overflow-hidden">
                <div className="border-b border-[#b9e4ec] px-6 py-5">
                  <p className="eyebrow mb-2">Ledger</p>
                  <h3 className="text-xl font-black text-[#07131f]">Transactions</h3>
                </div>
                <TransactionList transactions={transactions} onRefresh={loadData} />
              </div>
            </>
          ) : (
            <div className="panel p-8">
              <p className="text-[#46616b]">
                No transactions yet. Connect or sync an account to populate the chart.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
