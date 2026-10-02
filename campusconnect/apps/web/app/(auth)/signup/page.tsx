'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchColleges } from '@/store/slices/collegesSlice';
import { signupUser, clearSignupError } from '@/store/slices/authSlice';

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const colleges = useAppSelector((s) => s.colleges.items);
  const collegesLoading = useAppSelector((s) => s.colleges.loading);
  const collegesError = useAppSelector((s) => s.colleges.error);

  const loading = useAppSelector((s) => s.auth.signupLoading);
  const error = useAppSelector((s) => s.auth.signupError);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    collegeId: '',
  });

  useEffect(() => {
    dispatch(fetchColleges());
  }, [dispatch]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch(clearSignupError());

    const result = await dispatch(signupUser(form));
    if (signupUser.fulfilled.match(result)) {
      const otp = result.payload?.devOtp;
      const devOtp = typeof otp === 'string' ? `&otp=${encodeURIComponent(otp)}` : '';
      router.push(`/verify?email=${encodeURIComponent(form.email)}${devOtp}`);
    }
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
      <h1 className="text-2xl font-bold mb-6">Create your account</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Full name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">College</label>
          <select
            value={form.collegeId}
            onChange={(e) => setForm({ ...form, collegeId: e.target.value })}
            required
            disabled={collegesLoading}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-indigo-500 outline-none disabled:opacity-50"
          >
            <option value="">
              {collegesLoading ? 'Loading colleges…' : 'Select your college'}
            </option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {collegesError && (
            <p className="text-red-400 text-xs mt-1">{collegesError}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">College email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            placeholder="you@college.edu"
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-indigo-500 outline-none"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-medium"
        >
          {loading ? 'Creating...' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-gray-400 mt-6 text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-400 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}