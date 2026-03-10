# Dev environment
environment = "Dev"
aws_region  = "us-east-1"
vpc_cidr    = "10.0.0.0/16"
alarm_email = "your-email@example.com"

# The following are typically passed via environment variables in CI/CD (TF_VAR_db_username)
# But we include dummy values here so local `terraform plan` or `checkov` works without warnings
db_username = "dummy_user"
db_password = "dummy_password_123!"
