require("dotenv").config();

const express = require("express");

const app = express();

const authRoutes = require("./routes/authRoutes");

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
	    res.json({
		            message: "SecureCorp API Running"
		        });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	    console.log(`Server running on port ${PORT}`);
});
