const { handler } = require('../index');
const { CognitoJwtVerifier } = require("aws-jwt-verify");

// Mock the aws-jwt-verify package
jest.mock('aws-jwt-verify');

describe('Auth Lambda Handler', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        
        // Setup default mock implementation
        CognitoJwtVerifier.create.mockReturnValue({
            verify: jest.fn()
        });
    });

    test('should return 401 when Authorization header is missing', async () => {
        const event = {
            headers: {}
        };

        const response = await handler(event);

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.body).message).toBe('Authorization header is missing');
    });

    test('should return 401 when token format is invalid', async () => {
        const event = {
            headers: {
                Authorization: 'Invalid-Token'
            }
        };

        const response = await handler(event);

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.body).message).toBe('Invalid authorization format. Must use Bearer token');
    });

    test('should return 200 with user info when token is valid', async () => {
        const mockPayload = {
            sub: 'user123',
            username: 'testuser',
            scope: 'email profile'
        };

        // Setup mock implementation for this test
        const mockVerifier = {
            verify: jest.fn().mockResolvedValue(mockPayload)
        };
        CognitoJwtVerifier.create.mockReturnValue(mockVerifier);

        const event = {
            headers: {
                Authorization: 'Bearer valid-token'
            }
        };

        const response = await handler(event);

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.userId).toBe(mockPayload.sub);
        expect(body.username).toBe(mockPayload.username);
        expect(body.scope).toBe(mockPayload.scope);
    });

    test('should return 401 when token verification fails', async () => {
        // Setup mock implementation for this test
        const mockVerifier = {
            verify: jest.fn().mockRejectedValue(new Error('Invalid token'))
        };
        CognitoJwtVerifier.create.mockReturnValue(mockVerifier);

        const event = {
            headers: {
                Authorization: 'Bearer invalid-token'
            }
        };

        const response = await handler(event);

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.body).message).toBe('Invalid token');
    });
});
