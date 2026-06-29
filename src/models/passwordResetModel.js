const pool = require("../config/db");

async function saveResetToken(userId, token, expiresAt) {
	    await pool.query(
		            `
			            INSERT INTO password_reset_tokens(user_id, token, expires_at)
				            VALUES($1, $2, $3)
					            `,
		            [userId, token, expiresAt]
		        );
}

async function findResetToken(token) {
	    const result = await pool.query(
		            `
			            SELECT * FROM password_reset_tokens
				            WHERE token = $1
					            `,
		            [token]
		        );

	    return result.rows[0];
}

async function deleteResetToken(token) {
	    await pool.query(
		            `
			            DELETE FROM password_reset_tokens
				            WHERE token = $1
					            `,
		            [token]
		        );
}

module.exports = {
	    saveResetToken,
	    findResetToken,
	    deleteResetToken
};
