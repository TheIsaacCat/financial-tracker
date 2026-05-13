'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register(form.email, form.password, form.firstName, form.lastName);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Create account</h1>
        {error && <p className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <label className="block mb-4">
            <span className="block text-sm font-medium mb-1">First name</span>
            <input className="w-full border rounded px-3 py-2" value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} />
          </label>
          <label className="block mb-4">
            <span className="block text-sm font-medium mb-1">Last name</span>
            <input className="w-full border rounded px-3 py-2" value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} />
          </label>
        </div>
        <label className="block mb-4">
          <span className="block text-sm font-medium mb-1">Email</span>
          <input className="w-full border rounded px-3 py-2" value={form.email} onChange={(event) => updateField('email', event.target.value)} type="email" required />
        </label>
        <label className="block mb-6">
          <span className="block text-sm font-medium mb-1">Password</span>
          <input className="w-full border rounded px-3 py-2" value={form.password} onChange={(event) => updateField('password', event.target.value)} type="password" required minLength={8} />
        </label>
        <button disabled={submitting} className="w-full bg-blue-600 text-white py-2 rounded font-semibold disabled:opacity-50">
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
        <p className="text-sm text-gray-600 mt-4">
          Already registered? <Link href="/login" className="text-blue-600 font-semibold">Log in</Link>
        </p>
      </form>
    </main>
  );
}
