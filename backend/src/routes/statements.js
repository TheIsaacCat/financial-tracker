const express = require('express');
const { Op } = require('sequelize');
const { PlaidAccount, Statement, Transaction } = require('../models');

const router = express.Router();

function decimal(value) {
  return Number.parseFloat(value || 0);
}

function nextMonth(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthNumber, 1));
  return date.toISOString().slice(0, 7);
}

async function upsertMonthlyStatements(userId) {
  const accounts = await PlaidAccount.findAll({ where: { userId } });

  for (const account of accounts) {
    const transactions = await Transaction.findAll({
      where: { userId, plaidAccountId: account.id },
      order: [['date', 'ASC']],
    });

    const byMonth = new Map();
    transactions.forEach((transaction) => {
      const month = String(transaction.date).slice(0, 7);
      if (!byMonth.has(month)) {
        byMonth.set(month, { totalCredits: 0, totalDebits: 0 });
      }

      const summary = byMonth.get(month);
      const amount = decimal(transaction.amount);
      if (amount < 0) {
        summary.totalCredits += Math.abs(amount);
      } else {
        summary.totalDebits += amount;
      }
    });

    for (const [month, summary] of byMonth.entries()) {
      await Statement.upsert({
        userId,
        plaidAccountId: account.id,
        month,
        openingBalance: 0,
        closingBalance: summary.totalCredits - summary.totalDebits,
        totalCredits: summary.totalCredits,
        totalDebits: summary.totalDebits,
      });
    }
  }
}

router.get('/', async (req, res, next) => {
  try {
    await upsertMonthlyStatements(req.userId);

    const statements = await Statement.findAll({
      where: { userId: req.userId },
      include: [{ model: PlaidAccount, attributes: ['accountName', 'accountType', 'mask'] }],
      order: [['month', 'DESC']],
    });

    res.json({ statements });
  } catch (error) {
    next(error);
  }
});

router.get('/:month', async (req, res, next) => {
  try {
    const statements = await Statement.findAll({
      where: { userId: req.userId, month: req.params.month },
      include: [{ model: PlaidAccount, attributes: ['accountName', 'accountType', 'mask'] }],
      order: [['createdAt', 'DESC']],
    });

    const transactions = await Transaction.findAll({
      where: {
        userId: req.userId,
        date: {
          [Op.gte]: `${req.params.month}-01`,
          [Op.lt]: `${nextMonth(req.params.month)}-01`,
        },
      },
      order: [['date', 'DESC']],
    });

    res.json({ statements, transactions });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
