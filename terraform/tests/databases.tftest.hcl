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

  # Assertion 1: Verify Database Name
  assert {
    condition     = aws_db_instance.postgres.db_name == "sports_db_test"
    error_message = "The database name was not set correctly."
  }

  # Assertion 2: Verify Security Group Name
  assert {
    condition     = aws_security_group.rds_sg.name == "rds-sg-test"
    error_message = "The Security Group name was not set correctly based on the environment."
  }

  # Assertion 3: Verify Conditional Instance Class
  assert {
    condition     = aws_db_instance.postgres.instance_class == "db.t3.micro"
    error_message = "Instance Class should use db.t3.micro."
  }

  # Assertion 4: Verify Backup Retention Logic
  assert {
    condition     = aws_db_instance.postgres.backup_retention_period == 7
    error_message = "Database must have a 7-day backup retention period."
  }

  # Assertion 5: Verify Security Group Rules
  assert {
    condition     = tolist(aws_security_group.rds_sg.ingress)[0].from_port == 5432
    error_message = "Security group must allow PostgreSQL traffic on port 5432."
  }

  # Assertion 6: Verify Encryption & Monitoring (Security Checks)
  assert {
    condition     = aws_db_instance.postgres.storage_encrypted == true && aws_db_instance.postgres.performance_insights_enabled == true
    error_message = "Database must have encryption and performance insights enabled."
  }
}