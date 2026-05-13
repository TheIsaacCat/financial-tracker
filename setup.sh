#!/bin/bash

# Setup script for Financial Tracker

echo "🚀 Setting up Financial Tracker..."

# Backend setup
echo "📦 Setting up backend..."
cd backend
cp .env.example .env
echo "✅ Backend .env created. Please update it with your Plaid credentials."

npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

cd ..

# Frontend setup
echo "📦 Setting up frontend..."
cd frontend
cp .env.example .env.local
echo "✅ Frontend .env.local created."

npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your Plaid credentials"
echo "2. Make sure PostgreSQL is running"
echo "3. In one terminal: cd backend && npm run dev"
echo "4. In another terminal: cd frontend && npm run dev"
echo "5. Open http://localhost:3000 in your browser"
echo ""
