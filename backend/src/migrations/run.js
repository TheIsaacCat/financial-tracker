require('dotenv').config();

const { sequelize } = require('../models');

async function migrate() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  await sequelize.close();
  console.log('Database schema is up to date.');
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
