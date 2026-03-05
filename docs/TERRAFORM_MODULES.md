# Terraform Modules Guide

This project leverages **Terraform** to manage its cloud infrastructure on AWS. To keep the infrastructure maintainable, scalable, and secure, the configuration is heavily modularized.

## Existing Modules

The `terraform/modules/` directory contains the building blocks for our infrastructure:

- **`networking`**: Provisions the Virtual Private Cloud (VPC), subnets, Internet Gateways, and routing tables. Now securely configured with VPC Flow Logs.
- **`databases`**: Responsible for the underlying Relational Database Service (RDS) running PostgreSQL. Enforces encryption, blocks public Internet access, and enforces IAM Database Authentication.
- **`lambda`**: Packages and deploys the Node.js API code as a serverless function with an injected DynamoDB and database configuration. Handles all execution IAM roles and AWS X-Ray generic tracing configurations.
- **`api-gateway`**: Connects traffic from the open Internet to the Lambda functions. Configures default API routing, payload formatting, CORS restrictions, and robust CloudWatch Access Logging.
- **`frontend`**: Provisions the AWS S3 buckets and CloudFront distribution for the static React application.
- **`ai-services`**: Wires up permissions and hooks to AWS Bedrock to permit Claude 3 processing.
- **`monitoring`**: Handles dedicated CloudWatch Alarms and logs filtering for error states.

## How to Create a New Terraform Module

If you need to define a new architectural component (e.g., an SQS Queue for background job processing), you should create a new module.

### Step-by-step Process:

1. **Create the Folder Structure**:
   Create a new directory inside `terraform/modules/`.

   ```bash
   mkdir terraform/modules/sqs-jobs
   ```

2. **Define the Bare Minimum Files**:
   Inside your new folder (`terraform/modules/sqs-jobs`), create **at least** a `main.tf` file. You may optionally split variables and outputs into `variables.tf` and `outputs.tf` for larger modules.

   _Example `terraform/modules/sqs-jobs/main.tf`:_

   ```hcl
   variable "environment" {
     type = string
   }

   resource "aws_sqs_queue" "job_queue" {
     name                      = "sports-monitor-jobs-${var.environment}"
     kms_master_key_id         = "alias/aws/sqs"
     sqs_managed_sse_enabled   = true
   }

   output "queue_url" {
     value = aws_sqs_queue.job_queue.id
   }
   ```

3. **Call the Module in the Root** (`terraform/main.tf`):
   To use your newly created module, instantiate it in the root `main.tf` file and pass down the necessary variables.

   ```hcl
   module "sqs_jobs" {
     source = "./modules/sqs-jobs"

     environment = var.environment
   }
   ```

4. **Verify Your Syntax**:
   Before committing, initialize the dependencies and format your files.

   ```bash
   cd terraform/
   terraform init
   terraform fmt -recursive
   terraform validate
   ```

5. **Write Terraform Tests**:
   All modules MUST be covered by both Jest Integration Tests and Native Terraform Tests. If tests are omitted, the continuous integration pipelines will fail.
   - Run Native Tests: `terraform test`
   - Run Integration Tests (from `terraform/test`): `npm run test`
   - Test Coverage Script: `npm run test:coverage` (validates 100% module `.tftest.hcl` coverage mapping)

### Security Considerations for New Modules

Our CI/CD pipelines are rigidly monitored by `tfsec`. If your module provisions unencrypted data, opens wildcards (`*`) to the internet on `security_groups`, or provides overly permissive IAM roles, it will fail to deploy. Always refer to `tfsec` AWS rules before creating a module.
