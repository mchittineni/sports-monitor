# IAM role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${var.function_name}-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
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

# VPC access policy (required when Lambda runs inside a VPC)
resource "aws_iam_role_policy_attachment" "lambda_vpc_execution" {
  count      = length(var.subnet_ids) > 0 ? 1 : 0
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Security group for Lambda when deployed in VPC
resource "aws_security_group" "lambda_sg" {
  count       = length(var.subnet_ids) > 0 ? 1 : 0
  name        = "${var.function_name}-sg-${var.environment}"
  description = "Security group for Lambda function ${var.function_name}"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }
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

# Dynamically generate a dummy zip file for the initial terraform apply.
# The actual handler code should be deployed subsequently via a CI/CD pipeline.
data "archive_file" "dummy" {
  type        = "zip"
  output_path = "${path.module}/dummy_lambda.zip"

  source_content          = "exports.handler = async (event) => { return { statusCode: 200, body: 'Deployment successful' }; };"
  source_content_filename = "index.js"
}

# Lambda function
resource "aws_lambda_function" "api_handler" {
  # checkov:skip=CKV_AWS_272: ADD REASON
  architectures = ["arm64"]
  filename      = data.archive_file.dummy.output_path
  function_name = var.function_name
  handler       = var.handler
  runtime       = var.runtime
  role          = aws_iam_role.lambda_role.arn
  kms_key_arn   = var.kms_key_arn
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

  dynamic "vpc_config" {
    for_each = length(var.subnet_ids) > 0 ? [1] : []
    content {
      subnet_ids         = var.subnet_ids
      security_group_ids = [aws_security_group.lambda_sg[0].id]
    }
  }

  lifecycle {
    ignore_changes = [
      filename,
      source_code_hash,
      environment
    ]
  }
}

# --- EventBridge CRON Support --- #

resource "aws_cloudwatch_event_rule" "lambda_cron" {
  count               = var.schedule_expression != "" ? 1 : 0
  name                = "${var.function_name}-cron"
  description         = "Triggers ${var.function_name} based on schedule"
  schedule_expression = var.schedule_expression
}

resource "aws_cloudwatch_event_target" "lambda_cron_target" {
  count     = var.schedule_expression != "" ? 1 : 0
  rule      = aws_cloudwatch_event_rule.lambda_cron[0].name
  target_id = "TriggerLambda"
  arn       = aws_lambda_function.api_handler.arn
}

resource "aws_lambda_permission" "allow_eventbridge" {
  count         = var.schedule_expression != "" ? 1 : 0
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_handler.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.lambda_cron[0].arn
}
