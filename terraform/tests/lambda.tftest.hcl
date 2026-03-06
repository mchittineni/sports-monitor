mock_provider "aws" {}

run "execute_lambda_plan" {
  command = plan

  module {
    source = "./modules/lambda"
  }

  variables {
    environment    = "test"
    vpc_id         = "vpc-12345"
    function_name  = "test-lambda"
    handler        = "index.handler"
    runtime        = "nodejs18.x"
    db_host        = "localhost"
    db_name        = "testdb"
    dynamodb_table = "test-table"
  }

  assert {
    condition     = aws_lambda_function.api_handler.function_name == "test-lambda"
    error_message = "The Lambda function name is incorrect."
  }

  assert {
    condition     = aws_lambda_function.api_handler.runtime == "nodejs18.x"
    error_message = "The Lambda runtime should be nodejs18.x."
  }
}
