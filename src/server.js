require("dotenv").config();

const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./config/swagger");

const helmet = require("helmet");

const logger = require("./utils/logger");

const morgan = require("morgan");

const adminRoutes = require("./routes/adminRoutes");

const express = require("express");

const cors = require("cors");

const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(helmet());

app.use(cors({ origin: "http://localhost:5173", credentials: true}));

app.use(morgan("combined",{ stream: logger.stream}));

const authRoutes = require("./routes/authRoutes");

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);

app.use( "/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

app.get("/", (req, res) => {
	    res.json({
		            message: "SecureCorp API Running"
		        });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
		logger.info(`Server running on port ${PORT}`);
});
