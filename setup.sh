#!/bin/bash

# Sports Monitor - Quick Setup Script
# Run this script to quickly set up the entire sports-monitor project

set -e

echo "🚀 Sports Monitor - Quick Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo -e "${BLUE}Docker detected. Starting services...${NC}"
    docker-compose up -d
    
    echo ""
    echo -e "${YELLOW}Waiting for services to be ready...${NC}"
    sleep 10
    
    echo -e "${BLUE}Seeding database with demo data...${NC}"
    docker-compose exec -T backend npm run db:seed
    
    echo ""
    echo -e "${GREEN}✅ All services are running!${NC}"
    echo ""
    echo "Access points:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend API: http://localhost:3001"
    echo "  - API Docs (Swagger): http://localhost:3001/api-docs"
    echo ""
    echo "Demo Credentials:"
    echo "  Email: john_doe@example.com"
    echo "  Password: SecurePass123!"
    echo ""
    
else
    echo -e "${BLUE}Docker not found. Using manual setup...${NC}"
    echo ""
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${YELLOW}❌ Node.js not found. Please install Node.js v18+${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}Installing dependencies...${NC}"
    
    # Backend setup
    echo "  Backend..."
    cd backend
    npm install
    cd ..
    
    # Frontend setup
    echo "  Frontend..."
    cd frontend
    npm install
    cd ..
    
    echo ""
    echo -e "${BLUE}Setting up database...${NC}"
    cd backend
    npm run db:migrate
    npm run db:seed
    cd ..
    
    echo ""
    echo -e "${GREEN}✅ Setup complete!${NC}"
    echo ""
    echo "To start the application:"
    echo ""
    echo "  Terminal 1 - Backend:"
    echo "    cd backend && npm run dev"
    echo ""
    echo "  Terminal 2 - Frontend:"
    echo "    cd frontend && npm run dev"
    echo ""
    echo "Then access:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend API: http://localhost:3001"
    echo "  - API Docs: http://localhost:3001/api-docs"
    echo ""
    echo "Demo Credentials:"
    echo "  Email: john_doe@example.com"
    echo "  Password: SecurePass123!"
    echo ""
fi

echo -e "${BLUE}For full setup instructions, see docs/SETUP.md${NC}"
echo -e "${BLUE}For implementation details, see IMPLEMENTATION.md${NC}"
