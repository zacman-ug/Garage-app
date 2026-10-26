import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

const jwtSecret = () => process.env.JWT_SECRET || 'replace-me-in-production';

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    jwtSecret(),
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, jwtSecret());
}

export function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
  };
}

export async function authenticate(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = verifyToken(authorization.slice(7));
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = sanitizeUser(user);
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}
