const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const {

	    getUsers,
	    getUser,
	    editUser,
	    deleteUser,
	    restoreDeletedUser,
		 dashboard,
		 auditLogs

} = require("../controllers/adminController");

router.use(authenticate);

router.use(authorize("admin"));

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */

router.get("/dashboard", dashboard);

/**
 * @swagger
 * /api/admin/audit:
 *   get:
 *     summary: Get audit logs
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit log list
 */

router.get("/audit", auditLogs);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */

router.get("/users", getUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User details
 */

router.get("/users/:id", getUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update user details
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 */

router.put("/users/:id", editUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Soft delete a user
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 */

router.delete("/users/:id", deleteUser);

/**
 * @swagger
 * /api/admin/users/{id}/restore:
 *   put:
 *     summary: Restore a soft deleted user
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User restored successfully
 */

router.put("/users/:id/restore", restoreDeletedUser);

module.exports = router;
