# Financial Tracker - Complete Project Guide

Welcome to your Financial Tracker project! This guide will help you understand the project structure and get started quickly.

## 📁 Project Structure

```
financial-tracker/
├── backend/                    # Express.js backend API
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── middleware/        # Auth and error handling
│   │   ├── models/            # Sequelize database models
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utility functions
│   │   └── index.js           # Server entry point
│   ├── package.json           # Dependencies
│   ├── .env.example           # Environment template
│   ├── Dockerfile             # Docker configuration
│   └── .dockerignore
│
├── frontend/                   # Next.js frontend application
│   ├── app/                   # Next.js App Router
│   │   ├── page.js            # Home page
│   │   ├── login/page.js      # Login page
│   │   ├── register/page.js   # Registration page
│   │   ├── dashboard/page.js  # Main dashboard
│   │   ├── layout.js          # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable React components
│   │   ├── PlaidLinkButton.js
│   │   ├── TransactionList.js
│   │   ├── RecommendationsPanel.js
│   │   └── SpendingChart.js
│   ├── lib/                   # Utilities and API client
│   │   ├── api.js             # Axios API client
│   │   └── useAuth.js         # Authentication hook
│   ├── public/                # Static assets
│   ├── package.json           # Dependencies
│   ├── .env.example           # Environment template
│   ├── tailwind.config.js     # Tailwind CSS config
│   ├── next.config.js         # Next.js config
│   ├── Dockerfile             # Docker configuration
│   └── .dockerignore
│
├── docker-compose.yml         # Docker Compose setup (all services)
├── setup.sh                   # Setup script (macOS/Linux)
├── setup.bat                  # Setup script (Windows)
│
├── README.md                  # Comprehensive project documentation
├── GETTING_STARTED.md         # Quick start guide (START HERE!)
├── ARCHITECTURE.md            # Technical architecture & developer guide
└── PROJECT_STRUCTURE.md       # This file

```

## 🚀 Quick Start

### Choose Your Setup Method

#### Option 1: Quick Local Setup (Recommended for Development)
1. Run setup script:
   - **Windows**: Double-click `setup.bat`
   - **macOS/Linux**: Run `./setup.sh`

2. Configure Plaid credentials in `backend/.env`

3. Start services:
   ```bash
   # Terminal 1
   cd backend && npm run dev

   # Terminal 2
   cd frontend && npm run dev
   ```

4. Open http://localhost:3000

#### Option 2: Docker (All-in-One)
1. Set Plaid credentials:
   ```bash
   export PLAID_CLIENT_ID=your_id
   export PLAID_SECRET=your_secret
   ```

2. Start all services:
   ```bash
   docker-compose up
   ```

3. Open http://localhost:3000

👉 **See [GETTING_STARTED.md](GETTING_STARTED.md) for detailed instructions**

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[README.md](README.md)** | Complete project documentation with features, installation, API reference |
| **[GETTING_STARTED.md](GETTING_STARTED.md)** | Quick start guide with troubleshooting and Plaid setup |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | Technical architecture, data flows, database schema, dev guide |

## 🔑 Key Features

✅ **Bank Account Linking** - Secure connection via Plaid  
✅ **Transaction Syncing** - Automatic import of last 90 days  
✅ **Category Labeling** - Organize into 11 spending categories  
✅ **Analytics** - View spending breakdown by category  
✅ **Recommendations** - AI-powered savings suggestions  
✅ **Secure Auth** - JWT-based authentication  
✅ **Responsive UI** - Built with Next.js and Tailwind CSS  

## 🏗️ Architecture Overview

```
Browser (3000)
    ↓
Next.js Frontend
    ↓ (HTTP/JSON)
Express Backend (5000)
    ├→ Plaid API
    └→ PostgreSQL
```

## 🔧 Technology Stack

### Backend
- Node.js + Express
- PostgreSQL + Sequelize
- Plaid API
- JWT Authentication

