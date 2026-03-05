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

  assert {
    condition     = aws_s3_bucket.frontend.bucket == "test-frontend-bucket"
    error_message = "The S3 bucket name was not set correctly."
  }

  assert {
    condition     = aws_wafv2_web_acl.frontend.name == "sports-monitor-frontend-waf-test"
    error_message = "The WAF ACL name should include the environment."
  }
}
