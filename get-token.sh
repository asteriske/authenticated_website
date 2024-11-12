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

# First, try to create the user (this might fail if user already exists)
aws cognito-idp admin-create-user \
    --user-pool-id $USER_POOL_ID \
    --username user123 \
    --temporary-password pass123 \
    --message-action SUPPRESS \
    2>/dev/null

# Set the permanent password
aws cognito-idp admin-set-user-password \
    --user-pool-id $USER_POOL_ID \
    --username user123 \
    --password pass123 \
    --permanent

# Initiate auth and get the token
TOKEN=$(aws cognito-idp initiate-auth \
    --auth-flow USER_PASSWORD_AUTH \
    --client-id $CLIENT_ID \
    --auth-parameters USERNAME=user123,PASSWORD=pass123 \
    --query 'AuthenticationResult.AccessToken' \
    --output text)

# Update test-event.json with the token
sed -i "s|Bearer YOUR_TEST_JWT_TOKEN|Bearer $TOKEN|" test-event.json

echo "Token has been updated in test-event.json"
