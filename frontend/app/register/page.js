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
    <main className="app-shell flex items-center justify-center px-4 py-12">
      <form onSubmit={handleSubmit} className="panel w-full max-w-md p-8">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <span className="brand-mark">F</span>
          <span className="text-sm font-black">Financial Tracker</span>
        </Link>
        <p className="eyebrow mb-2">Get started</p>
        <h1 className="mb-6 text-3xl font-black text-black">Create account</h1>
        {error && <p className="mb-4 rounded border border-black bg-neutral-100 p-3 text-black">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <label className="block mb-4">
            <span className="mb-1 block text-sm font-bold text-black">First name</span>
            <input className="field" value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} />
          </label>
          <label className="block mb-4">
            <span className="mb-1 block text-sm font-bold text-black">Last name</span>
            <input className="field" value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} />
          </label>
        </div>
        <label className="block mb-4">
          <span className="mb-1 block text-sm font-bold text-black">Email</span>
          <input className="field" value={form.email} onChange={(event) => updateField('email', event.target.value)} type="email" required />
        </label>
        <label className="block mb-6">
          <span className="mb-1 block text-sm font-bold text-black">Password</span>
          <input className="field" value={form.password} onChange={(event) => updateField('password', event.target.value)} type="password" required minLength={8} />
        </label>
        <button disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
        <p className="mt-4 text-sm text-neutral-600">
          Already registered? <Link href="/login" className="font-bold text-black hover:text-black">Log in</Link>
        </p>
      </form>
    </main>
  );
}

