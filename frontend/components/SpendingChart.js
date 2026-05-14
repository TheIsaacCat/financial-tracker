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
  '#006d77',
  '#0f172a',
  '#f59e0b',
  '#d946ef',
  '#2563eb',
  '#16a34a',
  '#ea580c',
  '#7c3aed',
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
    currency: 'GBP',
    maximumFractionDigits: 0,
  });
}

export default function SpendingChart({ transactions }) {
  const [monthCount, setMonthCount] = useState(6);

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

    const monthlyTotals = months.map((month) => totalsByMonth[month]);
    const averageMonthlySpending =
      monthlyTotals.reduce((sum, value) => sum + value, 0) / months.length;
    const changeData = monthlyTotals.map((total) => total - averageMonthlySpending);
    const maxAbsChange = Math.max(
      1,
      ...changeData.map((value) => Math.abs(value))
    );

    return {
      averageMonthlySpending,
      maxAbsChange,
      data: {
        labels: months.map(monthLabel),
        datasets: [
          {
            type: 'bar',
            label: 'Change',
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
          {
            type: 'line',
            label: 'Average monthly spending',
            data: months.map(() => 0),
            yAxisID: 'change',
            borderColor: '#07131f',
            backgroundColor: '#07131f',
            pointRadius: 0,
            pointHoverRadius: 4,
            borderWidth: 5,
            tension: 0,
            fill: false,
            order: 0,
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
      },
    };
  }, [monthCount, transactions]);

  const hasData = chart.data.datasets.some((dataset) =>
    dataset.data.some((value) => Number.parseFloat(value || 0) !== 0)
  );

  return (
    <div className="panel p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow mb-2">Trends</p>
          <h3 className="text-xl font-black text-[#07131f]">Monthly Spending By Type</h3>
          <p className="mt-1 text-sm text-[#46616b]">
            Lines show spending by transaction type. Bars show change versus average.
          </p>
        </div>
        <label className="flex items-center gap-3 text-sm font-bold text-[#07131f]">
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
            className="field w-20"
          />
        </label>
      </div>

      {hasData ? (
        <div className="overflow-x-auto pb-2">
          <div
            className="relative"
            style={{ minWidth: `${Math.max(760, monthCount * 96)}px`, height: 440 }}
          >
            <Chart
              type="bar"
              data={chart.data}
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
                      color: '#07131f',
                      font: {
                        weight: 700,
                      },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        if (context.dataset.label === 'Average monthly spending') {
                          return `${context.dataset.label}: ${money(chart.averageMonthlySpending)}`;
                        }

                        return `${context.dataset.label}: ${money(context.parsed.y)}`;
                      },
                    },
                  },
                },
                scales: {
                  spend: {
                    type: 'linear',
                    position: 'left',
                    beginAtZero: true,
                    ticks: {
                      color: '#46616b',
                      callback: (value) => money(value),
                    },
                    title: {
                      display: true,
                      text: 'Spending',
                      color: '#07131f',
                    },
                  },
                  change: {
                    type: 'linear',
                    position: 'right',
                    min: -chart.maxAbsChange,
                    max: chart.maxAbsChange,
                    grid: {
                      drawOnChartArea: false,
                    },
                    ticks: {
                      color: '#46616b',
                      callback: (value) => money(value),
                    },
                    title: {
                      display: true,
                      text: 'Change',
                      color: '#07131f',
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
        <p className="text-[#46616b]">No spending data is available for the selected period.</p>
      )}
    </div>
  );
}
