# Getting Started

This guide walks you through running **Sports Monitor** locally. Docker is recommended because it wires up PostgreSQL, Redis, the backend, and the frontend automatically.

---

## Prerequisites

- [Docker & Docker Compose](https://www.docker.com/products/docker-desktop/) installed.
- [Node.js v20+](https://nodejs.org/) — only needed if you prefer running services manually without Docker.

---

## Step 1: Environment Variables

Copy the example environment file. It contains safe defaults for local development only.

```bash
cp .env.example .env
```

> Never use these default credentials in production.

Key variables you may want to review:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Backend API port |
| `DB_*` | local values | PostgreSQL connection settings |
| `REDIS_URL` | `redis://localhost:6379` | ElastiCache / local Redis URL |
| `JWT_SECRET` | dev-only value | Must be a 32+ char random string in production |
| `AWS_REGION` | `us-east-1` | Used by Bedrock AI and DynamoDB clients |
| `BEDROCK_MODEL_ID` | `anthropic.claude-3-sonnet-20240229` | Bedrock model for AI features |

---

## Step 2: Start the Services

```bash
docker-compose up -d --build
```

This starts:

1. **PostgreSQL** on port 5432 — user accounts and auth data.
2. **Redis** on port 6379 — sports event cache (also seeded by the CRON worker in AWS).
3. **Backend API** on port 3001 — Express running via `serverless-http` adapter.
4. **Frontend** on port 3000 — React + Vite dev server.

Check that all containers are healthy:

```bash
docker-compose ps
curl http://localhost:3001/health
```

---

## Step 3: Seed the Database

```bash
docker-compose exec backend npm run db:seed
```

This creates demo users and match records. Log in with:

- **Email:** `john_doe@example.com`
- **Password:** `SecurePass123!`

---

## Step 4: Seed the Redis Sports Cache (Optional)

In production, the `ingestSports` Lambda runs on a 5-minute EventBridge schedule. Locally you can trigger it directly to see live events on the map:

```bash
docker-compose exec backend npx ts-node src/workers/ingestSports.ts
```

This writes mock event data to Redis keys `sports_live_events` and `sports_by_country:<country>`.

---

## Step 5: Open the App

- **Interactive map:** [http://localhost:3000](http://localhost:3000)
- **API documentation (Swagger):** [http://localhost:3001/api-docs](http://localhost:3001/api-docs)
- **Health check:** [http://localhost:3001/health](http://localhost:3001/health)

---

## Running Tests

```bash
# Backend (Vitest, node environment, 90% coverage threshold)
cd backend && npm test

# Frontend (Vitest, jsdom environment, 90% coverage threshold)
cd frontend && npm test

# Terraform module validation (Jest + tf-helpers)
cd terraform/test && npm test
```

---

## Running Without Docker

If you prefer bare-metal:

1. Install and start PostgreSQL (port 5432) and Redis (port 6379) locally.
2. Copy and edit `.env` as described above.
3. In one terminal:
   ```bash
   cd backend && npm install && npm run dev
   ```
4. In another terminal:
   ```bash
   cd frontend && npm install && npm run dev
   ```

---

## Stopping

```bash
docker-compose down
```

Add `-v` to also remove the PostgreSQL data volume:

```bash
docker-compose down -v
```
