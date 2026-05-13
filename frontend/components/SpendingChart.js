'use client';

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SpendingChart({ transactions }) {
  const grouped = transactions.reduce((acc, transaction) => {
    const amount = Number.parseFloat(transaction.amount || 0);
    if (amount <= 0) return acc;

    const group = transaction.group || transaction.label || 'Other';
    acc[group] = (acc[group] || 0) + amount;
    return acc;
  }, {});

  const labels = Object.keys(grouped);
  const values = Object.values(grouped);

  if (labels.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Spending By Type</h2>
      <div className="max-w-md mx-auto">
        <Doughnut
          data={{
            labels,
            datasets: [
              {
                data: values,
                backgroundColor: ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2', '#64748b'],
              },
            ],
          }}
        />
      </div>
    </div>
  );
}
