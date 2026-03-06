output "repository_url" {
  value       = aws_ecr_repository.backend.repository_url
  description = "The URL of the repository"
}

output "repository_arn" {
  value       = aws_ecr_repository.backend.arn
  description = "Full ARN of the repository"
}
