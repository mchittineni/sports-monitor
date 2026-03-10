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

variable "subnet_ids" {
  type        = list(string)
  description = "Private subnet IDs for the RDS DB subnet group."
}

variable "kms_key_arn" {
  type        = string
  description = "The ARN of the shared KMS key for encrypting RDS data."
}