### Frontend
- Next.js 14
- React
- Tailwind CSS
- Axios

## 📋 API Endpoints

### Public Routes
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user

### Protected Routes (Require JWT)
- `GET /api/auth/me` - Get current user
- `POST /api/plaid/link-token` - Create Plaid link
- `POST /api/plaid/exchange-token` - Exchange token after authorization
- `GET /api/plaid/accounts` - List connected accounts
- `POST /api/plaid/sync` - Sync transactions
- `GET /api/transactions` - Get transactions
- `POST /api/transactions/:id/label` - Label transaction
- `GET /api/recommendations` - Get spending recommendations
- `GET /api/recommendations/analysis` - Get spending analysis

## 💾 Database Schema

### Core Tables
- **Users** - User accounts and authentication
- **PlaidAccounts** - Connected bank accounts
- **Transactions** - Bank transactions from Plaid
- **TransactionLabels** - User-assigned categories

## 🎯 Spending Categories

1. Food
2. Transportation
3. Utilities
4. Entertainment
5. Shopping
6. Healthcare
7. Education
8. Subscription
9. Work
10. Personal Care
11. Other

## 🤖 Recommendations Engine

Analyzes your spending to identify:
- High spending categories (>30% of total)
- Subscription services (>5 recurring)
- Frequent merchants
- Entertainment spending (>15% of total)

Calculates potential monthly savings for each recommendation.

## 🔐 Security Features

- Passwords hashed with bcrypt
- JWT tokens for authentication (7-day expiry)
- CORS restricted to frontend URL
- Input validation and sanitization
- Protected API routes
- SQL injection prevention via ORM

## 🚢 Deployment

The project is configured for deployment to:
- **Heroku** or **Render** (recommended)
- **AWS**, **DigitalOcean**, **Railway**
- Any platform supporting Node.js + PostgreSQL

See [ARCHITECTURE.md](ARCHITECTURE.md) for deployment checklist.

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection error | Ensure PostgreSQL is running, check DATABASE_URL |
| Plaid Link not loading | Verify PLAID_CLIENT_ID, check environment |
| CORS errors | Confirm FRONTEND_URL matches your setup |
| Port conflicts | Check what's using ports 3000, 5000, 5432 |

See [GETTING_STARTED.md](GETTING_STARTED.md) for more troubleshooting tips.

## 🔄 Development Workflow

1. **Make code changes** (auto-reload enabled)
2. **Test endpoints** using Postman or curl
3. **Check database** changes via Sequelize models
4. **Refresh browser** for frontend changes

## 📦 Running in Production

```bash
# Build frontend
cd frontend && npm run build

# Start backend
cd backend && npm start

# Set environment variables
# - Use production database
# - Set PLAID_ENV=production
# - Enable HTTPS
# - Use strong JWT_SECRET
# - Configure proper CORS
```

## 🤝 Contributing

To add features:
1. Create new components in `frontend/components/`
2. Add API methods in `backend/src/routes/`
3. Update database models in `backend/src/models/`
4. Test thoroughly before committing

## 📞 Getting Help

1. Check [GETTING_STARTED.md](GETTING_STARTED.md) for common issues
2. Review [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
3. Read [README.md](README.md) for comprehensive documentation
4. Check Plaid docs at https://plaid.com/docs/

## ✨ Next Steps

1. **Setup**: Run `setup.bat` or `setup.sh`
2. **Configure**: Add Plaid credentials to `backend/.env`
3. **Start**: Run backend and frontend in separate terminals
4. **Test**: Open http://localhost:3000 and register
5. **Connect**: Link a bank account via Plaid
6. **Explore**: Label transactions and view recommendations

Happy tracking! 💰

---

**Need help?** See the documentation files listed above or check [GETTING_STARTED.md](GETTING_STARTED.md).

**Found a bug?** Check the troubleshooting sections in GETTING_STARTED.md.

**Want to extend?** Review the ARCHITECTURE.md for understanding the codebase structure.
