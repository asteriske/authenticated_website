#!/bin/bash

# Get the function name from terraform state
FUNCTION_NAME=$(terraform output -raw auth_lambda_function_name || echo "auth_lambda")

# Invoke the function with the test event
aws lambda invoke \
  --function-name $FUNCTION_NAME \
  --payload fileb://test-event.json \
  response.json

# View the response
cat response.json
