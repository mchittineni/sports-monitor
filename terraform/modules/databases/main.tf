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

resource "aws_db_subnet_group" "postgres" {
  name       = "sports-monitor-${var.environment}"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "sports-monitor-db-subnet-group-${var.environment}"
  }
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
  identifier            = "sports-monitor-${var.environment}"
  engine                = "postgres"
  engine_version        = "15.3"
  instance_class        = var.environment == "prod" ? "db.t3.medium" : "db.t3.micro"
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"
  multi_az              = var.multi_az
  db_subnet_group_name  = aws_db_subnet_group.postgres.name
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  backup_retention_period   = var.environment == "prod" ? 30 : 7
  backup_window             = "03:00-04:00"
  maintenance_window        = "sun:04:00-sun:05:00"

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
