const { CognitoJwtVerifier } = require("aws-jwt-verify");

exports.handler = async (event) => {
    // Initialize the verifier
    const verifier = CognitoJwtVerifier.create({
        userPoolId: process.env.COGNITO_USER_POOL_ID,
        tokenUse: "access",
        clientId: process.env.COGNITO_CLIENT_ID,
    });
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
        
        try {
            // Verify the JWT token
            const payload = await verifier.verify(token);
            
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
