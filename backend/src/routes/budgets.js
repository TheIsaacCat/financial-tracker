const express = require('express');
const { Op } = require('sequelize');
const { Budget, Transaction } = require('../models');

const router = express.Router();

function decimal(value) {
  return Number.parseFloat(value || 0);
}

function currentMonthRange() {
  const start = new Date();
  start.setDate(1);
  const end = new Date(start);
  end.setMonth(start.getMonth() + 1);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

async function getCurrentMonthSpending(userId) {
  const { startDate, endDate } = currentMonthRange();
  const transactions = await Transaction.findAll({
    where: {
      userId,
      amount: { [Op.gt]: 0 },
      date: {
        [Op.gte]: startDate,
        [Op.lt]: endDate,
      },
    },
    attributes: ['group', 'amount'],
  });

  return transactions.reduce((acc, transaction) => {
    const group = transaction.group || 'Other';
    acc[group] = (acc[group] || 0) + decimal(transaction.amount);
    return acc;
  }, {});
}

function serializeBudget(budget, spendingByGroup) {
  const monthlyLimit = decimal(budget.monthlyLimit);
  const spent = spendingByGroup[budget.group] || 0;

  return {
    id: budget.id,
    group: budget.group,
    monthlyLimit,
    spent,
    remaining: monthlyLimit - spent,
    percentUsed: monthlyLimit > 0 ? Math.round((spent / monthlyLimit) * 100) : 0,
  };
}

router.get('/', async (req, res, next) => {
  try {
    const [budgets, spendingByGroup] = await Promise.all([
      Budget.findAll({
        where: { userId: req.userId },
        order: [['group', 'ASC']],
      }),
      getCurrentMonthSpending(req.userId),
    ]);

    res.json({
      budgets: budgets.map((budget) => serializeBudget(budget, spendingByGroup)),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { group, monthlyLimit } = req.body;
    const parsedLimit = decimal(monthlyLimit);

    if (!group || parsedLimit <= 0) {
      return res.status(400).json({ error: 'Group and a positive monthly limit are required' });
    }

    const [budget, created] = await Budget.findOrCreate({
      where: { userId: req.userId, group },
      defaults: { monthlyLimit: parsedLimit },
    });

    if (!created) {
      budget.monthlyLimit = parsedLimit;
      await budget.save();
    }

    const spendingByGroup = await getCurrentMonthSpending(req.userId);
    res.status(201).json({ budget: serializeBudget(budget, spendingByGroup) });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { monthlyLimit } = req.body;
    const parsedLimit = decimal(monthlyLimit);

    if (parsedLimit <= 0) {
      return res.status(400).json({ error: 'A positive monthly limit is required' });
    }

    const budget = await Budget.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    budget.monthlyLimit = parsedLimit;
    await budget.save();

    const spendingByGroup = await getCurrentMonthSpending(req.userId);
    res.json({ budget: serializeBudget(budget, spendingByGroup) });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await budget.destroy();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
