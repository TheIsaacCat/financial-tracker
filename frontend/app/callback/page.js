'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <main className="app-shell flex items-center justify-center">
      <p className="panel px-6 py-4 text-sm font-bold text-neutral-600">Returning to your dashboard...</p>
    </main>
  );
}

