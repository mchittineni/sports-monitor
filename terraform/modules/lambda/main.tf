variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "function_name" {
  type = string
}

variable "handler" {
  type = string
}

variable "runtime" {
  type = string
}

variable "db_host" {
  type = string
}

variable "db_name" {
  type = string
}

variable "dynamodb_table" {
  type = string
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
  filename      = "lambda_function.zip"  # Package during build
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
  value = aws_iam_role.lambda_role.arn
}

output "api_handler_invoke_arn" {
  value = aws_lambda_function.api_handler.invoke_arn
}
