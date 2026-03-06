# Deployment Guide

This document covers local development deployment and the automated CI/CD pipelines used for production deployments via GitHub Actions.

---

## 1. Local Deployment (Docker Compose)

Docker Compose spins up the full application stack locally without requiring PostgreSQL or Redis to be installed on your host.

### Prerequisites

- Docker and Docker Compose installed.
- AWS credentials configured locally if you want to test Bedrock AI features.

### Steps

1. **Prepare the environment file:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your local values. Never commit this file.

2. **Start the stack:**
   ```bash
   docker-compose up -d --build
   ```
   This starts:
   - `postgres` on port 5432
   - `redis` on port 6379
   - `backend` (Lambda-compatible Express) on port 3001
   - `frontend` (Vite dev server) on port 3000

3. **Seed the database:**
   ```bash
   docker-compose exec backend npm run db:seed
   ```

4. **Access the app:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API docs: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)
   - Health check: [http://localhost:3001/health](http://localhost:3001/health)

5. **Stop the stack:**
   ```bash
   docker-compose down
   ```

> **Sports data note:** Live events are populated by the `ingestSports` CRON Lambda in AWS. Locally, you can trigger it manually:
> ```bash
> docker-compose exec backend npx ts-node src/workers/ingestSports.ts
> ```

---

## 2. GitHub Actions CI/CD Pipelines

All workflows live in `.github/workflows/`. They authenticate to AWS via **OIDC** — no long-lived access keys are stored as secrets.

### Required repository secrets

| Secret | Description |
|---|---|
| `AWS_ROLE_ARN` | IAM Role ARN the OIDC provider can assume |
| `AWS_REGION` | Target AWS region (e.g. `us-east-1`) |
| `ECR_REGISTRY` | ECR registry URL |
| `ECR_BACKEND_REPOSITORY` | Backend image repo name |
| `ECR_FRONTEND_REPOSITORY` | Frontend image repo name |
| `TF_STATE_BUCKET` | S3 bucket for Terraform remote state |
| `LAMBDA_FUNCTION_NAME` | Lambda function name for backend deploys |
| `FRONTEND_BUCKET` | S3 bucket name for the React build |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution to invalidate after deploy |

---

### A. Tests & Lint (`test.yml`)

**Trigger:** Push or pull request to `main` or `develop`.

**What it does:**
1. Runs `npm run lint` + `npm run build` + `npm test` for both `frontend` and `backend`.
2. Runs Jest integration tests in `terraform/test/` (all 8 modules: networking, databases, lambda, api-gateway, frontend, ai-services, monitoring, main).
3. Runs `terraform validate` on all modules.
4. Runs **Checkov** IaC security scan using `.checkov.yml` (`soft-fail: false`, `hard-fail-on: [HIGH, CRITICAL]`).

Coverage thresholds (90% lines / functions / branches / statements) are enforced for both frontend and backend.

---

### B. Build & Push (`build.yml`)

**Trigger:** Push to `main`.

**What it does:**
1. Builds Docker images for `backend` and `frontend`.
2. Scans each image with **Trivy** (pinned to `aquasecurity/trivy-action@0.28.0`) for OS/library CVEs before pushing.
3. Pushes tagged images to **AWS ECR**.

---

### C. Deploy (`deploy.yml`)

**Trigger:** Push to `main` (also supports manual `workflow_dispatch`).

**Pipeline stages:**

#### Stage 1 — Terraform Plan
```
cd terraform && terraform init && terraform plan -out=tfplan
```
The plan artifact (`tfplan`) is uploaded via `actions/upload-artifact@v4` so the next job uses exactly the same plan that was reviewed.

#### Stage 2 — Terraform Apply
```
terraform apply -auto-approve tfplan
```
Downloads the `tfplan` artifact from Stage 1 and applies it. Uses `AWS_REGION` from repository secrets (not hardcoded).

#### Stage 3 — Backend Deploy
Deploys the newly pushed ECR image to the Lambda function:
```bash
aws lambda update-function-code \
  --function-name ${{ secrets.LAMBDA_FUNCTION_NAME }} \
  --image-uri $ECR_IMAGE
```

#### Stage 4 — Frontend Deploy
Builds the React app, syncs to S3, then invalidates CloudFront:
```bash
aws s3 sync dist/ s3://${{ secrets.FRONTEND_BUCKET }} --delete
aws cloudfront create-invalidation \
  --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
  --paths "/*"
```

---

## 3. Terraform Configuration

### Remote state

Terraform state is stored in an S3 backend (configured in `terraform/main.tf`). Always run `terraform init` before plan/apply in a new environment.

### Environment variables

Copy the example tfvars file and fill in your values:
```bash
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
```

Never commit `terraform.tfvars` — it contains database credentials.

### Module structure

Every module under `terraform/modules/` contains exactly three files:

| File | Purpose |
|---|---|
| `variables.tf` | All input variable declarations |
| `main.tf` | Resources and data sources |
| `outputs.tf` | All output value declarations |

See [TERRAFORM_MODULES.md](TERRAFORM_MODULES.md) for details on each module.

---

## 4. Manual Rollback

If a deployment introduces a regression:

**Lambda:** Roll back to the previous image digest:
```bash
aws lambda update-function-code \
  --function-name <name> \
  --image-uri <previous-ecr-uri>
```

**Terraform:** Revert the offending commit and re-run the deploy workflow, or run `terraform apply` locally from the previous state.

**Frontend:** Re-sync the previous `dist/` build to S3 and invalidate CloudFront.
