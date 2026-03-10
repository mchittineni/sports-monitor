mock_provider "aws" {}

run "execute_lambda_plan" {
  command = plan

  module {
    source = "./modules/lambda"
  }

  variables {
    environment         = "test"
    vpc_id              = "vpc-12345"
    function_name       = "test-lambda"
    handler             = "index.handler"
    runtime             = "nodejs18.x"
    db_host             = "localhost"
    db_name             = "testdb"
    dynamodb_table      = "test-table"
    subnet_ids          = ["subnet-11111111"]
    schedule_expression = "rate(5 minutes)"
  }

  # Assertion 1: Verify VPC Security Group Creation
  assert {
    condition     = length(aws_security_group.lambda_sg) > 0
    error_message = "Security group should be created when subnet_ids are provided."
  }

  # Assertion 2: Verify IAM Role Naming
  assert {
    condition     = aws_iam_role.lambda_role.name == "test-lambda-role-test"
    error_message = "Lambda IAM role name does not follow the naming convention."
  }

  # Assertion 3: Verify Tracing is Enabled 
  assert {
    condition     = aws_lambda_function.api_handler.tracing_config[0].mode == "Active"
    error_message = "X-Ray tracing must be set to 'Active' for monitoring compliance."
  }

  # Assertion 4: Verify EventBridge Permission
  assert {
    condition     = aws_lambda_permission.allow_eventbridge[0].principal == "events.amazonaws.com"
    error_message = "Lambda permission must allow principal 'events.amazonaws.com' for CRON triggers."
  }

  # Assertion 5: Verify Memory Allocation
  assert {
    condition     = aws_lambda_function.api_handler.memory_size == 512
    error_message = "Lambda memory size should be 512MB for this workload."
  }

  # Assertion 6: Verify Function Name and Runtime
  assert {
    condition     = aws_lambda_function.api_handler.function_name == "test-lambda"
    error_message = "The Lambda function name is incorrect."
  }

  # Assertion 7: Verify Runtime Version
  assert {
    condition     = aws_lambda_function.api_handler.runtime == "nodejs18.x"
    error_message = "The Lambda runtime should be nodejs18.x."
  }
}
