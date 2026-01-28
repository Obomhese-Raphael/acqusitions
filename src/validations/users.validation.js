import { z } from 'zod';

// Validate URL params for routes like /api/users/:id
export const userIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(2).max(255).trim().optional(),
    email: z.email().max(255).toLowerCase().trim().optional(),
    password: z.string().min(6).max(128).optional(),
    role: z.enum(['user', 'admin']).optional(),
  })
  .refine(val => Object.values(val).some(v => v !== undefined), {
    message: 'At least one field must be provided',
  });
