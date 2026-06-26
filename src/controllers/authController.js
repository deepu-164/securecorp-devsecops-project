const bcrypt = require("bcrypt");
const {
	    findUserByEmail,
	    createUser,
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

		            if (!email || !password) {
				                return res.status(400).json({
							                success: false,
							                message: "Email and password required"
							            });
				            }

		            const user = await findUserByEmail(email);

		            if (!user) {
				                return res.status(401).json({
							                success: false,
							                message: "Invalid credentials"
							            });
				            }

		            const passwordMatch = await bcrypt.compare(
				                password,
				                user.password
				            );

		            if (!passwordMatch) {
				                return res.status(401).json({
							                success: false,
							                message: "Invalid credentials"
							            });
				            }

		            const token = jwt.sign(
				                {
							                id: user.id,
							                email: user.email,
							                role: user.role
							            },
				                process.env.JWT_SECRET,
				                {
							                expiresIn: "1h"
							            }
				            );

		            res.status(200).json({
				                success: true,
				                token
				            });

		        } catch (error) {

				        console.error(error);

				        res.status(500).json({
						            success: false,
						            message: "Internal Server Error"
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
