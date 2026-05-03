import jwt from 'jsonwebtoken';

/**
 * Generates a short-lived access token for authentication and authorization.
 * Always signed with the PRIMARY secret.
 */
export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            username: user.username
        },
        process.env.ACCESS_TOKEN_SECRET_PRIMARY,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m'
        }
    );
};

/**
 * Generates a long-lived refresh token.
 * Always signed with the PRIMARY secret.
 */
export const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user._id
        },
        process.env.REFRESH_TOKEN_SECRET_PRIMARY,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d'
        }
    );
};
