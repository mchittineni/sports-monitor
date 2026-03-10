mock_provider "aws" {}

run "execute_api_gateway_plan" {
  command = plan

  module {
    source = "./modules/api-gateway"
  }

  variables {
    environment       = "test"
    lambda_invoke_arn = "arn:aws:lambda:us-east-1:123456789012:function:sports-api-test"
    allowed_origins   = ["http://localhost:3000"]
  }

  # Assertion 1: Verify KMS Key Rotation
  assert {
    condition     = aws_kms_key.logs.enable_key_rotation == true
    error_message = "KMS key rotation must be enabled for security compliance."
  }

  # Assertion 2: Verify API Protocol Type
  assert {
    condition     = aws_apigatewayv2_api.main.protocol_type == "HTTP"
    error_message = "The API Gateway protocol type must be HTTP."
  }

  # Assertion 3: Verify Log Retention
  assert {
    condition     = aws_cloudwatch_log_group.api_gateway_logs.retention_in_days == 30
    error_message = "CloudWatch log retention should be set to 30 days."
  }

  # Assertion 4: Verify Throttling Limits
  assert {
    condition     = aws_apigatewayv2_stage.main.default_route_settings[0].throttling_burst_limit == 100
    error_message = "The API throttling burst limit is not configured correctly."
  }
}