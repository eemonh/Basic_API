import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

/**
 * Middleware to verify the access token in the Authorization header.
 * Implements secret rotation by trying PRIMARY then SECONDARY secrets.
 */
export const verifyJWT = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided." });
        }

        let decodedToken;
        
        // Try Primary Secret first
        try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_PRIMARY);
        } catch (primaryError) {
            // If primary fails, try Secondary Secret (Rotation support)
            try {
                decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_SECONDARY);
            } catch (secondaryError) {
                return res.status(401).json({ message: "Unauthorized: Invalid or expired token." });
            }
        }

        const user = await User.findById(decodedToken.id).select("-password -refreshToken");

        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User not found." });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({ message: "Internal server error during authentication." });
    }
};
