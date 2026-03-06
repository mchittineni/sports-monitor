# Security & Production Readiness

This document outlines the security controls implemented across the application stack and the requirements for safe production operation.

---

## 1. Secrets Management

Never commit secrets to version control.

| Secret | Requirement | How to supply |
|---|---|---|
| `JWT_SECRET` | Minimum 32 random characters | AWS Secrets Manager or CI/CD secret |
| `DB_PASSWORD` | Strong password (16+ chars, special chars) | AWS Secrets Manager; injected as env var |
| `DB_USER` | Non-default username | Same as above |
| AWS credentials | No long-lived access keys | IAM Roles via OIDC (GitHub Actions) or Instance Profile |
| `BEDROCK_MODEL_ID` | Non-sensitive, but configurable | Environment variable |

The `terraform/terraform.tfvars.example` file shows required Terraform variables. Copy it to `terraform.tfvars` (git-ignored) and fill in real values before running `terraform apply`.

---

## 2. API Security

### HTTP Security Headers
`helmet` is applied globally in `index.ts` and adds secure defaults for all headers (CSP, HSTS, X-Frame-Options, etc.).

### Rate Limiting
- **Global API limiter:** 300 requests / 15 min per IP (disabled in development mode).
- **AI endpoint limiter:** 10 requests / 15 min per IP — applied exclusively to `/api/ai/*` to protect expensive Bedrock calls.

### Authentication
- Passwords hashed with `bcrypt` (10 salt rounds).
- JWT access tokens (short-lived) + refresh tokens (longer-lived).
- `trust proxy: 1` is set in production so Express correctly reads client IPs from `X-Forwarded-For` behind API Gateway / ALB.

### CORS
Origin is restricted to `CLIENT_URL` environment variable. Never use `*` in production.

---

## 3. Network Isolation (VPC)

All compute and data resources run inside a private VPC:

```
VPC 10.0.0.0/16
├── Public Subnets  — NAT Gateway, Internet Gateway only
└── Private Subnets — Lambda, RDS PostgreSQL, ElastiCache Redis
```

- **Lambda** runs in private subnets with a dedicated security group. Outbound internet access (for Bedrock, external APIs) routes through the **NAT Gateway** — inbound from the internet is not permitted directly.
- **RDS PostgreSQL** is placed in private subnets via a **DB Subnet Group**. Port 5432 is not accessible from the public internet.
- **ElastiCache Redis** is in the same private subnets. Port 6379 is not publicly accessible.

---

## 4. Database Security

- **SSL enforced in production:** `connection.ts` sets `ssl: { rejectUnauthorized: true }` when `NODE_ENV === 'production'`. Self-signed certificates are rejected.
- **Parameterised queries:** All SQL uses the `$1, $2 …` placeholder syntax via `pg.Pool.query()` — no string concatenation, no SQL injection risk.
- **Connection pool limits:** Configurable via `DB_POOL_MAX` (default 20) with idle and connection timeouts to prevent resource exhaustion.

---

## 5. Frontend / CDN Security

- The React build is served from **S3 + CloudFront**.
- The S3 bucket is **fully private** (`block_public_acls`, `block_public_policy`, `ignore_public_acls`, `restrict_public_buckets` all set to `true`).
- CloudFront accesses S3 exclusively via **Origin Access Control (OAC)** with `sigv4` request signing. No public bucket policies are used.
- CloudFront enforces **HTTPS-only** (`redirect-to-https` viewer protocol policy).

---

## 6. IaC Security Scanning (Checkov)

All Terraform changes are scanned with **Checkov** in CI. The `.checkov.yml` configuration enforces:

```yaml
soft-fail: false        # Non-zero exit code on any failure — blocks the pipeline
hard-fail-on:
  - HIGH
  - CRITICAL
```

This means any `HIGH` or `CRITICAL` severity finding will fail the CI job and prevent deployment. `MEDIUM` and `LOW` findings are surfaced as warnings.

Run locally before pushing:
```bash
checkov -d terraform/ --config-file terraform/.checkov.yml
```

---

## 7. Container Image Scanning (Trivy)

Backend and frontend Docker images are scanned by **Trivy** (`aquasecurity/trivy-action@0.28.0`) before being pushed to ECR. Any `HIGH` or `CRITICAL` CVEs in OS packages or application dependencies will fail the build workflow.

---

## 8. Monitoring & Alerting

- **CloudWatch Alarms** (provisioned by the `monitoring` Terraform module) alert on Lambda error rates, RDS CPU, and ElastiCache memory pressure.
- **SNS notifications** route alarms to the `alarm_email` address configured in `terraform.tfvars`.
- **React ErrorBoundary** (`ErrorBoundary.tsx`) catches unhandled render errors and shows a user-friendly fallback instead of a blank screen.

---

## 9. Checklist Before Going to Production

- [ ] Rotate all default passwords in `.env` / Secrets Manager
- [ ] Set a strong random `JWT_SECRET` (32+ chars)
- [ ] Confirm `NODE_ENV=production` is set in the Lambda environment
- [ ] Confirm CORS `CLIENT_URL` matches your CloudFront domain only
- [ ] Confirm CloudWatch Alarms are active and `alarm_email` is a monitored inbox
- [ ] Run `checkov` and resolve all HIGH/CRITICAL findings
- [ ] Run `trivy` on final Docker images
- [ ] Verify RDS is in private subnets and not publicly accessible
- [ ] Verify Lambda security group only allows required outbound traffic
