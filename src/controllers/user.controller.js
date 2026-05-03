import { User } from "../models/user.model.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.utils.js";
import jwt from "jsonwebtoken";

const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict"
};

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(412).json({ message: "All fields are required." });
        }

        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(422).json({ message: "User already exists with this email." });
            }
            return res.status(422).json({ message: "Username is already taken." });
        }

        const user = new User({ username, email, password });
        await user.save();

        const registeredUser = await User.findById(user._id).select("-password -refreshToken");

        res.status(201).json({ 
            message: "User registered successfully.",
            user: registeredUser
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Store refresh token in DB
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        res.status(200)
            .cookie("refreshToken", refreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json({ 
                message: "User logged in successfully.",
                user: loggedInUser,
                accessToken
            });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};

const logoutUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: { refreshToken: null }
            },
            { new: true }
        );

        res.status(200)
            .clearCookie("refreshToken", options)
            .clearCookie("accessToken", options)
            .json({ message: "User logged out successfully." });

    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};

const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({ message: "No refresh token provided." });
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET_PRIMARY);
        } catch (error) {
            try {
                decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET_SECONDARY);
            } catch (secError) {
                return res.status(401).json({ message: "Invalid or expired refresh token." });
            }
        }

        const user = await User.findById(decodedToken.id);

        if (!user || user.refreshToken !== incomingRefreshToken) {
            return res.status(401).json({ message: "Invalid refresh token." });
        }

        const accessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        res.status(200)
            .cookie("refreshToken", newRefreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json({ 
                message: "Token refreshed successfully.",
                accessToken,
                refreshToken: newRefreshToken
            });

    } catch (error) {
        console.error("Token refresh error:", error);
        res.status(500).json({ message: "Internal server error during token refresh." });
    }
};

const getCurrentUser = async (req, res) => {
    return res.status(200).json({ 
        message: "User fetched successfully.",
        user: req.user 
    });
};

export { registerUser, loginUser, logoutUser, refreshAccessToken, getCurrentUser };