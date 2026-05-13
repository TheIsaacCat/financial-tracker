# Architecture & Development Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Web Browser                          │
│                  (http://localhost:3000)                │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Next.js Frontend                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Pages & Components (React)                      │  │
│  │  ├─ app/page.js (Home)                          │  │
│  │  ├─ app/login/page.js                           │  │
│  │  ├─ app/register/page.js                        │  │
│  │  ├─ app/dashboard/page.js (Main)                │  │
│  │  └─ components/                                 │  │
│  │     ├─ PlaidLinkButton.js                       │  │
│  │     ├─ TransactionList.js                       │  │
│  │     ├─ RecommendationsPanel.js                  │  │
│  │     └─ SpendingChart.js                         │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  lib/ (Utilities)                                │  │
│  │  ├─ api.js (Axios API client)                    │  │
│  │  └─ useAuth.js (Auth hook)                       │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │ HTTP/JSON     │               │
         ▼               ▼               ▼
   ┌──────────────────────────────────────────────┐
   │    Express.js Backend API                    │
   │  (http://localhost:5000/api)                 │
   │  ┌──────────────────────────────────────┐   │
   │  │  Routes                              │   │
   │  │  ├─ /auth (Register, Login)          │   │
   │  │  ├─ /plaid (Plaid integration)       │   │
   │  │  ├─ /transactions (CRUD ops)         │   │
   │  │  └─ /recommendations (Analytics)     │   │
   │  └──────────────────────────────────────┘   │
   │  ┌──────────────────────────────────────┐   │
   │  │  Middleware                          │   │
   │  │  ├─ auth.js (JWT verification)       │   │
   │  │  └─ errorHandler.js                  │   │
   │  └──────────────────────────────────────┘   │
   │  ┌──────────────────────────────────────┐   │
   │  │  Services                            │   │
   │  │  ├─ plaidService.js (Link, sync)     │   │
   │  │  └─ recommendationsService.js        │   │
   │  └──────────────────────────────────────┘   │
   └────────┬─────────────────────────────────────┘
            │
    ┌───────┼────────────┐
    │       │            │
    ▼       ▼            ▼
  Plaid  PostgreSQL   (Logging)
  API    Database
```

## Data Flow

### User Registration & Login
```
User Input → Validation → Hash Password → Store in DB → Return JWT Token → Store in localStorage
```

### Bank Connection Flow
```
User Clicks Connect → Create Link Token → Plaid Link Modal → Authorize Bank → Get Public Token 
→ Exchange Token for Access Token → Store Access Token → Fetch Accounts → Sync Transactions
```

### Transaction Sync & Labeling
```
Fetch Transactions from Plaid → Check for Duplicates (plaidTransactionId) → Store in DB 
→ User Labels Transaction → Store Label → Update Analytics → Show Recommendations
```

### Recommendations Generation
```
Query Last 90 Days of Transactions → Group by Category → Calculate Stats → Apply Rules 
→ Generate Recommendations with Potential Savings → Return to Frontend
```

## Database Schema

### Users Table
```sql
id (UUID, PK)
email (String, Unique)
password (String, encrypted)
firstName (String)
lastName (String)
googleId (String, Optional)
createdAt (DateTime)
updatedAt (DateTime)
```

### PlaidAccounts Table
```sql
id (UUID, PK)
userId (UUID, FK → Users)
accessToken (String, encrypted)
itemId (String)
accountId (String)
accountName (String)
accountType (String)
accountSubtype (String)
mask (String)
lastSyncedAt (DateTime)
createdAt (DateTime)
updatedAt (DateTime)
```

### Transactions Table
```sql
id (UUID, PK)
userId (UUID, FK → Users)
plaidAccountId (UUID, FK → PlaidAccounts)
plaidTransactionId (String, Unique)
name (String)
amount (Decimal)
date (DateTime)
category (JSON)
merchant (String)
pending (Boolean)
createdAt (DateTime)
updatedAt (DateTime)
```

### TransactionLabels Table
```sql
id (UUID, PK)
transactionId (UUID, FK → Transactions)
userId (UUID, FK → Users)
label (ENUM: Food, Transportation, etc.)
notes (Text)
createdAt (DateTime)
updatedAt (DateTime)
```

## Key Features Implementation

### 1. Authentication (JWT)
- **Location**: `backend/src/routes/auth.js`, `backend/src/middleware/auth.js`
- **Flow**: 
  - User provides credentials
  - Server validates and creates JWT token
  - Client stores token in localStorage
  - Client includes token in Authorization header for protected routes
  - Server verifies token on each request

### 2. Plaid Integration
- **Location**: `backend/src/services/plaidService.js`
- **Key Methods**:
  - `createLinkToken()` - Initiate bank connection
  - `exchangePublicToken()` - Secure token exchange
  - `syncTransactions()` - Fetch and store transactions
  - `removeAccount()` - Disconnect bank account

### 3. Transaction Labeling
- **Location**: `backend/src/routes/transactions.js`, `frontend/components/TransactionList.js`
- **Features**:
  - Users can label transactions post-import
  - Labels stored separately for flexibility
  - Supports custom notes per transaction
  - Labels used for analytics and recommendations

### 4. Recommendations Engine
- **Location**: `backend/src/services/recommendationsService.js`
- **Algorithms**:
  - High spending detection (>30% of total)
  - Subscription analysis (>5 recurring)
  - Frequent merchant tracking
  - Entertainment spending ratio
- **Output**: Recommendations with estimated savings

## API Response Examples

### Register Response
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Transactions Response
```json
{
  "transactions": [
    {
      "id": "uuid",
      "name": "Starbucks",
      "amount": 5.50,
      "date": "2024-01-15",
      "merchant": "STARBUCKS COFFEE",
      "TransactionLabel": {
        "label": "Food",
        "notes": "Morning coffee"
      }
    }
  ]
}
```

### Recommendations Response
```json
{
  "recommendations": [
    {
      "type": "high-spending",
      "category": "Food",
      "message": "Your Food spending is 35% of total...",
      "severity": "warning",
      "potentialSavings": 125.50
    }
  ],
  "totalPotentialSavings": 350.00,
  "analysis": {
    "totalSpent": 2500.00,
    "categoryStats": [...]
  }
}
```

## Component Hierarchy

```
App (Root)
├── Pages
│   ├── page.js (Home/Landing)
│   ├── login/page.js
│   ├── register/page.js
│   └── dashboard/page.js
│       ├── PlaidLinkButton
│       ├── TransactionList
│       │   └── TransactionItem
│       ├── SpendingChart
│       └── RecommendationsPanel
└── Shared Components
    └── Navigation
```

## State Management

**Frontend State:**
- User authentication: `useAuth()` hook + localStorage
- Dashboard data: React `useState` hooks
- API calls: Axios with interceptors for JWT injection

**Backend State:**
- Database: PostgreSQL via Sequelize ORM
- Session management: JWT tokens (stateless)
- Rate limiting: (Can be added with express-rate-limit)

## Error Handling

### Frontend
```javascript
try {
  const response = await API_CALL()
  // Success
} catch (error) {
  // error.response.data.error contains error message
  // Display to user
}
```

### Backend
```javascript
// Errors caught by middleware
app.use(errorHandler)

// Responds with:
{
  "error": "Error message"
}
```

## Security Considerations

1. **Password Storage**: Bcrypt hashing with salt rounds
2. **JWT Tokens**: Signed with secret, expires in 7 days
3. **Plaid Access Tokens**: Stored encrypted in database
4. **CORS**: Restricted to frontend URL
5. **Input Validation**: Sequelize validators, req.body validation
6. **SQL Injection**: Prevented by ORM (Sequelize)
7. **XSS Protection**: Next.js automatic escaping

## Performance Optimization

1. **Database Queries**: Indexed on userId, date, plaidTransactionId
2. **Lazy Loading**: Transactions loaded in batches (limit 100)
3. **Caching**: Last 90 days of transactions cached in memory
4. **API Rate Limiting**: Can be added with middleware
5. **Frontend Optimization**: Next.js automatic code splitting

## Future Enhancement Opportunities

1. **Real-time Updates**: WebSocket integration for live sync
2. **Machine Learning**: Better category prediction
3. **Mobile App**: React Native version
4. **Advanced Analytics**: Time series analysis, forecasting
5. **Export Features**: PDF reports, CSV exports
6. **Integration**: YNAB, Mint data sync
7. **Budgeting**: Budget creation and alerts
8. **Notifications**: Email/SMS alerts for high spending

## Development Workflow

### Adding a New Feature

1. **Backend**:
   ```
   1. Create/update model in src/models/
   2. Create service in src/services/ if needed
   3. Add route in src/routes/
   4. Test with curl/Postman
   ```

2. **Frontend**:
   ```
   1. Add API method in lib/api.js
   2. Create component in components/
   3. Add page/route if needed
   4. Test in browser
   ```

### Testing

```bash
# Backend testing with curl
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Frontend testing in browser console
import { transactionAPI } from './lib/api'
transactionAPI.getTransactions()
```

## Deployment Checklist

- [ ] Update environment variables for production
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure CDN for frontend assets
- [ ] Set up monitoring and logging
- [ ] Enable rate limiting
- [ ] Review security headers
- [ ] Set up SSL certificates
- [ ] Configure CI/CD pipeline
- [ ] Test all features in staging
- [ ] Set up error tracking (Sentry, etc.)

---

For more details, see README.md and GETTING_STARTED.md
