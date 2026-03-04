## sports-monitor
An AI-powered, cloud-native web application that visualizes live sports activity across the world in real time through an interactive map interface.

### Security, availability, and scalability highlights

- **Secure by default**
  - HTTP security headers via `helmet`.
  - JWT authentication with bcrypt-hashed passwords.
  - Rate limiting on all API routes to reduce abuse.
  - CORS restricted to the configured frontend origin.
  - Secrets loaded strictly from environment variables or a secrets manager in production.

- **Highly available & scalable**
  - AWS API Gateway + Lambda for auto-scaling API compute.
  - DynamoDB on-demand for real-time events with TTL cleanup.
  - RDS PostgreSQL with encryption, automated backups, and Multi-AZ in production.
  - S3 + CloudFront for global, cached delivery of the React frontend.

- **Cost-conscious**
  - Small RDS instance types in non‑production.
  - On-demand DynamoDB tables and serverless compute to align cost with usage.
  - Environment-specific log retention and monitoring.

### Project structure and docs

- **Application**
  - `backend/` – Node.js/Express API, WebSocket server, auth, AI, and data pipeline.
  - `frontend/` – React + Vite SPA with interactive map and AI assistant.

- **Infrastructure and operations**
  - `terraform/` – AWS infrastructure as code (VPC, RDS, DynamoDB, Lambda, API Gateway, CloudFront, S3, monitoring).
  - `docker-compose.yml` – Local development stack (PostgreSQL, Redis, backend, frontend).
  - `.github/workflows/` – CI/CD pipelines for planning and applying Terraform and deploying the app.

- **Documentation**
  - `docs/SETUP.md` – End-to-end setup guide, environments, and deployment.
  - `docs/ARCHITECTURE.md` – System, security, and scaling architecture diagrams.
  - `docs/SECURITY.md` – Practical hardening, availability, and cost-control guidance.
  - `docs/CHECKLIST.md` – Completed feature and deployment checklist.
  - `docs/SUMMARY.md`, `docs/IMPLEMENTATION.md`, `docs/FILE_INVENTORY.md` – Deep-dive implementation details.

Sensitive configuration values are stored only in environment files (not checked in) and should be managed by a vault or secrets manager. JWT tokens, database passwords, and AWS credentials must never be committed, and HTTPS should always be enforced in production. Follow the security checklist in `docs/SETUP.md` and `docs/SECURITY.md` before deployment.
