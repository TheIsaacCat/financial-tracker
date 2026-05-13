const { Sequelize } = require('sequelize');

const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://financial_user:financial_password@localhost:5432/financial_tracker';

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions:
    process.env.NODE_ENV === 'production'
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
});

module.exports = sequelize;
