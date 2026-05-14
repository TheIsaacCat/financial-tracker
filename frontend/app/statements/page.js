'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { statementAPI } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';

function money(value) {
  return Number.parseFloat(value || 0).toLocaleString(undefined, {
    style: 'currency',
    currency: 'GBP',
  });
}

export default function StatementsPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    async function loadStatements() {
      try {
        const response = await statementAPI.getStatements();
        setStatements(response.data.statements);
      } finally {
        setLoading(false);
      }
    }

    loadStatements();
  }, [user]);

  if (authLoading || loading) {
    return <div className="app-shell flex items-center justify-center">Loading...</div>;
  }

  return (
    <main className="app-shell">
      <nav className="app-nav">
        <div className="app-container flex justify-between items-center py-4">
          <Link href="/dashboard" className="flex items-center gap-3 text-lg font-black text-[#07131f]">
            <span className="brand-mark">F</span>
            Financial Tracker
          </Link>
          <button onClick={logout} className="btn-secondary border-[#f0b3b3] text-[#9f1d1d] hover:border-[#9f1d1d] hover:bg-[#fff4f4]">
            Logout
          </button>
        </div>
      </nav>

      <section className="app-container py-8">
        <p className="eyebrow mb-2">Statements</p>
        <h1 className="mb-6 text-3xl font-black text-[#07131f]">Monthly Statements</h1>
        <div className="panel overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="table-head">
                <th className="p-4">Month</th>
                <th className="p-4">Account</th>
                <th className="p-4 text-right">Credits</th>
                <th className="p-4 text-right">Debits</th>
                <th className="p-4 text-right">Net</th>
              </tr>
            </thead>
            <tbody>
              {statements.map((statement) => (
                <tr key={statement.id} className="table-row">
                  <td className="p-4 font-medium">{statement.month}</td>
                  <td className="p-4">{statement.PlaidAccount?.accountName || 'Account'}</td>
                  <td className="p-4 text-right text-green-700">{money(statement.totalCredits)}</td>
                  <td className="p-4 text-right">{money(statement.totalDebits)}</td>
                  <td className="p-4 text-right font-semibold">{money(statement.closingBalance)}</td>
                </tr>
              ))}
              {statements.length === 0 && (
                <tr>
                  <td className="p-4 text-[#46616b]" colSpan="5">
                    No statements yet. Connect an account and sync transactions first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
