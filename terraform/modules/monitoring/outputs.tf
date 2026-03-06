output "log_group" {
  value       = aws_cloudwatch_log_group.api_logs.name
  description = "The full name of the created CloudWatch log group."
}
