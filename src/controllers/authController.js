const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
    saveResetToken,
    findResetToken,
    deleteResetToken
} = require("../models/passwordResetModel");

const {
    sendResetEmail
} = require("../services/emailService");

const {
    saveRefreshToken,
    findRefreshToken,
    deleteRefreshToken
} = require("../models/refreshTokenModel");

const { createAuditLog } = require("../models/auditModel");

const {
    findUserByEmail,
    createUser,
    incrementFailedAttempts,
    resetFailedAttempts,
    lockAccount,
    updatePassword
} = require("../models/userModel");

const register = async (req, res, next) => {
	    try {

		            const { name, email, password } = req.body;

		            if (!name || !email || !password) {
				                return res.status(400).json({
							                success: false,
							                message: "All fields are required"
							            });
				            }

		            const existingUser = await findUserByEmail(email);

		            if (existingUser) {
				                return res.status(409).json({
							                success: false,
							                message: "Email already exists"
							            });
				            }

		            const hashedPassword = await bcrypt.hash(password, 10);

		            const user = await createUser(
				                name,
				                email,
				                hashedPassword
				            );
                    await createAuditLog(user.id, "USER_REGISTERED");

		            res.status(201).json({
				                success: true,
				                message: "User registered successfully",
				                data: user
				            });

		        } catch (error) {

				        next(error);

				    }
};


const login = async (req, res, next) => {
    try {

        const { email, password } = req.body;

        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid Email or Password"
            });
        }

        // Check if account is locked
        if (user.lock_until && new Date(user.lock_until) > new Date()) {
            return res.status(403).json({
                success: false,
                message: "Account locked. Try again later."
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {

            await incrementFailedAttempts(user.id);

            await createAuditLog(user.id, "LOGIN_FAILED");

            if (user.failed_attempts + 1 >= 5) {

                await lockAccount(user.id, 15);

                await createAuditLog(user.id, "ACCOUNT_LOCKED");

                return res.status(403).json({
                    success: false,
                    message: "Too many failed attempts. Account locked for 15 minutes."
                });
            }

            return res.status(401).json({
                success: false,
                message: "Invalid Email or Password"
            });
        }

        await resetFailedAttempts(user.id);

        await createAuditLog(user.id, "LOGIN_SUCCESS");

        const accessToken = jwt.sign(
    {
        id: user.id,
        email: user.email,
        role: user.role
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "15m"
    }
);

const refreshToken = jwt.sign(
    {
        id: user.id
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "7d"
    }
);

const expiresAt = new Date();

expiresAt.setDate(expiresAt.getDate() + 7);

await saveRefreshToken(
    user.id,
    refreshToken,
    expiresAt
);

        res.json({
            success: true,
            accessToken,
    refreshToken
        });

    } catch (err) {

         next(err);

    }
};

const refresh = async (req, res, next) => {

    try {

        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token required"
            });
        }

        const storedToken = await findRefreshToken(refreshToken);

        if (!storedToken) {
            return res.status(403).json({
                success: false,
                message: "Invalid Refresh Token"
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_SECRET
        );

        const accessToken = jwt.sign(
            {
                id: decoded.id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m"
            }
        );

        res.json({
            success: true,
            accessToken
        });

    } catch (err) {

         next(err);

    }

};

const logout = async (req, res, next) => {

    try {

        const { refreshToken } = req.body;

        if (!refreshToken) {

            return res.status(400).json({
                success: false,
                message: "Refresh Token Required"
            });

        }

        await deleteRefreshToken(refreshToken);

        res.json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (err) {

         next(err);
    }

};

const forgotPassword = async (req, res, next) => {

    try {

        const { email } = req.body;

        const user = await findUserByEmail(email);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        const token =
            crypto.randomBytes(32).toString("hex");

        const expiresAt = new Date();

        expiresAt.setHours(
            expiresAt.getHours() + 1
        );

        await saveResetToken(
            user.id,
            token,
            expiresAt
        );

        await sendResetEmail(
            user.email,
            token
        );

        res.json({

            success: true,

            message:
                "Password reset email sent"

        });

    } catch (err) {

         next(err);


    }

};

const resetPassword = async (req, res, next) => {

    try {

        const { token, password } = req.body;

        const resetToken =
            await findResetToken(token);

        if (!resetToken) {

            return res.status(400).json({

                success: false,

                message: "Invalid token"

            });

        }

        if (new Date(resetToken.expires_at) < new Date()) {

            return res.status(400).json({

                success: false,

                message: "Token expired"

            });

        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        await updatePassword(

            resetToken.user_id,

            hashedPassword

        );

        await deleteResetToken(token);

        res.json({

            success: true,

            message:
                "Password updated successfully"

        });

    } catch (err) {

         next(err);
    }

};

const profile = async (req, res, next) => {
    try {

	    res.status(200).json({

		            success: true,

		            user: req.user

		        });
        } catch (err) {

        next(err);

    }


};

module.exports = {
	    register,
    login,
    refresh,
    logout,
    forgotPassword,
    resetPassword,
    profile
};
