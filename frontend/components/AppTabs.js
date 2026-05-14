import Link from 'next/link';

const tabs = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/statements', label: 'Statements' },
];

export default function AppTabs({ active }) {
  return (
    <div className="flex w-full gap-2 overflow-x-auto border-b border-black">
      {tabs.map((tab) => {
        const isActive = active === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`-mb-px border border-black px-5 py-2.5 text-sm font-black transition ${
              isActive
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
