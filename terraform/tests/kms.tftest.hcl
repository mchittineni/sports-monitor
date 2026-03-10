mock_provider "aws" {
  mock_data "aws_iam_policy_document" {
    defaults = {
      # We provide BOTH statements so Statement[1] exists for the test to check
      json = <<EOT
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EnableIAMUserPermissions",
      "Effect": "Allow",
      "Action": "kms:*",
      "Resource": "*"
    },
    {
      "Sid": "AllowServicesToUseKey",
      "Effect": "Allow",
      "Condition": {
        "StringEquals": { "aws:SourceAccount": "123456789012" }
      },
      "Action": "kms:GenerateDataKey*",
      "Resource": "*"
    }
  ]
}
EOT
    }
  }
}

run "validate_kms_policy" {
  command = plan

  module {
    source = "./modules/kms"
  }

  variables {
    environment = "test"
  }

  # Assertion 1: Verify that KMS key rotation is enabled for security compliance
  assert {
    condition     = aws_kms_key.shared.enable_key_rotation == true
    error_message = "KMS key rotation must be enabled for security compliance."
  }

  # Assertion21: Verify that the KMS key policy includes a condition to restrict access based on the source account for enhanced security
  assert {
    condition     = contains(keys(jsondecode(aws_kms_key.shared.policy).Statement[1].Condition.StringEquals), "aws:SourceAccount")
    error_message = "KMS policy is missing the SourceAccount security condition."
  }
}