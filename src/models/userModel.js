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

async function updatePassword(userId, hashedPassword) {

    await pool.query(
        `
        UPDATE users
        SET password = $2
        WHERE id = $1
        `,
        [userId, hashedPassword]
    );

}

async function getAllUsers(
    page = 1,
    limit = 10,
    search = "",
    role = "",
    deleted = false
) {

    const offset = (page - 1) * limit;

    const result = await pool.query(
        `
        SELECT
            id,
            name,
            email,
            role,
            is_deleted,
            created_at
        FROM users
        WHERE

        ($1 = '' OR
            LOWER(name) LIKE LOWER('%' || $1 || '%')
            OR
            LOWER(email) LIKE LOWER('%' || $1 || '%'))

        AND

        ($2 = '' OR role = $2)

        AND

        is_deleted = $3

        ORDER BY id

        LIMIT $4
        OFFSET $5
        `,
        [
            search,
            role,
            deleted,
            limit,
            offset
        ]
    );

    return result.rows;
}

async function getUserById(id) {

    const result = await pool.query(
        `
        SELECT
            id,
            name,
            email,
            role,
            is_deleted,
            created_at
        FROM users
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0];
}

async function softDeleteUser(id) {

    await pool.query(
        `
        UPDATE users
        SET
            is_deleted = TRUE,
            deleted_at = CURRENT_TIMESTAMP
        WHERE id = $1
        `,
        [id]
    );
}

async function restoreUser(id) {

    await pool.query(
        `
        UPDATE users
        SET
            is_deleted = FALSE,
            deleted_at = NULL
        WHERE id = $1
        `,
        [id]
    );
}

async function getDashboardStats() {

    const result = await pool.query(
        `
        SELECT

        COUNT(*) AS total_users,

        COUNT(*) FILTER (
            WHERE is_deleted = FALSE
        ) AS active_users,

        COUNT(*) FILTER (
            WHERE is_deleted = TRUE
        ) AS deleted_users,

        COUNT(*) FILTER (
            WHERE role = 'admin'
        ) AS admins,

        COUNT(*) FILTER (
            WHERE role = 'employee'
        ) AS employees,

        COUNT(*) FILTER (
            WHERE lock_until > NOW()
        ) AS locked_accounts

        FROM users
        `
    );

    return result.rows[0];
}

async function updateUser(id, name, role) {

    const result = await pool.query(
        `
        UPDATE users
        SET
            name = $1,
            role = $2
        WHERE id = $3
        RETURNING *
        `,
        [name, role, id]
    );

    return result.rows[0];
}



module.exports = {
	    findUserByEmail,
	    createUser,
	    incrementFailedAttempts,
	    resetFailedAttempts,
	    lockAccount,
    updatePassword,
	getAllUsers,
    getUserById,
    updateUser,
    softDeleteUser,
    restoreUser,
	getDashboardStats
};
