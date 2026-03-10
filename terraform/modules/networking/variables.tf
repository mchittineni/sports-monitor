variable "vpc_cidr" {
  type        = string
  description = "The IPv4 CIDR block for the entire Virtual Private Cloud (VPC)."
}

variable "availability_zones" {
  type        = list(string)
  description = "A list of AWS Availability Zones used to span public and private subnets."
}

variable "environment" {
  type        = string
  description = "Deployment environment identifier for resource tagging."
}

variable "kms_key_arn" {
  type        = string
  description = "The ARN of the KMS key used for encrypting resources within the VPC."
}