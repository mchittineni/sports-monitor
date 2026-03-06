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

# IAM Policy for Bedrock access
resource "aws_iam_role_policy" "bedrock_policy" {
  name = "bedrock-policy-${var.environment}"
  role = var.lambda_role_arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream"
        ]
        Resource = "arn:aws:bedrock:*::foundation-model/*"
      }
    ]
  })
}

# SageMaker endpoint for predictions (optional)
output "bedrock_enabled" {
  value       = true
  description = "Indicator that AWS Bedrock AI services are provisioned and accessible."
}
