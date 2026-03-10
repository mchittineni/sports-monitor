mock_provider "aws" {}

run "execute_monitoring_plan" {
  command = plan

  module {
    source = "./modules/monitoring"
  }

  variables {
    environment    = "test"
    log_group_name = "/aws/lambda/test-function"
    kms_key_arn    = "arn:aws:kms:us-east-1:123456789012:key/mock-id"
    alarm_email    = "alerts@example.com"
  }

  # Assertion 1: Verify Log Retention
  assert {
    condition     = aws_cloudwatch_log_group.api_logs.retention_in_days == 7
    error_message = "Log retention must be set to 7 days."
  }

  # Assertion 2: Verify Lambda Error Alarm Threshold
  assert {
    condition     = aws_cloudwatch_metric_alarm.lambda_errors.threshold == 5
    error_message = "The Lambda error alarm threshold is not set correctly."
  }

  # Assertion 3: Verify Alarm Actions
  assert {
    condition     = length(aws_cloudwatch_metric_alarm.rds_cpu.alarm_actions) > 0
    error_message = "RDS CPU Alarm must have at least one alarm action defined."
  }

  # Assertion 4: Verify Log Group Output
  assert {
    condition     = can(output.log_group)
    error_message = "Log group output should exist."
  }
}
