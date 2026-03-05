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
}
