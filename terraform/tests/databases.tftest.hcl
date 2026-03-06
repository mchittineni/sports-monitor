mock_provider "aws" {}

run "execute_databases_plan" {
  command = plan

  module {
    source = "./modules/databases"
  }

  variables {
    environment = "test"
    vpc_id      = "vpc-12345678"
    subnet_ids  = ["subnet-11111111", "subnet-22222222"]
    db_name     = "sports_db_test"
    db_username = "postgres"
    db_password = "supersecretpassword123"
    multi_az    = false
  }

  assert {
    condition     = aws_db_instance.postgres.db_name == "sports_db_test"
    error_message = "The database name was not set correctly."
  }

  assert {
    condition     = aws_security_group.rds_sg.name == "rds-sg-test"
    error_message = "The Security Group name was not set correctly based on the environment."
  }
}
