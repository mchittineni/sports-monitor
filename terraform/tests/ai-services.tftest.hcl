mock_provider "aws" {}

run "execute_ai_services_plan" {
  command = plan

  module {
    source = "./modules/ai-services"
  }

  variables {
    environment      = "test"
    vpc_id           = "vpc-123456"
    lambda_role_name = "my-test-role-name"
  }

  # Assertion 1: Verify Bedrock Enabled Output
  assert {
    condition     = can(output.bedrock_enabled)
    error_message = "Bedrock enabled flag should exist."

  }

  # Assertion 2: Verify Policy Naming
  assert {
    condition     = aws_iam_role_policy.bedrock_policy.name == "bedrock-policy-test"
    error_message = "The IAM policy name does not include the correct environment suffix."
  }

  # Assertion 3: Verify Permissions (Bedrock Actions)
  assert {
    condition     = contains(jsondecode(aws_iam_role_policy.bedrock_policy.policy).Statement[0].Action, "bedrock:InvokeModel")
    error_message = "The IAM policy is missing the required bedrock:InvokeModel permission."
  }

  # Assertion 4: Verify Resource Scope
  assert {
    condition     = jsondecode(aws_iam_role_policy.bedrock_policy.policy).Statement[0].Resource == "arn:aws:bedrock:*::foundation-model/*"
    error_message = "The policy resource ARN is incorrect or has been modified."
  }
}
