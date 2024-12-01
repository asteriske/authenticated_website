const { CognitoJwtVerifier } = require("aws-jwt-verify");

// Initialize the verifier outside the handler for better performance
const verifier = CognitoJwtVerifier.create({
    userPoolId: "us-east-2_ZAFeDBuHQ",
    tokenUse: "access",
    clientId: "5c2mtdrgbh82ljbgtl561en9i8",
});

console.error('Verifier configured with:', {
    userPoolId: "us-east-2_ZAFeDBuHQ",
    clientId: "5c2mtdrgbh82ljbgtl561en9i8"
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
        console.error('Token to verify:', token.substring(0, 20) + '...');
        
        try {
            // Verify the JWT token
            console.error('Attempting to verify token...');
            const payload = await verifier.verify(token);
            console.error('Token verified successfully:', payload);
            
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
