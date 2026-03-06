output "api_endpoint" {
  value       = aws_apigatewayv2_stage.main.invoke_url
  description = "The fully qualified URL endpoint for the deployed API Gateway."
}
