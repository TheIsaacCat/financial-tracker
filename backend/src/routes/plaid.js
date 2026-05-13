const express = require('express');
const plaidService = require('../services/plaidService');
const { PlaidAccount } = require('../models');
const router = express.Router();

// Create link token
router.post('/link-token', async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const linkToken = await plaidService.createLinkToken(req.userId);
    res.json({ linkToken });
  } catch (error) {
    next(error);
  }
});

// Exchange public token
router.post('/exchange-token', async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { publicToken } = req.body;
    if (!publicToken) {
      return res.status(400).json({ error: 'Public token required' });
    }

    const accounts = await plaidService.exchangePublicToken(publicToken, req.userId);
    res.json({ accounts });
  } catch (error) {
    next(error);
  }
});

// Sync transactions
router.post('/sync', async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await plaidService.syncTransactions(req.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get linked accounts
router.get('/accounts', async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const accounts = await PlaidAccount.findAll({
      where: { userId: req.userId },
    });

    res.json({ accounts });
  } catch (error) {
    next(error);
  }
});

// Remove account
router.delete('/accounts/:accountId', async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const account = await PlaidAccount.findByPk(req.params.accountId);
    if (!account || account.userId !== req.userId) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const result = await plaidService.removeAccount(req.params.accountId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
