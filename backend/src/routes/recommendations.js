const express = require('express');
const { Transaction } = require('../models');

const router = express.Router();

function decimal(value) {
  return Number.parseFloat(value || 0);
}

async function spendingByGroup(userId) {
  const transactions = await Transaction.findAll({ where: { userId } });
  const groups = {};

  transactions.forEach((transaction) => {
    const amount = decimal(transaction.amount);
    if (amount <= 0) return;

    const group = transaction.group || 'Other';
    groups[group] = groups[group] || { total: 0, count: 0 };
    groups[group].total += amount;
    groups[group].count += 1;
  });

  return groups;
}

router.get('/analysis', async (req, res, next) => {
  try {
    const groups = await spendingByGroup(req.userId);
    const totalSpent = Object.values(groups).reduce((sum, group) => sum + group.total, 0);

    res.json({ totalSpent, groups });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const groups = await spendingByGroup(req.userId);
    const totalSpent = Object.values(groups).reduce((sum, group) => sum + group.total, 0);

    const recommendations = Object.entries(groups)
      .filter(([, group]) => totalSpent > 0 && group.total / totalSpent > 0.2)
      .map(([name, group]) => ({
        title: `Review ${name.toLowerCase()} spending`,
        category: name,
        message: `${name} makes up ${Math.round((group.total / totalSpent) * 100)}% of tracked spending.`,
        potentialSavings: Math.round(group.total * 0.1 * 100) / 100,
      }));

    if (recommendations.length === 0) {
      recommendations.push({
        title: 'Build your spending baseline',
        category: 'General',
        message: 'Connect accounts and group transactions to reveal savings opportunities.',
        potentialSavings: 0,
      });
    }

    res.json({ recommendations });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
