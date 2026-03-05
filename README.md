# 🌍 Sports Monitor

Welcome to **Sports Monitor**! This is a modern, cloud-native web application that visualizes live sports activity around the world in real-time through an interactive and beautiful map interface.

## 🚀 Features

- **Interactive Global Map**: Click on any country to see what sports events are currently live or scheduled.
- **Real-Time Updates**: Powered by WebSockets and cached through Redis for instantaneous data delivery.
- **AI Assistant**: Chat with an integrated AI assistant (powered by AWS Bedrock / Claude 3) to ask about match statistics or get live summaries of your favorite games.
- **Highly Secure**: Features JWT authentication, hashed passwords, rate limiting, and HTTP security headers out of the box.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TailwindCSS, React-Leaflet, Zustand.
- **Backend**: Node.js, Express, Socket.io, TypeScript.
- **Database Layer**: PostgreSQL (users & teams), DynamoDB (live volatile events), Redis (query caching).
- **Infrastructure**: AWS (Lambda, API Gateway, CloudFront, S3, RDS) deployed via Terraform.

## 📖 Documentation

We've kept the documentation simple and focused so you can get up and running quickly:

1. [Getting Started](docs/GETTING_STARTED.md): Step-by-step instructions on how to run this project locally using Docker.
2. [Architecture](docs/ARCHITECTURE.md): A plain-English overview of how the frontend, backend, and databases talk to each other.
3. [Deployment Guide](docs/DEPLOYMENT.md): Learn how the app is deployed locally and in CI/CD using GitHub Actions.
4. [Terraform Modules](docs/TERRAFORM_MODULES.md): A breakdown of the infrastructure-as-code configuration.
5. [API Reference](docs/API_REFERENCE.md): How to use the interactive Swagger UI to explore and test the backend endpoints.
6. [Security](docs/SECURITY.md): Important notes on how to keep the application secure when deploying to production.
