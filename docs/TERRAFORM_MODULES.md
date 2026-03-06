# Terraform Modules Guide

All AWS infrastructure is managed through Terraform modules in `terraform/modules/`. Every module follows a strict three-file layout and is covered by automated tests in `terraform/test/`.

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

### `networking`

Provisions the VPC, public and private subnets, Internet Gateway, **NAT Gateway** (single instance in the first public subnet for cost efficiency), and route tables.

Key resources:
- `aws_vpc` — 10.0.0.0/16 with DNS support
- `aws_subnet` (public × 3, private × 3) across availability zones
- `aws_internet_gateway` — for public subnet egress
- `aws_eip` + `aws_nat_gateway` — for private subnet egress (Bedrock, external APIs)
- `aws_route_table` + `aws_route_table_association` — separate tables for public and private subnets

Outputs: `vpc_id`, `public_subnet_ids`, `private_subnet_ids`

---

### `databases`

Provisions **RDS PostgreSQL** (Multi-AZ) in private subnets.

Key resources:
- `aws_db_subnet_group` — places RDS in private subnets from the networking module
- `aws_db_instance` — encrypted, no public access, `max_allocated_storage = 100` for autoscaling
- `aws_security_group` — RDS SG allowing only Lambda SG on port 5432

Inputs required: `vpc_id`, `subnet_ids` (private), `db_name`, `db_username`, `db_password`

---

### `lambda`

Packages and deploys Lambda functions with **VPC placement** and correct IAM.

Key resources:
- `aws_iam_role` — with `Effect = "Allow"` (not `"Principal"`) in the assume role policy
- `aws_iam_role_policy_attachment` — `AWSLambdaBasicExecutionRole` + `AWSLambdaVPCAccessExecutionRole`
- `aws_security_group` — Lambda SG with controlled egress (HTTPS to Bedrock, Redis port to cache SG)
- `aws_lambda_function` — VPC config with `subnet_ids` (private) and `security_group_ids`

Inputs required: `vpc_id`, `subnet_ids`, `function_name`, `image_uri`, `environment_variables`

---

### `api-gateway`

Connects the public internet to Lambda via **API Gateway v2 HTTP API**.

Key resources:
- `aws_apigatewayv2_api` — HTTP API with CORS and default route
- `aws_apigatewayv2_integration` — Lambda proxy integration
- `aws_apigatewayv2_stage` — `$default` stage with auto-deploy and CloudWatch access logging

---

### `frontend`

Hosts the React SPA on **S3 + CloudFront** with fully private bucket access via OAC.

Key resources:
- `aws_s3_bucket` — private bucket (all `block_public_*` settings enabled)
- `aws_cloudfront_origin_access_control` — `sigv4` signing, `always` signing behavior
- `aws_s3_bucket_policy` — allows only `cloudfront.amazonaws.com` with `AWS:SourceArn` condition
- `aws_cloudfront_distribution` — HTTPS-only, OAC origin, `PriceClass_100`

> The S3 bucket does **not** use a public bucket policy. Access is exclusively through CloudFront OAC.

---

### `ai-services`

Provisions IAM permissions for Lambda to call **AWS Bedrock** (Claude 3 Sonnet).

Key resources:
- `aws_iam_policy` — `bedrock:InvokeModel` on the Claude 3 Sonnet model ARN
- `aws_iam_role_policy_attachment` — attaches the Bedrock policy to the Lambda execution role

The model ID is configurable via `BEDROCK_MODEL_ID` environment variable (default: `anthropic.claude-3-sonnet-20240229`).

---

### `monitoring`

Provisions **CloudWatch Alarms** and SNS notifications.

Key resources:
- `aws_kms_key` — KMS key for SNS topic encryption (created before the log group that references it)
- `aws_sns_topic` — encrypted alert topic
- `aws_sns_topic_subscription` — email subscription to `alarm_email`
- `aws_cloudwatch_metric_alarm` — Lambda error rate, RDS CPU, ElastiCache memory

---

## Root `terraform/`

The root module (`terraform/main.tf`) wires all child modules together and passes shared values (VPC ID, private subnet IDs, environment) between them.

The root also contains `variables.tf` and `outputs.tf` at the top level — all variable and output blocks live there, not inline in `main.tf`.

---

## IaC Testing

All modules are covered by automated tests in `terraform/test/`:

| Test file | Module tested |
|---|---|
| `networking.test.ts` | `modules/networking` |
| `databases.test.ts` | `modules/databases` |
| `lambda.test.ts` | `modules/lambda` |
| `api-gateway.test.ts` | `modules/api-gateway` |
| `frontend.test.ts` | `modules/frontend` |
| `ai-services.test.ts` | `modules/ai-services` |
| `monitoring.test.ts` | `modules/monitoring` |
| `main.test.ts` | root `terraform/` |

Each test runs `terraformInit` then `terraformValidate` via the `tf-helpers` utility. All tests have a 120 s timeout to accommodate provider download time.

Run the tests:
```bash
cd terraform/test && npm test
```

---

## Creating a New Module

1. **Create the directory and required files:**
   ```bash
   mkdir terraform/modules/sqs-jobs
   touch terraform/modules/sqs-jobs/{variables.tf,main.tf,outputs.tf}
   ```

2. **Declare all inputs in `variables.tf`**, all resources in `main.tf`, all outputs in `outputs.tf`.

3. **Call the module in `terraform/main.tf`:**
   ```hcl
   module "sqs_jobs" {
     source      = "./modules/sqs-jobs"
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
