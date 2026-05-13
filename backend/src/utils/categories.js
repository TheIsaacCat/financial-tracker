const GROUP_KEYWORDS = [
  ['Food', ['restaurant', 'cafe', 'coffee', 'grocery', 'market', 'food', 'dining']],
  ['Transportation', ['uber', 'lyft', 'fuel', 'gas', 'parking', 'train', 'transit', 'taxi']],
  ['Utilities', ['electric', 'water', 'gas bill', 'internet', 'phone', 'utility']],
  ['Housing', ['rent', 'mortgage', 'property']],
  ['Entertainment', ['netflix', 'spotify', 'cinema', 'movie', 'concert', 'game']],
  ['Shopping', ['amazon', 'store', 'shop', 'retail', 'target', 'walmart']],
  ['Healthcare', ['pharmacy', 'doctor', 'medical', 'health', 'dental']],
  ['Income', ['payroll', 'salary', 'deposit', 'interest']],
  ['Subscriptions', ['subscription', 'membership']],
];

function inferTransactionGroup(transaction) {
  const plaidCategory =
    transaction.personal_finance_category?.primary ||
    transaction.category?.primary ||
    transaction.category;
  const categoryText = Array.isArray(plaidCategory)
    ? plaidCategory.join(' ')
    : JSON.stringify(plaidCategory || '');
  const searchable = `${transaction.name || ''} ${transaction.merchant_name || ''} ${categoryText}`.toLowerCase();

  const match = GROUP_KEYWORDS.find(([, keywords]) =>
    keywords.some((keyword) => searchable.includes(keyword))
  );

  return match ? match[0] : 'Other';
}

module.exports = { inferTransactionGroup };
