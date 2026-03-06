# Deployment Guide

This document outlines the deployment process for **Sports Monitor** both for local development environments and automated production deployments via GitHub Actions.

## 1. Local Deployment (Docker Compose)

For local development, we use Docker Compose to spin up the entire application stack without requiring you to manually install dependencies like PostgreSQL or Redis on your host machine.

### Prerequisites

- Docker and Docker Compose installed.

### Steps

1. **Prepare Environment File**:
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. **Start the Stack**:
   Run the following command at the root of the project:
   ```bash
   docker-compose up -d --build
   ```
   This will start:
   - `postgres` on port 5432
   - `redis` on port 6379
   - `backend` on port 3001
   - `frontend` on port 3000
3. **Seed the Database**:
   Populate the database with sample data (teams, users, matches):
   ```bash
   docker-compose exec backend npm run db:seed
   ```
4. **Access the App**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API Docs: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

To stop the stack, run `docker-compose down`.

---

## 2. GitHub Actions Deployment (CI/CD)

For remote environments (dev, staging, prod), we use **GitHub Actions** located in `.github/workflows/`. Our automated pipelines are designed to validate, build, and deploy the infrastructure and application code securely.

### Workflows

#### A. Tests & Lint (`test.yml`)

- **Trigger**: Pushes and PRs to `main` or `develop`.
- **Purpose**: Runs `npm test`, `npm run build`, and `npm run lint` for frontend and backend codebases. It also executes the infrastructure checks: running both Jest Integration tests and Native Terraform Tests (`terraform test`), performing a `tfsec` security scan, and executing `terraform validate` to ensure infrastructure code is safe and syntactically correct.

#### B. Build & Push (`build.yml`)

- **Trigger**: Pushes to `main`.
- **Purpose**: Builds the Docker images for frontend and backend. Before pushing to the AWS ECR registry, images are actively scanned for OS/Library CVEs using `trivy`.

#### C. Deploy (`deploy.yml`)

- **Trigger**: Successful push to `main` (along with a manual `workflow_dispatch` fallback).
- **Purpose**:
  1. **Terraform**: Plans and applies the AWS infrastructure.
  2. **Backend**: Deploys the newly updated Docker image to the AWS Lambda function.
  3. **Frontend**: Builds the React single-page app and syncs it securely to the S3 bucket, then invalidates the CloudFront CDN cache automatically.

### AWS OIDC Authentication

Our workflows securely authenticate to AWS without using long-lived access keys by leveraging **OpenID Connect (OIDC)**. Ensure your GitHub repository is configured as an OIDC Identity Provider in AWS IAM so the `AWS_ROLE_ARN` secret can be naturally assumed.
