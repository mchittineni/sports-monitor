# Getting Started

This guide will help you get **Sports Monitor** running on your local machine quickly. We highly recommend using Docker, as it sets up the database, caching layer, and node servers automatically without polluting your machine with dependencies.

## Prerequisites

- [Docker & Docker Compose](https://www.docker.com/products/docker-desktop/) installed on your machine.
- [Node.js](https://nodejs.org/) (v20+) if you prefer running things manually.

## Step 1: Environment Variables

First, copy the example environment file. This file contains default credentials suitable for local development.

```bash
cp .env.example .env
```

_(Note: Never use these default credentials in production!)_

## Step 2: Start the Services

Use Docker Compose to build and start the entire stack:

```bash
docker-compose up -d
```

This command will start:

1. **PostgreSQL** (Port 5432) for user and team data.
2. **Redis** (Port 6379) for caching.
3. **Backend API** (Port 3001).
4. **Frontend App** (Port 3000).

You can check if everything is running successfully with:

```bash
docker-compose ps
```

## Step 3: Seed Fake Data

To actually see sports events on the map, you need to populate the database with some fake data and users. We've included a handy script for this:

```bash
# Run this from the repository root:
docker-compose exec backend npm run db:seed
```

This creates demo matches and users. You can log in to the map using:

- **Email**: `john_doe@example.com`
- **Password**: `SecurePass123!`

## Step 4: Open the App

You're all set!

- 🌍 View the interactive map: [http://localhost:3000](http://localhost:3000)
- 📖 View the API documentation: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

To stop the application at any time, run:

```bash
docker-compose down
```

---

_If you prefer to run the services manually without Docker, please inspect the `package.json` scripts in both the `frontend` and `backend` directories. You will need to have your own local PostgreSQL and Redis servers running._
