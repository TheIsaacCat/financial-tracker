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
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Log in</h1>
        {error && <p className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</p>}
        <label className="block mb-4">
          <span className="block text-sm font-medium mb-1">Email</span>
          <input className="w-full border rounded px-3 py-2" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label className="block mb-6">
          <span className="block text-sm font-medium mb-1">Password</span>
          <input className="w-full border rounded px-3 py-2" value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
        </label>
        <button disabled={submitting} className="w-full bg-blue-600 text-white py-2 rounded font-semibold disabled:opacity-50">
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
        <p className="text-sm text-gray-600 mt-4">
          No account yet? <Link href="/register" className="text-blue-600 font-semibold">Create one</Link>
        </p>
      </form>
    </main>
  );
}
