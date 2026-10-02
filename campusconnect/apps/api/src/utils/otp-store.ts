type OtpRecord = {
  otp: string;
  expiresAt: number;
};

const devOtpStore = new Map<string, OtpRecord>();

export function setDevOtp(email: string, otp: string, ttlSeconds: number) {
  devOtpStore.set(email, {
    otp,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export function getDevOtp(email: string) {
  const record = devOtpStore.get(email);
  if (!record) return null;
  if (Date.now() > record.expiresAt) {
    devOtpStore.delete(email);
    return null;
  }

  return record.otp;
}

export function deleteDevOtp(email: string) {
  devOtpStore.delete(email);
}