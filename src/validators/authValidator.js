const { body, validationResult } = require("express-validator");

const registerValidation = [
	    body("name")
	        .trim()
	        .notEmpty()
	        .withMessage("Name is required"),

	    body("email")
	        .isEmail()
	        .withMessage("Valid email is required")
	        .normalizeEmail(),

	    body("password")
	        .isLength({ min: 8 })
	        .withMessage("Password must be at least 8 characters"),

	    (req, res, next) => {

		            const errors = validationResult(req);

		            if (!errors.isEmpty()) {

				                return res.status(400).json({
							                success: false,
							                errors: errors.array()
							            });

				            }

		            next();
		        }
];

module.exports = {
	    registerValidation
};
