mock_provider "aws" {}

run "execute_ecr_plan" {
  command = plan

  module {
    source = "./modules/ecr"
  }

  variables {
    environment = "test"
  }

  # Assertion 1: Verify the Repository Name logic
  assert {
    condition     = aws_ecr_repository.backend.name == "sports-monitor-backend"
    error_message = "The ECR repository name was not set correctly."
  }

  # Assertion 2: Verify Encryption Configuration
  assert {
    condition     = aws_ecr_repository.backend.encryption_configuration[0].encryption_type == "KMS"
    error_message = "ECR must use KMS encryption for security compliance."
  }

  # Assertion 3: Verify Lifecycle Policy logic
  assert {
    condition     = jsondecode(aws_ecr_lifecycle_policy.backend_policy.policy).rules[0].selection.countNumber == 30
    error_message = "The lifecycle policy must be configured to retain 30 images."
  }

  # Assertion 4: Verify Tagging logic
  assert {
    condition     = aws_ecr_repository.backend.tags["Environment"] == "test"
    error_message = "The Environment tag was not applied correctly to the ECR repository."
  }
}