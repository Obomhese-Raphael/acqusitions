import { jwtToken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';
import logger from '#src/config/logger.js';

// If a token cookie exists, decode it and attach the payload to req.user.
// Never blocks the request.
export const optionalAuth = (req, _res, next) => {
  const token = cookies.get(req, 'token');

  if (!token) return next();

  try {
    req.user = jwtToken.verify(token);
  } catch {
    // Ignore invalid/expired tokens for optional auth.
  }

  next();
};

// Requires a valid token cookie; otherwise returns 401.
export const requireAuth = (req, res, next) => {
  try {
    const token = cookies.get(req, 'token');

    if (!token) {
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'Missing token' });
    }

    const payload = jwtToken.verify(token);
    req.user = payload;

    next();
  } catch (error) {
    logger.error('Error in require auth: ', error);
    return res
      .status(401)
      .json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
};

export const authenticateToken = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No access token provided',
      });
    }

    const decoded = jwtToken.verify(token);
    req.user = decoded;

    logger.info(`User authenticated: ${decoded.email} (${decoded.role})`);
    next();
  } catch (e) {
    logger.error('Authentication error:', e);

    if (e.message === 'Failed to authenticate token') {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid or expired token',
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Error during authentication',
    });
  }
};

export const requireRole = allowedRoles => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated',
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        logger.warn(
          `Access denied for user ${req.user.email} with role ${req.user.role}. Required: ${allowedRoles.join(', ')}`
        );
        return res.status(403).json({
          error: 'Access denied',
          message: 'Insufficient permissions',
        });
      }

      next();
    } catch (e) {
      logger.error('Role verification error:', e);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Error during role verification',
      });
    }
  };
};