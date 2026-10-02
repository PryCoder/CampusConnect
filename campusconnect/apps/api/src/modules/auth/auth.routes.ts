import { Router } from 'express';
import {
  SignupSchema,
  LoginSchema,
  VerifyOtpSchema,
} from '@univibe/shared';
import { validate } from '../../middlewares/validate';
import { env } from '../../config/env';
import * as authService from './auth.service';

const router = Router();

const cookieOpts = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
};

router.post('/signup', validate(SignupSchema), async (req, res, next) => {
  try {
    const result = await authService.signup(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/verify-otp', validate(VerifyOtpSchema), async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = await authService.verifyOtp(req.body);
    res.cookie('access_token', accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/login', validate(LoginSchema), async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = await authService.login(req.body);
    res.cookie('access_token', accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies.refresh_token;
    if (!token) return res.status(401).json({ message: 'No refresh token' });
    const { accessToken, refreshToken } = await authService.refresh(token);
    res.cookie('access_token', accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/' });
  res.json({ ok: true });
});

router.post('/resend-otp', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    await authService.issueOtp(email);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;