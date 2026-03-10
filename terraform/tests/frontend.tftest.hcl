mock_provider "aws" {}

run "execute_frontend_plan" {
  command = plan

  module {
    source = "./modules/frontend"
  }

  variables {
    environment          = "test"
    frontend_bucket_name = "test-frontend-bucket"
  }

  # Assertion 1: Check if the S3 bucket name is set correctly
  assert {
    condition     = aws_s3_bucket.frontend.bucket == "test-frontend-bucket"
    error_message = "The S3 bucket name was not set correctly."
  }

  # Assertion 2: Verify WAF ACL Name
  assert {
    condition     = aws_wafv2_web_acl.frontend.name == "sports-monitor-frontend-waf-test"
    error_message = "The WAF ACL name should include the environment."
  }

  # Assertion 21: Verify S3 Public Access Block
  assert {
    condition     = aws_s3_bucket_public_access_block.frontend.block_public_acls == true
    error_message = "S3 bucket must have public access blocks enabled."
  }

  # Assertion 3: Verify Encryption Configuration
  assert {
    condition     = one(aws_s3_bucket_server_side_encryption_configuration.frontend.rule).apply_server_side_encryption_by_default[0].sse_algorithm == "aws:kms"
    error_message = "S3 bucket must use KMS for server-side encryption."
  }

  # Assertion 4: Verify CloudFront Protocol Policy (Security)
  assert {
    condition     = aws_cloudfront_distribution.frontend.default_cache_behavior[0].viewer_protocol_policy == "redirect-to-https"
    error_message = "CloudFront must redirect all HTTP traffic to HTTPS."
  }

  # Assertion 5: Verify S3 Bucket Versioning
  assert {
    condition     = aws_s3_bucket_versioning.frontend.versioning_configuration[0].status == "Enabled"
    error_message = "S3 bucket versioning should be enabled for data recovery."
  }
}
