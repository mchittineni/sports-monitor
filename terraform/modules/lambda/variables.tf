variable "environment" {
  type        = string
  description = "The deployment environment (e.g., dev, prod) to tag resources and configure env vars."
}

variable "vpc_id" {
  type        = string
  description = "The ID of the VPC where the Lambda function will operate, allowing access to private resources like RDS."
}

variable "function_name" {
  type        = string
  description = "The logical name assigned to the deployed AWS Lambda function."
}

variable "handler" {
  type        = string
  description = "The code entrypoint for the Lambda function (e.g., dist/index.handler)."
}

variable "runtime" {
  type        = string
  description = "The Node.js runtime version required to execute the Lambda code."
}

variable "db_host" {
  type        = string
  description = "The host address for the PostgreSQL database passed via environment variables."
}

variable "db_name" {
  type        = string
  description = "The name of the connected PostgreSQL database."
}

variable "dynamodb_table" {
  type        = string
  description = "The name of the DynamoDB table used for live sports events."
}

variable "subnet_ids" {
  type        = list(string)
  description = "Private subnet IDs for Lambda VPC config. Empty list disables VPC placement."
  default     = []
}

variable "schedule_expression" {
  type        = string
  description = "Optional EventBridge schedule expression (e.g., 'rate(5 minutes)'). If provided, creates a CRON trigger for this Lambda."
  default     = ""
}

variable "kms_key_arn" {
  type        = string
  description = "ARN of the KMS key used for encrypting the Lambda function's environment variables."
}