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
