#!/bin/bash

# Change to terraform directory
cd terraform

# Get the Cognito User Pool ID and Client ID from terraform state
USER_POOL_ID=$(terraform output -raw cognito_user_pool_id || echo "")
CLIENT_ID=$(terraform output -raw cognito_client_id || echo "")

# Change back to original directory
cd ..

if [ -z "$USER_POOL_ID" ] || [ -z "$CLIENT_ID" ]; then
    echo "Error: Could not get Cognito IDs from Terraform state"
    exit 1
fi

# Delete existing user if it exists
aws cognito-idp admin-delete-user \
    --user-pool-id $USER_POOL_ID \
    --username user123 || true

# Create new user
aws cognito-idp admin-create-user \
    --user-pool-id $USER_POOL_ID \
    --username user123 \
    --temporary-password Pass123!@ \
    --message-action SUPPRESS

echo "Setting/confirming permanent password..."

# Set the permanent password and capture any errors
aws cognito-idp admin-set-user-password \
    --user-pool-id $USER_POOL_ID \
    --username user123 \
    --password Pass123!@ \
    --permanent

# Initiate auth and get the token
TOKEN=$(aws cognito-idp initiate-auth \
    --auth-flow USER_PASSWORD_AUTH \
    --client-id $CLIENT_ID \
    --auth-parameters USERNAME=user123,PASSWORD=Pass123!@ \
    --query 'AuthenticationResult.AccessToken' \
    --output text)

# Update test-event.json with the token
if [ -z "$TOKEN" ]; then
    echo "Error: No token received"
    exit 1
fi

echo "Token received: $TOKEN"

# Create new test-event.json with the token
cat > test-event.json << EOF
{
  "headers": {
    "Authorization": "Bearer $TOKEN"
  },
  "requestContext": {
    "http": {
      "method": "GET"
    }
  }
}
EOF

echo "Token has been updated in test-event.json"
echo "First few characters of token: ${TOKEN:0:20}..."
echo "Content of test-event.json:"
cat test-event.json
