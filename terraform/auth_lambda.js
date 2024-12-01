const { CognitoJwtVerifier } = require("aws-jwt-verify");

// Log environment variables
console.log('Environment variables:', {
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    clientId: process.env.COGNITO_CLIENT_ID
});

// Initialize the verifier outside the handler for better performance
const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    tokenUse: "access",
    clientId: process.env.COGNITO_CLIENT_ID,
});

exports.handler = async (event) => {
    try {
        // Parse the authorization header
        const authHeader = event.headers.Authorization || event.headers.authorization;
        
        if (!authHeader) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: 'Authorization header is missing'
                })
            };
        }

        // Basic validation of the auth header format
        if (!authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: 'Invalid authorization format. Must use Bearer token'
                })
            };
        }

        // Extract the token
        const token = authHeader.split(' ')[1];
        console.log('Token to verify:', token.substring(0, 20) + '...');
        
        try {
            // Verify the JWT token
            console.log('Attempting to verify token...');
            const payload = await verifier.verify(token);
            console.log('Token verified successfully:', payload);
            
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Authentication successful',
                    userId: payload.sub,
                    username: payload.username,
                    scope: payload.scope
                })
            };
        } catch (err) {
            console.error('Token validation failed:', err);
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: 'Invalid token'
                })
            };
        }

    } catch (error) {
        console.error('Authentication error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error during authentication'
            })
        };
    }
};
