data "aws_caller_identity" "current" {}

resource "aws_kms_key" "shared" {
  description             = "Shared KMS key for ${var.environment} infrastructure"
  deletion_window_in_days = 10
  enable_key_rotation     = true
  policy                  = data.aws_iam_policy_document.kms_shared.json

  tags = {
    Name        = "sports-monitor-shared-kms-${var.environment}"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

data "aws_iam_policy_document" "kms_shared" {
  # 1. Allow root/admin to manage the key
  statement {
    sid    = "EnableIAMUserPermissions"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }
    actions   = ["kms:*"]
    resources = ["*"]
  }

  # 2. Allow AWS Services to use the key for your specific account only
  statement {
    sid    = "AllowServicesToUseKey"
    effect = "Allow"
    principals {
      type = "Service"
      identifiers = [
        "s3.amazonaws.com",
        "rds.amazonaws.com",
        "sns.amazonaws.com",
        "cloudwatch.amazonaws.com",
        "lambda.amazonaws.com",
        "apigateway.amazonaws.com"
      ]
    }
    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey"
    ]
    resources = ["*"]

    # Critical Security: Prevents "Confused Deputy" attacks
    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = [data.aws_caller_identity.current.account_id]
    }
  }
}

resource "aws_kms_alias" "shared" {
  name          = "alias/sports-monitor-shared-${var.environment}"
  target_key_id = aws_kms_key.shared.key_id
}