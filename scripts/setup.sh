#!/bin/bash

# Local development setup script for Sports Monitor

set -e  # Exit on error

echo "🚀 Sports Monitor - Local Setup"
echo "================================"

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker"
    exit 1
fi

if ! command -v aws &> /dev/null; then
    echo "⚠️  AWS CLI is not installed. Some features may not work"
fi

echo "✅ Prerequisites check passed"

# Create .env files
echo ""
echo "📝 Creating .env files..."

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
else
    echo "⏭️  backend/.env already exists"
fi

if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env"
else
    echo "⏭️  frontend/.env already exists"
fi

# Start Docker Compose
echo ""
echo "🐳 Starting Docker Compose services..."
docker-compose up -d

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check if services are running
if ! docker-compose ps | grep -q "postgres.*Up"; then
    echo "❌ PostgreSQL failed to start"
    docker-compose logs postgres
    exit 1
fi

echo "✅ All services are running"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."

echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ Dependencies installed"

# Build backend
echo ""
echo "🔨 Building backend..."
cd backend
npm run build
cd ..

echo "✅ Backend built"

# Summary
echo ""
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "📍 Access the application:"
echo ""
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:3001"
echo "  Health:    http://localhost:3001/health"
echo ""
echo "🔧 Useful commands:"
echo ""
echo "  Start services:    docker-compose up -d"
echo "  Stop services:     docker-compose down"
echo "  View logs:         docker-compose logs -f [backend|postgres|redis]"
echo "  Dev backend:       cd backend && npm run dev"
echo "  Dev frontend:      cd frontend && npm run dev"
echo ""
echo "📚 Next steps:"
echo ""
echo "  1. Check out the README.md for detailed documentation"
echo "  2. Configure AWS credentials for AI features"
echo "  3. Try the interactive map at http://localhost:3000"
echo "  4. Read ARCHITECTURE.md for system design"
echo ""
