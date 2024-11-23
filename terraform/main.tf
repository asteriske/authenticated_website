# Configure the AWS Provider and Backend
terraform {
  backend "s3" {
    bucket = "terraform-state-bucket-name"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

locals {
  env = "dev"
}

# This creates an AWS bucket and a lambda function

resource "aws_s3_bucket" "project_bucket" {
  bucket = "media-auth-website-${local.env}"
  
  tags = {
    Name        = "Media Auth Website"
    Environment = local.env
  }
}

# allow public access
resource "aws_s3_bucket_public_access_block" "project_bucket" {
  bucket = aws_s3_bucket.project_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Objects uploaded with the bucket-owner-full-control canned ACL will belong to the bucket owner,
# object owner retains control in other circumstances
resource "aws_s3_bucket_ownership_controls" "project_bucket" {
  bucket = aws_s3_bucket.project_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "project_bucket" {
  depends_on = [
    aws_s3_bucket_ownership_controls.project_bucket,
    aws_s3_bucket_public_access_block.project_bucket,
  ]

  bucket = aws_s3_bucket.project_bucket.id
  acl    = "public-read"
}

# allow CloudFront read access
# resource "aws_s3_bucket_policy" "project_bucket" {
#   bucket = aws_s3_bucket.project_bucket.id

#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Sid       = "CloudFrontReadGetObject"
#         Effect    = "Allow"
#         Principal = {
#           AWS = aws_cloudfront_origin_access_identity.oai.iam_arn
#         }
#         Action   = "s3:GetObject"
#         Resource = "${aws_s3_bucket.project_bucket.arn}/*"
#       },
#     ]
#   })
# }
