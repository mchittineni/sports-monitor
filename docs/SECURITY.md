# Security & Production Readiness

Deploying **Sports Monitor** to the open internet requires robust security practices. Below are the minimal security requirements and architectural considerations.

## 1. Secrets Management

Never commit secrets to origin control. Always utilize a secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.) to inject configuration locally or to a deployed container.

- **JWT_SECRET**: Use a random string of at least 32 characters in production.
- **Database Credentials**: Use strong passwords for PostgreSQL and never open port 5432 to `0.0.0.0`.
- **AWS API Keys**: Instead of hardcoding keys in `.env`, use AWS IAM Roles attached directly to the Lambda functions or EC2 instances running your code.

## 2. API Security

By default, the Express application implements several layers of security:

- **Helmet**: Adds a suite of secure HTTP headers automatically to every response.
- **Rate-Limiting**: A global rate limiter (`express-rate-limit`) prevents catastrophic abuse of public endpoints by rejecting extreme bursts of traffic.
- **Authentication**: JWT issues secure session tokens, while bcrypt hashes the passwords inside the database (using a 10-round salt).

**Important**: In production, Express is configured with `trust proxy` so that it trusts the API Gateway / Load Balancer. Ensure your reverse proxy maps `X-Forwarded-*` headers correctly, and strictly configure `CORS` origins to match your frontend domain instead of using a wildcard `*`.

## 3. Availability and Scaling

Sports Monitor leverages modern scaling infrastructure out-of-the-box (via Terraform configs in `/terraform`):

- **DynamoDB** uses on-demand scaling so that bursts in "live-event" traffic instantly scale read-write capacity as sports games kick off.
- **Redis Integration** natively catches hot-path REST routes and responds from memory to protect the underlying database during viral traffic.
- **Global Error Boundaries** on React ensure that if a highly stressed node goes down or a data packet fails to resolve, a friendly UI crash page appears rather than a blank white screen.

Make sure your CloudWatch Alarms are active! It's critical to monitor the active connections to PostgreSQL and trigger automated alerts when Lambda error limits are breached.
