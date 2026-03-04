## Security, Availability, and Scalability Guide

This document explains how the sports-monitor stack is secured, how it scales, and what you should configure for production while keeping costs under control.

### Backend application

- **Secrets management**
  - `JWT_SECRET` is required in production and must be provided via environment variables or a secrets manager.
  - Local development uses a weak default secret; never reuse it in any shared or production environment.
  - Database credentials and AWS keys must not be committed to Git; store them in a vault (AWS Secrets Manager, HashiCorp Vault, 1Password, etc.).

- **HTTP and API security**
  - `helmet` is enabled globally to add secure HTTP headers.
  - A basic rate limiter protects all `/api` endpoints from abuse (burst traffic is automatically throttled).
  - CORS is locked to a single frontend origin via `CLIENT_URL`; update this per environment rather than using `*`.
  - In production, Express is configured with `trust proxy` so it correctly interprets `X-Forwarded-*` headers behind API Gateway or a load balancer.

- **Authentication**
  - Passwords are hashed with `bcrypt` and never stored in plain text.
  - JWT tokens use HS256 with 7‑day access and 30‑day refresh expirations.
  - All protected routes use middleware that validates the `Authorization: Bearer <token>` header.

### Infrastructure (Terraform)

- **PostgreSQL (RDS)**
  - Storage encryption is enabled by default; data at rest is protected with AWS-managed keys.
  - Automatic backups are configured with higher retention in production.
  - Deletion protection is turned on in production to prevent accidental data loss.

- **DynamoDB and Logs**
  - DynamoDB tables are on-demand, which auto-scale read/write capacity.
  - TTL is enabled on hot-event data so old items are cleaned up automatically.
  - CloudWatch log groups are created per environment with reasonable retention periods.

- **Monitoring and alerts**
  - CloudWatch alarms watch Lambda errors and RDS CPU utilization.
  - An SNS topic sends email alerts to the configured `alarm_email`.

### Scaling and cost controls

- **Automatic scaling**
  - API Gateway and Lambda scale horizontally with traffic.
  - DynamoDB uses on-demand capacity, scaling up and down automatically.
  - The frontend is served from S3 + CloudFront, which handle large spikes with caching.

- **Right-sizing and environment profiles**
  - RDS uses a small `t3.micro` instance in non‑production and a `t3.medium` in production by default.
  - Multi‑AZ is enabled only for production (for higher availability, at higher cost).
  - CloudWatch log retention is shorter in dev/staging and longer in prod.

### What you should do before going live

- Set a long, random `JWT_SECRET` for each environment (dev/staging/prod).
- Store all database passwords and AWS credentials in a proper secrets manager.
- Restrict CORS to your real frontend domain(s).
- Configure AWS IAM roles with least‑privilege policies for Lambda and CI.
- Review CloudWatch alarms and SNS targets so the right team members receive alerts.

