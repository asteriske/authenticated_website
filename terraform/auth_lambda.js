const { CognitoJwtVerifier } = require("aws-jwt-verify");

// Configuration values hardcoded for Lambda@Edge (which doesn't support environment variables)
const CONFIG = {
    userPoolId: "us-east-2_ZAFeDBuHQ",
    clientId: "5c2mtdrgbh82ljbgtl561en9i8"
};

// Initialize the verifier outside the handler for better performance
const verifier = CognitoJwtVerifier.create({
    userPoolId: CONFIG.userPoolId,
    tokenUse: "access",
    clientId: CONFIG.clientId,
});

console.error('Verifier configured with:', CONFIG);

// Helper function to decode JWT without verification
function decodeJwt(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        const payload = Buffer.from(parts[1], 'base64').toString();
        return JSON.parse(payload);
    } catch (e) {
        console.error('Error decoding token:', e);
        return null;
    }
}

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
        
        // Decode token without verification for debugging
        const decodedToken = decodeJwt(token);
        console.error('Decoded token payload:', decodedToken);
        
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
