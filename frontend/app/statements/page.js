'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { statementAPI } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';

function money(value) {
  return Number.parseFloat(value || 0).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-blue-600">Financial Tracker</Link>
          <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Logout
          </button>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Monthly Statements</h1>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-sm text-gray-500">
                <th className="p-4">Month</th>
                <th className="p-4">Account</th>
                <th className="p-4 text-right">Credits</th>
                <th className="p-4 text-right">Debits</th>
                <th className="p-4 text-right">Net</th>
              </tr>
            </thead>
            <tbody>
              {statements.map((statement) => (
                <tr key={statement.id} className="border-b last:border-b-0">
                  <td className="p-4 font-medium">{statement.month}</td>
                  <td className="p-4">{statement.PlaidAccount?.accountName || 'Account'}</td>
                  <td className="p-4 text-right text-green-700">{money(statement.totalCredits)}</td>
                  <td className="p-4 text-right">{money(statement.totalDebits)}</td>
                  <td className="p-4 text-right font-semibold">{money(statement.closingBalance)}</td>
                </tr>
              ))}
              {statements.length === 0 && (
                <tr>
                  <td className="p-4 text-gray-600" colSpan="5">
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
