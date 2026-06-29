const swaggerJsdoc = require("swagger-jsdoc");

const options = {
	    definition: {
		            openapi: "3.0.0",
		            info: {
				                title: "SecureCorp API",
				                version: "1.0.0",
				                description: "Enterprise User Management API"
				            },
		            servers: [
				                {
							                url: "http://localhost:3000"
							            }
				            ]
		        },

	    apis: [
		            "./src/routes/*.js"
		        ]
};

module.exports = swaggerJsdoc(options);
