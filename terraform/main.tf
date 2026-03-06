terraform {
  required_version = ">= 1.14.0, < 2.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    bucket         = "sports-monitor-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-lock"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Sports Monitor"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC and Networking
module "networking" {
  source = "./modules/networking"

  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  environment        = var.environment
}

# RDS PostgreSQL Database
module "databases" {
  source = "./modules/databases"

  vpc_id      = module.networking.vpc_id
  environment = var.environment
  db_name     = var.db_name
  db_username = var.db_username
  db_password = var.db_password
  multi_az    = var.environment == "prod" ? true : false
}

# KMS Key for DynamoDB encryption
resource "aws_kms_key" "dynamodb" {
  description             = "KMS key for DynamoDB encryption"
  deletion_window_in_days = 10
  enable_key_rotation     = true
}

resource "aws_kms_alias" "dynamodb" {
  name          = "alias/sports-monitor-dynamodb-${var.environment}"
  target_key_id = aws_kms_key.dynamodb.key_id
}

# DynamoDB Tables
resource "aws_dynamodb_table" "sports_events" {
  name         = "SportsEvents-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "N"
  }

  attribute {
    name = "countryCode"
    type = "S"
  }

  attribute {
    name = "sport"
    type = "S"
  }

  global_secondary_index {
    name            = "CountryCodeIndex"
    hash_key        = "countryCode"
    range_key       = "sk"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "SportIndex"
    hash_key        = "sport"
    range_key       = "sk"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.dynamodb.arn
  }

  tags = {
    Name = "SportsEvents"
  }
}

# API Gateway
module "api_gateway" {
  source = "./modules/api-gateway"

  environment       = var.environment
  lambda_invoke_arn = module.lambda_api.api_handler_invoke_arn
  # Override this per environment if you want stricter CORS
  # (for example, to only allow your production frontend domain).
  # allowed_origins = ["https://your-frontend.example.com"]
}

# Main Express API Lambda
module "lambda_api" {
  source = "./modules/lambda"

  environment    = var.environment
  vpc_id         = module.networking.vpc_id
  function_name  = "sports-monitor-api-${var.environment}"
  handler        = "dist/lambda.handler" # Updated to new API entrypoint
  runtime        = "nodejs20.x"
  db_host        = module.databases.db_endpoint
  db_name        = var.db_name
  dynamodb_table = aws_dynamodb_table.sports_events.name
}

# CRON Background Data Ingestion Lambda
module "lambda_ingest_worker" {
  source = "./modules/lambda"

  environment         = var.environment
  vpc_id              = module.networking.vpc_id
  function_name       = "sports-monitor-ingest-worker-${var.environment}"
  handler             = "dist/workers/ingestSports.handler"
  runtime             = "nodejs20.x"
  db_host             = module.databases.db_endpoint
  db_name             = var.db_name
  dynamodb_table      = aws_dynamodb_table.sports_events.name
  schedule_expression = "rate(5 minutes)" # Wires up EventBridge automatically
}

# AI Services (AWS Bedrock)
module "ai_services" {
  source = "./modules/ai-services"

  environment     = var.environment
  vpc_id          = module.networking.vpc_id
  lambda_role_arn = module.lambda_api.lambda_role_arn
}

# S3 for Frontend Hosting
module "frontend" {
  source = "./modules/frontend"

  environment          = var.environment
  frontend_bucket_name = "sports-monitor-frontend-${var.environment}"
}

# CloudWatch and Monitoring
module "monitoring" {
  source = "./modules/monitoring"

  environment    = var.environment
  log_group_name = "/aws/lambda/sports-monitor"
  alarm_email    = var.alarm_email
}

# Outputs
output "api_gateway_url" {
  value       = module.api_gateway.api_endpoint
  description = "API Gateway endpoint URL"
}

output "cloudfront_domain" {
  value       = module.frontend.cloudfront_domain_name
  description = "CloudFront distribution domain"
}

output "rds_endpoint" {
  value       = module.databases.db_endpoint
  sensitive   = true
  description = "RDS PostgreSQL endpoint"
}

output "dynamodb_table_name" {
  value       = aws_dynamodb_table.sports_events.name
  description = "DynamoDB table name"
}
