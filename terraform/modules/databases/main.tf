variable "vpc_id" {
  type        = string
  description = "The ID of the VPC where the RDS instance will be deployed."
}

variable "environment" {
  type        = string
  description = "Deployment environment name, used to prefix and tag resources appropriately."
}

variable "db_name" {
  type        = string
  description = "The initial name of the PostgreSQL database created within the RDS instance."
}

variable "db_username" {
  type        = string
  description = "The master username for accessing the PostgreSQL database."
}

variable "db_password" {
  type        = string
  sensitive   = true
  description = "The master password for the PostgreSQL instance. Marked sensitive to avoid logging."
}

variable "multi_az" {
  type        = bool
  default     = false
  description = "Specifies if the RDS instance is Multi-AZ (highly available). Typically true in production."
}

# KMS Key for RDS encryption
resource "aws_kms_key" "rds" {
  description             = "KMS key for RDS encryption"
  deletion_window_in_days = 10
  enable_key_rotation     = true
}

resource "aws_kms_alias" "rds" {
  name          = "alias/sports-monitor-rds-${var.environment}"
  target_key_id = aws_kms_key.rds.key_id
}
resource "aws_security_group" "rds_sg" {
  name        = "rds-sg-${var.environment}"
  description = "Security group for RDS PostgreSQL database"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
    description = "Allow PostgreSQL access from VPC"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["10.0.0.0/16"]
    description = "Allow outbound traffic within VPC"
  }
}

# RDS Database
resource "aws_db_instance" "postgres" {
  identifier        = "sports-monitor-${var.environment}"
  engine            = "postgres"
  engine_version    = "15.3"
  instance_class    = var.environment == "prod" ? "db.t3.medium" : "db.t3.micro"
  allocated_storage = 20
  storage_type      = "gp3"
  multi_az          = var.multi_az
  storage_encrypted = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  backup_retention_period = var.environment == "prod" ? 30 : 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  skip_final_snapshot       = var.environment != "prod"
  final_snapshot_identifier = "sports-monitor-${var.environment}-final-snapshot"

  deletion_protection                 = true
  publicly_accessible                 = false
  iam_database_authentication_enabled = true
  performance_insights_enabled        = true
  performance_insights_kms_key_id     = aws_kms_key.rds.arn

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = {
    Name = "sports-monitor-db"
  }
}

output "db_endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "The database connection endpoint (hostname and port) for the RDS instance."
}

output "db_host" {
  value       = split(":", aws_db_instance.postgres.endpoint)[0]
  description = "The hostname of the RDS instance, extracted from the full endpoint string."
}
