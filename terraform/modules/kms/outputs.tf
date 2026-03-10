output "key_arn" {
  value       = aws_kms_key.shared.arn
  description = "The Amazon Resource Name (ARN) of the shared KMS key to be used across all modules."
}

output "key_id" {
  value       = aws_kms_key.shared.key_id
  description = "The globally unique identifier for the KMS key."
}