import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
            Financial Tracker
          </p>
          <h1 className="text-4xl font-bold mt-3 mb-4">
            Connect your bank accounts and understand your money.
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl">
            See transactions, monthly statement summaries, and grouped spending so you can spot patterns quickly.
          </p>
          <div className="flex gap-3 mt-8">
            <Link href="/register" className="bg-blue-600 text-white px-5 py-3 rounded font-semibold">
              Create account
            </Link>
            <Link href="/login" className="border border-gray-300 px-5 py-3 rounded font-semibold">
              Log in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
