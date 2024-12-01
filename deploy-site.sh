#!/bin/bash

# Get the S3 bucket name and CloudFront domain from terraform
cd terraform
BUCKET_NAME=$(terraform output -raw project_bucket_name)
CLOUDFRONT_DOMAIN=$(terraform output -raw cloudfront_domain_name)
cd ..

# Upload the public directory to S3
aws s3 sync public/ s3://$BUCKET_NAME/

echo "Site deployed!"
echo "Access your site at: https://$CLOUDFRONT_DOMAIN"
