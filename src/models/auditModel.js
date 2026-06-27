const pool = require("../config/db");

async function createAuditLog(userId, action) {
	    await pool.query(
		            `
			            INSERT INTO audit_logs(user_id, action)
				            VALUES($1, $2)
					            `,
		            [userId, action]
		        );
}

module.exports = {
	    createAuditLog
};
