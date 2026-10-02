import nodemailer from 'nodemailer';
import { env } from '../config/env';

const smtpPass = env.SMTP_HOST.includes('gmail') ? env.SMTP_PASS.replace(/\s+/g, '') : env.SMTP_PASS;
const fromAddress = env.SMTP_HOST.includes('gmail') ? env.SMTP_USER : env.SMTP_FROM;

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: { user: env.SMTP_USER, pass: smtpPass },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,
});

export async function sendOtpEmail(to: string, otp: string) {
  if (env.NODE_ENV !== 'production') {
    console.log(`📧 DEV OTP for ${to}: ${otp}`);
    return;
  }

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject: `Your UniVibe verification code: ${otp}`,
    html: `
      <h2>Welcome to UniVibe</h2>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing: 6px;">${otp}</h1>
      <p>This code expires in 5 minutes.</p>
    `,
  });
}