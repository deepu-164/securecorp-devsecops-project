const { createAuditLog } = require("../models/auditModel");
const bcrypt = require("bcrypt");
const {
    findUserByEmail,
    createUser,
    incrementFailedAttempts,
    resetFailedAttempts,
    lockAccount
} = require("../models/userModel");

const register = async (req, res) => {
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

				        console.error(error);

				        res.status(500).json({
						            success: false,
						            message: "Internal Server Error"
						        });

				    }
};

const jwt = require("jsonwebtoken");

const login = async (req, res) => {
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

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "10m"
            }
        );

        res.json({
            success: true,
            token
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

const profile = async (req, res) => {

	    res.status(200).json({

		            success: true,

		            user: req.user

		        });

};

module.exports = {
	    register,
	    login,
	    profile
};
