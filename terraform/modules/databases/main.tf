variable "vpc_id" {
  type = string
}

variable "environment" {
  type = string
}

variable "db_name" {
  type = string
}

variable "db_username" {
  type = string
}

variable "db_password" {
  type        = string
  sensitive   = true
}

variable "multi_az" {
  type    = bool
  default = false
}

# RDS Security Group
resource "aws_security_group" "rds_sg" {
  name        = "rds-sg-${var.environment}"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# RDS Database
resource "aws_db_instance" "postgres" {
  identifier            = "sports-monitor-${var.environment}"
  engine                = "postgres"
  engine_version        = "15.3"
  instance_class        = var.environment == "prod" ? "db.t3.medium" : "db.t3.micro"
  allocated_storage     = 20
  storage_type          = "gp3"
  multi_az              = var.multi_az
  storage_encrypted     = true
  
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  backup_retention_period = var.environment == "prod" ? 30 : 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot       = var.environment != "prod"
  final_snapshot_identifier = "sports-monitor-${var.environment}-final-snapshot"

  deletion_protection = var.environment == "prod"

  enabled_cloudwatch_logs_exports = ["postgresql"]

  tags = {
    Name = "sports-monitor-db"
  }
}

output "db_endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "db_host" {
  value = split(":", aws_db_instance.postgres.endpoint)[0]
}
