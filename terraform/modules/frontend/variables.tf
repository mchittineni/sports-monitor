variable "environment" {
  type        = string
  description = "Execution environment name used for resource naming (e.g., dev, prod)."
}

variable "frontend_bucket_name" {
  type        = string
  description = "The exact, globally unique name for the S3 bucket hosting the static frontend assets."
}

variable "kms_key_arn" {
  type        = string
  description = "ARN of the KMS key used for encrypting the S3 bucket."
}