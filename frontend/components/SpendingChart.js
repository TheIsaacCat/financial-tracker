'use client';

import { useMemo, useState } from 'react';
import {
  BarElement,
  BarController,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const COLORS = [
  '#2563eb',
  '#16a34a',
  '#f59e0b',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#475569',
];

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key) {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: 'short',
    year: '2-digit',
  });
}

function buildMonths(count) {
  const end = new Date();
  end.setDate(1);

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(end);
    date.setMonth(end.getMonth() - (count - index - 1));
    return monthKey(date);
  });
}

function money(value) {
  return Number.parseFloat(value || 0).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

export default function SpendingChart({ transactions }) {
  const [monthCount, setMonthCount] = useState(12);

  const chart = useMemo(() => {
    const months = buildMonths(monthCount);
    const monthSet = new Set(months);
    const totalsByGroup = {};
    const totalsByMonth = Object.fromEntries(months.map((month) => [month, 0]));

    transactions.forEach((transaction) => {
      const amount = Number.parseFloat(transaction.amount || 0);
      if (amount <= 0 || !transaction.date) return;

      const key = transaction.date.slice(0, 7);
      if (!monthSet.has(key)) return;

      const group = transaction.group || transaction.label || 'Other';
      totalsByGroup[group] = totalsByGroup[group] || Object.fromEntries(months.map((month) => [month, 0]));
      totalsByGroup[group][key] += amount;
      totalsByMonth[key] += amount;
    });

    const groups = Object.entries(totalsByGroup)
      .map(([name, totals]) => ({
        name,
        totals,
        total: Object.values(totals).reduce((sum, value) => sum + value, 0),
      }))
      .filter((group) => group.total > 0)
      .sort((a, b) => b.total - a.total);

    const changeData = months.map((month, index) => {
      if (index === 0) return 0;
      return totalsByMonth[month] - totalsByMonth[months[index - 1]];
    });

    return {
      labels: months.map(monthLabel),
      datasets: [
        {
          type: 'bar',
          label: 'Change vs previous month',
          data: changeData,
          yAxisID: 'change',
          backgroundColor: changeData.map((value) =>
            value >= 0 ? 'rgba(220, 38, 38, 0.35)' : 'rgba(22, 163, 74, 0.35)'
          ),
          borderColor: changeData.map((value) =>
            value >= 0 ? 'rgba(220, 38, 38, 0.7)' : 'rgba(22, 163, 74, 0.7)'
          ),
          borderWidth: 1,
          borderRadius: 4,
          order: 2,
        },
        ...groups.map((group, index) => ({
          type: 'line',
          label: group.name,
          data: months.map((month) => group.totals[month]),
          yAxisID: 'spend',
          borderColor: COLORS[index % COLORS.length],
          backgroundColor: COLORS[index % COLORS.length],
          pointBackgroundColor: COLORS[index % COLORS.length],
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2,
          tension: 0.3,
          fill: false,
          order: 1,
        })),
      ],
    };
  }, [monthCount, transactions]);

  const hasData = chart.datasets.some((dataset) =>
    dataset.data.some((value) => Number.parseFloat(value || 0) !== 0)
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Monthly Spending By Type</h3>
          <p className="text-sm text-gray-600">
            Lines show spending by transaction type. Bars show month-to-month change.
          </p>
        </div>
        <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
          Months
          <input
            type="number"
            min="1"
            max="24"
            value={monthCount}
            onChange={(event) => {
              const nextValue = Number.parseInt(event.target.value, 10);
              if (Number.isNaN(nextValue)) return;
              setMonthCount(Math.min(Math.max(nextValue, 1), 24));
            }}
            className="w-20 rounded border border-gray-300 px-3 py-2 text-gray-900"
          />
        </label>
      </div>

      {hasData ? (
        <div className="overflow-x-auto pb-2">
          <div style={{ minWidth: `${Math.max(760, monthCount * 96)}px`, height: 440 }}>
            <Chart
              type="bar"
              data={chart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 14,
                      usePointStyle: true,
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.dataset.label}: ${money(context.parsed.y)}`,
                    },
                  },
                },
                scales: {
                  spend: {
                    type: 'linear',
                    position: 'left',
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => money(value),
                    },
                    title: {
                      display: true,
                      text: 'Spending',
                    },
                  },
                  change: {
                    type: 'linear',
                    position: 'right',
                    grid: {
                      drawOnChartArea: false,
                    },
                    ticks: {
                      callback: (value) => money(value),
                    },
                    title: {
                      display: true,
                      text: 'Change',
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      ) : (
        <p className="text-gray-600">No spending data is available for the selected period.</p>
      )}
    </div>
  );
}
