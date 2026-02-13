#!/bin/bash

# CarWheels.com - Quick Setup Script
# This script will set up the entire project

echo "🚗 CarWheels.com - Quick Setup"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 12+"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) found${NC}"
echo -e "${GREEN}✓ PostgreSQL found${NC}"

# Setup backend
echo -e "\n${BLUE}Setting up backend...${NC}"
cd backend
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created backend/.env file${NC}"
    echo "⚠️  Please edit backend/.env with your PostgreSQL credentials"
else
    echo -e "${GREEN}✓ backend/.env already exists${NC}"
fi

# Initialize database
echo -e "${BLUE}Initializing database...${NC}"
npm run db:migrate
npm run db:seed

echo -e "${GREEN}✓ Database initialized with sample data${NC}"

# Setup frontend
echo -e "\n${BLUE}Setting up frontend...${NC}"
cd ../frontend
npm install

# Create .env.local file if it doesn't exist
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✓ Created frontend/.env.local file${NC}"
else
    echo -e "${GREEN}✓ frontend/.env.local already exists${NC}"
fi

cd ..

echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your PostgreSQL connection details"
echo "2. Run: npm run dev"
echo "3. Backend: http://localhost:5000"
echo "4. Frontend: http://localhost:3000"
echo ""
echo "Or use Docker:"
echo "docker-compose up -d"
echo ""
echo "For more information, see README.md"
