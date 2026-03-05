mock_provider "aws" {}

run "execute_monitoring_plan" {
  command = plan

  module {
    source = "./modules/monitoring"
  }

  variables {
    environment    = "test"
    log_group_name = "/aws/lambda/test-function"
    alarm_email    = "alerts@example.com"
  }

  assert {
    condition     = can(output.log_group)
    error_message = "Log group output should exist."
  }
}
