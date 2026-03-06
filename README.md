# 🌍 Sports Monitor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Frontend: React](https://img.shields.io/badge/frontend-React-61DAFB?logo=react&logoColor=black)](#)
[![Backend: Node.js](https://img.shields.io/badge/backend-Node.js-339933?logo=node.js&logoColor=white)](#)
[![Infrastructure: Terraform](https://img.shields.io/badge/IaC-Terraform-7B42BC?logo=terraform&logoColor=white)](#)

Welcome to **Sports Monitor**! A modern, highly available, and cloud-native web application that visualizes live sports activity worldwide in real-time through an interactive map interface.

## 🚀 Key Features

- **Interactive Global Map**: Click on any country to discover live or scheduled sports events.
- **Real-Time Subscriptions**: Powered by WebSockets and cached through Redis for sub-second data delivery to active clients.
- **AI-Powered Insights**: An integrated assistant powered by AWS Bedrock (Claude 3) provides intelligent match statistics and live game summaries.
- **Security First**: Features JWT authentication, secure password hashing, rate limiting, and optimal HTTP security headers.
- **Highly Scalable**: Infrastructure deployed via Terraform supporting multi-AZ availability, auto-scaling, and Redis caching.

## 🛠️ Technology Stack

| Layer           | Technologies                                                         |
| :-------------- | :------------------------------------------------------------------- |
| **Frontend**    | React, Vite, TailwindCSS, React-Leaflet, Zustand                     |
| **Backend**     | Node.js, Express, Socket.io, TypeScript                              |
| **Databases**   | PostgreSQL (Relational), DynamoDB (Volatile Events), Redis (Caching) |
| **Cloud (AWS)** | Lambda, API Gateway, CloudFront, S3, RDS, Bedrock                    |
| **Infra (IaC)** | Terraform                                                            |

## 📐 Architecture High-Level

The application separates concerns between the React Client, the Node.js API/WebSocket Server, and a multi-tiered database setup. For a detailed breakdown and data flow diagram, see the [Architecture Documentation](docs/ARCHITECTURE.md).

## 📖 Complete Documentation

We maintain specific, focused documentation so you can find exactly what you need quickly:

1.  [**Getting Started**](docs/GETTING_STARTED.md): Step-by-step instructions on running this project locally using Docker Compose, including seeding data.
2.  [**Architecture & Data Flow**](docs/ARCHITECTURE.md): An outline of the system components and a visual sequence diagram of data from client to databases.
3.  [**API Reference**](docs/API_REFERENCE.md): Start the server to access the live Swagger UI to explore, authorize, and test backend endpoints.
4.  [**Security & Scalability**](docs/SECURITY.md): Important notes on keeping the application secure, rate limits, and configuration for production readiness.
5.  [**Deployment Guide**](docs/DEPLOYMENT.md): Continuous Integration and Continuous Deployment (CI/CD) instructions using GitHub Actions.
6.  [**Terraform Modules**](docs/TERRAFORM_MODULES.md): A breakdown of the infrastructure-as-code configuration and components deployed to AWS.

## 🤝 Contributing & Standards

Ensure you read the documentation thoroughly. This project emphasizes readability, strong typing, and robust documentation. All components and modules should be thoroughly commented using TSDoc/JSDoc standards. Before submitting PRs, please ensure that `npm run type-check` and `npm run test` pass successfully in both frontend and backend repositories.
