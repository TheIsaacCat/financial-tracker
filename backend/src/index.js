require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const requireAuth = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const plaidRoutes = require('./routes/plaid');
const transactionRoutes = require('./routes/transactions');
const recommendationRoutes = require('./routes/recommendations');
const statementRoutes = require('./routes/statements');

const app = express();
const port = process.env.PORT || 5000;
const frontendUrls = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || frontendUrls.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/plaid', requireAuth, plaidRoutes);
app.use('/api/transactions', requireAuth, transactionRoutes);
app.use('/api/recommendations', requireAuth, recommendationRoutes);
app.use('/api/statements', requireAuth, statementRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
  });
});

async function start() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });

  app.listen(port, '0.0.0.0', () => {
    console.log(`Financial Tracker API listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
