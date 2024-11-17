# Configure the AWS Provider and Backend
terraform {
  backend "s3" {
    bucket = "terraform-state-bucket-name"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

# This creates an AWS bucket and a lambda function

resource "aws_s3_bucket" "my_s3_bucket" {
  bucket = "my_s3_bucket"
  
  tags = {
    Name        = "My S3 Bucket"
    Environment = "Dev"
  }
}

resource "aws_s3_bucket_public_access_block" "my_s3_bucket" {
  bucket = aws_s3_bucket.my_s3_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_ownership_controls" "my_s3_bucket" {
  bucket = aws_s3_bucket.my_s3_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "my_s3_bucket" {
  depends_on = [
    aws_s3_bucket_ownership_controls.my_s3_bucket,
    aws_s3_bucket_public_access_block.my_s3_bucket,
  ]

  bucket = aws_s3_bucket.my_s3_bucket.id
  acl    = "public-read"
}

resource "aws_s3_bucket_policy" "my_s3_bucket" {
  bucket = aws_s3_bucket.my_s3_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "CloudFrontReadGetObject"
        Effect    = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.oai.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.my_s3_bucket.arn}/*"
      },
    ]
  })
}
