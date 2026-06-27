const pool = require("../config/db");

async function findUserByEmail(email) {
	    const result = await pool.query(
		            "SELECT * FROM users WHERE email = $1",
		            [email]
		        );

	    return result.rows[0];
}

async function createUser(name, email, password) {
	    const result = await pool.query(
		            `INSERT INTO users(name,email,password)
			             VALUES($1,$2,$3)
				              RETURNING id,name,email,role`,
		            [name, email, password]
		        );

	    return result.rows[0];
}

async function incrementFailedAttempts(userId) {
	    await pool.query(
		            `
			            UPDATE users
				            SET failed_attempts = failed_attempts + 1
					            WHERE id=$1
						            `,
		            [userId]
		        );
}

async function resetFailedAttempts(userId) {
	    await pool.query(
		            `
			            UPDATE users
				            SET failed_attempts=0,
					                lock_until=NULL
							        WHERE id=$1
								        `,
		            [userId]
		        );
}

async function lockAccount(userId, minutes) {
	    await pool.query(
		            `
			            UPDATE users
				            SET lock_until = NOW() + ($2 * interval '1 minute')
					            WHERE id=$1
						            `,
		            [userId, minutes]
		        );
}

module.exports = {
	    findUserByEmail,
	    createUser,
	    incrementFailedAttempts,
	    resetFailedAttempts,
	    lockAccount
};
