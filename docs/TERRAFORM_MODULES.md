# 🛡️ Terraform Modules Guide

All AWS infrastructure is managed through Terraform modules in `modules/`. Every module follows a strict three-file layout and is covered by automated native tests in `tests/`.

---

## Module File Structure (Required)

Every module **must** contain exactly these three files — no exceptions:

| File | Purpose |
|---|---|
| `variables.tf` | All `variable` declarations (type, description, default) |
| `main.tf` | All `resource` and `data` blocks |
| `outputs.tf` | All `output` value declarations |

Inline variable or output blocks inside `main.tf` are not permitted. This enforces consistent discoverability across the codebase.

---

## Existing Modules

### `kms` (Consolidated Security Layer)

Provisions a single, high-restriction **Customer Managed Key (CMK)** shared across all modules to reduce baseline costs by ~$15/month per environment.

Key resources:
- `aws_kms_key` — Consolidated key with `enable_key_rotation = true`.
- `aws_iam_policy_document` — Hardened policy using `aws:SourceAccount` conditions to prevent "confused deputy" attacks.
- `aws_kms_alias` — Environment-specific alias (e.g., `alias/sports-monitor-shared-prod`).

---

### `networking`

Provisions the VPC, public/private subnets, and NAT Gateway.

Key resources:
- `aws_vpc` — 10.0.0.0/16 with DNS support.
- `aws_cloudwatch_log_group` — VPC Flow Logs encrypted with the shared KMS key.
- `aws_nat_gateway` — Single instance in the first public subnet for cost efficiency.

---

### `databases`

Provisions **RDS PostgreSQL** using ARM64 (`db.t4g.micro`) instances for optimal price-performance.

Key resources:
- `aws_db_instance` — Encrypted storage and Performance Insights using the shared KMS key.
- `aws_security_group` — Restricted to Lambda ingress only on port 5432.

---

### `lambda`

Packages and deploys Lambda functions with **VPC placement** and ARM64 architecture.

Key resources:
- `aws_lambda_function` — Encrypted environment variables and VPC configuration.
- `aws_iam_role` — Standardized execution roles with Least Privilege policies.

---

### `api-gateway`

Connects the public internet to Lambda via **API Gateway v2 (HTTP API)**.

Key resources:
- `aws_apigatewayv2_api` — HTTP API with CORS enabled.
- `aws_cloudwatch_log_group` — Access logs encrypted via the shared KMS key.

---

### `frontend`

Hosts the React SPA on **S3 + CloudFront** with private bucket access via OAC.

Key resources:
- `aws_s3_bucket` — Private bucket with SSE-KMS encryption.
- `aws_cloudfront_origin_access_control` — Restricts bucket access solely to CloudFront.

---

### `monitoring`

Provisions **CloudWatch Alarms** and encrypted SNS notifications.

Key resources:
- `aws_sns_topic` — Encrypted alert topic using the shared KMS key.
- `aws_cloudwatch_metric_alarm` — Monitoring for Lambda errors, RDS CPU, and DynamoDB throttles.

---

## IaC Testing

All modules are covered by native Terraform tests in `tests/`. These tests use **Mock Providers** to validate logic without incurring AWS costs.

| Test file | Module tested | Verification Logic |
|---|---|---|
| `ai-services.test.ts` | `modules/ai-services` | Validates IAM policy allows bedrock:InvokeModel and checks model ARN formatting. |
| `api-gateway.tftest.hcl` | `modules/api-gateway` | Ensures log groups are linked to the shared KMS ARN. |
| `databases.tftest.hcl` | `modules/databases` | Checks instance class (t4g) and encryption settings. |
| `ecr.test.ts` | `modules/ecr` | Verifies image immutability is enabled and scan-on-push is active for security compliance. |
| `frontend.test.ts` | `modules/frontend` | Validates CloudFront OAC configuration and S3 bucket encryption using the shared KMS key. |
| `kms.tftest.hcl` | `modules/kms` | Verifies key rotation and policy JSON structure. |
| `lambda.test.ts` | `modules/lambda` | Checks for VPC placement, ARM64 architecture, and KMS encryption of environment variables. |
| `monitoring.test.ts` | `modules/monitoring` | Verifies SNS topic encryption and confirms CloudWatch alarms are mapped to correct thresholds. |
| `networking.tftest.hcl` | `modules/networking` | Validates subnet distribution across AZs. |

Each test runs `terraformInit` then `terraformValidate` via the `tf-helpers` utility. All tests have a 120 s timeout to accommodate provider download time.

Run the tests:
```bash
cd terraform/test && npm test
```

---

### 🏷️ Tagging Strategy
The project uses **Provider-Level Default Tags**. Do not add manual `tags` blocks to resources unless a unique identifier is required. Every resource automatically inherits:
- `Project`: "Sports Monitor"
- `Environment`: `var.environment` (dev/staging/prod)
- `Service`: "Sports-Monitor-Core"
- `ManagedBy`: "Terraform"

---

## Creating a New Module

1. **Create the directory and required files:**
   ```bash
   mkdir modules/new-service
   touch modules/new-service/{variables.tf,main.tf,outputs.tf}
   ```

2. **Declare all inputs in `variables.tf`**, all resources in `main.tf`, all outputs in `outputs.tf`.

3. **Call the module in `terraform/main.tf`:**
   ```hcl
   module "new_service" {
      source      = "./modules/new-service"
      kms_key_arn = module.kms.key_arn
      environment = var.environment
    }
   ```

4. **Validate your changes:**
   ```bash
   cd terraform
   terraform init
   terraform fmt -recursive
   terraform validate
   ```

5. **Add a test file** in `terraform/test/<module-name>.test.ts` following the `lambda.test.ts` pattern.

6. **Run Checkov before committing:**
   ```bash
   checkov -d terraform/ --config-file terraform/.checkov.yml
   ```
   All `HIGH` and `CRITICAL` findings must be resolved — they will block CI.

---

## Security Rules for New Modules

The CI pipeline runs Checkov with `hard-fail-on: [HIGH, CRITICAL]`. Common failure patterns to avoid:

- Unencrypted S3 buckets, RDS instances, or SQS queues
- Security groups with `0.0.0.0/0` inbound rules
- Overly permissive IAM policies (`Action: "*"` or `Resource: "*"`)
- Public RDS instances (`publicly_accessible = true`)
- Lambda functions without VPC placement (cannot reach private resources)
- S3 buckets with public ACLs or missing `block_public_*` settings