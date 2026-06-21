const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

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
