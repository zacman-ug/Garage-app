import * as authService from '../services/authService.js';

export async function login(req, res, next) {
  try {
    const result = await authService.loginWithPassword(req.body);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await authService.getUserById(req.user.id);
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const result = await authService.requestPasswordReset(req.body);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const result = await authService.resetPasswordWithToken(req.body);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}
