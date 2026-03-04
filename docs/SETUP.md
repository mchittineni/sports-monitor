# Sports Monitor - Setup Guide

> **Security reminder:** keep all sensitive values (JWT secrets, database credentials, AWS keys) out of source control. Use an encrypted secrets manager or environment-specific configuration (HashiCorp Vault, AWS Secrets Manager, etc.). Rotate keys regularly, enforce HTTPS/TLS for all endpoints, enable CORS restrictions to allowed domains, and use least‑privilege IAM roles. 
> 
> - **JWT_SECRET** should be long (≥32 chars) and unique per environment.
> - **Database passwords** must be strong and rotated periodically.
> - **AWS credentials** should use IAM roles when running in cloud environments.
> - Avoid default or demo credentials in production, and disable seeding after initial setup.
> - Monitor and audit access logs, configure rate-limiting and alerting.



Complete setup instructions for running the sports monitoring platform with authentication, API documentation, monitoring dashboards, and comprehensive tests.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Backend Configuration](#backend-configuration)
5. [Frontend Configuration](#frontend-configuration)
6. [Running Tests](#running-tests)
7. [API Documentation](#api-documentation)
8. [Monitoring & Dashboards](#monitoring--dashboards)
9. [Production Deployment](#production-deployment)

---

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14.0 or higher (or Docker)
- **Redis**: v7.0 or higher (or Docker)
- **Docker & Docker Compose**: Latest version (recommended)
- **AWS Account**: For Bedrock AI and CloudWatch (optional for local development)

---

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sports-monitor
```

### 2. Create Environment Files

Copy the example environment file and update with your configuration:

```bash
cp .env.example .env
```

**Key environment variables to update:**

```env
# Authentication (Change in production!)
JWT_SECRET=your-super-secret-key-minimum-32-characters

# AWS Configuration (for Bedrock and CloudWatch)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Database (if not using Docker)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sports_monitor
DB_USER=postgres
DB_PASSWORD=postgres
```

### 3. Install Dependencies

#### Backend:
```bash
cd backend
npm install
cd ..
```

#### Frontend:
```bash
cd frontend
npm install
cd ..
```

---

## Database Setup

### Option 1: Using Docker Compose (Recommended)

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose up -d

# Verify services are running
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Option 2: Manual Setup

#### PostgreSQL

```bash
# macOS (Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows (Use PostgreSQL installer)
```

Create the database:
```bash
psql -U postgres -c "CREATE DATABASE sports_monitor;"
```

#### Redis

```bash
# macOS (Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server

# Docker
docker run -d -p 6379:6379 redis:7-alpine
```

---

## Backend Configuration

### 1. Run Database Migrations

```bash
cd backend

# Apply authentication schema migration
npm run db:migrate

# Or manually apply the migration
psql -U postgres -d sports_monitor -f src/database/migrations/001_add_auth.sql
```

### 2. Seed Demo Data

```bash
# Seed both PostgreSQL and DynamoDB with demo data
npm run db:seed

# Or seed individually:
npm run db:seed:pg    # PostgreSQL only
npm run db:seed:dynamo # DynamoDB only
```

This creates:
- **5 demo users** (with hashed passwords)
- **14 sports teams** from various countries
- **5 matches** with live/scheduled/finished statuses
- **7 live events** in DynamoDB for real-time updates

Demo credentials:
```
Email: john_doe@example.com
Password: SecurePass123!

Email: jane_smith@example.com
Password: SecurePass123!
```

### 3. Install Additional Dependencies

If not using Docker, install auth and testing dependencies:

```bash
cd backend

# Core dependencies
npm install bcrypt jsonwebtoken swagger-jsdoc swagger-ui-express

# Type definitions
npm install --save-dev @types/bcrypt @types/jsonwebtoken

# Testing
npm install --save-dev vitest @vitest/coverage-v8
```

### 4. Start Backend Server

```bash
cd backend

# Development mode (with hot-reload)
npm run dev

# Production mode
npm run build
npm start
```

Expected output:
```
✅ Database connected
✅ Data pipeline started
🚀 Server running on http://localhost:3001
📡 WebSocket server running on ws://localhost:3001
```

---

## Frontend Configuration

### 1. Install Testing Dependencies

```bash
cd frontend

npm install --save-dev vitest @vitest/ui @testing-library/react jsdom
```

### 2. Start Frontend Development Server

```bash
cd frontend

npm run dev
```

Frontend will be available at `http://localhost:3000`

---

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

**Test files included:**
- `src/tests/auth.test.ts` - Authentication endpoints (9 tests)
- `src/tests/sports.test.ts` - Sports API endpoints (6 tests)
- `src/tests/ai.test.ts` - AI features (6 tests)
- `src/tests/auth.unit.test.ts` - Auth service units (8 tests)

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

**Test files included:**
- `src/tests/components.test.ts` - Component logic (8 tests)
- `src/tests/services.test.ts` - Service integration (6 tests)

---

## API Documentation

### Interactive Swagger UI

Once the backend is running, visit:

```
http://localhost:3001/api-docs
```

Features:
- 📖 Complete endpoint documentation
- 🔑 Bearer token authentication UI
- 📤 Try API requests directly from the browser
- 📋 Request/response schemas for all endpoints

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT tokens
- `GET /api/auth/me` - Get current authenticated user (protected)

#### User Profile
- `GET /api/user/favorites` - List favorite sports (protected)
- `POST /api/user/favorites/:sport` - Add favorite sport (protected)
- `DELETE /api/user/favorites/:sport` - Remove favorite (protected)
- `GET /api/user/watched` - List watched matches (protected)

#### Sports Data
- `GET /api/sports/by-country?country=Brazil` - Get sports by country
- `GET /api/sports/by-sport?sport=Football` - Get sports by type
- `GET /api/sports/live` - Get live events (with optional auth)

#### AI Features
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/summarize` - Get AI-generated summaries
- `POST /api/ai/predict` - Get match predictions

#### Statistics
- `GET /api/stats/overview` - Overview statistics
- `GET /api/stats/by-country/:country` - Country-specific stats

### Example API Calls

#### Register a User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "newuser",
    "password": "SecurePass123!"
  }'
```

#### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

Response includes JWT tokens:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "newuser"
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### Access Protected Endpoint

```bash
curl -X GET http://localhost:3001/api/user/favorites \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Monitoring & Dashboards

### CloudWatch Dashboard

The platform includes a CloudWatch dashboard service for monitoring:

```typescript
import { createMonitoringDashboard } from './services/dashboardService.js'

// Create dashboard for your environment
await createMonitoringDashboard('dev')  // or 'staging', 'production'
```

**Dashboard includes:**
- Lambda invocations, errors, and performance metrics
- RDS database CPU, connections, and storage
- DynamoDB read/write capacity and errors
- API Gateway request count, latency, and errors
- CloudWatch Logs insights for response analysis
- Redis cache performance metrics

### Local Development Monitoring

View logs in real-time:

```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
cd frontend && npm run dev

# PostgreSQL logs
docker-compose logs -f postgres

# Redis logs
docker-compose logs -f redis
```

---

## Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
JWT_SECRET=<long-random-secret-minimum-32-chars>
AWS_REGION=us-east-1
DB_HOST=<RDS-endpoint>
DB_PASSWORD=<strong-password>
```

### Build Backend

```bash
cd backend
npm run build
npm start
```

### Build Frontend

```bash
cd frontend
npm run build
```

### Deploy with Docker

```bash
# Build production images
docker build -t sports-monitor-backend:latest ./backend
docker build -t sports-monitor-frontend:latest ./frontend

# Push to registry
docker push your-registry/sports-monitor-backend:latest
docker push your-registry/sports-monitor-frontend:latest

# Deploy using your orchestration platform (Kubernetes, ECS, etc.)
```

### Security Checklist

- ✅ Change `JWT_SECRET` to a strong, random value (minimum 32 characters)
- ✅ Enable HTTPS/TLS for all endpoints
- ✅ Use strong database passwords
- ✅ Enable PostgreSQL SSL connections
- ✅ Configure CORS properly for your domain
- ✅ Enable rate limiting on API endpoints
- ✅ Set up AWS IAM roles with minimal permissions
- ✅ Enable CloudWatch alarms for error monitoring
- ✅ Regular security updates for dependencies

### AWS Configuration

Required IAM permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "s3:GetObject",
        "s3:PutObject",
        "cloudwatch:PutDashboard",
        "cloudwatch:GetDashboard",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill process if needed
kill -9 <PID>
```

### Database Connection Error

```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Check from backend directory
npm run db:migrate
```

### JWT Authentication Fails

- Verify `JWT_SECRET` is set in `.env`
- Check token is included in `Authorization: Bearer <token>` header
- Verify token hasn't expired (7 days by default)
- Restart backend server after changing `JWT_SECRET`

### Tests Fail

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Run tests with verbose output
npm test -- --reporter=verbose
```

### WebSocket Connection Issues

- Ensure backend server is running
- Check CORS configuration matches frontend URL
- Verify firewall allows WebSocket connections
- Check browser console for connection errors

---

## Support & Documentation

- **API Docs**: http://localhost:3001/api-docs (Swagger UI)
- **Test Coverage**: `npm run test:coverage`
- **Database Schema**: See `docs/DATABASE_SCHEMA.sql`
- **Architecture**: See `README.md`

---

## Quick Start Commands

```bash
# One-command setup (with Docker)
docker-compose up -d && echo "Services running!"

# Manual development setup
npm install
cd backend && npm run db:seed && npm run dev &
cd frontend && npm run dev

# Run all tests
npm test

# View API docs
open http://localhost:3001/api-docs

# Tail logs
docker-compose logs -f
```

---

Last updated: 2026
For issues, please check the GitHub repository or contact the development team.
