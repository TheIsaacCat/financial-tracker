@echo off
REM Setup script for Financial Tracker on Windows

echo.
echo 🚀 Setting up Financial Tracker...
echo.

REM Backend setup
echo 📦 Setting up backend...
cd backend
copy .env.example .env
echo ✅ Backend .env created. Please update it with your Plaid credentials.

call npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    exit /b 1
)

cd ..

REM Frontend setup
echo 📦 Setting up frontend...
cd frontend
copy .env.example .env.local
echo ✅ Frontend .env.local created.

call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    exit /b 1
)

cd ..

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Update backend\.env with your Plaid credentials
echo 2. Make sure PostgreSQL is running
echo 3. In one terminal: cd backend && npm run dev
echo 4. In another terminal: cd frontend && npm run dev
echo 5. Open http://localhost:3000 in your browser
echo.
pause
