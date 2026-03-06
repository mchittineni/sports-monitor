output "lambda_role_arn" {
  value       = aws_iam_role.lambda_role.arn
  description = "The ARN of the IAM role assumed by the Lambda function during execution."
}

output "api_handler_invoke_arn" {
  value       = aws_lambda_function.api_handler.invoke_arn
  description = "The ARN used by API Gateway to grant permission to invoke the Lambda function."
}
