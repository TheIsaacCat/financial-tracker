const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
  },
  {
    tableName: 'users',
  }
);

const PlaidAccount = sequelize.define(
  'PlaidAccount',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    itemId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    accountName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountType: DataTypes.STRING,
    accountSubtype: DataTypes.STRING,
    mask: DataTypes.STRING,
    lastSyncedAt: DataTypes.DATE,
  },
  {
    tableName: 'plaid_accounts',
  }
);

const Transaction = sequelize.define(
  'Transaction',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    plaidAccountId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    plaidTransactionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    category: DataTypes.JSONB,
    group: {
      type: DataTypes.STRING,
      defaultValue: 'Other',
    },
    label: DataTypes.STRING,
    notes: DataTypes.TEXT,
    merchant: DataTypes.STRING,
    pending: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'transactions',
    indexes: [
      { fields: ['userId', 'date'] },
      { fields: ['userId', 'group'] },
    ],
  }
);

const Statement = sequelize.define(
  'Statement',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    plaidAccountId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    month: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    openingBalance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    closingBalance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    totalCredits: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    totalDebits: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
  },
  {
    tableName: 'statements',
    indexes: [{ unique: true, fields: ['userId', 'plaidAccountId', 'month'] }],
  }
);

User.hasMany(PlaidAccount, { foreignKey: 'userId', onDelete: 'CASCADE' });
PlaidAccount.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Transaction, { foreignKey: 'userId', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

PlaidAccount.hasMany(Transaction, { foreignKey: 'plaidAccountId', onDelete: 'CASCADE' });
Transaction.belongsTo(PlaidAccount, { foreignKey: 'plaidAccountId' });

User.hasMany(Statement, { foreignKey: 'userId', onDelete: 'CASCADE' });
Statement.belongsTo(User, { foreignKey: 'userId' });

PlaidAccount.hasMany(Statement, { foreignKey: 'plaidAccountId', onDelete: 'CASCADE' });
Statement.belongsTo(PlaidAccount, { foreignKey: 'plaidAccountId' });

module.exports = {
  sequelize,
  User,
  PlaidAccount,
  Transaction,
  Statement,
};
