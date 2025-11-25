#!/bin/bash

echo "🚀 Setting up Expense Tracker..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your database credentials and secrets"
    echo ""
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Ask user if they want to push schema to database
echo ""
read -p "Do you want to push the database schema? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗄️  Pushing database schema..."
    npx prisma db push
    echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with the correct database URL and secrets"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000"
echo ""
echo "Useful commands:"
echo "  - npm run dev          : Start development server"
echo "  - npx prisma studio    : Open Prisma Studio (database GUI)"
echo "  - npx prisma db push   : Push schema changes to database"
echo "  - npx prisma migrate dev : Create and apply migrations"
