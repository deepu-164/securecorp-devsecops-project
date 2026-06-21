const registerUser = async (req, res) => {
	  const { name, email, password } = req.body;

	  return res.status(201).json({
		      success: true,
		      message: "User registered successfully",
		      data: {
			            name,
			            email
			          }
		    });
};

module.exports = {
	  registerUser
};
