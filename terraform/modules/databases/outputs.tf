output "db_endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "The database connection endpoint (hostname and port) for the RDS instance."
}

output "db_host" {
  value       = split(":", aws_db_instance.postgres.endpoint)[0]
  description = "The hostname of the RDS instance, extracted from the full endpoint string."
}
