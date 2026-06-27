const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const {
	    register,
	    login,
	    profile
} = require("../controllers/authController");



router.post("/register", register);

router.post("/login", login);

router.get(
	    "/admin",
	    authenticate,
	    authorize("admin"),
	    (req, res) => {

		            res.json({
				                success: true,
				                message: "Welcome Admin"
				            });

		        }
);

router.get(
	    "/profile",
	    authenticate,
	    profile
);

module.exports = router;
