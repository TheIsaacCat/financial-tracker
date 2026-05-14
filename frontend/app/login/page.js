'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to log in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="app-shell flex items-center justify-center px-4 py-12">
      <form onSubmit={handleSubmit} className="panel w-full max-w-md p-8">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <span className="brand-mark">F</span>
          <span className="text-sm font-black">Financial Tracker</span>
        </Link>
        <p className="eyebrow mb-2">Welcome back</p>
        <h1 className="mb-6 text-3xl font-black text-[#07131f]">Log in</h1>
        {error && <p className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}
        <label className="block mb-4">
          <span className="mb-1 block text-sm font-bold text-[#07131f]">Email</span>
          <input className="field" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label className="block mb-6">
          <span className="mb-1 block text-sm font-bold text-[#07131f]">Password</span>
          <input className="field" value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
        </label>
        <button disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
        <p className="mt-4 text-sm text-[#46616b]">
          No account yet? <Link href="/register" className="font-bold text-[#0a7282] hover:text-[#07131f]">Create one</Link>
        </p>
      </form>
    </main>
  );
}
