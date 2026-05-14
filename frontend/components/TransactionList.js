'use client';

import { useState } from 'react';
import { transactionAPI } from '@/lib/api';

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

export default function TransactionList({ transactions, onRefresh }) {
  const [savingId, setSavingId] = useState(null);

  const updateGroup = async (transaction, group) => {
    setSavingId(transaction.id);
    try {
      await transactionAPI.labelTransaction(transaction.id, transaction.label || group, transaction.notes || '', group);
      await onRefresh?.();
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="table-head">
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Merchant</th>
            <th className="px-4 py-3">Account</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="table-row">
              <td className="px-4 py-3 text-sm whitespace-nowrap text-neutral-600">{transaction.date}</td>
              <td className="px-4 py-3">
                <p className="font-semibold text-black">{transaction.merchant || transaction.name}</p>
                {transaction.notes && <p className="text-xs text-neutral-500">{transaction.notes}</p>}
              </td>
              <td className="px-4 py-3 text-sm text-neutral-600">
                {transaction.PlaidAccount?.accountName || 'Account'}
              </td>
              <td className="px-4 py-3">
                <select
                  className="field min-w-36 py-1.5 text-sm"
                  value={transaction.group || 'Other'}
                  disabled={savingId === transaction.id}
                  onChange={(event) => updateGroup(transaction, event.target.value)}
                >
                  {GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 text-right font-bold text-black">{money(transaction.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

