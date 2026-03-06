mock_provider "aws" {}

run "execute_ai_services_plan" {
  command = plan

  module {
    source = "./modules/ai-services"
  }

  variables {
    environment     = "test"
    vpc_id          = "vpc-123456"
    lambda_role_arn = "sports-lambda-role-test"
  }

  assert {
    condition     = can(output.bedrock_enabled)
    error_message = "Bedrock enabled flag should exist."
  }
}
