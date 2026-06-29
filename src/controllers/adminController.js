const {
	    getAllUsers,
	    getUserById,
	    updateUser,
	    softDeleteUser,
	    restoreUser,
		getDashboardStats
} = require("../models/userModel");

const { createAuditLog } = require("../models/auditModel");

const { getAuditLogs} = require("../models/auditModel");

const getUsers = async (req, res, next) => {

    try {

        const page = Number(req.query.page) || 1;

        const limit = Number(req.query.limit) || 10;

        const search = req.query.search || "";

        const role = req.query.role || "";

        const deleted =
            req.query.deleted === "true";

        const users = await getAllUsers(
            page,
            limit,
            search,
            role,
            deleted
        );

        res.json({

            success: true,

            page,

            limit,

            total: users.length,

            users

        });

    } catch (err) {

        next(err);

    }

};

const getUser = async (req, res, next) => {

	    try {

		            const user = await getUserById(req.params.id);

		            if (!user) {

				                return res.status(404).json({
							                success: false,
							                message: "User not found"
							            });

				            }

		            res.json({
				                success: true,
				                user
				            });

		        } catch (err) {

				        next(err);

				    }

};

const editUser = async (req, res, next) => {

	    try {

		            const { name, role } = req.body;

		            const user = await updateUser(
				                req.params.id,
				                name,
				                role
				            );

		            await createAuditLog(
				                req.user.id,
				                `UPDATED_USER_${req.params.id}`
				            );

		            res.json({
				                success: true,
				                user
				            });

		        } catch (err) {

				        next(err);

				    }

};

const deleteUser = async (req, res, next) => {

	    try {

		            await softDeleteUser(req.params.id);

		            await createAuditLog(
				                req.user.id,
				                `DELETED_USER_${req.params.id}`
				            );

		            res.json({
				                success: true,
				                message: "User deleted"
				            });

		        } catch (err) {

				        next(err);

				    }

};

const restoreDeletedUser = async (req, res, next) => {

	    try {

		            await restoreUser(req.params.id);

		            await createAuditLog(
				                req.user.id,
				                `RESTORED_USER_${req.params.id}`
				            );

		            res.json({
				                success: true,
				                message: "User restored"
				            });

		        } catch (err) {

				        next(err);

				    }

};

const dashboard = async (req, res, next) => {

    try {

        const stats = await getDashboardStats();

        res.json({

            success: true,

            stats

        });

    } catch (err) {

        next(err);

    }

};

const auditLogs = async (req, res, next) => {

    try {

        const page =
            Number(req.query.page) || 1;

        const limit =
            Number(req.query.limit) || 10;

        const userId =
            req.query.userId || "";

        const action =
            req.query.action || "";

        const logs =
            await getAuditLogs(
                page,
                limit,
                userId,
                action
            );

        res.json({

            success: true,

            page,

            limit,

            total: logs.length,

            logs

        });

    } catch (err) {

        next(err);

    }

};

module.exports = {

	    getUsers,
	    getUser,
	    editUser,
	    deleteUser,
	    restoreDeletedUser,
		 dashboard,
		  auditLogs

};
