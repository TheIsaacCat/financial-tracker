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
    currency: 'USD',
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
          <tr className="border-b text-sm text-gray-500">
            <th className="py-2 pr-3">Date</th>
            <th className="py-2 pr-3">Merchant</th>
            <th className="py-2 pr-3">Account</th>
            <th className="py-2 pr-3">Type</th>
            <th className="py-2 pr-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b last:border-b-0">
              <td className="py-3 pr-3 text-sm whitespace-nowrap">{transaction.date}</td>
              <td className="py-3 pr-3">
                <p className="font-medium">{transaction.merchant || transaction.name}</p>
                {transaction.notes && <p className="text-xs text-gray-500">{transaction.notes}</p>}
              </td>
              <td className="py-3 pr-3 text-sm text-gray-600">
                {transaction.PlaidAccount?.accountName || 'Account'}
              </td>
              <td className="py-3 pr-3">
                <select
                  className="border rounded px-2 py-1 text-sm"
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
              <td className="py-3 pr-3 text-right font-semibold">{money(transaction.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
