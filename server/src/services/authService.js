import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/db.js';
import { info } from '../utils/logger.js';
import { sanitizeUser, signToken } from '../middleware/auth.js';

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function loginWithPassword({ email, password }) {
  if (!email || !password) {
    const error = new Error('Email and password are required.');
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { email: String(email).trim().toLowerCase() },
  });

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = signToken(user);
  return { token, user: sanitizeUser(user) };
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }
  return sanitizeUser(user);
}

export async function requestPasswordReset({ email }) {
  const normalized = String(email || '')
    .trim()
    .toLowerCase();

  if (!normalized) {
    const error = new Error('Email is required.');
    error.statusCode = 400;
    throw error;
  }

  const genericMessage =
    'If an account exists for that email, password reset instructions have been sent.';

  const user = await prisma.user.findUnique({ where: { email: normalized } });

  if (!user) {
    return { message: genericMessage };
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashResetToken(rawToken);
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: tokenHash,
      resetPasswordExpires: expires,
    },
  });

  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');
  const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

  info('Password reset requested', { email: normalized, resetUrl });

  // When SMTP is not configured, return the link so recovery still works in local/demo installs.
  const emailConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
  const payload = { message: genericMessage };

  if (!emailConfigured) {
    payload.resetUrl = resetUrl;
    payload.delivery = 'link';
    payload.hint =
      'Email delivery is not configured on this server yet. Use the secure recovery link below. It expires in 1 hour.';
  } else {
    payload.delivery = 'email';
    // Hook for future SMTP: send resetUrl to user.email
  }

  return payload;
}

export async function resetPasswordWithToken({ token, password }) {
  if (!token || !password) {
    const error = new Error('Reset token and new password are required.');
    error.statusCode = 400;
    throw error;
  }

  if (String(password).length < 8) {
    const error = new Error('Password must be at least 8 characters.');
    error.statusCode = 400;
    throw error;
  }

  const tokenHash = hashResetToken(token);
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { gt: new Date() },
    },
  });

  if (!user) {
    const error = new Error('This reset link is invalid or has expired. Request a new one.');
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return {
    message: 'Your password has been updated. You can sign in with your new password.',
  };
}
