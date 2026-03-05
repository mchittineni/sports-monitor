variable "vpc_cidr" {
  type        = string
  description = "The IPv4 CIDR block for the entire Virtual Private Cloud (VPC)."
}

# KMS Key for VPC flow logs
resource "aws_kms_key" "vpc_flow_logs" {
  description             = "KMS key for VPC flow logs encryption"
  deletion_window_in_days = 10
  enable_key_rotation     = true
}

resource "aws_kms_alias" "vpc_flow_logs" {
  name          = "alias/sports-monitor-vpc-flow-logs-${var.environment}"
  target_key_id = aws_kms_key.vpc_flow_logs.key_id
}

variable "availability_zones" {
  type        = list(string)
  description = "A list of AWS Availability Zones used to span public and private subnets."
}

variable "environment" {
  type        = string
  description = "Deployment environment identifier for resource tagging."
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "sports-monitor-vpc-${var.environment}"
  }
}

# VPC Flow Logs
resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  name              = "/aws/vpc/sports-monitor-flow-logs-${var.environment}"
  retention_in_days = 30
  kms_key_id        = aws_kms_key.vpc_flow_logs.arn
}

resource "aws_iam_role" "vpc_flow_log_role" {
  name = "vpc-flow-log-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "vpc-flow-logs.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "vpc_flow_log_policy" {
  name = "vpc-flow-log-policy-${var.environment}"
  role = aws_iam_role.vpc_flow_log_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:logs:*:*:log-group:/aws/vpc/sports-monitor-flow-logs-${var.environment}"
      }
    ]
  })
}

resource "aws_flow_log" "main" {
  iam_role_arn    = aws_iam_role.vpc_flow_log_role.arn
  log_destination = aws_cloudwatch_log_group.vpc_flow_logs.arn
  traffic_type    = "ALL"
  vpc_id          = aws_vpc.main.id
}

# Public Subnets
resource "aws_subnet" "public" {
  count                   = length(var.availability_zones)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index * 10 + 0}.0/24"
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = false

  tags = {
    Name = "public-subnet-${count.index + 1}"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index * 10 + 1}.0/24"
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "private-subnet-${count.index + 1}"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "sports-monitor-igw"
  }
}

# Route Table for Public Subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

output "vpc_id" {
  value       = aws_vpc.main.id
  description = "The ID of the newly provisioned VPC."
}

output "public_subnet_ids" {
  value       = aws_subnet.public[*].id
  description = "List of IDs representing the provisioned public subnets."
}

output "private_subnet_ids" {
  value       = aws_subnet.private[*].id
  description = "List of IDs representing the provisioned private subnets."
}
