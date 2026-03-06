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
