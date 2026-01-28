import { db } from '#src/config/database.js';
import logger from '#src/config/logger.js';
import { users } from '#src/models/user.model.js';
import { eq } from 'drizzle-orm';
import { hashPassword } from '#src/services/auth.service.js';

const normalizeUser = user => {
  if (!user) return user;

  const { createdAt, updatedAt, ...rest } = user;

  return {
    ...rest,
    created_at: createdAt ?? user.created_at,
    updated_at: updatedAt ?? user.updated_at,
  };
};

export const getAllUsers = async () => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);

    return allUsers.map(normalizeUser);
  } catch (error) {
    logger.error('Error getting users', error);
    throw error;
  }
};

export const getUserByIdService = async id => {
  try {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new Error('User not found');
    }

    return normalizeUser(result[0]);
  } catch (error) {
    logger.error('Error getting user by id', error);
    throw error;
  }
};

export const updateUser = async (id, updates) => {
  try {
    // Ensure user exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new Error('User not found');
    }

    const safeUpdates = { ...updates };

    // If password is being updated, hash it before saving
    if (typeof safeUpdates.password === 'string' && safeUpdates.password.length) {
      safeUpdates.password = await hashPassword(safeUpdates.password);
    }

    const [updated] = await db
      .update(users)
      .set(safeUpdates)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return normalizeUser(updated);
  } catch (error) {
    logger.error('Error updating user', error);
    throw error;
  }
};

export const deleteUser = async id => {
  try {
    // Ensure user exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new Error('User not found');
    }

    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });

    return deleted;
  } catch (error) {
    logger.error('Error deleting user', error);
    throw error;
  }
};
