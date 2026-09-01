import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User';
import { isTokenRevoked } from '../utils/tokenBlacklist';

export interface AuthedRequest extends Request {
  user?: IUser;
}

/**
 * Verifies the Bearer JWT on the request and attaches the user document
 * (without the password field) to req.user. Responds 401 if missing/invalid
 * or if the token was explicitly revoked via logout.
 */
export async function protect(req: AuthedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;
  const header = req.headers.authorization;

  if (header && header.startsWith('Bearer ')) {
    token = header.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }

  try {
    if (await isTokenRevoked(token)) {
      return res.status(401).json({ error: 'Not authorized, token has been revoked' });
    }

    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Not authorized, user no longer exists' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Not authorized, token invalid or expired' });
  }
}

/**
 * Restricts a route to one or more roles. Must run after `protect`.
 */
export function authorize(...roles: UserRole[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Role '${req.user.role}' is not permitted to perform this action` });
    }
    next();
  };
}

/**
 * Like `protect`, but does not fail if there's no token — useful for routes
 * (e.g. creating a booking) that behave differently for guests vs logged-in users.
 * Still rejects revoked tokens silently (treats as guest).
 */
export async function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const token = header.split(' ')[1];
    try {
      if (!(await isTokenRevoked(token))) {
        const secret = process.env.JWT_SECRET as string;
        const decoded = jwt.verify(token, secret) as { id: string };
        const user = await User.findById(decoded.id);
        if (user) req.user = user;
      }
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}
