# Financial Tracker

A full-stack web application that helps you understand your spending by automatically pulling transactions from your bank accounts using Plaid, organizing them into categories, and providing personalized recommendations to help you save money.

## Features

- **Plaid Integration**: Securely connect your bank accounts to automatically pull transactions
- **Transaction Labeling**: Organize transactions into spending categories (Food, Transportation, Utilities, etc.)
- **Spending Analytics**: View detailed breakdowns of your spending by category
- **Smart Recommendations**: Get AI-powered suggestions to help you save money based on your spending patterns
- **Secure Authentication**: Register and login with email/password
- **Real-time Sync**: Keep your transactions up-to-date with automatic Plaid syncing

## Tech Stack

### Backend
- **Node.js** + **Express** - REST API
- **PostgreSQL** - Database
- **Sequelize** - ORM
- **Plaid API** - Bank data integration
- **JWT** - Authentication

### Frontend
- **Next.js 14** - React framework
- **Tailwind CSS** - Styling
- **Axios** - API client
- **Chart.js** - Data visualization

## Local Hosting

Use [LOCAL_HOSTING.md](LOCAL_HOSTING.md) to run the app on your machine with Docker Compose, expose it on your LAN, or set up router port forwarding.

Quick Docker start:

```bash
cp .env.example .env
docker compose up --build
```

Then open `http://localhost:3000`.

## Deployment

### Docker Deployment to Render

The project includes Docker and Render Blueprint configuration:

#### Quick Deploy
1. **Test locally first:**
   ```bash
   # Linux/Mac
   ./deploy-to-render.sh

   # Windows
   deploy-to-render.bat
   ```

2. **Push to Git and deploy:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

3. **Deploy on Render:**
   - Use **New -> Blueprint** in the Render dashboard
   - Select this repo so Render reads `render.yaml`
   - Fill in the required Plaid and service URL environment variables
   - Follow the full dashboard walkthrough in `RENDER_DEPLOYMENT.md`

#### Manual Docker Build
```bash
# Build images
docker build -t financial-tracker-backend ./backend
docker build -t financial-tracker-frontend ./frontend

# Run locally
docker-compose up
```

**Detailed deployment guide:** [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)

### Other Deployment Options

- **Railway**: Use `railway up` after installing Railway CLI
- **Fly.io**: Use `fly launch` and `fly deploy`
- **Heroku**: Traditional Node.js deployment
- **Vercel + Railway**: Deploy frontend to Vercel, backend to Railway

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd financial-tracker
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Update .env with your credentials:
# DATABASE_URL=postgresql://user:password@localhost:5432/financial_tracker
# PLAID_CLIENT_ID=your_plaid_client_id
# PLAID_SECRET=your_plaid_secret
# JWT_SECRET=your_jwt_secret_key

# Start the backend (make sure PostgreSQL is running)
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create .env.local file
cp .env.example .env.local

# Start the frontend
npm run dev
```

### 4. Database Setup

The database will be automatically created when you start the backend for the first time. Sequelize will sync all models.

## Usage

1. **Register/Login**: Create an account or login at http://localhost:3000
2. **Connect Bank Account**: Click "Connect Bank Account" and authorize through Plaid
3. **View Transactions**: Your recent transactions will appear in the dashboard
4. **Change Transaction Types**: Use the type dropdown on each transaction to categorize it
5. **Review Trends**: Use the dashboard chart to compare monthly spending by type

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Plaid
- `POST /api/plaid/link-token` - Create Plaid link token
- `POST /api/plaid/exchange-token` - Exchange public token for access token
- `GET /api/plaid/accounts` - Get connected accounts
- `POST /api/plaid/sync` - Sync transactions
- `DELETE /api/plaid/accounts/:accountId` - Remove account

### Transactions
- `GET /api/transactions` - Get transactions with optional filters
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/transactions/:id/label` - Label a transaction
- `GET /api/transactions/stats/summary` - Get spending statistics

### Recommendations
- `GET /api/recommendations` - Get spending recommendations
- `GET /api/recommendations/analysis` - Get detailed spending analysis

## Project Structure

```
financial-tracker/
├── backend/
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── models/       # Sequelize models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utility functions
│   │   └── index.js      # Server entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/              # Utility functions & API client
│   ├── public/           # Static files
│   ├── package.json
│   └── .env.example
└── docker-compose.yml    # Docker Compose configuration
```

## Spending Categories

- Food
- Transportation
- Utilities
- Entertainment
- Shopping
- Healthcare
- Education
- Subscription
- Work
- Personal Care
- Other

## Recommendations Engine

The recommendations engine analyzes your spending patterns to provide insights such as:
- High spending categories that exceed 30% of total
- Subscription services to review for unused accounts
- Frequent merchants where you can potentially save
- Entertainment spending that exceeds 15% of total

Each recommendation includes potential monthly savings calculations.

## Environment Variables

### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `PLAID_CLIENT_ID` - Plaid API client ID
- `PLAID_SECRET` - Plaid API secret
- `PLAID_ENV` - Plaid environment (sandbox/production)
- `JWT_SECRET` - Secret key for JWT tokens
- `FRONTEND_URL` - Frontend URL for CORS
- `PORT` - Backend server port (default: 5000)

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_PLAID_CLIENT_ID` - Plaid client ID for frontend

## Docker Deployment

To run the entire application with Docker Compose:

```bash
# Copy and edit local environment variables
cp .env.example .env

# Start all services
docker compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

## Development Tips

1. **Hot Reload**: Both backend and frontend support hot reload during development
2. **Database Reset**: To reset the database, delete the PostgreSQL volume and restart Docker
3. **Plaid Sandbox**: Use test credentials from Plaid's documentation for sandbox testing
4. **CORS Issues**: If you encounter CORS errors, check that FRONTEND_URL is correctly set in backend .env

## Future Enhancements

- [ ] Export transactions to CSV
- [ ] Budget tracking and alerts
- [ ] Monthly spending reports
- [ ] Goal setting and progress tracking
- [ ] Multi-currency support
- [ ] Mobile app
- [ ] Advanced analytics dashboard
- [ ] Integration with investment accounts
- [ ] Recurring transaction detection
- [ ] Bill payment reminders

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please open an issue on GitHub.

## Disclaimer

This application handles sensitive financial data. For production use:
- Use HTTPS only
- Store secrets in a secure secrets manager
- Implement rate limiting
- Add comprehensive error handling
- Set up monitoring and logging
- Conduct security audits
- Comply with financial data regulations (PCI DSS, etc.)
