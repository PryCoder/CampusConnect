import { z } from 'zod';


export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2).max(60),
  collegeId: z.string().min(1),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const VerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;

// ============= USER =============
export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  bio: z.string().max(300).optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// ============= ENUMS =============
export enum Role {
  STUDENT = 'STUDENT',
  CLUB_ADMIN = 'CLUB_ADMIN',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}