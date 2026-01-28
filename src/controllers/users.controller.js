import logger from '#src/config/logger.js';
import {
  deleteUser as deleteUserService,
  getAllUsers,
  getUserByIdService,
  updateUser as updateUserService,
} from '#src/services/users.service.js';
import {
  updateUserSchema,
  userIdSchema,
} from '#validations/users.validation.js';
import { formatValidationError } from '#utils/format.js';
import { cookies } from '#utils/cookies.js';

export const fetchAllUsers = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    logger.info('Getting users...');
    const allUsers = await getAllUsers();

    res.json({
      message: 'Successfully fetched all users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (error) {
    logger.error('Failed to fetch users', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message:
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : String(error?.message || error),
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const idResult = userIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(idResult.error),
      });
    } else {
      logger.info('ID Result Present: ', idResult);
    }

    const id = idResult.data.id;
    console.log('ID: ', id);

    if (req.user.role !== 'admin' && Number(req.user.id) !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    logger.info(`Getting user: ${id}`);
    const user = await getUserByIdService(id);
    console.log('User Present and Found: ', user);

    res.status(200).json({
      message: 'Successfully fetched user',
      user,
    });
  } catch (error) {
    logger.error('Failed to fetch user', error);

    if (error?.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(500).json({
      error: 'Failed to fetch user',
      message:
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : String(error?.message || error),
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const idResult = userIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(idResult.error),
      });
    }

    const bodyResult = updateUserSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(bodyResult.error),
      });
    }

    const id = idResult.data.id;
    const updates = bodyResult.data;

    const isAdmin = req.user.role === 'admin';
    const isSelf = Number(req.user.id) === id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!isAdmin && updates.role !== undefined) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only admins can change user roles',
      });
    }

    logger.info(`Updating user: ${id}`);
    const updated = await updateUserService(id, updates);

    res.status(200).json({
      message: 'User updated',
      user: updated,
    });
  } catch (error) {
    logger.error('Failed to update user', error);

    if (error?.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    const msg = String(error?.message || error);
    if (msg.includes('duplicate key') || msg.includes('users_email_unique')) {
      return res.status(409).json({ error: 'Email already exist' });
    }

    res.status(500).json({
      error: 'Failed to update user',
      message:
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : String(error?.message || error),
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const idResult = userIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(idResult.error),
      });
    }

    const id = idResult.data.id;

    const isAdmin = req.user.role === 'admin';
    const isSelf = Number(req.user.id) === id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    logger.info(`Deleting user: ${id}`);
    const deleted = await deleteUserService(id);

    if (isSelf) {
      cookies.clear(res, 'token');
    }

    res.status(200).json({
      message: 'User deleted',
      user: deleted,
    });
  } catch (error) {
    logger.error('Failed to delete user', error);

    if (error?.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(500).json({
      error: 'Failed to delete user',
      message:
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : String(error?.message || error),
    });
  }
};
