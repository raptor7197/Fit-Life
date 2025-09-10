#!/bin/bash

# Fitlife App Quick Setup Script

echo "🚀 Starting Fitlife App Setup..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   Run: sudo systemctl start mongod"
    echo "   Or: mongod --dbpath /path/to/data"
    exit 1
fi

# Backend setup
echo "📦 Setting up backend..."
cd server

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit server/.env with your actual values!"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    npm install
fi

# Frontend setup
cd ..
echo "📦 Setting up frontend..."

# Create frontend .env if needed
if [ ! -f .env ]; then
    echo "REACT_APP_API_URL=http://localhost:4000/api" > .env
fi

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    npm install
fi

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit server/.env with your configuration"
echo "2. Start the backend: cd server && npm run dev"
echo "3. Start the frontend: npm start (in root directory)"
echo "4. Visit http://localhost:3000"
echo ""
echo "📖 See IMPLEMENTATION_PLAN.md for detailed development guide"
