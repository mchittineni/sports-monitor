output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.frontend.domain_name
  description = "The generated CloudFront distribution domain name pointing to the frontend."
}
