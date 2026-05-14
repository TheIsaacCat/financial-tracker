'use client';

import { useMemo, useState } from 'react';
import { budgetAPI } from '@/lib/api';

const GROUPS = [
  'Food',
  'Transportation',
  'Utilities',
  'Housing',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Income',
  'Subscriptions',
  'Other',
];

function money(value) {
  return Number.parseFloat(value || 0).toLocaleString(undefined, {
    style: 'currency',
    currency: 'GBP',
  });
}

export default function BudgetPanel({ budgets, onRefresh }) {
  const [group, setGroup] = useState('Food');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState({});
  const [error, setError] = useState('');

  const usedGroups = useMemo(() => new Set(budgets.map((budget) => budget.group)), [budgets]);
  const availableGroups = GROUPS.filter((item) => !usedGroups.has(item));

  const createBudget = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      await budgetAPI.saveBudget(group, monthlyLimit);
      setMonthlyLimit('');
      setGroup(availableGroups.find((item) => item !== group) || 'Food');
      await onRefresh?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to save budget');
    } finally {
      setSaving(false);
    }
  };

  const updateBudget = async (budget) => {
    const nextLimit = editing[budget.id] ?? budget.monthlyLimit;
    setError('');
    setSaving(true);

    try {
      await budgetAPI.updateBudget(budget.id, nextLimit);
      setEditing((current) => {
        const next = { ...current };
        delete next[budget.id];
        return next;
      });
      await onRefresh?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update budget');
    } finally {
      setSaving(false);
    }
  };

  const deleteBudget = async (budget) => {
    setError('');
    setSaving(true);

    try {
      await budgetAPI.deleteBudget(budget.id);
      await onRefresh?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to delete budget');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-black px-6 py-5">
        <p className="eyebrow mb-2">Budgets</p>
        <h3 className="text-xl font-black text-black">Monthly Limits</h3>
        <p className="mt-1 text-sm text-neutral-600">
          Track current-month spending against your target by transaction type.
        </p>
      </div>

      <div className="space-y-5 p-6">
        {error && <p className="rounded border border-black bg-neutral-100 p-3 text-sm font-bold">{error}</p>}

        <form onSubmit={createBudget} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <label className="block">
            <span className="mb-1 block text-sm font-bold">Type</span>
            <select
              className="field"
              value={group}
              onChange={(event) => setGroup(event.target.value)}
              disabled={availableGroups.length === 0 || saving}
            >
              {(availableGroups.length ? availableGroups : GROUPS).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold">Monthly limit</span>
            <input
              className="field"
              type="number"
              min="1"
              step="0.01"
              value={monthlyLimit}
              onChange={(event) => setMonthlyLimit(event.target.value)}
              placeholder="500"
              disabled={saving}
              required
            />
          </label>
          <button className="btn-primary self-end" disabled={saving || availableGroups.length === 0}>
            Add Budget
          </button>
        </form>

        {budgets.length > 0 ? (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const percent = Math.min(budget.percentUsed, 999);
              const progressWidth = `${Math.min(percent, 100)}%`;
              const overBudget = budget.spent > budget.monthlyLimit;

              return (
                <div key={budget.id} className="rounded border border-black p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h4 className="text-lg font-black">{budget.group}</h4>
                      <p className="text-sm text-neutral-600">
                        {money(budget.spent)} spent of {money(budget.monthlyLimit)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        className="field w-32"
                        type="number"
                        min="1"
                        step="0.01"
                        value={editing[budget.id] ?? budget.monthlyLimit}
                        onChange={(event) =>
                          setEditing((current) => ({
                            ...current,
                            [budget.id]: event.target.value,
                          }))
                        }
                      />
                      <button className="btn-secondary" disabled={saving} onClick={() => updateBudget(budget)}>
                        Save
                      </button>
                      <button className="btn-secondary" disabled={saving} onClick={() => deleteBudget(budget)}>
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 h-4 overflow-hidden rounded border border-black bg-white">
                    <div
                      className={overBudget ? 'h-full bg-red-600' : 'h-full bg-black'}
                      style={{ width: progressWidth }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs font-bold uppercase tracking-wide">
                    <span>{percent}% used</span>
                    <span className={overBudget ? 'text-red-700' : 'text-neutral-600'}>
                      {overBudget
                        ? `${money(Math.abs(budget.remaining))} over`
                        : `${money(budget.remaining)} left`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-neutral-600">No budgets yet. Add a monthly limit to start tracking.</p>
        )}
      </div>
    </div>
  );
}
