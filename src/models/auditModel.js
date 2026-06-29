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

async function getAuditLogs(
    page = 1,
    limit = 10,
    userId = "",
    action = ""
) {

    const offset = (page - 1) * limit;

    const result = await pool.query(

        `
        SELECT

            audit_logs.id,
            audit_logs.action,
            audit_logs.created_at,

            users.name,
            users.email

        FROM audit_logs

        LEFT JOIN users

            ON users.id = audit_logs.user_id

        WHERE

            ($1 = '' OR audit_logs.user_id = $1::INT)

        AND

            ($2 = '' OR audit_logs.action ILIKE '%' || $2 || '%')

        ORDER BY audit_logs.created_at DESC

        LIMIT $3

        OFFSET $4
        `,

        [
            userId,
            action,
            limit,
            offset
        ]

    );

    return result.rows;

}

module.exports = {
	    createAuditLog,
		getAuditLogs
};
