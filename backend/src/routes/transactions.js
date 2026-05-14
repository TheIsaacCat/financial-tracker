const express = require('express');
const { Op, fn, col } = require('sequelize');
const { Transaction, PlaidAccount } = require('../models');

const router = express.Router();

function decimal(value) {
  return Number.parseFloat(value || 0);
}

router.get('/', async (req, res, next) => {
  try {
    const { limit = 50, group, startDate, endDate } = req.query;
    const where = { userId: req.userId };

    if (group) {
      where.group = group;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = startDate;
      if (endDate) where.date[Op.lte] = endDate;
    }

    const transactions = await Transaction.findAll({
      where,
      include: [{ model: PlaidAccount, attributes: ['accountName', 'accountType', 'mask'] }],
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      limit: Math.min(Number.parseInt(limit, 10) || 50, 5000),
    });

    res.json({ transactions });
  } catch (error) {
    next(error);
  }
});

router.get('/groups', async (req, res, next) => {
  try {
    const rows = await Transaction.findAll({
      where: { userId: req.userId },
      attributes: [
        'group',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('amount')), 'total'],
      ],
      group: ['group'],
      order: [[fn('SUM', col('amount')), 'DESC']],
      raw: true,
    });

    res.json({
      groups: rows.map((row) => ({
        group: row.group || 'Other',
        count: Number.parseInt(row.count, 10),
        total: decimal(row.total),
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/stats/summary', async (req, res, next) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const transactions = await Transaction.findAll({
      where: {
        userId: req.userId,
        date: { [Op.gte]: since.toISOString().slice(0, 10) },
      },
    });

    const totalSpent = transactions.reduce((sum, transaction) => {
      const amount = decimal(transaction.amount);
      return amount > 0 ? sum + amount : sum;
    }, 0);

    const labeledCount = transactions.filter((transaction) => transaction.label).length;
    const totalTransactions = transactions.length;

    res.json({
      stats: {
        totalSpent,
        totalTransactions,
        averageTransaction: totalTransactions ? totalSpent / totalTransactions : 0,
        labeledCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/label', async (req, res, next) => {
  try {
    const { label, notes, group } = req.body;
    const transaction = await Transaction.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    transaction.label = label || null;
    transaction.notes = notes || null;
    if (group) {
      transaction.group = group;
    } else if (label) {
      transaction.group = label;
    }

    await transaction.save();
    res.json({ transaction });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
