# IAM Policy for Bedrock access
resource "aws_iam_role_policy" "bedrock_policy" {
  name = "bedrock-policy-${var.environment}"
  role = var.lambda_role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream"
        ]
        Resource = "arn:aws:bedrock:*::foundation-model/*"
      }
    ]
  })
}
