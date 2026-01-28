import express from 'express';
import {
  deleteUser,
  fetchAllUsers,
  getUserById,
  updateUser,
} from '#controllers/users.controller.js';
import {
  authenticateToken,
  requireRole,
} from '#src/middleware/auth.middleware.js';

const router = express.Router();

// GET /api/users - Get all users (admin only)
router.get('/', authenticateToken, requireRole, fetchAllUsers);

// GET /api/users/:id - Get a user (admin or self)
router.get('/:id', authenticateToken, getUserById);

// PUT /api/users/:id - Update a user (self; admins can update any; only admins can change role)
router.put('/:id', authenticateToken, updateUser);

// DELETE /api/users/:id - Delete a user (self; admins can delete any)
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteUser);

export default router;
