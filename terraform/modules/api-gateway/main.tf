variable "environment" {
  type = string
}

variable "lambda_invoke_arn" {
  type = string
}

variable "allowed_origins" {
  type        = list(string)
  description = "Allowed CORS origins for the API Gateway"
  default     = ["*"]
}

resource "aws_apigatewayv2_api" "main" {
  name          = "sports-monitor-api-${var.environment}"
  protocol_type = "HTTP"

  cors_configuration {
    allow_credentials = true
    allow_headers     = ["content-type", "authorization"]
    allow_methods     = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_origins     = var.allowed_origins
    max_age           = 300
  }
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id = aws_apigatewayv2_api.main.id

  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  payload_format_version = "2.0"
  uri                    = var.lambda_invoke_arn
}

resource "aws_apigatewayv2_route" "api_route" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "$default"
  target             = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
  authorization_type = "NONE"
}

resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = var.environment
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 100
    throttling_rate_limit  = 50
  }
}

output "api_endpoint" {
  value = aws_apigatewayv2_stage.main.invoke_url
}
