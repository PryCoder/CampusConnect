import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../../prisma/client';
import { redis } from '../../utils/redis';
import { deleteDevOtp, getDevOtp, setDevOtp } from '../../utils/otp-store';
import { AppError } from '../../middlewares/error';
import { logger } from '../../utils/logger';
import { sendOtpEmail } from '../../utils/mailer';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt';
import type { SignupInput, LoginInput, VerifyOtpInput } from '@univibe/shared';

const OTP_TTL = 5 * 60; // seconds
const OTP_OPERATION_TIMEOUT_MS = 5000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string) {
  return Promise.race<T>([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

export async function signup(input: SignupInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError(409, 'Email already registered');

  const college = await prisma.college.findUnique({ where: { id: input.collegeId } });
  if (!college) throw new AppError(404, 'College not found');

  const domain = input.email.split('@')[1];
  if (domain !== college.domain) {
    throw new AppError(400, `Email must end with @${college.domain}`);
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
      collegeId: input.collegeId,
    },
  });

  const otp = await issueOtp(user.email);

  return {
    userId: user.id,
    devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
  };
}

export async function issueOtp(email: string) {
  const otp = crypto.randomInt(100000, 999999).toString();

  if (process.env.NODE_ENV !== 'production') {
    setDevOtp(email, otp, OTP_TTL);
  }

  void (async () => {
    try {
      await withTimeout(redis.setex(`otp:${email}`, OTP_TTL, otp), OTP_OPERATION_TIMEOUT_MS, 'Redis OTP write');
    } catch (error) {
      logger.warn({ email, error }, 'OTP Redis write failed');
    }

    try {
      await withTimeout(sendOtpEmail(email, otp), OTP_OPERATION_TIMEOUT_MS, 'SMTP OTP send');
    } catch (error) {
      logger.warn({ email, error }, 'OTP email send failed');
    }
  })();

  return otp;
}

export async function verifyOtp(input: VerifyOtpInput) {
  let stored: string | null = null;

  try {
    stored = await withTimeout(redis.get(`otp:${input.email}`), OTP_OPERATION_TIMEOUT_MS, 'Redis OTP read');
  } catch (error) {
    logger.warn({ email: input.email, error }, 'OTP Redis read failed');
  }

  if (!stored && process.env.NODE_ENV !== 'production') {
    stored = getDevOtp(input.email);
  }

  if (!stored) throw new AppError(400, 'OTP expired or not found');
  if (stored !== input.otp) throw new AppError(400, 'Invalid OTP');

  try {
    await withTimeout(redis.del(`otp:${input.email}`), OTP_OPERATION_TIMEOUT_MS, 'Redis OTP delete');
  } catch (error) {
    logger.warn({ email: input.email, error }, 'OTP Redis delete failed');
  }

  if (process.env.NODE_ENV !== 'production') {
    deleteDevOtp(input.email);
  }

  const user = await prisma.user.update({
    where: { email: input.email },
    data: { verifiedAt: new Date() },
  });

  return buildTokens(user);
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AppError(401, 'Invalid credentials');
  if (!user.verifiedAt) throw new AppError(403, 'Please verify your email first');

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw new AppError(401, 'Invalid credentials');

  return buildTokens(user);
}

export async function refresh(refreshToken: string) {
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new AppError(401, 'User not found');
    return buildTokens(user);
  } catch {
    throw new AppError(401, 'Invalid refresh token');
  }
}

function buildTokens(user: { id: string; role: string; collegeId: string }) {
  const payload = { sub: user.id, role: user.role, collegeId: user.collegeId };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}