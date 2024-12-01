#!/bin/bash

# Create a temporary directory for packaging
mkdir -p dist/auth-lambda

# Copy function code
cp src/lambda/auth/index.js dist/auth-lambda/

# Install production dependencies
cd dist/auth-lambda
npm init -y
npm install --production aws-jwt-verify

# Create zip package
zip -r ../auth-lambda.zip .

# Clean up
cd ../..
rm -rf dist/auth-lambda
