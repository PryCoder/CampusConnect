'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const devOtp = searchParams.get('otp') ?? '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/proxy/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? 'Verification failed');
      }

      router.push('/feed');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    await fetch('/api/proxy/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
      <h1 className="text-2xl font-bold mb-2">Check your email</h1>
      <p className="text-sm text-gray-400 mb-6">
        We sent a 6-digit code to <strong>{email}</strong>
      </p>

      {devOtp ? (
        <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          Development OTP: <strong className="tracking-[0.3em]">{devOtp}</strong>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          required
          maxLength={6}
          placeholder="000000"
          className="w-full px-3 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-indigo-500 outline-none text-center text-2xl tracking-[0.5em]"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-medium"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>

        <button
          type="button"
          onClick={resend}
          className="w-full text-sm text-gray-400 hover:text-indigo-400"
        >
          Didn't get it? Resend code
        </button>
      </form>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyInner />
    </Suspense>
  );
}