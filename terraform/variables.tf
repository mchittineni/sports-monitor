variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region"
}

variable "environment" {
  type        = string
  description = "Environment name (Dev, Stage, Prod)"
  validation {
    condition     = contains(["Dev", "Stage", "Prod"], var.environment)
    error_message = "Environment must be Dev, Stage, or Prod."
  }
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "VPC CIDR block"
}

variable "availability_zones" {
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
  description = "Availability zones"
}

variable "db_name" {
  type        = string
  default     = "sports_monitor"
  description = "PostgreSQL database name"
}

variable "db_username" {
  type        = string
  description = "PostgreSQL master username"
  sensitive   = true
}

variable "db_password" {
  type        = string
  description = "PostgreSQL master password"
  sensitive   = true
}

variable "alarm_email" {
  type        = string
  description = "Email for CloudWatch alarms"
}
