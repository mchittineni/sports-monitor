variable "environment" {
  type        = string
  description = "The deployment environment (e.g., Dev, Staging, Prod) used for naming and tagging resources."
}

variable "lambda_invoke_arn" {
  type        = string
  description = "The Amazon Resource Name (ARN) invoking the primary backend Lambda function."
}

variable "allowed_origins" {
  type        = list(string)
  description = "Allowed CORS origins for the API Gateway."
  default     = ["*"]
}

variable "kms_key_arn" {
  type        = string
  description = "The ARN of the shared KMS key for encrypting CloudWatch logs."
}