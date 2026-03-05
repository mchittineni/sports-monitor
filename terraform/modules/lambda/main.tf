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
  description = "The name of the connected PostgresSQL database."
}

variable "dynamodb_table" {
  type        = string
  description = "The name of the DynamoDB table used for live sports events."
}

# IAM role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${var.function_name}-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Principal"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# Attach basic execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Attach X-Ray tracing policy
resource "aws_iam_role_policy_attachment" "lambda_xray_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess"
}

# DynamoDB access policy
resource "aws_iam_role_policy" "dynamodb_policy" {
  name = "dynamodb-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          "arn:aws:dynamodb:*:*:table/${var.dynamodb_table}",
          "arn:aws:dynamodb:*:*:table/${var.dynamodb_table}/index/*"
        ]
      }
    ]
  })
}

# Lambda function
resource "aws_lambda_function" "api_handler" {
  filename      = "lambda_function.zip" # Package during build
  function_name = var.function_name
  handler       = var.handler
  runtime       = var.runtime
  role          = aws_iam_role.lambda_role.arn
  timeout       = 30
  memory_size   = 512

  environment {
    variables = {
      DB_HOST        = var.db_host
      DB_NAME        = var.db_name
      DYNAMODB_TABLE = var.dynamodb_table
      ENVIRONMENT    = var.environment
    }
  }

  tracing_config {
    mode = "Active"
  }
}

output "lambda_role_arn" {
  value       = aws_iam_role.lambda_role.arn
  description = "The ARN of the IAM role assumed by the Lambda function during execution."
}

output "api_handler_invoke_arn" {
  value       = aws_lambda_function.api_handler.invoke_arn
  description = "The ARN used by API Gateway to grant permission to invoke the Lambda function."
}
