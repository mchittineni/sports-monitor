terraform {
  required_version = ">= 1.14.0, < 2.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    bucket       = "sports-monitor-terraform-state"
    key          = "prod/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
    encrypt      = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Sports Monitor"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Service     = "Sports-Monitor-Core"
    }
  }
}

# --- Centralized Security Layer ---

# Single KMS Key to replace all individual module keys
module "kms" {
  source      = "./modules/kms"
  environment = var.environment
}

# --- Infrastructure Layers ---

# VPC and Networking
module "networking" {
  source             = "./modules/networking"
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  kms_key_arn        = module.kms.key_arn
}

# RDS PostgreSQL Database
module "databases" {
  source      = "./modules/databases"
  environment = var.environment
  vpc_id      = module.networking.vpc_id
  subnet_ids  = module.networking.private_subnet_ids
  db_name     = var.db_name
  db_username = var.db_username
  db_password = var.db_password
  multi_az    = var.environment == "prod" ? true : false
  kms_key_arn = module.kms.key_arn
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
    kms_key_arn = module.kms.key_arn
  }
}

# API Gateway
module "api_gateway" {
  source            = "./modules/api-gateway"
  environment       = var.environment
  lambda_invoke_arn = module.lambda_api.api_handler_invoke_arn
  kms_key_arn       = module.kms.key_arn
  # Override this per environment if you want stricter CORS
  # (for example, to only allow your production frontend domain).
  # allowed_origins = ["https://your-frontend.example.com"]
}

# Main Express API Lambda
module "lambda_api" {
  source              = "./modules/lambda"
  environment         = var.environment
  vpc_id              = module.networking.vpc_id
  subnet_ids          = module.networking.private_subnet_ids
  function_name       = "sports-monitor-api-${var.environment}"
  handler             = "dist/lambda.handler"
  runtime             = "nodejs20.x"
  kms_key_arn         = module.kms.key_arn
  db_host             = module.databases.db_endpoint
  db_name             = var.db_name
  dynamodb_table      = aws_dynamodb_table.sports_events.name
  schedule_expression = "rate(10 minutes)"
}

# CRON Background Data Ingestion Lambda
module "lambda_ingest_worker" {
  source              = "./modules/lambda"
  environment         = var.environment
  vpc_id              = module.networking.vpc_id
  subnet_ids          = module.networking.private_subnet_ids
  function_name       = "sports-monitor-ingest-worker-${var.environment}"
  handler             = "dist/workers/ingestSports.handler"
  runtime             = "nodejs20.x"
  kms_key_arn         = module.kms.key_arn
  db_host             = module.databases.db_endpoint
  db_name             = var.db_name
  dynamodb_table      = aws_dynamodb_table.sports_events.name
  schedule_expression = "rate(5 minutes)"
}

# AI Services (AWS Bedrock)
module "ai_services" {
  source          = "./modules/ai-services"
  environment     = var.environment
  vpc_id          = module.networking.vpc_id
  lambda_role_arn = module.lambda_api.lambda_role_arn
}

# ECR Container Registry
module "ecr" {
  source      = "./modules/ecr"
  environment = var.environment
}

# S3 for Frontend Hosting
module "frontend" {
  source               = "./modules/frontend"
  environment          = var.environment
  frontend_bucket_name = "sports-monitor-frontend-${var.environment}"
  kms_key_arn          = module.kms.key_arn
}

# CloudWatch and Monitoring
module "monitoring" {
  source         = "./modules/monitoring"
  environment    = var.environment
  log_group_name = "/aws/lambda/sports-monitor"
  alarm_email    = var.alarm_email
  kms_key_arn    = module.kms.key_arn
}