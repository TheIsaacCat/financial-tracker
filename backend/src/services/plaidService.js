const plaidClient = require('./plaidClient');
const { PlaidAccount, Transaction } = require('../models');
const { inferTransactionGroup } = require('../utils/categories');

class PlaidService {
  async createLinkToken(userId) {
    try {
      const linkTokenRequest = {
        user: { client_user_id: String(userId) },
        client_name: 'Financial Tracker',
        products: ['auth', 'transactions'],
        country_codes: ['US'],
        language: 'en',
      };

      if (process.env.PLAID_REDIRECT_URI) {
        linkTokenRequest.redirect_uri = process.env.PLAID_REDIRECT_URI;
      }

      const response = await plaidClient.linkTokenCreate(linkTokenRequest);
      return response.data.link_token;
    } catch (error) {
      const plaidError = error.response?.data;
      if (plaidError) {
        console.error('Plaid link token error:', {
          error_type: plaidError.error_type,
          error_code: plaidError.error_code,
          error_message: plaidError.error_message,
          display_message: plaidError.display_message,
          request_id: plaidError.request_id,
        });
      }
      throw new Error(
        `Failed to create link token: ${plaidError?.error_message || error.message}`
      );
    }
  }

  async exchangePublicToken(publicToken, userId) {
    try {
      const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });

      const { access_token, item_id } = response.data;

      // Get account details
      const accountsResponse = await plaidClient.accountsGet({
        access_token,
      });

      const accounts = accountsResponse.data.accounts;
      const savedAccounts = [];

      for (const account of accounts) {
        const [plaidAccount] = await PlaidAccount.findOrCreate({
          where: { accountId: account.account_id },
          defaults: {
            userId,
            accessToken: access_token,
            itemId: item_id,
            accountName: account.name,
            accountType: account.type,
            accountSubtype: account.subtype,
            mask: account.mask,
          },
        });
        savedAccounts.push(plaidAccount);
      }

      return savedAccounts;
    } catch (error) {
      throw new Error(`Failed to exchange public token: ${error.message}`);
    }
  }

  async syncTransactions(userId) {
    try {
      const plaidAccounts = await PlaidAccount.findAll({ where: { userId } });

      for (const account of plaidAccounts) {
        const response = await plaidClient.transactionsGet({
          access_token: account.accessToken,
          start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
        });

        const transactions = response.data.transactions;

        for (const txn of transactions) {
          await Transaction.findOrCreate({
            where: {
              plaidTransactionId: txn.transaction_id,
            },
            defaults: {
              userId,
              plaidAccountId: account.id,
              name: txn.name,
              amount: txn.amount,
              date: txn.date,
              category: txn.personal_finance_category,
              group: inferTransactionGroup(txn),
              merchant: txn.merchant_name,
              pending: txn.pending,
            },
          });
        }

        // Update last synced time
        account.lastSyncedAt = new Date();
        await account.save();
      }

      return { success: true, message: 'Transactions synced successfully' };
    } catch (error) {
      throw new Error(`Failed to sync transactions: ${error.message}`);
    }
  }

  async removeAccount(accountId) {
    try {
      const account = await PlaidAccount.findByPk(accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      await plaidClient.itemRemove({
        access_token: account.accessToken,
      });

      await account.destroy();
      return { success: true, message: 'Account removed successfully' };
    } catch (error) {
      throw new Error(`Failed to remove account: ${error.message}`);
    }
  }
}

module.exports = new PlaidService();
