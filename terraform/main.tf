# This creates an AWS bucket and a lambda function

resource "aws_s3_bucket" "my_s3_bucket" {
  bucket = "my_s3_bucket"
  
  tags = {
    Name        = "My S3 Bucket"
    Environment = "Dev"
  }
}
