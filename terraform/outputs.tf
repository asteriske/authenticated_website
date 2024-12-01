# Output the Lambda function name
output "auth_lambda_function_name" {
  value = aws_lambda_function.auth_lambda.function_name
}

# Output Cognito User Pool ID
output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

# Output Cognito Client ID
output "cognito_client_id" {
  value = aws_cognito_user_pool_client.client.id
}

# Output S3 bucket name
output "project_bucket_name" {
  value = aws_s3_bucket.project_bucket.id
}

# Output CloudFront domain name
output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.s3_distribution.domain_name
}
