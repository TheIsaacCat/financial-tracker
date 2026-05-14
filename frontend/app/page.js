import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="app-shell">
      <section className="app-container py-16">
        <div className="max-w-4xl">
          <div className="mb-8 flex items-center gap-3">
            <span className="brand-mark">F</span>
            <span className="text-sm font-black text-[#07131f]">Financial Tracker</span>
          </div>
          <p className="eyebrow">
            Financial Tracker
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight text-[#07131f]">
            Connect your bank accounts and understand your money.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#46616b]">
            See transactions, monthly statement summaries, and grouped spending so you can spot patterns quickly.
          </p>
          <div className="flex gap-3 mt-8">
            <Link href="/register" className="btn-primary">
              Create account
            </Link>
            <Link href="/login" className="btn-secondary">
              Log in
            </Link>
          </div>
          <div className="panel mt-12 grid gap-0 overflow-hidden md:grid-cols-3">
            {['Connect', 'Review', 'Refine'].map((item, index) => (
              <div key={item} className="border-b border-[#b9e4ec] p-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
                <p className="text-sm font-black text-[#0a7282]">{index + 1}</p>
                <h2 className="mt-3 text-lg font-black text-[#07131f]">{item}</h2>
                <p className="mt-2 text-sm leading-6 text-[#46616b]">
                  {index === 0 && 'Link accounts securely and pull transactions into one view.'}
                  {index === 1 && 'Compare monthly spending by type with a clear average baseline.'}
                  {index === 2 && 'Adjust transaction types so the picture gets sharper over time.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
