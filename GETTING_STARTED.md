# Getting Started - Financial Tracker

## Quick Start Guide

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 12+ (or use Docker)
- Plaid account (free sandbox available at https://plaid.com)

### Option 1: Local Development (No Docker)

#### 1. Setup Environment

**On Windows:**
```bash
setup.bat
```

**On macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

#### 2. Configure Backend

Edit `backend/.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/financial_tracker
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
```

#### 3. Start PostgreSQL

**Using Docker:**
```bash
docker run --name postgres -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=financial_tracker -p 5432:5432 -d postgres:15-alpine
```

**Or use your existing PostgreSQL instance**

#### 4. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### 5. Access Application

Open http://localhost:3000 in your browser

---

### Option 2: Docker Compose (All-in-One)

#### 1. Set Plaid Credentials

```bash
export PLAID_CLIENT_ID=your_plaid_client_id
export PLAID_SECRET=your_plaid_secret
```

#### 2. Start All Services

```bash
docker-compose up
```

#### 3. Access Application

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## Getting Plaid Credentials

1. Go to https://plaid.com/
2. Sign up for a free account
3. Create a new app in the dashboard
4. Copy your **Client ID** and **Secret**
5. Use these in your `.env` files

**Note**: Start with the **Sandbox** environment for development. Upgrade to **Production** when ready.

---

## First Steps in the App

1. **Register**: Create a new account with your email
2. **Connect Bank**: Click "Connect Bank Account" in the dashboard
3. **Authorize**: Log in to your bank through Plaid's interface
4. **Import Transactions**: Transactions will appear automatically
5. **Label Transactions**: Click "Label" on transactions to categorize them
6. **View Insights**: Check the recommendations panel for spending patterns

---

## Troubleshooting

### Database Connection Error
- Make sure PostgreSQL is running on port 5432
- Check DATABASE_URL is correct in `backend/.env`
- Try creating the database manually:
  ```sql
  CREATE DATABASE financial_tracker;
  ```

### Plaid Link Not Loading
- Check PLAID_CLIENT_ID is correct
- Make sure you're in the right Plaid environment (sandbox/production)
- Clear browser cache and try again

### CORS Errors
- Verify FRONTEND_URL is set correctly in `backend/.env`
- Frontend should be at `http://localhost:3000`
- Backend should be at `http://localhost:5000`

### Port Already in Use
- Backend uses port 5000: `lsof -i :5000`
- Frontend uses port 3000: `lsof -i :3000`
- Kill processes or change ports

---

## Development Commands

### Backend
```bash
cd backend
npm run dev        # Start development server with hot reload
npm start         # Start production server
npm run migrate   # Run migrations
```

### Frontend
```bash
cd frontend
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
```

---

## Testing with Plaid Sandbox

Use these test credentials in Plaid Link:
- **Username**: `user_good`
- **Password**: `pass_good`

This will give you access to test transactions in the sandbox environment.

---

## Database Schema Overview

### Users Table
- Stores user accounts and authentication details
- Supports email/password and OAuth

### PlaidAccounts Table
- Stores connected bank accounts
- Maintains access tokens for Plaid API

### Transactions Table
- Stores synced bank transactions
- Linked to users and Plaid accounts

### TransactionLabels Table
- User-assigned labels for transactions
- Stores spending categories and notes

---

## API Testing

Use a tool like **Postman** or **cURL** to test the API:

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## Next Steps

1. **Customize Categories**: Edit spending categories in `TransactionLabel` model
2. **Enhance Recommendations**: Modify algorithm in `recommendationsService.js`
3. **Add Features**: Budget tracking, goals, reports
4. **Deploy**: Follow deployment guides for Heroku/AWS/Railway

---

## Support Resources

- [Plaid API Docs](https://plaid.com/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [Sequelize ORM](https://sequelize.org/)

---

## Security Notes

⚠️ **For Development Only** ⚠️

Before production deployment:
- ✅ Use environment variables for all secrets
- ✅ Enable HTTPS
- ✅ Set up proper CORS policies
- ✅ Implement rate limiting
- ✅ Add input validation
- ✅ Set up logging and monitoring
- ✅ Consider PCI DSS compliance
- ✅ Use a secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.)

---

Enjoy tracking your finances! 💰
