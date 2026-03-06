variable "environment" {
  type        = string
  description = "The deployment environment name."
}

variable "vpc_id" {
  type        = string
  description = "VPC boundary ID for network-constrained resources."
}

variable "lambda_role_arn" {
  type        = string
  description = "The IAM role ARN of the Lambda function that requires access to AWS Bedrock AI models."
}
